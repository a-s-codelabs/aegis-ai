import { NextResponse } from 'next/server';
import { analyzeWithGemini } from '@/lib/utils/gemini-scam-detector';

export const maxDuration = 30;

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

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { callerText, conversationContext = [] } = body;

    if (!callerText || typeof callerText !== 'string') {
      return NextResponse.json(
        { error: 'callerText is required and must be a string' },
        { status: 400 }
      );
    }

    if (!callerText.trim()) {
      return NextResponse.json({
        scamScore: 0,
        keywords: [],
        isScam: false,
        confidence: 'low',
      });
    }

    // Build full transcript with context - FOCUS ON CALLER'S SPEECH ONLY
    // Filter to only include caller's messages (not AI agent responses)
    const callerOnlyContext = conversationContext
      .filter((line: string) => line.startsWith('Caller:'))
      .map((line: string) => line.replace(/^Caller:\s*/, '')); // Remove "Caller:" prefix
    
    const fullTranscript = [
      ...callerOnlyContext,
      callerText, // Current caller text (already from caller)
    ].join('\n');
    
    console.log('[AnalyzeRealtime] Analyzing caller conversation:', {
      callerText,
      callerOnlyContextLength: callerOnlyContext.length,
      fullTranscriptLength: fullTranscript.length,
    });

    // Quick pattern matching first (fast fallback)
    const lowerText = callerText.toLowerCase();
    const foundPatterns = SCAM_PATTERNS.filter((pattern) =>
      lowerText.includes(pattern.toLowerCase())
    );

    const baseScore = Math.min(foundPatterns.length * 15, 85);

    // If high pattern match, return immediately
    if (foundPatterns.length >= 3) {
      return NextResponse.json({
        scamScore: Math.min(baseScore + 10, 95),
        keywords: foundPatterns.slice(0, 5),
        isScam: true,
        confidence: 'high',
      });
    }

    // Use Gemini for deeper analysis
    try {
      const geminiResult = await analyzeWithGemini({
        transcript: fullTranscript,
        scamPatterns: SCAM_PATTERNS,
      });

      const scamScore = geminiResult.scamScore || 0;
      const keywords = geminiResult.keywords || [];

      // Combine keywords from pattern matching and Gemini
      const allKeywords = [
        ...foundPatterns,
        ...keywords,
      ];
      const uniqueKeywords = [...new Set(allKeywords)].slice(0, 5);

      // Use higher of base score or Gemini score
      const finalScore = Math.max(baseScore, scamScore);

      // Determine if scam
      const isScam = finalScore >= 50;

      // Determine confidence
      let confidence: 'low' | 'medium' | 'high' = 'low';
      if (finalScore >= 70) {
        confidence = 'high';
      } else if (finalScore >= 40) {
        confidence = 'medium';
      }

      return NextResponse.json({
        scamScore: Math.min(finalScore, 100),
        keywords: uniqueKeywords,
        isScam,
        confidence,
      });
    } catch (aiError) {
      console.warn(
        '[AnalyzeRealtime] Gemini analysis failed, using pattern matching:',
        aiError
      );

      // Fallback to pattern matching
      const isScam = baseScore >= 50;
      let confidence: 'low' | 'medium' | 'high' = 'low';
      if (baseScore >= 70) {
        confidence = 'high';
      } else if (baseScore >= 40) {
        confidence = 'medium';
      }

      return NextResponse.json({
        scamScore: baseScore,
        keywords: foundPatterns.slice(0, 5),
        isScam,
        confidence,
      });
    }
  } catch (error) {
    console.error('[AnalyzeRealtime] Error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
        scamScore: 0,
        keywords: [],
        isScam: false,
        confidence: 'low' as const,
      },
      { status: 500 }
    );
  }
}

