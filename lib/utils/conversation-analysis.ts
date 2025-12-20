/**
 * Conversation Analysis Utilities
 * Reusable functions for analyzing call transcripts and calculating scam risk
 */

export interface TranscriptEntry {
  speaker: string;
  text: string;
}

export interface AnalysisResult {
  scamScore: number;
  keywords: string[];
  alert?: string;
}

/**
 * Analyzes a conversation transcript for scam indicators
 * @param transcript - Array of transcript entries
 * @returns Promise with analysis result containing scam score and keywords
 */
export async function analyzeConversation(
  transcript: TranscriptEntry[]
): Promise<AnalysisResult> {
  try {
    const response = await fetch('/api/analyze-transcript', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transcript }),
    });

    if (!response.ok) {
      throw new Error(`Analysis failed: ${response.statusText}`);
    }

    const result = await response.json();
    return {
      scamScore: result.scamScore || 0,
      keywords: result.keywords || [],
      alert: result.alert,
    };
  } catch (error) {
    console.error('[ConversationAnalysis] Error analyzing conversation:', error);
    // Return safe default on error
    return {
      scamScore: 0,
      keywords: [],
    };
  }
}

/**
 * Calculates risk level based on scam score
 * @param scamScore - Score from 0-100
 * @returns Risk level category
 */
export function getRiskLevel(scamScore: number): 'low' | 'medium' | 'high' {
  if (scamScore < 30) return 'low';
  if (scamScore < 70) return 'medium';
  return 'high';
}

/**
 * Gets color class for risk level
 * @param scamScore - Score from 0-100
 * @returns Tailwind color class
 */
export function getRiskColor(scamScore: number): string {
  if (scamScore < 20) return 'text-green-500';
  if (scamScore < 50) return 'text-yellow-500';
  if (scamScore < 70) return 'text-orange-500';
  return 'text-red-500';
}

/**
 * Gets background color class for risk level
 * @param scamScore - Score from 0-100
 * @returns Tailwind background color class
 */
export function getRiskBgColor(scamScore: number): string {
  if (scamScore < 20) return 'bg-green-500';
  if (scamScore < 50) return 'bg-yellow-500';
  if (scamScore < 70) return 'bg-orange-500';
  return 'bg-red-500';
}

