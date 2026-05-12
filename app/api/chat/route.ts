import { NextRequest } from 'next/server'
import { chatCompletion, ChatMessage, DEFAULT_MODEL } from '@/lib/nvidia'
import { prisma } from '@/lib/prisma'
import { explainSystemPrompt, summarySystemPrompt, exerciseSystemPrompt } from '@/lib/prompts'
import { parseDocx, parsePdf, getDocumentPath } from '@/lib/documentParser'

async function getDocumentContent(type: string): Promise<string> {
  const filename = type === 'chapter' ? 'chapitre1.docx' : 'devoir1.pdf'
  const cached = await prisma.document.findUnique({ where: { filename } })
  if (cached) return cached.content

  const filePath = getDocumentPath(filename)
  const parsed = filename.endsWith('.docx')
    ? await parseDocx(filePath)
    : await parsePdf(filePath)

  await prisma.document.create({ data: { filename, content: parsed.text, type } })
  return parsed.text
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { sessionId, message, mode } = body as {
    sessionId: string
    message: string
    mode: 'explain' | 'summary' | 'exercise'
  }

  // Load session + history
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: { messages: { orderBy: { createdAt: 'asc' } } },
  })

  if (!session) {
    return Response.json({ error: 'Session not found' }, { status: 404 })
  }

  const chapterContent = await getDocumentContent('chapter')
  const exerciseContent =
    mode === 'exercise' ? await getDocumentContent('exercise') : ''

  let systemPrompt: string
  if (mode === 'explain') systemPrompt = explainSystemPrompt(chapterContent)
  else if (mode === 'summary') systemPrompt = summarySystemPrompt(chapterContent)
  else systemPrompt = exerciseSystemPrompt(chapterContent, exerciseContent)

  const history: ChatMessage[] = (session.messages as any[]).map((m) => ({
    role: m.role as 'user' | 'assistant',
    content: m.content,
  }))

  const messages: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    ...history,
    { role: 'user', content: message },
  ]

  // Save user message
  await prisma.message.create({
    data: { sessionId, role: 'user', content: message },
  })

  // Stream from NVIDIA NIM — Kimi K2 Instruct (1T MoE, 128K ctx, best free model)
  const nimResponse = await chatCompletion(messages, {
    model: DEFAULT_MODEL,
    stream: true,
    temperature: 0.7,
    max_tokens: 1024,
  })

  let fullText = ''

  const stream = new ReadableStream({
    async start(controller) {
      const reader = nimResponse.body!.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n').filter((l) => l.startsWith('data: '))

        for (const line of lines) {
          const data = line.slice(6)
          if (data === '[DONE]') continue
          try {
            const parsed = JSON.parse(data)
            const token = parsed.choices?.[0]?.delta?.content ?? ''
            if (token) {
              fullText += token
              controller.enqueue(new TextEncoder().encode(token))
            }
          } catch {}
        }
      }

      // Save assistant reply
      await prisma.message.create({
        data: { sessionId, role: 'assistant', content: fullText },
      })

      controller.close()
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Transfer-Encoding': 'chunked',
      'X-Accel-Buffering': 'no',
    },
  })
}
