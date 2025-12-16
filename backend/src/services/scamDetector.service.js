/**
 * Scam Detection Service
 *
 * This service contains the core AI logic for detecting scam calls.
 * It uses pattern matching and Groq LLM for analysis.
 *
 * Extracted from: app/api/analyze-transcript/route.ts
 */

import { generateText } from 'ai';
import { groq } from '@ai-sdk/groq';

// Scam patterns to detect (from original implementation)
const SCAM_PATTERNS = [
  'social security number',
  'verify your account',
  'suspicious activity',
  'arrest warrant',
  'tax fraud',
  'IRS',
  'refund',
  'urgent action required',
  'confirm your identity',
  'wire transfer',
  'gift card',
  'bitcoin',
  'cryptocurrency',
  'bank account number',
  'credit card',
  'routing number',
  'send money',
  'pay immediately',
  'limited time offer',
  'act now',
  'congratulations you won',
  'claim your prize',
  'tech support',
  'microsoft support',
  'apple support',
  'your computer is infected',
  'refund owed',
  'grandson in jail',
  'family emergency',
  'password',
  'pin number',
  'security code',
  'cvv',
];

/**
 * Analyze transcript for scam indicators
 *
 * @param {string|Array} transcript - Full transcript or array of transcript entries
 * @returns {Promise<{scamScore: number, keywords: string[], alert?: string}>}
 */
export async function analyzeTranscript(transcript) {
  try {
    let fullTranscript = '';

    // Handle different transcript formats
    if (Array.isArray(transcript)) {
      fullTranscript = transcript
        .map((entry) => {
          if (typeof entry === 'string') return entry;
          return `${entry.speaker || 'Unknown'}: ${entry.text || entry}`;
        })
        .join('\n');
    } else if (typeof transcript === 'string') {
      fullTranscript = transcript;
    } else {
      // Handle object format: { userTranscript, agentResponse }
      const userText = transcript.userTranscript || '';
      const agentText = transcript.agentResponse || '';
      fullTranscript = `User: ${userText}\nAgent: ${agentText}`;
    }

    if (!fullTranscript.trim()) {
      return { scamScore: 0, keywords: [] };
    }

    // Pattern-based detection (Layer 1)
    const lowerTranscript = fullTranscript.toLowerCase();
    const foundPatterns = SCAM_PATTERNS.filter((pattern) =>
      lowerTranscript.includes(pattern.toLowerCase())
    );

    const baseScore = Math.min(foundPatterns.length * 15, 85);

    // High risk if 3+ patterns found
    if (foundPatterns.length >= 3) {
      return {
        scamScore: Math.min(baseScore + 10, 95),
        keywords: foundPatterns.slice(0, 5),
        alert: 'High risk scam call detected',
      };
    }

    // AI-based analysis (Layer 2) - if API key available
    if (!process.env.GROQ_API_KEY) {
      console.warn('[ScamDetector] GROQ_API_KEY not set, using pattern-based scoring only');
      return {
        scamScore: baseScore,
        keywords: foundPatterns.slice(0, 5),
        note: 'AI analysis unavailable - using pattern matching only',
      };
    }

    const promptText = `Analyze this phone call transcript for scam indicators and respond with a JSON object containing a scamScore (0-100) and keywords array.

Transcript:
${fullTranscript}

Common scam patterns: ${SCAM_PATTERNS.join(', ')}

Look for:
- Urgency or threats
- Requests for personal/financial info
- Impersonation of authorities
- Pressure tactics
- Payment requests (gift cards, wire transfers)

Respond ONLY with valid JSON: {"scamScore": 75, "keywords": ["urgent", "verify"]}
If safe, respond: {"scamScore": 5, "keywords": []}`;

    try {
      const result = await generateText({
        model: groq('llama-3.3-70b-versatile'),
        prompt: promptText,
        maxTokens: 300,
      });

      const analysis = JSON.parse(result.text);
      const aiScore = analysis.scamScore || 0;
      const finalScore = Math.max(baseScore, aiScore);

      // Combine keywords from both pattern matching and AI
      const allKeywords = [
        ...foundPatterns,
        ...(analysis.keywords || []),
      ];
      const uniqueKeywords = [...new Set(allKeywords)].slice(0, 5);

      return {
        scamScore: Math.min(finalScore, 100),
        keywords: uniqueKeywords,
      };
    } catch (parseError) {
      console.error('[ScamDetector] Error parsing AI response:', parseError);
      return {
        scamScore: baseScore,
        keywords: foundPatterns.slice(0, 5),
        note: 'AI analysis failed - using pattern matching',
      };
    }
  } catch (error) {
    console.error('[ScamDetector] Analysis error:', error);
    throw new Error(`Scam detection failed: ${error.message}`);
  }
}

/**
 * Get scam patterns list (for reference)
 */
export function getScamPatterns() {
  return SCAM_PATTERNS;
}

