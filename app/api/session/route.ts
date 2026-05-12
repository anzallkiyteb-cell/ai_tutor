import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  const { mode } = await request.json()

  const session = await prisma.session.create({
    data: { mode },
  })

  return Response.json({ sessionId: session.id })
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const sessionId = searchParams.get('id')

  if (!sessionId) return Response.json({ error: 'id required' }, { status: 400 })

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: { messages: { orderBy: { createdAt: 'asc' } } },
  })

  return Response.json(session)
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const sessionId = searchParams.get('id')

  if (!sessionId) return Response.json({ error: 'id required' }, { status: 400 })

  await prisma.message.deleteMany({ where: { sessionId } })
  await prisma.session.delete({ where: { id: sessionId } })

  return Response.json({ ok: true })
}
