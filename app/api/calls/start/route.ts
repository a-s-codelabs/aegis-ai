/**
 * POST /api/calls/start
 * 
 * Start a new call recording session.
 * Creates a conversation ID and initializes audio buffers.
 */

import { NextResponse } from 'next/server';

// In-memory storage for active call sessions
// In production, use Redis or a database
const activeSessions = new Map<string, {
  conversationId: string;
  startTime: number;
  inputChunks: Array<{ base64Data: string; timestamp: number }>;
  outputChunks: Array<{ base64Data: string; timestamp: number }>;
}>();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { phoneNumber, userId } = body;

    if (!phoneNumber) {
      return NextResponse.json(
        { error: 'phoneNumber is required' },
        { status: 400 }
      );
    }

    // Generate conversation ID
    const conversationId = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Initialize session
    activeSessions.set(conversationId, {
      conversationId,
      startTime: Date.now(),
      inputChunks: [],
      outputChunks: [],
    });

    console.log('[CallStart] Started recording session:', conversationId);

    return NextResponse.json({
      conversationId,
      startTime: activeSessions.get(conversationId)!.startTime,
    });
  } catch (error) {
    console.error('[CallStart] Error:', error);
    return NextResponse.json(
      { error: 'Failed to start call recording' },
      { status: 500 }
    );
  }
}

/**
 * Add audio chunk to active session
 * Called from WebSocket handler or frontend
 */
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { conversationId, type, base64Data } = body;

    if (!conversationId || !type || !base64Data) {
      return NextResponse.json(
        { error: 'conversationId, type, and base64Data are required' },
        { status: 400 }
      );
    }

    const session = activeSessions.get(conversationId);
    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    const chunk = {
      base64Data,
      timestamp: Date.now() - session.startTime,
    };

    if (type === 'input') {
      session.inputChunks.push(chunk);
    } else if (type === 'output') {
      session.outputChunks.push(chunk);
    } else {
      return NextResponse.json(
        { error: 'Invalid type. Must be "input" or "output"' },
        { status: 400 }
      );
    }

    // Log periodically to verify chunks are being received
    const totalChunks = session.inputChunks.length + session.outputChunks.length;
    if (totalChunks === 1 || totalChunks % 100 === 0) {
      console.log(`[CallStart] ✅ Received ${type} audio chunk for ${conversationId}:`, {
        totalChunks,
        inputChunks: session.inputChunks.length,
        outputChunks: session.outputChunks.length,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[CallStart] Error adding chunk:', error);
    return NextResponse.json(
      { error: 'Failed to add audio chunk' },
      { status: 500 }
    );
  }
}

/**
 * Get active session (for debugging)
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const conversationId = searchParams.get('conversationId');

  if (!conversationId) {
    return NextResponse.json(
      { error: 'conversationId is required' },
      { status: 400 }
    );
  }

  const session = activeSessions.get(conversationId);
  if (!session) {
    return NextResponse.json(
      { error: 'Session not found' },
      { status: 404 }
    );
  }

  return NextResponse.json({
    conversationId: session.conversationId,
    startTime: session.startTime,
    duration: Date.now() - session.startTime,
    inputChunks: session.inputChunks.length,
    outputChunks: session.outputChunks.length,
  });
}

// Export helper to get session data (used by end route)
export function getSession(conversationId: string) {
  return activeSessions.get(conversationId);
}

export function deleteSession(conversationId: string) {
  activeSessions.delete(conversationId);
}

