/**
 * Real-time Scam Detection Service
 *
 * Analyzes caller speech in real-time using Gemini AI.
 * Designed for low-latency analysis during live conversations.
 */

import { analyzeWithGemini } from './gemini-scam-detector';

export interface RealtimeScamAnalysis {
  scamScore: number;
  keywords: string[];
  isScam: boolean;
  confidence: 'low' | 'medium' | 'high';
}

export interface RealtimeScamDetectorOptions {
  /**
   * Minimum time between analyses (in milliseconds) to avoid rate limits
   * Default: 2000ms (2 seconds)
   */
  debounceMs?: number;
  /**
   * Maximum number of conversation turns to include in context
   * Default: 5
   */
  maxContextTurns?: number;
}

/**
 * Real-time scam detector with debouncing and context management
 */
export class RealtimeScamDetector {
  private lastAnalysisTime = 0;
  private pendingText: string[] = [];
  private conversationContext: string[] = [];
  private debounceTimer: NodeJS.Timeout | null = null;
  private readonly debounceMs: number;
  private readonly maxContextTurns: number;

  constructor(options: RealtimeScamDetectorOptions = {}) {
    this.debounceMs = options.debounceMs ?? 2000;
    this.maxContextTurns = options.maxContextTurns ?? 5;
  }

  /**
   * Analyze caller speech in real-time
   * Uses debouncing to avoid excessive API calls
   */
  async analyzeCallerSpeech(
    text: string,
    conversationContext?: string[]
  ): Promise<RealtimeScamAnalysis> {
    if (!text.trim()) {
      return {
        scamScore: 0,
        keywords: [],
        isScam: false,
        confidence: 'low',
      };
    }

    // Update conversation context
    if (conversationContext) {
      this.conversationContext = conversationContext.slice(
        -this.maxContextTurns
      );
    }

    // Add current text to pending queue
    this.pendingText.push(text);

    // Debounce: wait for more text or timeout
    return new Promise((resolve) => {
      if (this.debounceTimer) {
        clearTimeout(this.debounceTimer);
      }

      this.debounceTimer = setTimeout(async () => {
        const combinedText = this.pendingText.join(' ');
        this.pendingText = [];

        try {
          const result = await this.performAnalysis(combinedText);
          resolve(result);
        } catch (error) {
          console.error(
            '[RealtimeScamDetector] Analysis error:',
            error
          );
          // Return safe default on error
          resolve({
            scamScore: 0,
            keywords: [],
            isScam: false,
            confidence: 'low',
          });
        }
      }, this.debounceMs);
    });
  }

  /**
   * Perform immediate analysis (bypass debouncing)
   * Useful for final analysis or urgent detection
   */
  async analyzeImmediate(
    text: string,
    conversationContext?: string[]
  ): Promise<RealtimeScamAnalysis> {
    if (!text.trim()) {
      return {
        scamScore: 0,
        keywords: [],
        isScam: false,
        confidence: 'low',
      };
    }

    // Clear any pending debounced analysis
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }

    // Combine pending text with current
    const combinedText = [
      ...this.pendingText,
      text,
    ].join(' ');
    this.pendingText = [];

    // Update context
    if (conversationContext) {
      this.conversationContext = conversationContext.slice(
        -this.maxContextTurns
      );
    }

    return this.performAnalysis(combinedText);
  }

  /**
   * Perform the actual Gemini analysis
   */
  private async performAnalysis(
    text: string
  ): Promise<RealtimeScamAnalysis> {
    // Build full transcript with context
    const fullTranscript = [
      ...this.conversationContext,
      `Caller: ${text}`,
    ].join('\n');

    // Get scam patterns (same as used in analyze-transcript)
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

    try {
      // Use Gemini for analysis
      const geminiResult = await analyzeWithGemini({
        transcript: fullTranscript,
        scamPatterns: SCAM_PATTERNS,
      });

      const scamScore = geminiResult.scamScore || 0;
      const keywords = geminiResult.keywords || [];

      // Determine if scam based on score
      const isScam = scamScore >= 50;

      // Determine confidence level
      let confidence: 'low' | 'medium' | 'high' = 'low';
      if (scamScore >= 70) {
        confidence = 'high';
      } else if (scamScore >= 40) {
        confidence = 'medium';
      }

      return {
        scamScore,
        keywords,
        isScam,
        confidence,
      };
    } catch (error) {
      console.error(
        '[RealtimeScamDetector] Gemini analysis failed:',
        error
      );

      // Fallback to pattern matching
      const lowerText = text.toLowerCase();
      const foundPatterns = SCAM_PATTERNS.filter((pattern) =>
        lowerText.includes(pattern.toLowerCase())
      );

      const baseScore = Math.min(foundPatterns.length * 15, 85);
      const isScam = baseScore >= 50;

      return {
        scamScore: baseScore,
        keywords: foundPatterns.slice(0, 5),
        isScam,
        confidence: foundPatterns.length >= 3 ? 'high' : 'medium',
      };
    }
  }

  /**
   * Add conversation turn to context
   */
  addToContext(speaker: string, text: string) {
    this.conversationContext.push(`${speaker}: ${text}`);
    // Keep only last N turns
    if (this.conversationContext.length > this.maxContextTurns) {
      this.conversationContext.shift();
    }
  }

  /**
   * Clear conversation context
   */
  clearContext() {
    this.conversationContext = [];
    this.pendingText = [];
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
  }

  /**
   * Get current conversation context
   */
  getContext(): string[] {
    return [...this.conversationContext];
  }
}

