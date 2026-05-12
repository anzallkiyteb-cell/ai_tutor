// NVIDIA NIM API client — OpenAI-compatible endpoint
// Model: meta/llama-4-maverick-17b-128e-instruct
// Llama 4 Maverick: 17B active params (128 experts MoE), ~1.4s response,
// excellent French, structured educational output. Best speed/quality on NIM as of 2026-05-12.

const NVIDIA_BASE_URL = 'https://integrate.api.nvidia.com/v1'
const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY!

export const DEFAULT_MODEL = 'meta/llama-4-maverick-17b-128e-instruct'

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export async function chatCompletion(
  messages: ChatMessage[],
  options: {
    model?: string
    stream?: boolean
    temperature?: number
    max_tokens?: number
  } = {}
): Promise<Response> {
  const {
    model = DEFAULT_MODEL,
    stream = false,
    temperature = 0.6,
    max_tokens = 2048,
  } = options

  const response = await fetch(`${NVIDIA_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${NVIDIA_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages,
      temperature,
      max_tokens,
      stream,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`NVIDIA NIM error ${response.status}: ${error}`)
  }

  return response
}

export async function chatCompletionText(
  messages: ChatMessage[],
  options?: Parameters<typeof chatCompletion>[1]
): Promise<string> {
  const response = await chatCompletion(messages, { ...options, stream: false })
  const data = await response.json()
  return data.choices[0].message.content as string
}
