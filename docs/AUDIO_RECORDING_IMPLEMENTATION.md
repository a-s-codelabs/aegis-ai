# Real-Time Audio Recording Implementation

## Current Implementation

The audio recording system captures audio from ElevenLabs Agent calls in real-time using a **browser-based approach**:

### Architecture

```
Browser (ElevenLabsClient)
  ↓ WebSocket (direct to ElevenLabs)
ElevenLabs ConvAI API
  ↓ audio events (audio_output, audio_input)
Browser captures audio chunks
  ↓ HTTP PUT /api/calls/start
Backend buffers audio chunks
  ↓ On call end: POST /api/calls/end
Backend merges chunks → WAV file
  ↓ Upload to storage
Audio URL saved to call log
```

### How It Works

1. **Browser captures audio**: The `ElevenLabsClient` in the browser receives audio events from ElevenLabs WebSocket
2. **Chunks sent to backend**: Each audio chunk (base64 PCM16) is sent to `PUT /api/calls/start`
3. **Backend buffers**: Audio chunks are stored in memory (or Redis in production)
4. **Call ends**: When call ends, `POST /api/calls/end` merges all chunks into WAV
5. **Storage**: WAV file is uploaded to configured storage (local/S3/Supabase)
6. **Frontend display**: Audio player shows in call logs when `audioUrl` exists

## Message Types Handled

The system captures these ElevenLabs WebSocket message types:

- **`audio` / `audio_event`**: AI agent voice output (base64 PCM16)
  - Field: `eventData.audio_event.audio_base_64`
  - Captured as `output` type

- **`audio_input` / `audio_input_event`**: Caller voice (if ElevenLabs echoes it back)
  - Field: `eventData.audio_input_event.audio_base_64`
  - Captured as `input` type

- **`conversation_end_event`**: Call ended
  - Triggers audio file generation and upload

## Audio Format

- **Format**: PCM16 (16-bit signed integers)
- **Sample Rate**: 24kHz (ElevenLabs ConvAI) or 16kHz (realtime media)
- **Channels**: Mono (1 channel)
- **Encoding**: Base64 in WebSocket messages
- **Output**: WAV file (44-byte header + PCM data)

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

## Frontend Integration

### Call Logs Page

The call logs page (`app/(pages)/call-logs/page.tsx`) displays:

1. **Recorded Audio Player** (if `audioUrl` exists)
   - Shown above the transcript
   - Uses HTML5 `<audio controls />` element

2. **Conversation Transcript**
   - Shows full conversation between AI and caller
   - Keywords displayed in a row below the heading

3. **Call Metadata**
   - Phone number, date, duration
   - Risk score and status badge

## Storage Configuration

### Local Storage (Default)

```bash
AUDIO_STORAGE_TYPE=local
AUDIO_STORAGE_PATH=./public/recordings
```

Files are saved to `./public/recordings/` and accessible at `/recordings/filename.wav`

### S3 Storage

```bash
AUDIO_STORAGE_TYPE=s3
S3_BUCKET=your-bucket-name
S3_REGION=us-east-1
S3_ACCESS_KEY_ID=your-key
S3_SECRET_ACCESS_KEY=your-secret
```

### Supabase Storage

```bash
AUDIO_STORAGE_TYPE=supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_STORAGE_BUCKET=recordings
```

## Database Schema

See `docs/DATABASE_SCHEMA.md` for complete schema.

Key table: `call_recordings`
- `conversation_id` (unique)
- `audio_url` (TEXT, nullable)
- `duration` (INTEGER)
- `transcript` (JSONB)
- `keywords` (TEXT[])

## Troubleshooting

### Audio not captured

1. **Check browser console**: Look for errors in `ElevenLabsClient`
2. **Verify conversationId**: Ensure it's passed to `ElevenLabsClient` constructor
3. **Check network tab**: Verify `PUT /api/calls/start` requests are being sent
4. **Verify audio events**: Check if `audio_event` messages are received from ElevenLabs

### Audio file not generated

1. **Check backend logs**: Look for WAV creation errors
2. **Verify chunks exist**: Check session stats via `GET /api/calls/start?conversationId=...`
3. **Storage permissions**: Ensure write permissions for local storage
4. **Storage config**: Verify environment variables are set correctly

### Audio player not showing

1. **Check audioUrl**: Verify it's saved in call log (check localStorage or database)
2. **File accessibility**: Ensure audio file is accessible at the URL
3. **CORS issues**: If using external storage, check CORS settings
4. **Browser console**: Check for audio loading errors

## Important Notes

### Why Browser-Based Capture?

- **Next.js limitation**: API routes don't support WebSocket upgrades
- **Direct connection**: Browser connects directly to ElevenLabs (lower latency)
- **Real-time**: Audio is captured as it happens, not after the fact
- **No server overhead**: Reduces server load

### Alternative: Standalone WebSocket Server

If you need server-side audio capture, you can run a separate Node.js WebSocket server (see `server/websocket-server.ts`). This requires:

1. Install `ws` package: `npm install ws @types/ws`
2. Run separate server process
3. Update frontend to connect through proxy

### Audio Quality

- **Sample rate**: 24kHz (standard for voice)
- **Bit depth**: 16-bit PCM
- **File size**: ~1.5MB per minute of audio
- **Format**: WAV (uncompressed, high quality)

### Production Considerations

1. **Use Redis**: Replace in-memory session storage with Redis
2. **Database**: Store call metadata in PostgreSQL/MySQL
3. **CDN**: Serve audio files from CDN for faster playback
4. **Compression**: Consider MP3/OGG for smaller file sizes
5. **Cleanup**: Implement job to delete old audio files

## Code Locations

- **Audio capture**: `lib/utils/elevenlabs-client.ts` (lines 831-860)
- **Audio buffering**: `app/api/calls/start/route.ts`
- **WAV conversion**: `lib/utils/wav-writer.ts`
- **Storage upload**: `lib/utils/audio-storage.ts`
- **Call end**: `app/api/calls/end/route.ts`
- **Frontend display**: `app/(pages)/call-logs/page.tsx` (lines 276-294)

