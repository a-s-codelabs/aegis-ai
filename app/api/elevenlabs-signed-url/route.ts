export const maxDuration = 60

export async function GET() {
  try {
    const agentId = process.env.ELEVENLABS_AGENT_ID
    const apiKey = process.env.ELEVENLABS_API_KEY

    if (!agentId || !apiKey) {
      return Response.json(
        {
          error:
            "ElevenLabs configuration missing. Please add ELEVENLABS_AGENT_ID and ELEVENLABS_API_KEY to environment variables.",
        },
        { status: 500 },
      )
    }

    // Get signed URL from ElevenLabs
    const response = await fetch(
      `https://api.elevenlabs.io/v1/convai/conversation/get-signed-url?agent_id=${agentId}`,
      {
        headers: {
          "xi-api-key": apiKey,
        },
      },
    )

    if (!response.ok) {
      const error = await response.text()
      console.error("[v0] ElevenLabs API error:", error)
      return Response.json({ error: "Failed to get signed URL from ElevenLabs" }, { status: 500 })
    }

    const data = await response.json()
    return Response.json({ signedUrl: data.signed_url })
  } catch (error) {
    console.error("[v0] Error getting signed URL:", error)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}
