# Anti-Scam Backend API

Backend API service for the Anti-Scam mobile application. This service provides REST endpoints for AI-powered scam call detection.

## Features

- 🤖 AI-powered scam detection using Groq LLM
- 📞 Call session management
- 🔍 Real-time transcript analysis
- 🎯 Pattern-based and AI-based detection
- 🔊 ElevenLabs voice integration support

## Quick Start

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and fill in your API keys:

```bash
cp .env.example .env
```

Edit `.env`:
```env
PORT=3001
GROQ_API_KEY=your_groq_api_key_here
ELEVENLABS_AGENT_ID=your_elevenlabs_agent_id_here  # Optional
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here    # Optional
```

### 3. Run the Server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will start on `http://localhost:3001` (or the port specified in `.env`).

## API Endpoints

### Health Check

```
GET /health
```

Returns server status.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Start Call Session

```
POST /api/ai/start-call
```

Start a new AI call session.

**Request Body:**
```json
{
  "callerNumber": "+15551234567",
  "userId": "user123",
  "metadata": {
    "deviceId": "device123",
    "platform": "android"
  }
}
```

**Response:**
```json
{
  "callId": "call_1234567890_abc123",
  "callerNumber": "+15551234567",
  "status": "active",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

### Analyze Transcript

```
POST /api/ai/analyze
```

Analyze a transcript chunk and update scam score incrementally.

**Request Body:**
```json
{
  "callId": "call_1234567890_abc123",
  "transcriptChunk": {
    "speaker": "Caller",
    "text": "Hello, this is urgent regarding your bank account."
  }
}
```

**Alternative formats:**
```json
{
  "callId": "call_1234567890_abc123",
  "transcriptChunk": "Hello, this is urgent regarding your bank account."
}
```

```json
{
  "callId": "call_1234567890_abc123",
  "transcriptChunk": [
    { "speaker": "Caller", "text": "Hello" },
    { "speaker": "User", "text": "Hi" }
  ]
}
```

**Response:**
```json
{
  "callId": "call_1234567890_abc123",
  "scamScore": 75,
  "keywords": ["urgent", "bank account", "verify"],
  "isScam": true,
  "confidence": 0.75,
  "alert": "High risk scam call detected"
}
```

### Get Call Result

```
GET /api/call/result/:callId
```

Get final call analysis result.

**Response:**
```json
{
  "callId": "call_1234567890_abc123",
  "isScam": true,
  "confidence": 0.87,
  "scamScore": 87,
  "keywords": ["urgent", "bank account", "verify", "immediately"],
  "summary": "Call transcript: Caller: Hello, this is urgent...",
  "status": "completed",
  "callerNumber": "+15551234567",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:05:00.000Z"
}
```

### ElevenLabs Signed URL (Optional)

```
GET /api/ai/elevenlabs-signed-url
```

Get signed URL for ElevenLabs voice integration.

**Response:**
```json
{
  "signedUrl": "https://..."
}
```

## Architecture

```
backend/
├── src/
│   ├── app.js              # Express app setup
│   ├── server.js           # Server entry point
│   ├── routes/             # API routes
│   │   ├── ai.routes.js
│   │   └── call.routes.js
│   ├── controllers/        # Request handlers
│   │   ├── ai.controller.js
│   │   └── call.controller.js
│   ├── services/           # Business logic
│   │   ├── ai.service.js
│   │   └── scamDetector.service.js
│   └── models/             # Data models
│       └── callSession.model.js
├── .env.example
├── package.json
└── README.md
```

## Scam Detection Logic

The service uses a two-layer detection approach:

1. **Pattern Matching**: Detects known scam keywords (e.g., "social security number", "urgent action required")
2. **AI Analysis**: Uses Groq LLM to analyze conversation context and detect sophisticated scams

**Scam Score Threshold:**
- Score > 60: Marked as scam
- Score ≤ 60: Marked as safe

## Error Handling

All endpoints return appropriate HTTP status codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request (missing/invalid parameters)
- `404`: Not Found (call session not found)
- `500`: Internal Server Error

Error responses:
```json
{
  "error": "Error message here"
}
```

## Testing with cURL

### Start a call:
```bash
curl -X POST http://localhost:3001/api/ai/start-call \
  -H "Content-Type: application/json" \
  -d '{
    "callerNumber": "+15551234567",
    "userId": "user123"
  }'
```

### Analyze transcript:
```bash
curl -X POST http://localhost:3001/api/ai/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "callId": "call_1234567890_abc123",
    "transcriptChunk": {
      "speaker": "Caller",
      "text": "Hello, this is urgent regarding your bank account."
    }
  }'
```

### Get result:
```bash
curl http://localhost:3001/api/call/result/call_1234567890_abc123
```

## Notes

- Call sessions are stored in-memory (will be lost on server restart)
- For production, replace in-memory storage with a database (MongoDB, PostgreSQL, etc.)
- The service is designed to be stateless and scalable
- CORS is enabled for mobile app integration

