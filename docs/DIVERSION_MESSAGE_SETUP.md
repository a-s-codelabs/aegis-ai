# Custom Diversion Message Setup Guide

## Overview

The Custom Diversion Message feature automatically plays a security message to callers when scam risk exceeds 70% and immediately terminates the call. This is a **production-ready security feature** that protects users from high-risk scam calls.

## How It Works

1. **Real-time Scam Detection**: The system continuously analyzes caller speech during the conversation
2. **Risk Threshold**: When scam risk score exceeds **70%**, diversion is triggered
3. **Diversion Message**: A pre-recorded message is played to the caller
4. **Call Termination**: The call is immediately terminated after the message plays
5. **Status Tracking**: Call is logged as "Blocked – Security Risk" in the dashboard

## Diversion Message Script

The exact message played to callers:

> "This call cannot continue due to security verification issues. No further information will be shared. Please contact the account holder through official channels. Goodbye."

**Important**: This message:
- ✅ Does NOT accuse the caller of being a scammer
- ✅ Does NOT expose detection logic
- ✅ Provides clear, professional communication
- ✅ Ends the call immediately after playback

## ElevenLabs Agent Configuration

### Current Implementation

The diversion message is **NOT** configured in the ElevenLabs agent dashboard. Instead, it's handled programmatically:

1. **Backend API** (`/api/trigger-diversion`): Generates the message audio using ElevenLabs TTS API
2. **ElevenLabs Client**: Plays the audio and terminates the WebSocket connection
3. **Frontend**: Updates UI to show "Blocked – Security Risk" status

### Why Not in Agent Configuration?

- **Flexibility**: Message can be updated without changing agent settings
- **Control**: Programmatic control allows immediate termination
- **Consistency**: Same message across all voice preferences (default/female/male)
- **Security**: No risk of agent continuing conversation after diversion

## Voice Configuration

The diversion message uses the **same voice** as the active call:

- **Default Voice**: Uses `ELEVENLABS_VOICE_ID_DEFAULT` (or agent's default voice)
- **Female Voice**: Uses `ELEVENLABS_VOICE_ID_FEMALE`
- **Male Voice**: Uses `ELEVENLABS_VOICE_ID_MALE`

### Environment Variables (Optional)

If you want to customize the voice IDs used for diversion messages:

```bash
# .env.local
ELEVENLABS_VOICE_ID_DEFAULT=pNInz6obpgDQGcFmaJgB  # Adam (default)
ELEVENLABS_VOICE_ID_FEMALE=EXAVITQu4vr4xnSDxMaL   # Bella (female)
ELEVENLABS_VOICE_ID_MALE=VR6AewLTigWG4xSOukaG     # Arnold (male)
```

**Note**: If not set, the system uses default ElevenLabs voice IDs that match common agent voices.

## Backend Implementation

### API Endpoint: `/api/trigger-diversion`

**Method**: `POST`

**Request Body**:
```json
{
  "voice": "default" | "female" | "male",
  "voiceId": "optional_voice_id_override"
}
```

**Response**:
```json
{
  "success": true,
  "message": "This call cannot continue...",
  "audioDataUrl": "data:audio/mpeg;base64,...",
  "audioSize": 12345
}
```

### Flow

1. Frontend detects risk > 70%
2. Calls `aiVoiceClientRef.current.playDiversionMessageAndTerminate()`
3. Client stops WebSocket (stops LLM responses)
4. Client stops microphone streaming
5. Client fetches diversion audio from `/api/trigger-diversion`
6. Client plays audio via Web Audio API
7. Client terminates call after playback

## Frontend Implementation

### Status Tracking

The dashboard tracks call status:

- `'active'`: Normal conversation in progress
- `'blocked'`: Diversion triggered, message playing
- `'ended'`: Call terminated

### UI Updates

When diversion is triggered:

1. **Active Call Card**: Shows "Blocked – Security Risk" header
2. **Risk Indicator**: Orange color (instead of red/green)
3. **Status Badge**: "Blocked – Security Risk" badge
4. **Call History**: Shows blocked status with orange icon

### Event Logging

Diversion events are logged with:

```javascript
{
  timestamp: "2025-01-20T10:30:00.000Z",
  callerNumber: "+1 (555) 123-4567",
  riskScore: 85,
  keywords: ["wire transfer", "gift card"],
}
```

## Testing

### Manual Testing

1. Start a call via "Incoming Call" button
2. Divert to AI protection
3. Speak scam-related keywords (e.g., "wire transfer", "gift card", "bitcoin")
4. Wait for risk score to exceed 70%
5. Verify:
   - Diversion message plays
   - Call terminates immediately
   - Dashboard shows "Blocked – Security Risk"
   - Call history shows blocked status

### Expected Behavior

- ✅ Message plays in the same voice as the call
- ✅ No further LLM responses after diversion
- ✅ Call terminates after message completes
- ✅ Status updates to "Blocked – Security Risk"
- ✅ Event logged with timestamp

## Security Considerations

### Constraints Met

- ✅ **No Accusations**: Message doesn't accuse caller of being a scammer
- ✅ **No Continued Conversation**: Conversation stops immediately after diversion
- ✅ **No Logic Exposure**: Detection logic not revealed to caller
- ✅ **Production Ready**: Clean, maintainable implementation

### Best Practices

1. **Threshold**: Diversion threshold (70%) is higher than sensitivity thresholds (30-60%)
   - This ensures only high-confidence scams trigger diversion
   - Lower-risk calls continue for more analysis

2. **Immediate Termination**: WebSocket closed before message plays
   - Prevents any further LLM responses
   - Stops microphone streaming (no more caller input)

3. **Graceful Handling**: If message playback fails, call still terminates
   - Security is prioritized over UX
   - Error logged for debugging

## Troubleshooting

### Message Not Playing

1. Check browser console for errors
2. Verify `ELEVENLABS_API_KEY` is set
3. Check network tab for `/api/trigger-diversion` response
4. Verify Web Audio API is supported in browser

### Call Not Terminating

1. Check if `playDiversionMessageAndTerminate()` is called
2. Verify WebSocket is closed (check network tab)
3. Check if `endCall()` is called after message plays

### Wrong Voice

1. Verify voice preference matches agent voice
2. Check `ELEVENLABS_VOICE_ID_*` environment variables
3. Ensure voice IDs match your ElevenLabs account

## Future Enhancements

Potential improvements:

1. **Customizable Message**: Allow users to customize diversion message
2. **Multiple Languages**: Support diversion messages in different languages
3. **Analytics**: Track diversion frequency and effectiveness
4. **Whitelist**: Allow certain numbers to bypass diversion
5. **Gradual Escalation**: Play warning before full diversion

## Related Documentation

- [ElevenLabs Agent Configuration](./ELEVENLABS_AGENT_CONFIGURATION.md)
- [ElevenLabs Voice Agent Setup](./ELEVENLABS_VOICE_AGENT.md)
- [Microphone Troubleshooting](./MICROPHONE_TROUBLESHOOTING.md)

