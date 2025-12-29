# Scam Warning Message Implementation

## Overview

This document describes the implementation of the scam warning message feature that replaces the custom diversion message. The warning message is sent as a **normal agent message** through the WebSocket connection, ensuring it is:
- ✅ Spoken by the AI agent
- ✅ Recorded in call logs
- ✅ Appears in call history with waveform
- ✅ Transcribed
- ✅ Uses the selected voice (male/female/default)
- ✅ Fixed playback speed of 0.6

## Architecture

### Flow

1. **Scam Detection**: Real-time analysis tracks scam risk score (0-100)
2. **Threshold Check**: When risk >= 70%, warning is triggered
3. **Message Sending**: Warning message sent as text input through WebSocket
4. **Agent Processing**: Agent processes and speaks the message using configured voice
5. **Recording**: Message audio is recorded as part of normal conversation
6. **Transcription**: Message appears in transcript as agent response
7. **Termination**: Call ends cleanly after message playback

## Implementation Details

### Backend Logic

**File**: `lib/utils/elevenlabs-client.ts`

**Method**: `sendScamWarningAndTerminate()`

**Key Features**:
- Stops microphone streaming (no more caller input)
- Sends warning message as text input through WebSocket
- Waits for agent to finish speaking
- Terminates call cleanly

**Warning Message** (Fixed):
```
"This call appears suspicious. For your safety, I cannot continue this conversation. Please contact official support channels. Goodbye."
```

### Voice Selection

- Uses voice preference set at session start (default/female/male)
- Voice is locked at session start (ElevenLabs limitation)
- Playback speed is **fixed at 0.6** for all voices
- No hardcoded agent IDs - uses voice labels only

### WebSocket Message Format

```json
{
  "type": "text",
  "text": "This call appears suspicious...",
  "playback_speed": 0.6
}
```

### Frontend Integration

**File**: `app/(pages)/dashboard/page.tsx`

**Trigger Logic**:
- Monitors scam risk score in real-time
- Triggers when `scamScore >= 70`
- Prevents duplicate triggers with `diversionTriggeredRef`
- Updates call status to "blocked"
- Logs warning event with timestamp

**UI Updates**:
- Shows "Blocked – Security Risk" status
- Displays warning message in transcript
- Marks call as blocked in call history
- Shows orange color scheme for blocked calls

## Key Differences from Diversion Message

| Feature | Custom Diversion | Agent Message (Current) |
|---------|------------------|-------------------------|
| Recording | ❌ Not recorded | ✅ Recorded |
| Transcription | ❌ Not transcribed | ✅ Transcribed |
| Call History | ❌ Not in history | ✅ Appears in history |
| Waveform | ❌ No waveform | ✅ Shows waveform |
| Voice Selection | ✅ Uses selected voice | ✅ Uses selected voice |
| Playback Speed | Variable | Fixed 0.6 |

## Constraints Met

- ✅ **No Custom Diversion**: Uses normal agent message
- ✅ **Recorded**: Message appears in call logs
- ✅ **Transcribed**: Message appears in transcript
- ✅ **Voice Selection**: Respects user preference
- ✅ **Fixed Playback Speed**: Always 0.6
- ✅ **Clean Termination**: Call ends after message
- ✅ **No Hardcoded IDs**: Uses voice labels only

## Testing

### Manual Testing Steps

1. Start a call via "Incoming Call" button
2. Divert to AI protection
3. Speak scam-related keywords (e.g., "wire transfer", "gift card")
4. Wait for risk score to exceed 70%
5. Verify:
   - Warning message appears in transcript
   - Message is spoken by agent
   - Call terminates after message
   - Call history shows "Blocked – Security Risk"
   - Audio waveform is visible in call history

### Expected Behavior

- ✅ Message sent as text input through WebSocket
- ✅ Agent processes and speaks the message
- ✅ Message audio is recorded
- ✅ Message appears in transcript as agent response
- ✅ Call terminates cleanly after playback
- ✅ Status updates to "Blocked – Security Risk"

## Troubleshooting

### Message Not Appearing in Transcript

- Check WebSocket connection is open
- Verify `onAgentResponse` callback is triggered
- Check browser console for errors

### Message Not Being Spoken

- Verify agent is processing text input
- Check ElevenLabs API supports text input
- Ensure WebSocket message format is correct

### Call Not Terminating

- Check `sendScamWarningAndTerminate()` completes
- Verify WebSocket close event fires
- Check `endCall()` is called

## Future Enhancements

Potential improvements:
1. **Customizable Message**: Allow users to customize warning message
2. **Multiple Languages**: Support warning messages in different languages
3. **Analytics**: Track warning frequency and effectiveness
4. **Gradual Escalation**: Play warning before full termination

## Related Documentation

- [ElevenLabs Agent Configuration](./ELEVENLABS_AGENT_CONFIGURATION.md)
- [ElevenLabs Voice Agent Setup](./ELEVENLABS_VOICE_AGENT.md)
- [Diversion Message Setup](./DIVERSION_MESSAGE_SETUP.md) (Deprecated)

