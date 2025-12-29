/**
 * Trigger Diversion Message API Route
 * 
 * When scam risk exceeds threshold (70), this endpoint:
 * 1. Generates the diversion message audio via ElevenLabs TTS
 * 2. Returns the audio URL for playback
 * 3. Caller should play this audio, then terminate the call
 */

import { NextResponse } from 'next/server';

export const maxDuration = 30;

const DIVERSION_MESSAGE = "This call cannot continue due to security verification issues. No further information will be shared. Please contact the account holder through official channels. Goodbye.";

interface DiversionRequest {
  voiceId?: string;
  voice?: 'default' | 'female' | 'male';
  message?: string; // Optional custom message override
}

/**
 * Get voice ID based on voice preference
 */
function getVoiceId(voice: 'default' | 'female' | 'male' = 'default'): string {
  // Default voice IDs from ElevenLabs
  // These should match your configured agent voices
  const VOICE_IDS: Record<string, string> = {
    default: process.env.ELEVENLABS_VOICE_ID_DEFAULT || 'pNInz6obpgDQGcFmaJgB', // Adam (default)
    female: process.env.ELEVENLABS_VOICE_ID_FEMALE || 'EXAVITQu4vr4xnSDxMaL', // Bella (female)
    male: process.env.ELEVENLABS_VOICE_ID_MALE || 'VR6AewLTigWG4xSOukaG', // Arnold (male)
  };
  
  return VOICE_IDS[voice] || VOICE_IDS.default;
}

/**
 * Generate diversion message audio using ElevenLabs TTS API
 */
async function generateDiversionAudio(voiceId: string, message?: string): Promise<ArrayBuffer> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  
  if (!apiKey) {
    throw new Error('ELEVENLABS_API_KEY not configured');
  }

  const textToSpeak = message || DIVERSION_MESSAGE;

  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
    {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': apiKey,
      },
      body: JSON.stringify({
        text: textToSpeak,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        },
      }),
    }
  );

  if (!response.ok) {
    let errorText = '';
    try {
      errorText = await response.text();
    } catch {
      errorText = `HTTP ${response.status}: ${response.statusText}`;
    }
    
    // Try to parse as JSON for better error messages
    try {
      const errorJson = JSON.parse(errorText);
      if (errorJson.detail?.status === 'missing_permissions') {
        const permissionMatch = errorJson.detail?.message?.match(/permission (\w+)/i);
        const missingPermission = permissionMatch ? permissionMatch[1] : 'text_to_speech';
        throw new Error(
          `Your ElevenLabs API key is missing the "${missingPermission}" permission. ` +
          `Please update your API key in the ElevenLabs dashboard to include this permission. ` +
          `Note: Preview requires this permission, but actual scam warnings during calls will work without it.`
        );
      }
      if (errorJson.detail?.message) {
        throw new Error(errorJson.detail.message);
      }
    } catch (parseError) {
      // If it's already an Error with our custom message, re-throw it
      if (parseError instanceof Error && parseError.message.includes('missing')) {
        throw parseError;
      }
      // Otherwise, use the raw error text
    }
    
    // Default error message if JSON parsing didn't produce a better one
    throw new Error(`ElevenLabs TTS failed: ${response.status} ${errorText}`);
  }

  return await response.arrayBuffer();
}

export async function POST(req: Request) {
  try {
    const body: DiversionRequest = await req.json().catch(() => ({}));
    const voice = body.voice || 'default';
    const voiceId = body.voiceId || getVoiceId(voice);
    const customMessage = body.message;

    const messageToUse = customMessage || DIVERSION_MESSAGE;

    console.log('[TriggerDiversion] Generating diversion message audio...', {
      voice,
      voiceId,
      message: messageToUse,
      isCustom: !!customMessage,
    });

    // Validate API key before proceeding
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      console.error('[TriggerDiversion] ELEVENLABS_API_KEY not configured');
      return NextResponse.json(
        {
          success: false,
          error: 'ELEVENLABS_API_KEY not configured. Please check your environment variables.',
        },
        { status: 500 }
      );
    }

    // Generate audio
    let audioBuffer: ArrayBuffer;
    try {
      audioBuffer = await generateDiversionAudio(voiceId, customMessage);
    } catch (ttsError) {
      const errorMessage = ttsError instanceof Error ? ttsError.message : 'Unknown TTS error';
      console.error('[TriggerDiversion] TTS generation failed:', errorMessage);
      
      // Provide more helpful error messages
      let userFriendlyError = errorMessage;
      if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
        userFriendlyError = 'Invalid ElevenLabs API key. Please check your ELEVENLABS_API_KEY.';
      } else if (errorMessage.includes('404')) {
        userFriendlyError = `Voice ID not found: ${voiceId}. Please check your voice configuration.`;
      } else if (errorMessage.includes('429')) {
        userFriendlyError = 'ElevenLabs API rate limit exceeded. Please try again later.';
      }
      
      return NextResponse.json(
        {
          success: false,
          error: userFriendlyError,
        },
        { status: 500 }
      );
    }

    // Convert to base64 for frontend playback
    const base64Audio = Buffer.from(audioBuffer).toString('base64');
    const audioDataUrl = `data:audio/mpeg;base64,${base64Audio}`;

    console.log('[TriggerDiversion] ✅ Diversion message audio generated');

    return NextResponse.json({
      success: true,
      message: messageToUse,
      audioDataUrl,
      audioSize: audioBuffer.byteLength,
    });
  } catch (error) {
    console.error('[TriggerDiversion] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}

