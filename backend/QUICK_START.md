# Backend Quick Start Guide

## 1. Install Dependencies

```bash
cd backend
npm install
```

## 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and add your API keys:

```env
PORT=3001
GROQ_API_KEY=your_groq_api_key_here
ELEVENLABS_AGENT_ID=your_elevenlabs_agent_id_here  # Optional
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here    # Optional
```

**Note:** `GROQ_API_KEY` is required for AI analysis. ElevenLabs keys are optional (only needed for voice integration).

## 3. Start the Server

```bash
npm run dev
```

You should see:
```
🚀 Backend API server running on http://0.0.0.0:3001
📡 Health check: http://0.0.0.0:3001/health
🤖 AI endpoints: http://0.0.0.0:3001/api/ai/*
📞 Call endpoints: http://0.0.0.0:3001/api/call/*
```

## 4. Test the API

### Health Check
```bash
curl http://localhost:3001/health
```

### Start a Call Session
```bash
curl -X POST http://localhost:3001/api/ai/start-call \
  -H "Content-Type: application/json" \
  -d '{
    "callerNumber": "+15551234567",
    "userId": "user123"
  }'
```

Response:
```json
{
  "callId": "call_1234567890_abc123",
  "callerNumber": "+15551234567",
  "status": "active",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

### Analyze Transcript
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

### Get Call Result
```bash
curl http://localhost:3001/api/call/result/call_1234567890_abc123
```

## Troubleshooting

### "GROQ_API_KEY not set"
- Make sure you've created `.env` file
- Check that `GROQ_API_KEY` is set correctly
- The service will still work with pattern-based detection, but AI analysis won't be available

### Port Already in Use
- Change `PORT` in `.env` to a different port (e.g., 3002)
- Or stop the process using port 3001

### Module Not Found
- Run `npm install` again
- Make sure you're in the `backend` directory

## Next Steps

- Integrate with your mobile app
- See [README.md](./README.md) for full API documentation
- See [../PROJECT_STRUCTURE.md](../PROJECT_STRUCTURE.md) for project overview

