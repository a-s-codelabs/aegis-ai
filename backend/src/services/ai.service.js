/**
 * AI Service
 *
 * Service for managing AI-related operations:
 * - Starting call sessions
 * - Analyzing transcript chunks
 * - Managing conversation context
 */

import { createCallSession, addTranscriptChunk, updateCallSession, getCallSession } from '../models/callSession.model.js';
import { analyzeTranscript } from './scamDetector.service.js';

/**
 * Start a new AI call session
 *
 * @param {Object} params - Call parameters
 * @param {string} params.callerNumber - Phone number of the caller
 * @param {string} params.userId - User ID
 * @param {Object} params.metadata - Optional metadata
 * @returns {Object} Call session with callId
 */
export async function startCall({ callerNumber, userId, metadata = {} }) {
  if (!callerNumber || !userId) {
    throw new Error('callerNumber and userId are required');
  }

  const session = createCallSession({
    callerNumber,
    userId,
    metadata,
  });

  console.log(`[AIService] Started call session: ${session.callId}`);

  return {
    callId: session.callId,
    callerNumber: session.callerNumber,
    status: session.status,
    createdAt: session.createdAt,
  };
}

/**
 * Analyze a transcript chunk and update call session
 *
 * @param {Object} params - Analysis parameters
 * @param {string} params.callId - Call session ID
 * @param {string|Array|Object} params.transcriptChunk - Transcript to analyze
 * @param {string} params.audioReference - Optional audio file reference
 * @returns {Object} Updated analysis results
 */
export async function analyzeCallChunk({ callId, transcriptChunk, audioReference }) {
  if (!callId) {
    throw new Error('callId is required');
  }

  if (!transcriptChunk && !audioReference) {
    throw new Error('Either transcriptChunk or audioReference is required');
  }

  // Get current session
  const session = getCallSession(callId);

  if (!session) {
    throw new Error(`Call session not found: ${callId}`);
  }

  // Add transcript chunk to session
  if (transcriptChunk) {
    let entry;

    if (typeof transcriptChunk === 'string') {
      // Simple string - assume it's from the caller
      entry = { speaker: 'Caller', text: transcriptChunk };
    } else if (Array.isArray(transcriptChunk)) {
      // Array of entries - add all
      transcriptChunk.forEach((chunk) => {
        addTranscriptChunk(callId, chunk);
      });
      // Use last entry for analysis
      entry = transcriptChunk[transcriptChunk.length - 1];
    } else {
      // Object with speaker and text
      entry = transcriptChunk;
    }

    if (entry) {
      addTranscriptChunk(callId, entry);
    }
  }

  // Analyze full transcript so far
  const analysis = await analyzeTranscript(session.transcript);

  // Update session with analysis results
  const updatedSession = updateCallSession(callId, {
    scamScore: analysis.scamScore,
    keywords: analysis.keywords,
  });

  console.log(`[AIService] Analyzed chunk for ${callId}, score: ${analysis.scamScore}`);

  return {
    callId,
    scamScore: analysis.scamScore,
    keywords: analysis.keywords,
    isScam: updatedSession.isScam,
    confidence: updatedSession.confidence,
    alert: analysis.alert,
    note: analysis.note,
  };
}

/**
 * Get ElevenLabs signed URL (if needed for voice integration)
 *
 * @returns {Object} Signed URL for ElevenLabs
 */
export async function getElevenLabsSignedUrl() {
  const agentId = process.env.ELEVENLABS_AGENT_ID;
  const apiKey = process.env.ELEVENLABS_API_KEY;

  if (!agentId || !apiKey) {
    throw new Error(
      'ElevenLabs configuration missing. Please add ELEVENLABS_AGENT_ID and ELEVENLABS_API_KEY to environment variables.'
    );
  }

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

    throw new Error(`Failed to get signed URL from ElevenLabs: ${errorData.message || errorText}`);
  }

  const data = await response.json();

  if (!data.signed_url) {
    throw new Error('Invalid response from ElevenLabs: missing signed_url');
  }

  return { signedUrl: data.signed_url };
}

