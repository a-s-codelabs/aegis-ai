# ElevenLabs Agent Configuration Guide

## Issue: AI Not Having Proper Conversation

If the AI is ending conversations too quickly or not engaging properly, you need to configure your ElevenLabs agent in the dashboard.

## Step 1: Configure Agent System Prompt

1. Go to [ElevenLabs Agents Dashboard](https://elevenlabs.io/app/agents)
2. Select your agent
3. Go to **"System Prompt"** or **"Instructions"** section
4. Update the prompt to:

```
You are a call screening assistant. Your role is to have a thorough, natural conversation with callers to understand their purpose.

IMPORTANT CONVERSATION RULES:
1. Ask questions to understand the caller's full purpose
2. Have a back-and-forth conversation - don't just respond once
3. Continue the conversation for at least 10 exchanges before concluding
4. Ask follow-up questions like:
   - "Can you tell me more about that?"
   - "What specifically do you need help with?"
   - "I'd like to understand better, can you explain?"
5. Don't end the conversation prematurely
6. Be patient and gather complete information
7. Only after understanding the full context should you provide assistance

CONVERSATION STYLE:
- Be friendly and professional
- Ask open-ended questions
- Show genuine interest in understanding the caller's needs
- Don't rush to conclusions
- Engage in natural dialogue

Remember: Your goal is to have a meaningful conversation to understand why they're calling, not to answer on their behalf or end quickly.
```

## Step 2: Configure Conversation Flow Settings

1. In your agent settings, find **"Conversation Flow"** or **"Turn-Taking"**
2. Configure:
   - **Silence Timeout**: Set to 10-15 seconds (don't end too quickly)
   - **Max Conversation Duration**: Set to 5-10 minutes
   - **Auto-End Conversation**: **DISABLE** (turn off)
   - **Interruption Handling**: Allow caller to interrupt

## Step 3: Test Your Agent

After updating settings:
1. Test the agent in the ElevenLabs dashboard
2. Have a conversation and verify it:
   - Asks follow-up questions
   - Continues conversation for multiple exchanges
   - Doesn't end prematurely
   - Engages naturally

## Current Code Behavior

Our code:
- ✅ Tracks dialogue count (requires 10+ dialogues)
- ✅ Only makes final decision after sufficient conversation
- ✅ Analyzes keywords from caller's speech
- ✅ Uses Gemini AI to detect scams based on keywords

The conversation quality is controlled by your ElevenLabs agent configuration, not our code.

## Common Issues

### Issue 1: AI Ends Conversation Too Quickly
**Fix**: Increase silence timeout and disable auto-end in agent settings

### Issue 2: AI Not Asking Questions
**Fix**: Update system prompt to emphasize asking questions and engaging

### Issue 3: AI Answers On Behalf of Caller
**Fix**: Update system prompt to clarify you're screening, not answering for them

### Issue 4: Conversation Feels Robotic
**Fix**: Update system prompt to be more conversational and natural

## Best Practices

1. **System Prompt**: Emphasize conversation, questions, and engagement
2. **Timeout Settings**: Give enough time for natural pauses
3. **Turn-Taking**: Allow natural back-and-forth
4. **Testing**: Test with real scenarios before deploying

## Summary

The AI conversation quality is controlled by your ElevenLabs agent configuration. Update the system prompt and conversation flow settings in the dashboard to ensure proper engagement.

