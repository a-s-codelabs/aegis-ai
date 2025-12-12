export const maxDuration = 60

export async function GET() {
  try {
    const agentId = process.env.ELEVENLABS_AGENT_ID
    const apiKey = process.env.ELEVENLABS_API_KEY

    if (!agentId || !apiKey) {
      console.error('[ElevenLabs] Missing environment variables:', {
        hasAgentId: !!agentId,
        hasApiKey: !!apiKey,
      });
      return Response.json(
        {
          error:
            'ElevenLabs configuration missing. Please add ELEVENLABS_AGENT_ID and ELEVENLABS_API_KEY to environment variables.',
          details: 'Check your .env.local file or environment configuration',
        },
        { status: 500 }
      );
    }

    console.log('[ElevenLabs] Requesting signed URL for agent:', agentId);

    // Get signed URL from ElevenLabs
    const response = await fetch(
      `https://api.elevenlabs.io/v1/convai/conversation/get-signed-url?agent_id=${agentId}`,
      {
        method: 'GET',
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { message: errorText };
      }

      console.error('[ElevenLabs] API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData,
      });

      return Response.json(
        {
          error: 'Failed to get signed URL from ElevenLabs',
          details: errorData.message || errorText,
          status: response.status,
        },
        { status: response.status }
      );
    }

    const data = await response.json()

    if (!data.signed_url) {
      console.error('[ElevenLabs] No signed_url in response:', data);
      return Response.json(
        {
          error: 'Invalid response from ElevenLabs',
          details: 'Response missing signed_url field',
        },
        { status: 500 }
      );
    }

    console.log('[ElevenLabs] Successfully obtained signed URL');
    return Response.json({ signedUrl: data.signed_url })
  } catch (error) {
    console.error('[ElevenLabs] Error getting signed URL:', error);
    return Response.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
