# Real-Time Audio Recording for ElevenLabs Agent Calls

## Overview

This implementation captures audio from ElevenLabs Agent calls in real-time and stores it for playback in call logs.

## Architecture

```
Browser (ElevenLabsClient)
  ↓ WebSocket
ElevenLabs ConvAI API
  ↓ audio_output, audio_input events
Browser captures audio chunks
  ↓ HTTP PUT /api/calls/start
Backend buffers audio chunks
  ↓ On call end: POST /api/calls/end
Backend merges chunks → WAV file
  ↓ Upload to storage
Audio URL saved to call log
```

## Implementation Details

### 1. Audio Capture

**Location:** `lib/utils/elevenlabs-client.ts`

The `ElevenLabsClient` class captures audio in two ways:

- **Audio Output (AI Voice)**: Captured from `audio_event.audio_base_64` messages
- **Audio Input (Caller Voice)**: Captured from microphone and sent to backend via `PUT /api/calls/start`

### 2. Backend Audio Buffering

**Location:** `app/api/calls/start/route.ts`

- `POST /api/calls/start` - Creates a new recording session
- `PUT /api/calls/start` - Adds audio chunks to the session buffer
- Buffers both `input` (caller) and `output` (AI) audio chunks

### 3. Audio Processing

**Location:** `lib/utils/wav-writer.ts`

- Converts base64 PCM16 audio chunks to WAV format
- Supports merging input and output audio by timestamp
- Sample rate: 24kHz (ElevenLabs ConvAI) or 16kHz (realtime media)

### 4. Storage

**Location:** `lib/utils/audio-storage.ts`

- Supports local filesystem, S3, or Supabase storage
- Configure via environment variables:
  - `AUDIO_STORAGE_TYPE=local|s3|supabase`
  - `AUDIO_STORAGE_PATH=./public/recordings` (for local)

### 5. Call End & Save

**Location:** `app/api/calls/end/route.ts`

- Merges all audio chunks into a single WAV file
- Uploads to configured storage
- Returns `audioUrl` for frontend display

### 6. Frontend Display

**Location:** `app/(pages)/call-logs/page.tsx`

- Displays audio player above transcript when `audioUrl` exists
- Uses HTML5 `<audio controls />` element

## WebSocket Server (Optional)

**Location:** `server/websocket-server.ts`

A standalone WebSocket server that can proxy ElevenLabs connections and capture audio server-side. This is useful if you want to capture audio without relying on the browser.

### Usage

```typescript
import { startWebSocketServer } from './server/websocket-server';

// Start WebSocket server on port 3001
const wss = startWebSocketServer(3001);
```

### Client Connection

```javascript
const ws = new WebSocket('ws://localhost:3001?conversationId=conv_123&signedUrl=...');
```

## Database Schema

See `docs/DATABASE_SCHEMA.md` for the complete database schema.

Key fields:
- `conversation_id` - Unique identifier for the call
- `audio_url` - URL to the recorded WAV file
- `duration` - Call duration in seconds
- `transcript` - JSON array of conversation entries
- `keywords` - Array of detected scam keywords

## Environment Variables

```bash
# Audio Storage
AUDIO_STORAGE_TYPE=local  # or 's3' or 'supabase'
AUDIO_STORAGE_PATH=./public/recordings

# S3 (if using S3 storage)
S3_BUCKET=your-bucket-name
S3_REGION=us-east-1
S3_ACCESS_KEY_ID=your-key
S3_SECRET_ACCESS_KEY=your-secret

# Supabase (if using Supabase storage)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_STORAGE_BUCKET=recordings
```

## API Endpoints

### POST /api/calls/start
Start a new call recording session.

**Request:**
```json
{
  "phoneNumber": "+1234567890",
  "userId": "user_123"
}
```

**Response:**
```json
{
  "conversationId": "conv_1234567890_abc",
  "startTime": 1234567890
}
```

### PUT /api/calls/start
Add audio chunk to active session.

**Request:**
```json
{
  "conversationId": "conv_1234567890_abc",
  "type": "input",  // or "output"
  "base64Data": "base64_encoded_pcm16_audio"
}
```

### POST /api/calls/end
End call recording and save audio file.

**Request:**
```json
{
  "conversationId": "conv_1234567890_abc",
  "phoneNumber": "+1234567890",
  "duration": 120,
  "risk": 75,
  "status": "scam"
}
```

**Response:**
```json
{
  "conversationId": "conv_1234567890_abc",
  "audioUrl": "/recordings/conv_1234567890_abc_2025-12-18T12-00-00.wav",
  "duration": 120,
  "phoneNumber": "+1234567890",
  "risk": 75,
  "status": "scam",
  "createdAt": "2025-12-18T12:00:00.000Z"
}
```

### GET /api/calls/:conversationId
Get call metadata including audio URL.

**Response:**
```json
{
  "conversationId": "conv_1234567890_abc",
  "audioUrl": "/recordings/conv_1234567890_abc_2025-12-18T12-00-00.wav",
  "duration": 120,
  "phoneNumber": "+1234567890",
  "risk": 75,
  "status": "scam",
  "createdAt": "2025-12-18T12:00:00.000Z"
}
```

## Message Types from ElevenLabs

The system handles these ElevenLabs WebSocket message types:

- `audio` / `audio_event` - AI voice output (base64 PCM)
- `audio_input` / `audio_input_event` - Caller voice (if echoed back)
- `conversation_end_event` - Call ended
- `user_transcript` - Caller speech transcription
- `agent_response` - AI agent text response

## Audio Format

- **Format**: PCM16 (16-bit signed integers)
- **Sample Rate**: 24kHz (ConvAI) or 16kHz (realtime media)
- **Channels**: Mono (1 channel)
- **Encoding**: Base64 in WebSocket messages
- **Output**: WAV file (44-byte header + PCM data)

## Troubleshooting

### Audio not being captured

1. Check browser console for errors
2. Verify `conversationId` is being passed to `ElevenLabsClient`
3. Check network tab for `PUT /api/calls/start` requests
4. Verify audio chunks are being received (check session stats)

### Audio file not generated

1. Check backend logs for WAV creation errors
2. Verify storage configuration (local path, S3 credentials, etc.)
3. Check file permissions for local storage
4. Verify audio chunks exist before call ends

### Audio player not showing

1. Verify `audioUrl` is saved in call log
2. Check browser console for audio loading errors
3. Verify audio file is accessible at the URL
4. Check CORS settings if using external storage

## Future Improvements

- [ ] Add audio compression (MP3/OGG) for smaller file sizes
- [ ] Implement audio streaming for long calls
- [ ] Add audio quality settings
- [ ] Support separate tracks for caller and AI
- [ ] Add audio transcription from WAV files
- [ ] Implement audio search/filtering

