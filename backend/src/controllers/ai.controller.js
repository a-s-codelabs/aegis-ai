/**
 * AI Controller
 *
 * Handles HTTP requests for AI-related endpoints
 */

import * as aiService from '../services/ai.service.js';

/**
 * POST /api/ai/start-call
 * Start a new AI call session
 */
export async function startCall(req, res, next) {
  try {
    const { callerNumber, userId, metadata } = req.body;

    if (!callerNumber || !userId) {
      return res.status(400).json({
        error: 'callerNumber and userId are required',
      });
    }

    const result = await aiService.startCall({
      callerNumber,
      userId,
      metadata: metadata || {},
    });

    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/ai/analyze
 * Analyze a transcript chunk
 */
export async function analyze(req, res, next) {
  try {
    const { callId, transcriptChunk, audioReference } = req.body;

    if (!callId) {
      return res.status(400).json({
        error: 'callId is required',
      });
    }

    if (!transcriptChunk && !audioReference) {
      return res.status(400).json({
        error: 'Either transcriptChunk or audioReference is required',
      });
    }

    const result = await aiService.analyzeCallChunk({
      callId,
      transcriptChunk,
      audioReference,
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/ai/elevenlabs-signed-url
 * Get ElevenLabs signed URL for voice integration
 */
export async function getElevenLabsSignedUrl(req, res, next) {
  try {
    const result = await aiService.getElevenLabsSignedUrl();
    res.json(result);
  } catch (error) {
    next(error);
  }
}

