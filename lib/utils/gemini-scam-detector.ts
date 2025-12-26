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
}): Promise<GeminiScamAnalysis> {
  const { transcript, scamPatterns } = params;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY not set');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

  const prompt = `You are an expert phone scam detection system. Analyze ONLY the CALLER's speech and behavior patterns.

IMPORTANT: Focus ONLY on what the CALLER says. Ignore AI agent responses. Base your analysis purely on the caller's conversation patterns, word choice, and behavior.

Caller's Conversation:
${transcript}

Common scam patterns to detect:
${scamPatterns.join(', ')}

Analyze the CALLER for these scam indicators:
- Urgency, threats, or pressure tactics ("act now", "immediately", "you'll be arrested")
- Requests for personal/financial information (SSN, bank account, credit card, passwords)
- Impersonation attempts (claiming to be IRS, Microsoft, bank, government)
- Payment requests (gift cards, wire transfers, bitcoin, cryptocurrency, prepaid cards)
- Suspicious claims (you won a prize, owe money, account suspended, refund available)
- Emotional manipulation (family emergency, legal trouble, account closure)
- Unusual payment methods (gift cards, wire transfers, cryptocurrency)
- Requests to download software or grant remote access

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

Respond ONLY with valid minified JSON in this exact shape:
{"scamScore": 0-100, "keywords": ["keyword1","keyword2"]}

Examples:
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


