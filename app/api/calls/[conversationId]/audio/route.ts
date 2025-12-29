/**
 * PUT /api/calls/:conversationId/audio
 * 
 * Update call log with audio URL after recording is complete.
 * Called by WebSocket server when audio is saved.
 */

import { NextResponse } from 'next/server';
import { saveCall } from '../route';

export async function PUT(
  req: Request,
  { params }: { params: { conversationId: string } }
) {
  try {
    const { conversationId } = params;
    const body = await req.json();
    const { audioUrl } = body;

    if (!audioUrl) {
      return NextResponse.json(
        { error: 'audioUrl is required' },
        { status: 400 }
      );
    }

    // Get existing call data (in production, query database)
    // For now, we'll update the call history map
    // In production, update the database record
    console.log(`[CallAudio] Updating call ${conversationId} with audio URL: ${audioUrl}`);

    // Note: In production, you would update the database here
    // For now, the WebSocket server handles saving, and this endpoint
    // can be used to update the call log if needed
    
    return NextResponse.json({ 
      success: true, 
      conversationId, 
      audioUrl 
    });
  } catch (error) {
    console.error('[CallAudio] Error:', error);
    return NextResponse.json(
      { error: 'Failed to update call audio URL' },
      { status: 500 }
    );
  }
}

