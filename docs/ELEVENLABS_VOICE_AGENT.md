# ElevenLabs Voice Agent Setup Guide

## Current Implementation

You are **already using a voice agent** via ElevenLabs ConvAI! The current implementation provides:

- ✅ Real-time bidirectional voice conversation
- ✅ Microphone audio streaming to AI
- ✅ AI voice responses
- ✅ Real-time transcription
- ✅ Scam detection integration

## Architecture

```
Caller (Microphone) 
  ↓
Browser (ElevenLabsClient)
  ↓
WebSocket → ElevenLabs ConvAI API
  ↓
AI Agent (responds with voice)
  ↓
Browser (plays audio)
```

## Current API Endpoint

Your code uses the **ConvAI API**:
```
GET /v1/convai/conversation/get-signed-url?agent_id={agent_id}
```

This is a **voice agent** that:
- Listens to caller's microphone
- Responds with AI-generated voice
- Provides real-time transcription

## Agents Platform vs ConvAI

### ConvAI (Current - What You're Using)
- ✅ Simple voice conversation
- ✅ Real-time bidirectional audio
- ✅ Basic agent configuration
- ✅ Works with `ELEVENLABS_AGENT_ID`

### Agents Platform (Advanced Features)
- ✅ All ConvAI features PLUS:
- ✅ Workflows (multi-step conversations)
- ✅ Knowledge bases (RAG)
- ✅ Tools (API integrations)
- ✅ Custom authentication
- ✅ Analytics & monitoring
- ✅ Conversation retention

## Setting Up Your Voice Agent

### Step 1: Create an Agent

1. Go to [ElevenLabs Agents Dashboard](https://elevenlabs.io/app/agents)
2. Click **"Create Agent"**
3. Configure your agent:
   - **Name**: "Call Screening Agent" (or your choice)
   - **Voice**: Select from 5k+ voices
   - **Language**: Choose language
   - **System Prompt**: Define agent behavior
   - **Knowledge Base**: (Optional) Upload documents
   - **Tools**: (Optional) Connect APIs

### Step 2: Get Your Agent ID

1. After creating the agent, copy the **Agent ID**
2. It looks like: `agent_abc123xyz...`
3. Add it to your `.env.local`:

```bash
ELEVENLABS_AGENT_ID=agent_abc123xyz...
ELEVENLABS_API_KEY=your_api_key_here
```

### Step 3: Configure API Key Permissions

Your API key **MUST** have these permissions:
- ✅ `convai_write` (for ConvAI/voice agents)
- ✅ `agents_read` (to read agent config)
- ✅ `agents_write` (to create/manage agents)

**To enable permissions:**
1. Go to [API Keys Settings](https://elevenlabs.io/app/settings/api-keys)
2. Edit your API key
3. Enable **"Write"** permission for **"ElevenLabs Agents"**
4. Save changes

### Step 4: Test Your Agent

1. Start your Next.js app
2. Go to Dashboard
3. Click "Divert to AI Protection"
4. Speak into your microphone
5. The AI should respond!

## Current Code Structure

### API Route
**File**: `app/api/elevenlabs-signed-url/route.ts`
- Fetches signed WebSocket URL from ElevenLabs
- Uses `ELEVENLABS_AGENT_ID` to identify your agent

### Client Library
**File**: `lib/utils/elevenlabs-client.ts`
- `ElevenLabsClient` class handles:
  - WebSocket connection
  - Microphone audio capture
  - Audio streaming to ElevenLabs
  - AI response playback
  - Real-time transcription

### Dashboard Integration
**File**: `app/(pages)/dashboard/page.tsx`
- `handleDivertToAI()` function:
  - Initializes `ElevenLabsClient`
  - Sets up callbacks for transcripts
  - Integrates with scam detection

## Voice Agent Features You're Using

### ✅ Real-Time Audio Streaming
- Microphone → Browser → ElevenLabs
- Format: PCM16, 24kHz, Mono
- Base64 encoded, sent via WebSocket

### ✅ AI Voice Responses
- ElevenLabs generates natural speech
- Plays through browser speakers
- Configurable playback rate (default: 0.75x for clarity)

### ✅ Real-Time Transcription
- Caller speech → Text (via ElevenLabs)
- AI responses → Text
- Used for scam detection

### ✅ Scam Detection Integration
- Caller transcripts analyzed by Gemini AI
- Real-time scam score calculation
- Keyword extraction

## Troubleshooting

### "Audio not reaching AI"

**Check console logs:**
```
[ElevenLabsClient] ✅✅✅ FIRST AUDIO CHUNK SENT TO ELEVENLABS! ✅✅✅
[ElevenLabsClient] 🔊 Audio detected in chunk 1! Your voice is being sent!
[ElevenLabsClient] 🎤 ✅✅✅ CONFIRMED: Caller audio received by AI! ✅✅✅
```

**If you see "🔇 Silence":**
1. Check Windows microphone settings
2. Ensure microphone is enabled
3. Speak louder/closer to mic
4. Check browser permissions

### "401 Unauthorized" Error

**Solution:**
1. Verify API key has `convai_write` permission
2. Check `ELEVENLABS_API_KEY` in `.env.local`
3. Restart Next.js dev server after changing env vars

### "Agent not found" Error

**Solution:**
1. Verify `ELEVENLABS_AGENT_ID` is correct
2. Agent must exist in your ElevenLabs account
3. Check agent ID in [Agents Dashboard](https://elevenlabs.io/app/agents)

## Upgrading to Agents Platform

If you want advanced features (workflows, knowledge bases, tools), you can:

1. **Use Agents Platform Dashboard** to configure advanced features
2. **Keep using the same API endpoint** - it works with both ConvAI and Agents Platform agents
3. **Add knowledge bases** in the dashboard for better responses
4. **Configure workflows** for multi-step conversations

The current code will work with Agents Platform agents - no code changes needed!

## Resources

- [ElevenLabs Agents Platform Docs](https://elevenlabs.io/docs/agents-platform/quickstart)
- [Agents Dashboard](https://elevenlabs.io/app/agents)
- [API Keys Settings](https://elevenlabs.io/app/settings/api-keys)
- [WebSocket API Docs](https://elevenlabs.io/docs/agents-platform/libraries/web-sockets)

## Summary

**You already have a working voice agent!** 🎉

The current implementation:
- ✅ Uses ElevenLabs ConvAI/Agents Platform
- ✅ Provides real-time voice conversation
- ✅ Integrates with scam detection
- ✅ Works with microphone input

To enhance it:
- Configure agent in [Agents Dashboard](https://elevenlabs.io/app/agents)
- Add knowledge bases for better responses
- Set up workflows for complex conversations
- Connect tools for API integrations

No code changes needed - just configure your agent in the dashboard!

