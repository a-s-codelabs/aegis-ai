/**
 * Call Controller
 *
 * Handles HTTP requests for call-related endpoints
 */

import { getCallSession, completeCallSession } from '../models/callSession.model.js';
import { analyzeTranscript } from '../services/scamDetector.service.js';

/**
 * GET /api/call/result/:callId
 * Get final call result
 */
export async function getCallResult(req, res, next) {
  try {
    const { callId } = req.params;

    if (!callId) {
      return res.status(400).json({
        error: 'callId is required',
      });
    }

    let session = getCallSession(callId);

    if (!session) {
      return res.status(404).json({
        error: 'Call session not found',
      });
    }

    // If call is still active, perform final analysis
    if (session.status === 'active' && session.transcript.length > 0) {
      const finalAnalysis = await analyzeTranscript(session.transcript);

      session = completeCallSession(callId, {
        scamScore: finalAnalysis.scamScore,
        keywords: finalAnalysis.keywords,
        summary: session.transcript
          .map((entry) => `${entry.speaker}: ${entry.text}`)
          .join('\n')
          .substring(0, 500), // Limit summary length
      });
    }

    // Return final result
    res.json({
      callId: session.callId,
      isScam: session.isScam,
      confidence: session.confidence,
      scamScore: session.scamScore,
      keywords: session.keywords,
      summary: session.summary || 'No summary available',
      status: session.status,
      callerNumber: session.callerNumber,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
    });
  } catch (error) {
    next(error);
  }
}

