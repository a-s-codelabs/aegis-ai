/**
 * GET /api/calls/:conversationId
 * 
 * Get call recording metadata and audio URL.
 */

import { NextResponse } from 'next/server';

// In production, this would query a database
// For now, we'll return a placeholder
const callHistory = new Map<string, {
  conversationId: string;
  audioUrl: string | null;
  duration: number;
  phoneNumber: string;
  risk?: number;
  status: string;
  createdAt: string;
}>();

export async function GET(
  req: Request,
  { params }: { params: { conversationId: string } }
) {
  try {
    const { conversationId } = params;

    const call = callHistory.get(conversationId);
    if (!call) {
      return NextResponse.json(
        { error: 'Call not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(call);
  } catch (error) {
    console.error('[CallGet] Error:', error);
    return NextResponse.json(
      { error: 'Failed to get call' },
      { status: 500 }
    );
  }
}

// Helper to save call (called from end route)
export function saveCall(callData: {
  conversationId: string;
  audioUrl: string | null;
  duration: number;
  phoneNumber: string;
  risk?: number;
  status: string;
  createdAt: string;
}) {
  callHistory.set(callData.conversationId, callData);
  console.log(`[CallStorage] Saved call ${callData.conversationId} with audio URL: ${callData.audioUrl}`);
}

// Export helper to get all calls (for debugging)
export function getAllCalls() {
  return Array.from(callHistory.values());
}

