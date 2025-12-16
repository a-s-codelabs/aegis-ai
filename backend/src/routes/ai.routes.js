/**
 * AI Routes
 *
 * Routes for AI-related endpoints
 */

import express from 'express';
import * as aiController from '../controllers/ai.controller.js';

const router = express.Router();

// POST /api/ai/start-call
// Start a new AI call session
router.post('/start-call', aiController.startCall);

// POST /api/ai/analyze
// Analyze a transcript chunk
router.post('/analyze', aiController.analyze);

// GET /api/ai/elevenlabs-signed-url
// Get ElevenLabs signed URL (optional, for voice integration)
router.get('/elevenlabs-signed-url', aiController.getElevenLabsSignedUrl);

export default router;

