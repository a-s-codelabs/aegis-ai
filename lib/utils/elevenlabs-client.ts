/**
 * ElevenLabs ConvAI Browser Client with Bidirectional Audio
 *
 * Full-featured client for real-time conversation with ElevenLabs ConvAI:
 * - Bidirectional audio streaming (mic -> ElevenLabs, ElevenLabs -> speakers)
 * - Real-time transcription of caller speech
 * - Audio playback via Web Audio API
 * - Event callbacks for transcript updates and scam analysis triggers
 */

export interface ElevenLabsClientOptions {
  /**
   * Optional fallback audio file that will be played locally
   * once the ElevenLabs session starts (e.g. `/sounds/ai-greeting.mp3`).
   *
   * This is purely for demo UX and does not affect the ConvAI API.
   */
  fallbackGreetingAudioUrl?: string;
  /**
   * Playback rate for AI voice (0.5 = half speed, 1.0 = normal, 1.5 = 1.5x speed)
   * Default: 0.6 (60% speed - slower and clearer for better understanding)
   */
  playbackRate?: number;
  /**
   * Callback when caller's speech is transcribed
   */
  onUserTranscript?: (text: string) => void;
  /**
   * Callback when AI agent responds
   */
  onAgentResponse?: (text: string) => void;
  /**
   * Callback when conversation starts
   */
  onConversationStart?: () => void;
  /**
   * Callback when conversation ends
   */
  onConversationEnd?: () => void;
  /**
   * Callback for errors
   */
  onError?: (error: Error) => void;
}

export class ElevenLabsClient {
  private ws: WebSocket | null = null;
  private isConnected = false;
  private readonly options: ElevenLabsClientOptions;
  private readonly playbackRate: number;
  private fallbackAudio: HTMLAudioElement | null = null;
  private mediaStream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private audioSource: MediaStreamAudioSourceNode | null = null;
  private audioProcessor: ScriptProcessorNode | null = null;
  private audioQueue: string[] = [];
  private isPlayingAudio = false;
  private isCleaningUp = false;

  constructor(options?: ElevenLabsClientOptions) {
    this.options = options ?? {};
    // Set playback rate (default 0.75 = 75% speed for slower, clearer speech)
    this.playbackRate = this.options.playbackRate ?? 0.6; // Default: 60% speed (slower and clearer)
    if (this.options.fallbackGreetingAudioUrl && typeof window !== 'undefined') {
      // Preload optional fallback greeting so playback feels instant
      this.fallbackAudio = new Audio(this.options.fallbackGreetingAudioUrl);
    }
  }

  /**
   * Start a ConvAI session with bidirectional audio:
   * - Fetch signed URL from our Next.js API
   * - Open WebSocket connection
   * - Capture microphone audio and stream to ElevenLabs
   * - Handle audio responses from ElevenLabs
   */
  async start() {
    if (this.ws || this.isConnected) {
      // Session already started
      return;
    }

    try {
      const res = await fetch('/api/elevenlabs-signed-url');
      if (!res.ok) {
        let errorMessage = `Failed to fetch signed URL: ${res.status} ${res.statusText}`;
        try {
          const errorData = (await res.json()) as { 
            error?: string; 
            details?: string;
            rawError?: string;
          };
          
          // Prefer details field (user-friendly message) over error field
          if (errorData.details) {
            errorMessage = errorData.details;
          } else if (errorData.error) {
            errorMessage = errorData.error;
            // Include raw error if available for debugging
            if (errorData.rawError && errorData.rawError !== errorData.error) {
              errorMessage += ` (${errorData.rawError})`;
            }
          }
        } catch {
          // If JSON parsing fails, use the default error message
        }
        const error = new Error(errorMessage);
        console.error('[ElevenLabsClient]', error.message);
        this.options.onError?.(error);
        return;
      }

      const data = (await res.json()) as { signedUrl?: string; error?: string; details?: string };
      if (!data.signedUrl) {
        const errorMessage = data.error 
          ? (data.details ? `${data.error} - ${data.details}` : data.error)
          : 'Missing signedUrl in response';
        const error = new Error(errorMessage);
        console.error('[ElevenLabsClient]', error.message);
        this.options.onError?.(error);
        return;
      }

      // Check if mediaDevices API is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error(
          'Microphone access is not available in this browser. Please use a modern browser that supports microphone access (Chrome, Firefox, Edge, or Safari).'
        );
      }

      // Request microphone access with better error handling
      // CRITICAL: Request microphone with explicit device selection if possible
      try {
        console.log('[ElevenLabsClient] 🎤 Requesting microphone access...');
        
        // CRITICAL: Disable audio processing to get raw audio signal
        // echoCancellation, noiseSuppression, and autoGainControl can filter out ALL audio
        // if the microphone volume is low or if there's a system issue
        let audioConstraints: MediaTrackConstraints = {
          echoCancellation: false, // Disable - might be filtering out all audio
          noiseSuppression: false, // Disable - might be filtering out all audio
          autoGainControl: false, // Disable - might be filtering out all audio
          // Request specific constraints to ensure quality
          sampleRate: { ideal: 24000 },
          channelCount: { ideal: 1 }, // Mono
        };
        
        // Try to get device list to help with selection
        try {
          const devices = await navigator.mediaDevices.enumerateDevices();
          const audioInputs = devices.filter(device => device.kind === 'audioinput');
          if (audioInputs.length > 0) {
            console.log('[ElevenLabsClient] 📱 Available microphones:', audioInputs.map(d => d.label || d.deviceId));
            // Use the first available microphone (or default)
            // Note: We can't set deviceId without user permission, but we can log what's available
          }
        } catch (enumError) {
          console.warn('[ElevenLabsClient] Could not enumerate devices (permission may be required first):', enumError);
        }
        
        // Request microphone access
        this.mediaStream = await navigator.mediaDevices.getUserMedia({
          audio: audioConstraints,
        });
        
        // Verify microphone is working
        const audioTracks = this.mediaStream.getAudioTracks();
        if (audioTracks.length === 0) {
          throw new Error('No audio tracks found in media stream');
        }
        
        const track = audioTracks[0];
        const trackSettings = track.getSettings();
        console.log('[ElevenLabsClient] ✅ Microphone access granted!');
        console.log('[ElevenLabsClient] 📊 Microphone details:', {
          label: track.label || 'Default microphone',
          enabled: track.enabled,
          muted: track.muted,
          readyState: track.readyState,
          settings: trackSettings,
        });
        
        // CRITICAL: Verify track is actually active and receiving audio
        if (track.readyState !== 'live') {
          console.error('[ElevenLabsClient] ❌ Audio track is not live! State:', track.readyState);
        }
        
        if (track.muted) {
          console.error('[ElevenLabsClient] ❌ Audio track is MUTED! This will prevent audio capture.');
        }
        
        if (!track.enabled) {
          console.error('[ElevenLabsClient] ❌ Audio track is DISABLED! Enabling now...');
          track.enabled = true;
        }
        
        // Add event listeners to track state changes
        track.addEventListener('ended', () => {
          console.error('[ElevenLabsClient] ❌ Microphone track ended unexpectedly!');
        });
        
        track.addEventListener('mute', () => {
          console.error('[ElevenLabsClient] ❌ Microphone track was MUTED!');
        });
        
        track.addEventListener('unmute', () => {
          console.log('[ElevenLabsClient] ✅ Microphone track unmuted');
        });
        
        // Test if we can actually get audio data from the track
        console.log('[ElevenLabsClient] 🔍 Testing microphone audio capture...');
        this.testMicrophoneCapture();
        
        // CRITICAL: Ensure track is enabled and not muted
        if (!track.enabled) {
          console.warn('[ElevenLabsClient] ⚠️ Audio track is disabled! Enabling...');
          track.enabled = true;
        }
        
        if (track.muted) {
          console.warn('[ElevenLabsClient] ⚠️ Audio track is muted! Unmuting...');
          // Note: muted property is read-only, but we can check system settings
        }
        
        // Test audio capture with a simple check
        this.testMicrophoneCapture();
        
        // Add event listeners to track state changes
        track.addEventListener('ended', () => {
          console.error('[ElevenLabsClient] ❌ Microphone track ended!');
        });
        
        track.addEventListener('mute', () => {
          console.warn('[ElevenLabsClient] ⚠️ Microphone track was muted!');
        });
        
        track.addEventListener('unmute', () => {
          console.log('[ElevenLabsClient] ✅ Microphone track unmuted');
        });
      } catch (mediaError: any) {
        let errorMessage = 'Could not access microphone. ';
        
        if (mediaError.name === 'NotFoundError' || mediaError.name === 'DevicesNotFoundError') {
          errorMessage += 'No microphone device found. Please connect a microphone to your device and try again.';
        } else if (mediaError.name === 'NotAllowedError' || mediaError.name === 'PermissionDeniedError') {
          errorMessage += 'Microphone permission denied. Please click "Allow" when prompted, or enable microphone access in your browser settings and refresh the page.';
        } else if (mediaError.name === 'NotReadableError' || mediaError.name === 'TrackStartError') {
          errorMessage += 'Microphone is already in use by another application. Please close other applications using the microphone and try again.';
        } else if (mediaError.name === 'OverconstrainedError') {
          errorMessage += 'Microphone does not meet the required specifications. Please try a different microphone.';
        } else {
          errorMessage += mediaError.message || 'Unknown error occurred while accessing microphone.';
        }
        
        throw new Error(errorMessage);
      }

      // Setup audio context for processing
      // CRITICAL: ElevenLabs ConvAI requires 24kHz sample rate
      // If browser doesn't support 24kHz, we'll need to resample
      const targetSampleRate = 24000;
      try {
        this.audioContext = new AudioContext({ sampleRate: targetSampleRate });
        console.log(`[ElevenLabsClient] AudioContext created with sample rate: ${this.audioContext.sampleRate}Hz`);
        
        // Verify sample rate matches requirement
        if (this.audioContext.sampleRate !== targetSampleRate) {
          console.warn(
            `[ElevenLabsClient] Warning: AudioContext sample rate is ${this.audioContext.sampleRate}Hz, but ElevenLabs requires ${targetSampleRate}Hz. Audio may not work correctly.`
          );
        }
      } catch (error) {
        // Fallback to default sample rate if 24kHz not supported
        console.warn('[ElevenLabsClient] Could not create AudioContext with 24kHz, using default:', error);
        this.audioContext = new AudioContext();
        console.log(`[ElevenLabsClient] AudioContext created with default sample rate: ${this.audioContext.sampleRate}Hz`);
      }

      // Connect to ElevenLabs WebSocket
      const ws = new WebSocket(data.signedUrl);
      this.ws = ws;

      ws.onopen = () => {
        this.isConnected = true;
        console.log('[ElevenLabsClient] ✅ WebSocket connected to ElevenLabs');
        if (data.signedUrl) {
          console.log('[ElevenLabsClient] 📡 WebSocket URL:', data.signedUrl.substring(0, 50) + '...');
        }

        // Trigger conversation start callback
        this.options.onConversationStart?.();

        // Start audio streaming IMMEDIATELY (this captures microphone and sends to ElevenLabs)
        console.log('[ElevenLabsClient] 🎤 Starting microphone audio streaming...');
        console.log('[ElevenLabsClient] 📊 Audio format: PCM16, 24kHz, Mono');
        console.log('[ElevenLabsClient] 📝 Message format: { "user_audio_chunk": "<base64_pcm16>" }');
        
        // Start audio streaming - ensure it happens
        try {
          this.startAudioStreaming();
          console.log('[ElevenLabsClient] ✅ Audio streaming started. Speak into your microphone now!');
        } catch (streamError) {
          console.error('[ElevenLabsClient] ❌ Failed to start audio streaming:', streamError);
          // Retry after small delay
          setTimeout(() => {
            try {
              this.startAudioStreaming();
              console.log('[ElevenLabsClient] ✅ Audio streaming started on retry.');
            } catch (retryError) {
              console.error('[ElevenLabsClient] ❌ Audio streaming failed on retry:', retryError);
              this.options.onError?.(new Error('Failed to start audio streaming: ' + (retryError instanceof Error ? retryError.message : 'Unknown error')));
            }
          }, 500);
        }

        // Play fallback greeting if available
        if (this.fallbackAudio) {
          this.fallbackAudio.currentTime = 0;
          void this.fallbackAudio
            .play()
            .catch((error) =>
              console.error('[ElevenLabsClient] Fallback audio error:', error)
            );
        }
      };

      ws.onmessage = async (event) => {
        try {
          // Handle text messages (JSON events)
          if (typeof event.data === 'string') {
            const eventData = JSON.parse(event.data);
            this.handleWebSocketEvent(eventData);
          }
          // Handle binary audio data
          else if (event.data instanceof ArrayBuffer) {
            // Binary audio frames are handled differently
            // For now, we'll focus on base64 audio from JSON events
          }
        } catch (error) {
          console.error(
            '[ElevenLabsClient] Error processing message:',
            error
          );
        }
      };

      ws.onerror = (event) => {
        console.error('[ElevenLabsClient] ❌ WebSocket error:', event);
        console.error('[ElevenLabsClient] WebSocket state:', ws.readyState);
        const error = new Error('WebSocket connection error - audio may not be reaching AI');
        this.options.onError?.(error);
      };

      ws.onclose = (event) => {
        console.log(
          '[ElevenLabsClient] WebSocket closed:',
          event.code,
          event.reason || 'No reason provided'
        );
        
        // Log close codes for debugging
        const closeCodeMessages: Record<number, string> = {
          1000: 'Normal closure',
          1001: 'Going away',
          1002: 'Protocol error',
          1003: 'Unsupported data',
          1005: 'No status code (abnormal closure)',
          1006: 'Abnormal closure (no close frame)',
          1007: 'Invalid frame payload data',
          1008: 'Policy violation',
          1009: 'Message too big',
          1010: 'Mandatory extension',
          1011: 'Internal server error',
        };
        
        const closeMessage = closeCodeMessages[event.code] || `Unknown code: ${event.code}`;
        console.warn(`[ElevenLabsClient] WebSocket closed: ${closeMessage} (${event.code})`);
        
        this.isConnected = false;
        this.ws = null;
        
        // Only cleanup if not already cleaning up (avoid double cleanup)
        if (!this.isCleaningUp) {
          this.cleanup();
        }
      };
    } catch (error) {
      console.error('[ElevenLabsClient] Error starting session:', error);
      const err =
        error instanceof Error ? error : new Error('Unknown error');
      this.options.onError?.(err);
      this.cleanup();
    }
  }

  /**
   * Start capturing and streaming microphone audio to ElevenLabs
   * CRITICAL: This function captures your microphone and sends it to ElevenLabs AI
   */
  private startAudioStreaming() {
    if (!this.mediaStream) {
      console.error('[ElevenLabsClient] ❌ Cannot start audio streaming: No media stream (microphone not accessed)');
      return;
    }
    
    if (!this.audioContext) {
      console.error('[ElevenLabsClient] ❌ Cannot start audio streaming: No audio context');
      return;
    }
    
    if (!this.ws) {
      console.error('[ElevenLabsClient] ❌ Cannot start audio streaming: No WebSocket connection');
      return;
    }
    
    if (this.ws.readyState !== WebSocket.OPEN) {
      console.error('[ElevenLabsClient] ❌ Cannot start audio streaming: WebSocket not open (state:', this.ws.readyState, ')');
      return;
    }

    console.log('[ElevenLabsClient] 🎤 Initializing audio capture pipeline...');
    console.log('[ElevenLabsClient] 📊 Resources check:', {
      hasMediaStream: !!this.mediaStream,
      hasAudioContext: !!this.audioContext,
      hasWebSocket: !!this.ws,
      wsState: this.ws.readyState,
      audioContextState: this.audioContext.state,
    });

    try {
      // Resume audio context if suspended (required for user interaction)
      if (this.audioContext.state === 'suspended') {
        console.log('[ElevenLabsClient] ⏸️ Audio context suspended, resuming...');
        this.audioContext.resume().then(() => {
          console.log('[ElevenLabsClient] ✅ Audio context resumed');
        }).catch((error) => {
          console.error('[ElevenLabsClient] ❌ Failed to resume audio context:', error);
        });
      }

      // Create audio source from microphone stream
      const source = this.audioContext.createMediaStreamSource(
        this.mediaStream
      );
      this.audioSource = source;
      console.log('[ElevenLabsClient] ✅ Audio source created from microphone');

      // Use ScriptProcessorNode (deprecated but still widely supported)
      // Buffer size: 4096 samples for ~170ms at 24kHz
      // Smaller buffer = lower latency but more processing
      const bufferSize = 4096;
      const processor = this.audioContext.createScriptProcessor(bufferSize, 1, 1);
      this.audioProcessor = processor;
      console.log(`[ElevenLabsClient] ✅ Audio processor created (buffer: ${bufferSize} samples)`);

      let audioChunkCount = 0;
      let lastAudioLogTime = Date.now();
      
      processor.onaudioprocess = (e) => {
        // CRITICAL: Always check WebSocket state before processing
        if (
          this.isCleaningUp ||
          !this.ws ||
          this.ws.readyState !== WebSocket.OPEN
        ) {
          if (this.ws && this.ws.readyState !== WebSocket.OPEN && !this.isCleaningUp) {
            console.warn('[ElevenLabsClient] WebSocket not open, state:', this.ws.readyState);
          }
          return;
        }

        try {
          const inputData = e.inputBuffer.getChannelData(0);
          const inputSampleRate = e.inputBuffer.sampleRate;
          const targetSampleRate = 24000; // ElevenLabs requirement

          // Check if there's actual audio input (not silence)
          // CRITICAL: Check for ANY non-zero audio signal (very sensitive)
          // Some microphones might have very low output, so we check for any signal
          let maxAmplitude = 0;
          let hasAudio = false;
          
          // Calculate max amplitude first
          for (let i = 0; i < inputData.length; i++) {
            const absValue = Math.abs(inputData[i]);
            if (absValue > maxAmplitude) {
              maxAmplitude = absValue;
            }
          }
          
          // Use a very low threshold - even background noise should be detected
          // If maxAmplitude is 0, it means NO audio is coming through at all
          const audioThreshold = 0.0001; // Extremely sensitive - detect any signal
          hasAudio = maxAmplitude > audioThreshold;
          
          // CRITICAL: If amplitude is exactly 0, the microphone isn't sending audio
          if (maxAmplitude === 0 && audioChunkCount % 20 === 0) {
            console.error('[ElevenLabsClient] ❌❌❌ CRITICAL: Audio amplitude is exactly 0.0! ❌❌❌');
            console.error('[ElevenLabsClient] Microphone is connected but NOT sending audio signal.');
            console.error('[ElevenLabsClient] 🔧 FIX THIS NOW:');
            console.error('[ElevenLabsClient] 1. Open Windows Settings → Privacy → Microphone → Ensure access is ON');
            console.error('[ElevenLabsClient] 2. Open Windows Sound Settings → Recording → Select "BH900 PRO" → Properties → Levels');
            console.error('[ElevenLabsClient] 3. Ensure microphone volume is NOT at 0% (try 50-100%)');
            console.error('[ElevenLabsClient] 4. Ensure microphone is NOT muted (check mute button)');
            console.error('[ElevenLabsClient] 5. Test microphone in Windows Voice Recorder app');
            console.error('[ElevenLabsClient] 6. Check if microphone works in other apps (Discord, Teams, etc.)');
          }
          
          // Log first few chunks with detailed audio info
          if (audioChunkCount <= 5) {
            console.log(`[ElevenLabsClient] 📊 Audio chunk ${audioChunkCount} analysis:`, {
              maxAmplitude: maxAmplitude.toFixed(6),
              hasAudio,
              sampleCount: inputData.length,
              allZeros: maxAmplitude === 0,
            });
          }
          
          // Warn if we're not detecting audio after many chunks
          if (!hasAudio && audioChunkCount > 100 && audioChunkCount % 200 === 0) {
            console.warn('[ElevenLabsClient] ⚠️ No audio detected from microphone. Please check:');
            console.warn('[ElevenLabsClient] - Is your microphone/earphones connected and working?');
            console.warn('[ElevenLabsClient] - Are you speaking into the microphone?');
            console.warn('[ElevenLabsClient] - Check system microphone settings');
          }

          // Resample audio if needed (browser default is usually 48kHz, ElevenLabs needs 24kHz)
          // Create a new Float32Array to avoid type issues
          const inputDataArray = new Float32Array(inputData);
          let audioData: Float32Array = inputDataArray;
          if (inputSampleRate !== targetSampleRate) {
            audioData = this.resampleAudio(inputDataArray, inputSampleRate, targetSampleRate) as Float32Array;
          }

          // Convert Float32 (-1.0 to 1.0) to Int16 PCM (-32768 to 32767)
          const pcm16 = new Int16Array(audioData.length);
          for (let i = 0; i < audioData.length; i++) {
            // Clamp and convert to Int16
            const sample = Math.max(-1, Math.min(1, audioData[i]));
            pcm16[i] = Math.round(sample * 32767);
          }

          // Send audio chunk to ElevenLabs as base64-encoded PCM16
          // IMPORTANT: Send ALL chunks (including silence) to maintain connection
          if (this.ws.readyState === WebSocket.OPEN) {
            // Convert Int16Array to base64 efficiently
            const uint8Array = new Uint8Array(pcm16.buffer);
            let binaryString = '';
            const chunkSize = 8192; // Process in chunks to avoid stack overflow
            for (let i = 0; i < uint8Array.length; i += chunkSize) {
              const chunk = uint8Array.slice(i, i + chunkSize);
              binaryString += String.fromCharCode(...chunk);
            }
            const base64Audio = btoa(binaryString);

            // Send audio chunk to ElevenLabs
            // CRITICAL: This is how caller audio reaches the AI
            // ElevenLabs ConvAI expects: { "user_audio_chunk": "<base64_encoded_pcm16>" }
            try {
              // Ensure we're sending in the correct format
              const message = JSON.stringify({
                user_audio_chunk: base64Audio,
              });
              
              // Verify message size (should be reasonable - typically 5-15KB per chunk)
              const messageSize = new Blob([message]).size;
              
              // Send via WebSocket (text message, not binary)
              this.ws.send(message);
              
              audioChunkCount++;
              
              // Debug: Log first few chunks to verify format and transmission
              if (audioChunkCount <= 3) {
                console.log(`[ElevenLabsClient] 📤 Chunk ${audioChunkCount} sent to ElevenLabs:`, {
                  format: 'JSON: { "user_audio_chunk": "<base64_pcm16>" }',
                  base64Length: base64Audio.length,
                  messageSize: `${(messageSize / 1024).toFixed(2)} KB`,
                  hasAudio: hasAudio ? '✅ YES' : '❌ NO',
                  amplitude: maxAmplitude.toFixed(4),
                  webSocketState: this.ws.readyState === WebSocket.OPEN ? 'OPEN ✅' : `CLOSED ❌ (${this.ws.readyState})`,
                });
                
                if (hasAudio) {
                  console.log(`[ElevenLabsClient] 🔊 Audio detected in chunk ${audioChunkCount}! Your voice is being sent!`);
                } else {
                  console.warn(`[ElevenLabsClient] ⚠️ No audio in chunk ${audioChunkCount} - speak into your microphone!`);
                }
              }
              
              // Log every second (roughly every 50 chunks at 24kHz) with detailed info
              const now = Date.now();
              if (now - lastAudioLogTime >= 1000) {
                const chunksPerSecond = audioChunkCount / ((now - (lastAudioLogTime - 1000)) / 1000);
                console.log(
                  `[ElevenLabsClient] 🎤 Audio streaming: ${audioChunkCount} chunks sent (${chunksPerSecond.toFixed(1)}/sec)${
                    hasAudio ? ` | 🔊 Audio detected (amplitude: ${maxAmplitude.toFixed(3)})` : ' | 🔇 Silence'
                  } | WS: ${this.ws.readyState === WebSocket.OPEN ? 'OPEN ✅' : `CLOSED ❌ (${this.ws.readyState})`} | Chunk size: ${messageSize} bytes`
                );
                lastAudioLogTime = now;
              }
              
              // First chunk verification
              if (audioChunkCount === 1) {
                console.log('[ElevenLabsClient] ✅✅✅ FIRST AUDIO CHUNK SENT TO ELEVENLABS! ✅✅✅');
                console.log('[ElevenLabsClient] 📦 First chunk details:', {
                  sampleRate: inputSampleRate,
                  targetSampleRate,
                  resampled: inputSampleRate !== targetSampleRate,
                  pcm16Length: pcm16.length,
                  base64Length: base64Audio.length,
                  hasAudio,
                  messageFormat: 'JSON: { "user_audio_chunk": "<base64>" }',
                  webSocketState: this.ws.readyState,
                });
                console.log('[ElevenLabsClient] 🎤 Your microphone audio is now being sent to ElevenLabs AI!');
                console.log('[ElevenLabsClient] 🔊 Keep speaking - the AI should respond to your voice!');
              }
              
              // Alert if no audio detected after reasonable time
              if (audioChunkCount === 200 && !hasAudio) {
                console.error('[ElevenLabsClient] ❌❌❌ WARNING: No audio detected after 200 chunks! ❌❌❌');
                console.error('[ElevenLabsClient] This means your microphone is not picking up sound.');
                console.error('[ElevenLabsClient] Please check:');
                console.error('[ElevenLabsClient] 1. Is your earphones/microphone connected?');
                console.error('[ElevenLabsClient] 2. Is the microphone enabled in Windows settings?');
                console.error('[ElevenLabsClient] 3. Are you speaking into the microphone?');
                console.error('[ElevenLabsClient] 4. Try speaking louder or closer to the microphone');
              }
            } catch (sendError) {
              console.error('[ElevenLabsClient] ❌ CRITICAL: Error sending audio chunk:', sendError);
              console.error('[ElevenLabsClient] WebSocket state:', this.ws?.readyState);
              // Don't throw - continue processing to maintain stream
            }
          }
        } catch (error) {
          if (!this.isCleaningUp) {
            console.error('[ElevenLabsClient] Error processing audio:', error);
          }
        }
      };

      // Connect audio pipeline: Microphone -> Source -> Processor -> Destination
      source.connect(processor);
      // Connect processor to destination to avoid audio processing warnings
      processor.connect(this.audioContext.destination);

      console.log('[ElevenLabsClient] ✅ Audio streaming pipeline connected!');
      console.log('[ElevenLabsClient] 🎤 MICROPHONE → AUDIO PROCESSOR → ELEVENLABS AI');
      console.log('[ElevenLabsClient] 🔊 Start speaking now - your voice will be sent to the AI!');
      
      // Verify audio is flowing
      setTimeout(() => {
        if (this.audioProcessor && this.audioSource) {
          console.log('[ElevenLabsClient] ✅ Audio pipeline verification: Active and ready');
        } else {
          console.error('[ElevenLabsClient] ❌ Audio pipeline verification: Components missing!');
        }
      }, 1000);
    } catch (error) {
      console.error('[ElevenLabsClient] Error starting audio streaming:', error);
      const err = error instanceof Error ? error : new Error('Unknown error');
      this.options.onError?.(err);
    }
  }

  /**
   * Test microphone capture to verify audio is being received
   */
  private testMicrophoneCapture() {
    if (!this.mediaStream || !this.audioContext) {
      return;
    }

    try {
      const testContext = new AudioContext({ sampleRate: 24000 });
      const source = testContext.createMediaStreamSource(this.mediaStream);
      const processor = testContext.createScriptProcessor(4096, 1, 1);
      let testSampleCount = 0;
      let audioDetected = false;

      processor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        const hasAudio = inputData.some((sample) => Math.abs(sample) > 0.01);
        const maxAmplitude = Math.max(...inputData.map(Math.abs));

        if (hasAudio && !audioDetected) {
          audioDetected = true;
          console.log('[ElevenLabsClient] ✅ MICROPHONE TEST PASSED: Audio detected!');
          console.log('[ElevenLabsClient] 🔊 Audio amplitude:', maxAmplitude.toFixed(3));
        }

        testSampleCount++;
        // Stop test after 2 seconds
        if (testSampleCount > 100) {
          processor.disconnect();
          source.disconnect();
          testContext.close();
          
          if (!audioDetected) {
            console.warn('[ElevenLabsClient] ⚠️ MICROPHONE TEST: No audio detected. Please check:');
            console.warn('[ElevenLabsClient] 1. Is your microphone/earphones connected?');
            console.warn('[ElevenLabsClient] 2. Is the microphone enabled in system settings?');
            console.warn('[ElevenLabsClient] 3. Are you speaking into the microphone?');
          }
        }
      };

      source.connect(processor);
      processor.connect(testContext.destination);
    } catch (error) {
      console.error('[ElevenLabsClient] Error testing microphone:', error);
    }
  }

  /**
   * Resample audio from one sample rate to another (simple linear interpolation)
   * Used when browser sample rate doesn't match ElevenLabs requirement (24kHz)
   */
  private resampleAudio(
    audioData: Float32Array,
    fromSampleRate: number,
    toSampleRate: number
  ): Float32Array {
    if (fromSampleRate === toSampleRate) {
      // Create a new Float32Array with proper buffer type
      return new Float32Array(audioData.buffer.slice(0));
    }

    const ratio = fromSampleRate / toSampleRate;
    const newLength = Math.round(audioData.length / ratio);
    const result = new Float32Array(newLength);

    for (let i = 0; i < newLength; i++) {
      const srcIndex = i * ratio;
      const srcIndexFloor = Math.floor(srcIndex);
      const srcIndexCeil = Math.min(srcIndexFloor + 1, audioData.length - 1);
      const fraction = srcIndex - srcIndexFloor;

      // Linear interpolation
      result[i] =
        audioData[srcIndexFloor] * (1 - fraction) +
        audioData[srcIndexCeil] * fraction;
    }

    return result;
  }

  /**
   * Handle WebSocket events from ElevenLabs
   */
  private handleWebSocketEvent(eventData: any) {
    // Log all event types for debugging (but not too verbose)
    if (eventData.type && !['audio'].includes(eventData.type)) {
      // Don't log 'audio' events as they come too frequently
      console.log(`[ElevenLabsClient] 📨 Received WebSocket event: ${eventData.type}`);
    }
    
    // Handle user transcript (caller's speech) - THIS IS CRITICAL FOR SCAM DETECTION
    // This confirms that ElevenLabs received and processed the audio!
    if (
      eventData.type === 'user_transcript' &&
      eventData.user_transcription_event
    ) {
      const userText =
        eventData.user_transcription_event.user_transcript || '';
      if (userText && userText.trim()) {
        console.log('[ElevenLabsClient] 🎤 ✅✅✅ CONFIRMED: Caller audio received by AI! ✅✅✅');
        console.log('[ElevenLabsClient] 🎤 This proves your microphone audio reached ElevenLabs!');
        console.log('[ElevenLabsClient] 🎤 Caller said:', userText);
        // Trigger callback to analyze caller's speech for scam detection
        this.options.onUserTranscript?.(userText);
      } else {
        console.warn('[ElevenLabsClient] ⚠️ Received empty user transcript - audio may not be clear enough');
        console.warn('[ElevenLabsClient] Try speaking louder or closer to the microphone');
      }
    }

    // Handle agent response (AI assistant's text)
    if (
      eventData.type === 'agent_response' &&
      eventData.agent_response_event
    ) {
      const agentText =
        eventData.agent_response_event.agent_response || '';
      if (agentText) {
        console.log('[ElevenLabsClient] AI Agent responded:', agentText);
        this.options.onAgentResponse?.(agentText);
      }
    }

    // Handle audio from ElevenLabs
    if (eventData.type === 'audio' && eventData.audio_event) {
      const base64Audio = eventData.audio_event.audio_base_64;
      if (base64Audio) {
        this.playAudio(base64Audio);
      }
    }

    // Handle conversation initiation
    if (eventData.type === 'conversation_initiation_event') {
      console.log('[ElevenLabsClient] Conversation initiated');
      this.options.onConversationStart?.();
    }

    // Handle conversation end
    if (eventData.type === 'conversation_end_event') {
      console.log('[ElevenLabsClient] Conversation ended');
      this.options.onConversationEnd?.();
    }

    // Handle errors
    if (eventData.type === 'error') {
      console.error('[ElevenLabsClient] Error from ElevenLabs:', eventData);
      const error = new Error(eventData.message || 'ElevenLabs error');
      this.options.onError?.(error);
    }
  }

  /**
   * Play audio from ElevenLabs using Web Audio API
   */
  private playAudio(base64Audio: string) {
    if (this.isCleaningUp || !this.audioContext) {
      return;
    }

    // Add to queue
    this.audioQueue.push(base64Audio);

    // Process queue if not already playing
    if (!this.isPlayingAudio) {
      this.processAudioQueue();
    }
  }

  /**
   * Process audio queue and play chunks sequentially
   */
  private async processAudioQueue() {
    if (
      this.isPlayingAudio ||
      this.isCleaningUp ||
      !this.audioContext ||
      this.audioQueue.length === 0
    ) {
      return;
    }

    this.isPlayingAudio = true;

    const base64Audio = this.audioQueue.shift();
    if (!base64Audio) {
      this.isPlayingAudio = false;
      return;
    }

    try {
      // Resume audio context if suspended
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      // Decode base64 to audio buffer
      const binaryString = atob(base64Audio);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const int16Array = new Int16Array(bytes.buffer);
      const float32Array = new Float32Array(int16Array.length);
      for (let i = 0; i < int16Array.length; i++) {
        float32Array[i] = int16Array[i] / 32768.0;
      }

      const audioBuffer = this.audioContext.createBuffer(
        1,
        float32Array.length,
        24000
      );
      audioBuffer.getChannelData(0).set(float32Array);

      const source = this.audioContext.createBufferSource();
      source.buffer = audioBuffer;
      // Set playback rate to slow down AI speech (0.75 = 75% speed)
      source.playbackRate.value = this.playbackRate;
      source.connect(this.audioContext.destination);

      source.onended = () => {
        this.isPlayingAudio = false;
        // Process next chunk
        this.processAudioQueue();
      };

      source.start();
    } catch (error) {
      if (!this.isCleaningUp) {
        console.error('[ElevenLabsClient] Error playing audio:', error);
      }
      this.isPlayingAudio = false;
      // Try next chunk
      this.processAudioQueue();
    }
  }

  /**
   * Stop the ConvAI session and clean up all resources.
   */
  stop() {
    this.cleanup();
  }

  /**
   * Clean up all resources (audio, WebSocket, media stream)
   */
  private cleanup() {
    this.isCleaningUp = true;

    // Close WebSocket
    if (this.ws) {
      try {
        this.ws.close();
      } catch (error) {
        console.error('[ElevenLabsClient] Error closing WebSocket:', error);
      }
      this.ws = null;
    }

    this.isConnected = false;

    // Stop audio processing
    if (this.audioProcessor) {
      try {
        this.audioProcessor.disconnect();
      } catch (error) {
        // Ignore disconnect errors
      }
      this.audioProcessor = null;
    }

    if (this.audioSource) {
      try {
        this.audioSource.disconnect();
      } catch (error) {
        // Ignore disconnect errors
      }
      this.audioSource = null;
    }

    // Stop media stream
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }

    // Close audio context
    if (this.audioContext) {
      this.audioContext
        .close()
        .catch((error) =>
          console.error('[ElevenLabsClient] Error closing audio context:', error)
        );
      this.audioContext = null;
    }

    // Clear audio queue
    this.audioQueue = [];
    this.isPlayingAudio = false;

    // Stop fallback audio
    if (this.fallbackAudio) {
      try {
        this.fallbackAudio.pause();
        this.fallbackAudio.currentTime = 0;
      } catch (error) {
        console.error('[ElevenLabsClient] Error stopping fallback audio:', error);
      }
    }

    this.isCleaningUp = false;
  }
}


