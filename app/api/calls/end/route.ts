/**
 * POST /api/calls/end
 * 
 * End a call recording session, merge audio chunks into WAV file,
 * upload to storage, and return audio URL.
 */

import { NextResponse } from 'next/server';
import { getSession, deleteSession } from '../start/route';
import { createMergedWavFile } from '@/lib/utils/wav-writer';
import { uploadAudioFile, getStorageConfig } from '@/lib/utils/audio-storage';
import { saveCall } from '../[conversationId]/route';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { conversationId, phoneNumber, duration, risk, status } = body;

    if (!conversationId) {
      return NextResponse.json(
        { error: 'conversationId is required' },
        { status: 400 }
      );
    }

    // Get session data (may not exist if call didn't go through /api/calls/start)
    const session = getSession(conversationId);
    
    // Try to get audio URL from WebSocket server first (if media streaming was enabled)
    let audioUrl: string | null = null;
    
    try {
      // Check if WebSocket server has saved audio for this conversation
      const { getSessionStats } = await import('@/server/websocket-server');
      const wsSession = getSessionStats(conversationId);
      
      if (wsSession && wsSession.totalChunks > 0) {
        console.log('[CallEnd] Audio was recorded via WebSocket server, waiting for save...');
        // WebSocket server will save audio when connection closes
        // For now, we'll check if it's already saved
        // In production, you might want to wait for the WebSocket server to finish
      }
    } catch (error) {
      console.log('[CallEnd] WebSocket server not available or session not found, using local chunks');
    }

    // If session exists, try to create audio from local chunks
    if (session) {
      const totalChunks = session.inputChunks.length + session.outputChunks.length;
      console.log('[CallEnd] Ending recording session:', conversationId, {
        inputChunks: session.inputChunks.length,
        outputChunks: session.outputChunks.length,
        totalChunks,
        duration: Date.now() - session.startTime,
      });

      if (totalChunks === 0) {
        console.warn('[CallEnd] ⚠️ WARNING: No audio chunks recorded for this call!');
        console.warn('[CallEnd] This means audio chunks were not sent to /api/calls/start (PUT)');
      }

      // Fallback: Create merged WAV file from local audio chunks (if WebSocket didn't capture)
      if (!audioUrl && (session.inputChunks.length > 0 || session.outputChunks.length > 0)) {
        try {
          console.log('[CallEnd] Creating WAV file from local chunks:', {
            inputChunks: session.inputChunks.length,
            outputChunks: session.outputChunks.length,
          });

          const wavBuffer = createMergedWavFile(
            session.inputChunks,
            session.outputChunks,
            24000 // ElevenLabs sample rate
          );

          console.log('[CallEnd] WAV file created, size:', wavBuffer.length, 'bytes');

          // Generate filename
          const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
          const filename = `${conversationId}_${timestamp}.wav`;

          // Upload to storage
          const storageConfig = getStorageConfig();
          console.log('[CallEnd] Storage config:', { type: storageConfig.type, localPath: storageConfig.localPath });
          
          audioUrl = await uploadAudioFile(wavBuffer, filename, storageConfig);

          console.log('[CallEnd] ✅ Audio file uploaded from local chunks:', audioUrl);
        } catch (error) {
          console.error('[CallEnd] ❌ Error creating/uploading audio file:', error);
          // Continue even if audio upload fails
          audioUrl = null;
        }
      } else if (!audioUrl) {
        console.warn('[CallEnd] ⚠️ No audio chunks to save (neither WebSocket nor local)');
      }

      // Clean up session
      deleteSession(conversationId);
    } else {
      // Session doesn't exist - this is OK, just log it
      console.log('[CallEnd] No session found for conversationId:', conversationId, '- call may not have been recorded or session expired');
    }

    // Save call metadata with audio URL
    const callData = {
      conversationId,
      audioUrl: audioUrl || null,
      duration: duration || (session ? Math.floor((Date.now() - session.startTime) / 1000) : 0),
      phoneNumber: phoneNumber || 'unknown',
      risk: risk || 0,
      status: status || 'unknown',
      createdAt: new Date().toISOString(),
    };

    console.log('[CallEnd] 📦 Returning call data:', {
      conversationId: callData.conversationId,
      audioUrl: callData.audioUrl,
      hasAudioUrl: !!callData.audioUrl,
      duration: callData.duration,
      phoneNumber: callData.phoneNumber,
    });

    // Save to call history (in production, save to database)
    saveCall(callData);

    // Return call metadata with audio URL
    return NextResponse.json(callData);
  } catch (error) {
    console.error('[CallEnd] Error:', error);
    return NextResponse.json(
      { error: 'Failed to end call recording' },
      { status: 500 }
    );
  }
}

