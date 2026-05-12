import { NextRequest } from 'next/server'
import { parseDocx, parsePdf, getDocumentPath } from '@/lib/documentParser'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const type = searchParams.get('type') ?? 'chapter'

  const filename = type === 'chapter' ? 'chapitre1.docx' : 'devoir1.pdf'

  // Return cached version from DB if available
  const cached = await prisma.document.findUnique({ where: { filename } })
  if (cached) {
    return Response.json({ content: cached.content, filename, type })
  }

  // Parse and cache
  const filePath = getDocumentPath(filename)
  const parsed =
    filename.endsWith('.docx') ? await parseDocx(filePath) : await parsePdf(filePath)

  const doc = await prisma.document.create({
    data: { filename, content: parsed.text, type },
  })

  return Response.json({ content: doc.content, filename, type })
}
