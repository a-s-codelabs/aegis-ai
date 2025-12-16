/**
 * Call Routes
 *
 * Routes for call-related endpoints
 */

import express from 'express';
import * as callController from '../controllers/call.controller.js';

const router = express.Router();

// GET /api/call/result/:callId
// Get final call result
router.get('/result/:callId', callController.getCallResult);

export default router;

