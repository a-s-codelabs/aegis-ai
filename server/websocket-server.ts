/**
 * WebSocket Server for ElevenLabs Media Capture
 * 
 * Handles media streaming from ElevenLabs Agents API:
 * 1. Accepts connections from ElevenLabs (when media streaming is enabled)
 * 2. Captures audio_output and audio_input messages
 * 3. Buffers PCM audio chunks per conversation_id
 * 4. Converts to WAV (16kHz mono) and saves when call ends
 * 5. Persists audio_url in call_logs
 * 
 * IMPORTANT: This server accepts connections FROM ElevenLabs, not from our client.
 * When a conversation is started with media streaming, ElevenLabs connects to this server.
 */

import { WebSocketServer, WebSocket } from 'ws';
import { createWavFile } from '../lib/utils/wav-writer';
import { uploadAudioFile, getStorageConfig } from '../lib/utils/audio-storage';

interface AudioSession {
  conversationId: string;
  elevenlabsWs: WebSocket | null;
  inputChunks: Array<{ base64Data: string; timestamp: number }>;
  outputChunks: Array<{ base64Data: string; timestamp: number }>;
  startTime: number;
  audioUrl: string | null; // Set when audio is saved
}

const activeSessions = new Map<string, AudioSession>();

/**
 * Start WebSocket server for ElevenLabs media streaming
 * 
 * This server accepts connections from ElevenLabs when media streaming is enabled.
 * ElevenLabs will connect to this server and send audio frames.
 */
export function startWebSocketServer(port: number = 3001) {
  const wss = new WebSocketServer({ port });

  wss.on('connection', (elevenlabsWs: WebSocket, req) => {
    console.log('[WS Server] New connection from ElevenLabs');

    // Extract conversationId from query params or headers
    // ElevenLabs may send conversation_id in the connection URL or initial message
    const url = new URL(req.url || '', `http://${req.headers.host}`);
    let conversationId = url.searchParams.get('conversation_id') || 
                         url.searchParams.get('conversationId') ||
                         req.headers['x-conversation-id'] as string;

    // If conversationId not in URL, wait for initial message
    let session: AudioSession | null = null;

    const handleMessage = async (event: any) => {
      try {
        // Handle text messages (JSON events)
        if (typeof event.data === 'string') {
          const eventData = JSON.parse(event.data);
          
          // Log all incoming message types for debugging
          console.log(`[WS Server] Received message type: ${eventData.type || 'unknown'}`, {
            conversationId: conversationId || eventData.conversation_id,
            hasAudio: !!(eventData.audio_output || eventData.audio_input),
          });

          // Extract conversationId from first message if not in URL
          if (!conversationId && eventData.conversation_id) {
            conversationId = eventData.conversation_id;
            console.log(`[WS Server] Extracted conversationId from message: ${conversationId}`);
          }

          // Initialize session if we have conversationId
          if (conversationId && !session) {
            session = {
              conversationId,
              elevenlabsWs,
              inputChunks: [],
              outputChunks: [],
              startTime: Date.now(),
              audioUrl: null,
            };
            activeSessions.set(conversationId, session);
            console.log(`[WS Server] Initialized session for conversation: ${conversationId}`);
          }

          if (session) {
            await handleElevenLabsMessage(session, eventData);
          }
        }
        // Handle binary audio data (PCM)
        else if (event.data instanceof ArrayBuffer || Buffer.isBuffer(event.data)) {
          if (!session && conversationId) {
            session = {
              conversationId,
              elevenlabsWs,
              inputChunks: [],
              outputChunks: [],
              startTime: Date.now(),
              audioUrl: null,
            };
            activeSessions.set(conversationId, session);
            console.log(`[WS Server] Initialized session from binary data: ${conversationId}`);
          }

          if (session) {
            // Convert binary to base64
            const buffer = Buffer.from(event.data);
            const base64 = buffer.toString('base64');
            // Assume binary data is audio_output (AI voice)
            addAudioChunk(session, 'output', base64);
          }
        }
      } catch (error) {
        console.error(`[WS Server] Error processing message:`, error);
      }
    };

    elevenlabsWs.on('message', handleMessage);

    elevenlabsWs.on('error', (error) => {
      console.error(`[WS Server] WebSocket error for ${conversationId || 'unknown'}:`, error);
    });

    elevenlabsWs.on('close', async (event) => {
      console.log(`[WS Server] Connection closed for ${conversationId || 'unknown'}, code: ${event.code}`);
      
      if (session) {
        // Save audio when connection closes
        const audioUrl = await saveCallAudio(session);
        session.audioUrl = audioUrl;
        
        // Update call log with audio URL
        if (audioUrl) {
          await updateCallLogAudioUrl(session.conversationId, audioUrl);
        }

        // Clean up session
        activeSessions.delete(session.conversationId);
      }
    });
  });

  console.log(`[WS Server] WebSocket server started on port ${port}`);
  console.log(`[WS Server] Ready to accept media streaming from ElevenLabs`);
  return wss;
}

/**
 * Handle messages from ElevenLabs WebSocket
 * 
 * Processes audio_output, audio_input, and call_end events from ElevenLabs media streaming.
 */
async function handleElevenLabsMessage(session: AudioSession, eventData: any) {
  // Handle audio_output (AI voice) - base64 PCM
  if (eventData.type === 'audio_output' || eventData.audio_output) {
    let base64Audio: string | undefined;
    
    // Try different possible formats
    if (eventData.audio_output) {
      base64Audio = typeof eventData.audio_output === 'string' 
        ? eventData.audio_output 
        : eventData.audio_output.data || eventData.audio_output.audio_base_64;
    } else if (eventData.data) {
      base64Audio = eventData.data;
    }

    if (base64Audio) {
      addAudioChunk(session, 'output', base64Audio);
      console.log(`[WS Server] Received audio_output chunk for ${session.conversationId}`);
    }
  }

  // Handle audio_input (caller voice) - base64 PCM
  if (eventData.type === 'audio_input' || eventData.audio_input) {
    let base64Audio: string | undefined;
    
    // Try different possible formats
    if (eventData.audio_input) {
      base64Audio = typeof eventData.audio_input === 'string' 
        ? eventData.audio_input 
        : eventData.audio_input.data || eventData.audio_input.audio_base_64;
    }

    if (base64Audio) {
      addAudioChunk(session, 'input', base64Audio);
      console.log(`[WS Server] Received audio_input chunk for ${session.conversationId}`);
    }
  }

  // Handle call_end
  if (eventData.type === 'call_end' || eventData.type === 'conversation_end_event' || eventData.call_end) {
    console.log(`[WS Server] Call ended for ${session.conversationId}`);
    
    // Save audio when call ends
    const audioUrl = await saveCallAudio(session);
    session.audioUrl = audioUrl;
    
    // Update call log with audio URL
    if (audioUrl) {
      await updateCallLogAudioUrl(session.conversationId, audioUrl);
    }
  }
}

/**
 * Add audio chunk to session buffer
 */
function addAudioChunk(session: AudioSession, type: 'input' | 'output', base64Data: string) {
  const chunk = {
    base64Data,
    timestamp: Date.now() - session.startTime,
  };

  if (type === 'input') {
    session.inputChunks.push(chunk);
  } else {
    session.outputChunks.push(chunk);
  }

  // Log periodically
  const totalChunks = session.inputChunks.length + session.outputChunks.length;
  if (totalChunks % 100 === 0) {
    console.log(`[WS Server] ${session.conversationId}: ${session.inputChunks.length} input, ${session.outputChunks.length} output chunks (total: ${totalChunks})`);
  }
}

/**
 * Save call audio when call ends
 * 
 * Converts buffered PCM audio chunks to WAV (16kHz mono) and uploads to storage.
 */
async function saveCallAudio(session: AudioSession): Promise<string | null> {
  // Check if we have any audio chunks
  if (session.inputChunks.length === 0 && session.outputChunks.length === 0) {
    console.log(`[WS Server] No audio chunks to save for ${session.conversationId}`);
    return null;
  }

  try {
    // Merge input and output audio by timestamp
    const allChunks = [...session.inputChunks, ...session.outputChunks];
    allChunks.sort((a, b) => a.timestamp - b.timestamp);

    console.log(`[WS Server] Converting ${allChunks.length} audio chunks to WAV for ${session.conversationId}...`);

    // Convert to WAV (ElevenLabs realtime media uses 16kHz mono PCM)
    const wavBuffer = createWavFile(
      allChunks.map(chunk => ({ base64Data: chunk.base64Data })),
      16000, // 16kHz sample rate for realtime media
      1 // Mono
    );

    // Generate filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${session.conversationId}_${timestamp}.wav`;

    // Upload to storage
    const storageConfig = getStorageConfig();
    const audioUrl = await uploadAudioFile(wavBuffer, filename, storageConfig);

    console.log(`[WS Server] ✅ Audio saved for ${session.conversationId}: ${audioUrl}`);
    console.log(`[WS Server] Stats: ${session.inputChunks.length} input chunks, ${session.outputChunks.length} output chunks, duration: ${Date.now() - session.startTime}ms`);

    return audioUrl;
  } catch (error) {
    console.error(`[WS Server] Error saving audio for ${session.conversationId}:`, error);
    return null;
  }
}

/**
 * Update call log with audio URL
 * 
 * Persists the audio_url in the call_logs table/database.
 */
async function updateCallLogAudioUrl(conversationId: string, audioUrl: string): Promise<void> {
  try {
    // Call the internal API to update the call log
    // In production, this would update a database directly
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
                    process.env.VERCEL_URL || 
                    'http://localhost:3000';
    
    // Use internal API route to update call log
    const response = await fetch(`${baseUrl}/api/calls/${conversationId}/audio`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ audioUrl }),
    });

    if (response.ok) {
      console.log(`[WS Server] ✅ Updated call log ${conversationId} with audio URL: ${audioUrl}`);
    } else {
      console.warn(`[WS Server] Failed to update call log ${conversationId}: ${response.status}`);
    }
  } catch (error) {
    console.error(`[WS Server] Error updating call log for ${conversationId}:`, error);
    // Don't throw - audio is saved, just log update failed
  }
}

// Export helper to get session stats
export function getSessionStats(conversationId: string) {
  const session = activeSessions.get(conversationId);
  if (!session) return null;

  return {
    conversationId: session.conversationId,
    startTime: session.startTime,
    duration: Date.now() - session.startTime,
    inputChunks: session.inputChunks.length,
    outputChunks: session.outputChunks.length,
    totalChunks: session.inputChunks.length + session.outputChunks.length,
  };
}


