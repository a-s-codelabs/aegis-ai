# ElevenLabs Media Streaming Setup

This document explains how ElevenLabs call audio recording works with media streaming enabled.

## Overview

When calls are started with ElevenLabs Agents API, media streaming can be enabled to capture audio directly on the backend. This allows audio recordings to appear in call logs.

## Architecture

```
Browser (ElevenLabsClient)
  ↓
POST /api/elevenlabs-signed-url (with conversationId)
  ↓
ElevenLabs Agents API (starts conversation with media streaming)
  ↓
ElevenLabs connects to: ws://<BACKEND_DOMAIN>/ws/elevenlabs-media
  ↓
WebSocket Server (server/websocket-server.ts)
  ↓
Captures audio_output, audio_input events
  ↓
Saves WAV file (16kHz mono) when call ends
  ↓
Updates call log with audio_url
```

## Key Changes

### 1. Modified `/api/elevenlabs-signed-url` Route

- Now accepts `conversationId` in request body
- Uses ElevenLabs Agents API (`/v1/convai/conversation/start`) instead of just getting signed URL
- Enables media streaming when `conversationId` is provided:
  ```json
  {
    "agent_id": "...",
    "media": {
      "stream": true,
      "websocket_url": "wss://<BACKEND_DOMAIN>/ws/elevenlabs-media"
    }
  }
  ```

### 2. WebSocket Server (`server/websocket-server.ts`)

- Accepts connections from ElevenLabs (not from browser)
- Handles events:
  - `audio_output` - AI agent voice (base64 PCM)
  - `audio_input` - Caller voice (base64 PCM)
  - `call_end` - Call termination
- Buffers audio chunks per `conversationId`
- Converts to WAV (16kHz mono) when call ends
- Saves to storage and updates call log

### 3. Updated ElevenLabsClient

- Now passes `conversationId` when requesting signed URL
- Enables media streaming automatically if `conversationId` is provided in options

### 4. Call End API

- Checks WebSocket server for saved audio first
- Falls back to local audio chunks if WebSocket didn't capture

## Setup Instructions

### 1. Install Dependencies

```bash
npm install ws
npm install --save-dev @types/ws
```

### 2. Environment Variables

Add to `.env.local`:

```bash
# Backend domain for WebSocket URL
NEXT_PUBLIC_BACKEND_DOMAIN=your-domain.com
# Or use VERCEL_URL for Vercel deployments
VERCEL_URL=your-app.vercel.app

# ElevenLabs API
ELEVENLABS_API_KEY=your_api_key
ELEVENLABS_AGENT_ID=your_agent_id
# Or use voice-specific agents:
ELEVENLABS_AGENT_ID_DEFAULT=your_default_agent_id
ELEVENLABS_AGENT_ID_FEMALE=your_female_agent_id
ELEVENLABS_AGENT_ID_MALE=your_male_agent_id
```

### 3. Start WebSocket Server

#### Option A: Custom Next.js Server (Recommended)

Use the custom server (`server.js`) that handles both HTTP and WebSocket:

```bash
node server.js
```

Or add to `package.json`:
```json
{
  "scripts": {
    "dev:server": "node server.js",
    "start:server": "NODE_ENV=production node server.js"
  }
}
```

#### Option B: Separate WebSocket Server

Run the WebSocket server separately:

```typescript
import { startWebSocketServer } from './server/websocket-server';

const wss = startWebSocketServer(3001);
console.log('WebSocket server running on port 3001');
```

Then use a reverse proxy (nginx, Caddy) to route `/ws/elevenlabs-media` to port 3001.

### 4. Verify Setup

1. Start a call with conversationId
2. Check console logs for:
   - `[ElevenLabs] Media streaming enabled for conversation: <id>`
   - `[WS Server] New connection from ElevenLabs`
   - `[WS Server] Received audio_output chunk`
3. End the call
4. Check for:
   - `[WS Server] ✅ Audio saved for <id>: <url>`
   - Audio player appears in call logs

## Troubleshooting

### Audio not appearing in call logs

1. **Check WebSocket server is running**
   - Verify logs show `[WS Server] WebSocket server started`
   - Check that ElevenLabs can connect to your WebSocket URL

2. **Verify media streaming is enabled**
   - Check console for `[ElevenLabs] Media streaming enabled`
   - Ensure `conversationId` is passed to ElevenLabsClient

3. **Check WebSocket connection**
   - Look for `[WS Server] New connection from ElevenLabs`
   - Verify `audio_output` events are being received

4. **Check audio saving**
   - Look for `[WS Server] ✅ Audio saved` message
   - Verify storage configuration is correct

### WebSocket server not starting

- Ensure `ws` package is installed
- Check port is not already in use
- Verify TypeScript compilation if using TS files

### Audio URL not persisting

- Check `/api/calls/:conversationId/audio` endpoint is accessible
- Verify call log update logic in WebSocket server
- Check database/storage permissions

## API Reference

### POST /api/elevenlabs-signed-url

**Request:**
```json
{
  "voice": "default" | "female" | "male",
  "conversationId": "conv_123..." // Optional, enables media streaming
}
```

**Response:**
```json
{
  "signedUrl": "wss://...",
  "conversationId": "conv_123...",
  "mediaStreamingEnabled": true
}
```

### WebSocket: ws://<domain>/ws/elevenlabs-media

**Connection:** ElevenLabs connects to this endpoint when media streaming is enabled.

**Events Received:**
- `audio_output` - AI voice audio (base64 PCM)
- `audio_input` - Caller voice audio (base64 PCM)
- `call_end` - Call termination

**Events Sent:**
- None (server only receives)

## Important Notes

1. **Media streaming must be enabled at call start** - Cannot be enabled mid-call
2. **Past calls cannot be recovered** - Only calls started with media streaming will have recordings
3. **WebSocket server must be running** - Audio won't be captured if server is down
4. **ConversationId is required** - Media streaming only works when conversationId is provided

## Validation Checklist

- [ ] Console logs show `audio_output` events during calls
- [ ] WAV file is created after call ends
- [ ] Audio plays in call log UI
- [ ] Audio URL is persisted in call_logs
- [ ] WebSocket server accepts connections before call starts
- [ ] All message types are logged for debugging

