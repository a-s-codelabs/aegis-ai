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

  const prompt = `You are an expert phone scam detection system.

Analyze this phone call transcript for scam indicators and respond with a JSON object only.

Transcript:
${transcript}

Common scam patterns to pay special attention to:
${scamPatterns.join(', ')}

Look for:
- Urgency or threats
- Requests for personal/financial information
- Impersonation of authorities or companies
- Pressure tactics
- Payment requests (gift cards, wire transfers, cryptocurrency)

Respond ONLY with valid minified JSON in this exact shape:
{"scamScore": 0-100, "keywords": ["keyword1","keyword2"]}

Examples:
{"scamScore": 75, "keywords": ["urgent", "wire transfer"]}
{"scamScore": 5, "keywords": []}

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


