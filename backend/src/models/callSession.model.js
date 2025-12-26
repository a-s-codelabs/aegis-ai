/**
 * Call Session Model
 *
 * In-memory storage for call sessions.
 * In production, this would be replaced with a database (MongoDB, PostgreSQL, etc.)
 */

// In-memory store for call sessions
const callSessions = new Map();

/**
 * Create a new call session
 *
 * @param {Object} params - Call session parameters
 * @param {string} params.callerNumber - Phone number of the caller
 * @param {string} params.userId - User ID who initiated/owns the call
 * @param {Object} params.metadata - Optional metadata
 * @returns {Object} Call session object
 */
export function createCallSession({ callerNumber, userId, metadata = {} }) {
  const callId = `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const session = {
    callId,
    callerNumber,
    userId,
    metadata,
    status: 'active', // active, completed, failed
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    transcript: [], // Array of { speaker, text, timestamp }
    scamScore: 0,
    keywords: [],
    confidence: 0,
    isScam: false,
    summary: '',
  };

  callSessions.set(callId, session);

  console.log(`[CallSession] Created session: ${callId} for user: ${userId}`);

  return session;
}

/**
 * Get a call session by ID
 *
 * @param {string} callId - Call session ID
 * @returns {Object|null} Call session or null if not found
 */
export function getCallSession(callId) {
  return callSessions.get(callId) || null;
}

/**
 * Update call session
 *
 * @param {string} callId - Call session ID
 * @param {Object} updates - Fields to update
 * @returns {Object|null} Updated call session or null if not found
 */
export function updateCallSession(callId, updates) {
  const session = callSessions.get(callId);

  if (!session) {
    return null;
  }

  // Update fields
  Object.assign(session, updates, {
    updatedAt: new Date().toISOString(),
  });

  // Update scam status based on score (threshold: >40% = scam)
  if (updates.scamScore !== undefined) {
    session.isScam = updates.scamScore > 40; // Threshold: 40
    session.confidence = Math.min(updates.scamScore / 100, 1); // Normalize to 0-1
  }

  callSessions.set(callId, session);

  return session;
}

/**
 * Add transcript chunk to call session
 *
 * @param {string} callId - Call session ID
 * @param {Object} transcriptEntry - { speaker, text }
 * @returns {Object|null} Updated call session or null if not found
 */
export function addTranscriptChunk(callId, transcriptEntry) {
  const session = callSessions.get(callId);

  if (!session) {
    return null;
  }

  const entry = {
    ...transcriptEntry,
    timestamp: new Date().toISOString(),
  };

  session.transcript.push(entry);
  session.updatedAt = new Date().toISOString();

  callSessions.set(callId, session);

  return session;
}

/**
 * Complete a call session
 *
 * @param {string} callId - Call session ID
 * @param {Object} finalData - Final analysis data
 * @returns {Object|null} Completed call session or null if not found
 */
export function completeCallSession(callId, finalData = {}) {
  const session = callSessions.get(callId);

  if (!session) {
    return null;
  }

  // Generate summary if not provided
  if (!finalData.summary && session.transcript.length > 0) {
    const transcriptText = session.transcript
      .map((entry) => `${entry.speaker}: ${entry.text}`)
      .join('\n');
    finalData.summary = `Call transcript: ${transcriptText.substring(0, 200)}...`;
  }

  return updateCallSession(callId, {
    ...finalData,
    status: 'completed',
  });
}

/**
 * Get all call sessions for a user
 *
 * @param {string} userId - User ID
 * @returns {Array} Array of call sessions
 */
export function getUserCallSessions(userId) {
  return Array.from(callSessions.values()).filter(
    (session) => session.userId === userId
  );
}

/**
 * Delete a call session (cleanup)
 *
 * @param {string} callId - Call session ID
 * @returns {boolean} True if deleted, false if not found
 */
export function deleteCallSession(callId) {
  return callSessions.delete(callId);
}

