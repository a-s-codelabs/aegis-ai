/**
 * ElevenLabs Signed URL API Route
 * 
 * Maps voice preference to agent_id BEFORE starting the call.
 * 
 * Voice → Agent Mapping:
 * - 'default' → ELEVENLABS_AGENT_ID_DEFAULT (or ELEVENLABS_AGENT_ID for backward compatibility)
 * - 'female' → ELEVENLABS_AGENT_ID_FEMALE
 * - 'male' → ELEVENLABS_AGENT_ID_MALE
 * 
 * CRITICAL: ElevenLabs Agents lock voice at session start.
 * Voice cannot be changed during an active call.
 * To switch voices, user must start a new call with the selected agent.
 */

export const maxDuration = 60

export async function POST(req: Request) {
  try {
    const apiKey = process.env.ELEVENLABS_API_KEY

    if (!apiKey) {
      console.error('[ElevenLabs] Missing API key');
      return Response.json(
        {
          error:
            'ElevenLabs configuration missing. Please add ELEVENLABS_API_KEY to environment variables.',
          details: 'Check your .env.local file or environment configuration',
        },
        { status: 500 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const voice = body.voice;

    // Validate voice preference
    const validVoices = ['default', 'female', 'male'];
    const validatedVoice = validVoices.includes(voice) ? voice : 'default';

    // Map voice preference to agent_id
    // Environment variables: ELEVENLABS_AGENT_ID_DEFAULT, ELEVENLABS_AGENT_ID_FEMALE, ELEVENLABS_AGENT_ID_MALE
    // Fallback to ELEVENLABS_AGENT_ID for backward compatibility
    let agentId: string | undefined;
    switch (validatedVoice) {
      case 'default':
        agentId = process.env.ELEVENLABS_AGENT_ID_DEFAULT || process.env.ELEVENLABS_AGENT_ID;
        break;
      case 'female':
        agentId = process.env.ELEVENLABS_AGENT_ID_FEMALE;
        break;
      case 'male':
        agentId = process.env.ELEVENLABS_AGENT_ID_MALE;
        break;
    }

    if (!agentId) {
      console.error('[ElevenLabs] Missing agent ID for voice:', validatedVoice);
      return Response.json(
        {
          error: `ElevenLabs agent ID not configured for voice: ${validatedVoice}`,
          details: `Please add ELEVENLABS_AGENT_ID_${validatedVoice.toUpperCase()} to environment variables, or use ELEVENLABS_AGENT_ID for default voice.`,
        },
        { status: 500 }
      );
    }

    console.log('[ElevenLabs] Requesting signed URL for agent:', agentId, `(voice: ${validatedVoice})`);

    const url = `https://api.elevenlabs.io/v1/convai/conversation/get-signed-url?agent_id=${agentId}`;

    // Get signed URL from ElevenLabs
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
      },
    });

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

      // Extract nested error message from ElevenLabs API response
      let errorMessage = errorText;
      if (errorData.detail) {
        // Handle nested detail structure: { detail: { message: "...", status: "..." } }
        if (typeof errorData.detail === 'object' && errorData.detail.message) {
          errorMessage = errorData.detail.message;
        } else if (typeof errorData.detail === 'string') {
          errorMessage = errorData.detail;
        }
      } else if (errorData.message) {
        errorMessage = errorData.message;
      }

      // Provide user-friendly message for common errors
      let userFriendlyMessage = errorMessage;
      if (errorMessage.includes('missing_permissions') || errorMessage.includes('convai_write')) {
        userFriendlyMessage = 'Your ElevenLabs API key is missing the required "convai_write" permission. Please update your API key in the ElevenLabs dashboard to include ConvAI permissions.';
      } else if (errorMessage.includes('invalid') || errorMessage.includes('unauthorized')) {
        userFriendlyMessage = 'Invalid or unauthorized ElevenLabs API key. Please check your ELEVENLABS_API_KEY in your environment variables.';
      }

      return Response.json(
        {
          error: 'Failed to get signed URL from ElevenLabs',
          details: userFriendlyMessage,
          rawError: errorMessage,
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
