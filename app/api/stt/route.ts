// STT is handled client-side via the Web Speech API (SpeechRecognition).
// This route is kept as a stub for future server-side STT integration.
export async function POST() {
  return Response.json(
    { error: 'STT is handled client-side via Web Speech API' },
    { status: 501 }
  )
}
