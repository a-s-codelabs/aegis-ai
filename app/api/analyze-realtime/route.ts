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
  // OTP and verification codes (HIGH PRIORITY - major scam indicator)
  'otp',
  'one time password',
  'verification code',
  'verification otp',
  'sms code',
  'text code',
  '6 digit code',
  '4 digit code',
  'verification number',
  'confirm code',
  'enter code',
  'share code',
  'send code',
  'provide code',
  // Bank balance and account access (HIGH PRIORITY)
  'check bank balance',
  'verify bank balance',
  'check account balance',
  'verify account balance',
  'bank balance',
  'account balance',
  'check your balance',
  'verify your balance',
  'access your account',
  'login to your account',
  'account access',
  'banking information',
  'account details',
  'account verification',
];

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { callerText, conversationContext = [], dialogueCount = 0 } = body;

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
    
    // Only do comprehensive analysis after sufficient dialogue (10+ exchanges)
    const MIN_DIALOGUES_FOR_COMPREHENSIVE_ANALYSIS = 10;
    const hasEnoughDialogue = dialogueCount >= MIN_DIALOGUES_FOR_COMPREHENSIVE_ANALYSIS;

    console.log('[AnalyzeRealtime] Analyzing caller conversation:', {
      callerText,
      callerOnlyContextLength: callerOnlyContext.length,
      fullTranscriptLength: fullTranscript.length,
      dialogueCount: `${dialogueCount}/${MIN_DIALOGUES_FOR_COMPREHENSIVE_ANALYSIS}`,
      hasEnoughDialogue,
    });

    // Quick pattern matching first (fast fallback)
    const lowerText = callerText.toLowerCase();
    const foundPatterns = SCAM_PATTERNS.filter((pattern) =>
      lowerText.includes(pattern.toLowerCase())
    );

    // CRITICAL: OTP and bank balance requests are HIGH PRIORITY scams
    const highPriorityPatterns = [
      'otp', 'one time password', 'verification code', 'verification otp',
      'check bank balance', 'verify bank balance', 'check account balance',
      'verify account balance', 'bank balance', 'account balance'
    ];
    const hasHighPriorityPattern = highPriorityPatterns.some(pattern => 
      lowerText.includes(pattern.toLowerCase())
    );

    // Higher base score for high priority patterns
    let baseScore = Math.min(foundPatterns.length * 15, 85);
    if (hasHighPriorityPattern) {
      baseScore = Math.min(baseScore + 30, 95); // Add 30 points for OTP/bank balance requests
      console.log('[AnalyzeRealtime] 🚨 HIGH PRIORITY SCAM PATTERN DETECTED: OTP or bank balance request');
    }

    // If high pattern match OR high priority pattern, return immediately as scam
    if (foundPatterns.length >= 3 || hasHighPriorityPattern) {
      return NextResponse.json({
        scamScore: Math.min(baseScore + 10, 95),
        keywords: foundPatterns.slice(0, 5),
        isScam: true,
        confidence: 'high',
      });
    }

    // Use Gemini for deeper analysis
    // If we don't have enough dialogue yet, provide preliminary assessment
    try {
      const geminiResult = await analyzeWithGemini({
        transcript: fullTranscript,
        scamPatterns: SCAM_PATTERNS,
        hasEnoughDialogue, // Pass flag to indicate if we have enough dialogue
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
      // CRITICAL: If OTP or bank balance patterns found, ensure high score
      let finalScore = Math.max(baseScore, scamScore);
      
      // Force high score if OTP or bank balance patterns detected
      if (hasHighPriorityPattern) {
        finalScore = Math.max(finalScore, 85); // Minimum 85 for OTP/bank balance requests
        console.log('[AnalyzeRealtime] 🚨 Forcing high scam score due to OTP/bank balance request');
      }

      // Determine if scam (threshold: >40% = scam)
      const isScam = finalScore > 40;

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

      // Fallback to pattern matching (threshold: >40% = scam)
      const isScam = baseScore > 40;
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

