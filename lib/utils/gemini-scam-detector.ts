/**
 * Google Gemini Scam Detector Helper
 *
 * This wraps the official @google/generative-ai client so that our
 * /api/analyze-transcript route can call Gemini without duplicating logic.
 *
 * NOTE: This is designed for server-side usage only.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

export interface GeminiScamAnalysis {
  scamScore: number;
  keywords: string[];
}

/**
 * Analyze a transcript string with Gemini and return a scam score + keywords.
 *
 * If anything fails (no API key, parsing issues, etc.), this function throws.
 * The caller is responsible for catching and falling back to pattern-only logic.
 */
export async function analyzeWithGemini(params: {
  transcript: string;
  scamPatterns: string[];
  hasEnoughDialogue?: boolean;
}): Promise<GeminiScamAnalysis> {
  const { transcript, scamPatterns, hasEnoughDialogue = true } = params;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY not set');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

  // Adjust prompt based on whether we have enough dialogue
  const dialogueContext = hasEnoughDialogue 
    ? 'You have sufficient conversation data to make a comprehensive assessment. Provide a final analysis.'
    : 'This is early in the conversation. Provide a preliminary assessment but note that more dialogue is needed for a final determination. The AI agent should continue the conversation to gather more information.';

  const prompt = `You are an expert phone scam detection system. Analyze ONLY the CALLER's speech and behavior patterns.

IMPORTANT: Focus ONLY on what the CALLER says. Ignore AI agent responses. Base your analysis purely on the caller's conversation patterns, word choice, and behavior.

${dialogueContext}

Caller's Conversation:
${transcript}

Common scam patterns to detect:
${scamPatterns.join(', ')}

Analyze the CALLER for these scam indicators (CRITICAL - these are HIGH RISK):
- **OTP/Verification Code Requests (VERY HIGH RISK - 80-100 score)**: Asking for OTP, one-time password, verification code, SMS code, text code, 6-digit code, 4-digit code. Legitimate companies NEVER ask for OTP over the phone.
- **Bank Balance/Account Access Requests (VERY HIGH RISK - 80-100 score)**: Asking to "check bank balance", "verify account balance", "check your balance", "access your account", "login to account". Legitimate banks NEVER ask you to verify balance or access account over the phone.
- Urgency, threats, or pressure tactics ("act now", "immediately", "you'll be arrested")
- Requests for personal/financial information (SSN, bank account, credit card, passwords, PIN, CVV)
- Impersonation attempts (claiming to be IRS, Microsoft, bank, government)
- Payment requests (gift cards, wire transfers, bitcoin, cryptocurrency, prepaid cards)
- Suspicious claims (you won a prize, owe money, account suspended, refund available)
- Emotional manipulation (family emergency, legal trouble, account closure)
- Unusual payment methods (gift cards, wire transfers, cryptocurrency)
- Requests to download software or grant remote access

**CRITICAL SCAM INDICATORS (Score 80-100 immediately):**
- Any request for OTP, verification code, or one-time password
- Any request to check or verify bank/account balance
- Any request for banking login credentials
- Any request for account access codes

Safe caller indicators:
- Professional, calm communication
- Legitimate business inquiries
- Appointment confirmations
- Customer service follow-ups
- No pressure or urgency
- No requests for sensitive information

Score guidelines:
- 0-20: Very safe (normal business/personal call)
- 21-40: Low risk (slightly suspicious but likely safe)
- 41-60: Medium risk (suspicious patterns detected)
- 61-80: High risk (strong scam indicators)
- 81-100: Very high risk (clear scam attempt)

**MANDATORY HIGH SCORES:**
- OTP/verification code requests: 85-100 (legitimate companies NEVER ask for OTP over phone)
- Bank balance/account access requests: 85-100 (legitimate banks NEVER ask to verify balance over phone)
- Any combination of financial info + urgency: 80-100

Respond ONLY with valid minified JSON in this exact shape:
{"scamScore": 0-100, "keywords": ["keyword1","keyword2"]}

Examples:
{"scamScore": 95, "keywords": ["otp", "verification code", "bank balance"]}  // OTP request = HIGH SCAM
{"scamScore": 90, "keywords": ["check bank balance", "verify account"]}  // Bank balance request = HIGH SCAM
{"scamScore": 85, "keywords": ["wire transfer", "urgent", "IRS"]}
{"scamScore": 10, "keywords": []}
{"scamScore": 45, "keywords": ["refund"]}

Do not include any explanation or extra text.`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  let parsed: { scamScore?: number; keywords?: string[] };
  try {
    parsed = JSON.parse(text);
  } catch (error) {
    // Sometimes models wrap JSON in backticks or code fences; try to sanitize.
    const sanitized = text
      .trim()
      .replace(/```json/gi, '')
      .replace(/```/g, '');
    parsed = JSON.parse(sanitized);
  }

  const scamScore =
    typeof parsed.scamScore === 'number'
      ? Math.min(Math.max(parsed.scamScore, 0), 100)
      : 0;
  const keywords = Array.isArray(parsed.keywords)
    ? parsed.keywords.filter((k) => typeof k === 'string')
    : [];

  return {
    scamScore,
    keywords,
  };
}


