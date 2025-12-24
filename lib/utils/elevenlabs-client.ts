/**
 * ElevenLabs ConvAI Browser Client (Hackathon Edition)
 *
 * This is a lightweight helper around the ElevenLabs ConvAI signed WebSocket URL.
 * It is intentionally minimal and focused on the demo use-case:
 *
 * - When a call is diverted to AI, we:
 *   - Fetch `/api/elevenlabs-signed-url` to get the signed WebSocket URL
 *   - Open the WebSocket connection
 *   - Send an initial greeting message like:
 *       "This is your AI assistant speaking, how can I help you today?"
 * - We also expose a `stop` method to gracefully close the session when the call ends.
 *
 * NOTE:
 * - A full production-grade ConvAI integration would handle:
 *   - Bidirectional audio streaming (mic -> ElevenLabs, ElevenLabs -> speakers)
 *   - Proper binary audio decoding and playback via Web Audio API
 * - For the hackathon demo we keep it intentionally simple and focused on:
 *   - Actually calling the ElevenLabs ConvAI WebSocket API
 *   - Logging events for debugging
 *   - Optionally playing a local fallback audio greeting so the UX still feels live
 */

export interface ElevenLabsClientOptions {
  /**
   * Optional fallback audio file that will be played locally
   * once the ElevenLabs session starts (e.g. `/sounds/ai-greeting.mp3`).
   *
   * This is purely for demo UX and does not affect the ConvAI API.
   */
  fallbackGreetingAudioUrl?: string;
}

export class ElevenLabsClient {
  private ws: WebSocket | null = null;
  private isConnected = false;
  private readonly options: ElevenLabsClientOptions;
  private fallbackAudio: HTMLAudioElement | null = null;

  constructor(options?: ElevenLabsClientOptions) {
    this.options = options ?? {};
    if (this.options.fallbackGreetingAudioUrl && typeof window !== 'undefined') {
      // Preload optional fallback greeting so playback feels instant
      this.fallbackAudio = new Audio(this.options.fallbackGreetingAudioUrl);
    }
  }

  /**
   * Start a ConvAI session:
   * - Fetch signed URL from our Next.js API
   * - Open WebSocket connection
   * - Send initial greeting message over ConvAI
   */
  async start() {
    if (this.ws || this.isConnected) {
      // Session already started
      return;
    }

    try {
      const res = await fetch('/api/elevenlabs-signed-url');
      if (!res.ok) {
        console.error(
          '[ElevenLabsClient] Failed to fetch signed URL:',
          res.status,
          res.statusText
        );
        return;
      }

      const data = (await res.json()) as { signedUrl?: string; error?: string };
      if (!data.signedUrl) {
        console.error(
          '[ElevenLabsClient] Missing signedUrl in response:',
          data
        );
        return;
      }

      // NOTE: ElevenLabs ConvAI uses WebSockets for realtime audio.
      const ws = new WebSocket(data.signedUrl);
      this.ws = ws;

      ws.onopen = () => {
        this.isConnected = true;
        console.log('[ElevenLabsClient] WebSocket connected');

        // Send a simple greeting message to ConvAI.
        // The exact payload shape can be enhanced later as needed.
        const greetingPayload = {
          type: 'user_message',
          // This is the line your hackathon judges will hear first
          // from the AI assistant (via ElevenLabs voice).
          text: 'This is your AI assistant speaking, how can I help you today?',
        };

        try {
          ws.send(JSON.stringify(greetingPayload));
        } catch (sendError) {
          console.error(
            '[ElevenLabsClient] Failed to send greeting payload:',
            sendError
          );
        }

        // Play fallback greeting locally so the UX still has audible feedback
        // even if the ConvAI audio plumbing is minimal for this demo.
        if (this.fallbackAudio) {
          this.fallbackAudio.currentTime = 0;
          void this.fallbackAudio
            .play()
            .catch((error) =>
              console.error('[ElevenLabsClient] Fallback audio error:', error)
            );
        }
      };

      ws.onmessage = (event) => {
        // For the hackathon we only log messages; full audio handling
        // can be added later without changing the dashboard API.
        // ElevenLabs may send both text and binary audio frames.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data: any = event.data;
        console.log('[ElevenLabsClient] Received message from ConvAI:', data);
      };

      ws.onerror = (event) => {
        console.error('[ElevenLabsClient] WebSocket error:', event);
      };

      ws.onclose = (event) => {
        console.log(
          '[ElevenLabsClient] WebSocket closed:',
          event.code,
          event.reason
        );
        this.isConnected = false;
        this.ws = null;
      };
    } catch (error) {
      console.error('[ElevenLabsClient] Error starting session:', error);
    }
  }

  /**
   * Stop the ConvAI session and clean up.
   */
  stop() {
    try {
      if (this.ws) {
        this.ws.close();
        this.ws = null;
        this.isConnected = false;
      }
    } catch (error) {
      console.error('[ElevenLabsClient] Error closing WebSocket:', error);
    }

    // Stop any fallback audio that might be playing
    if (this.fallbackAudio) {
      try {
        this.fallbackAudio.pause();
        this.fallbackAudio.currentTime = 0;
      } catch (error) {
        console.error('[ElevenLabsClient] Error stopping fallback audio:', error);
      }
    }
  }
}


