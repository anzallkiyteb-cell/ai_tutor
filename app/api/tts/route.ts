// TTS is handled client-side via the Web Speech API (speechSynthesis).
// This route is kept as a stub for future server-side TTS integration.
export async function POST() {
  return Response.json(
    { error: 'TTS is handled client-side via Web Speech API' },
    { status: 501 }
  )
}
