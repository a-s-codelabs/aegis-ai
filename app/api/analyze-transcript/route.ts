// NOTE: Previously this route used Groq via the `ai` SDK.
// For the hackathon demo we now delegate the deeper AI analysis
// to Google Gemini, while keeping the same response shape.
// The old Groq-based code is intentionally left commented for reference.

// import { generateText } from "ai"
// import { groq } from "@ai-sdk/groq"
import { analyzeWithGemini } from '@/lib/utils/gemini-scam-detector';

export const maxDuration = 60

const SCAM_PATTERNS = [
  "social security number",
  "verify your account",
  "suspicious activity",
  "arrest warrant",
  "tax fraud",
  "IRS",
  "refund",
  "urgent action required",
  "confirm your identity",
  "wire transfer",
  "gift card",
  "bitcoin",
  "cryptocurrency",
  "bank account number",
  "credit card",
  "routing number",
  "send money",
  "pay immediately",
  "limited time offer",
  "act now",
  "congratulations you won",
  "claim your prize",
  "tech support",
  "microsoft support",
  "apple support",
  "your computer is infected",
  "refund owed",
  "grandson in jail",
  "family emergency",
  "password",
  "pin number",
  "security code",
  "cvv",
  // OTP and verification codes (HIGH PRIORITY - major scam indicator)
  "otp",
  "one time password",
  "verification code",
  "verification otp",
  "sms code",
  "text code",
  "6 digit code",
  "4 digit code",
  "verification number",
  "confirm code",
  "enter code",
  "share code",
  "send code",
  "provide code",
  // Bank balance and account access (HIGH PRIORITY)
  "check bank balance",
  "verify bank balance",
  "check account balance",
  "verify account balance",
  "bank balance",
  "account balance",
  "check your balance",
  "verify your balance",
  "access your account",
  "login to your account",
  "account access",
  "banking information",
  "account details",
  "account verification",
]

export async function POST(req: Request) {
  try {
    const body = await req.json()

    // Check if we need to extract purpose instead of analyzing for scams
    if (body.extractPurpose) {
      return await extractPurpose(body.transcript)
    }

    let fullTranscript = ""

    if (body.transcript && Array.isArray(body.transcript)) {
      fullTranscript = body.transcript
        .map((entry: { speaker: string; text: string }) => `${entry.speaker}: ${entry.text}`)
        .join("\n")
    } else {
      const userText = body.userTranscript || ""
      const agentText = body.agentResponse || ""
      fullTranscript = `User: ${userText}\nAgent: ${agentText}`
    }

    if (!fullTranscript.trim()) {
      return Response.json({ scamScore: 0, keywords: [] })
    }

    const lowerTranscript = fullTranscript.toLowerCase()
    const foundPatterns = SCAM_PATTERNS.filter((pattern) => lowerTranscript.includes(pattern.toLowerCase()))

    const baseScore = Math.min(foundPatterns.length * 15, 85)

    if (foundPatterns.length >= 3) {
      return Response.json({
        scamScore: Math.min(baseScore + 10, 95),
        keywords: foundPatterns.slice(0, 5),
        alert: "High risk scam call detected",
      })
    }

    // Use AI for deeper analysis
    try {
      // Use Google Gemini for deeper semantic analysis (Layer 2)
      const geminiResult = await analyzeWithGemini({
        transcript: fullTranscript,
        scamPatterns: SCAM_PATTERNS,
      })

      const aiScore = geminiResult.scamScore || 0
      const finalScore = Math.max(baseScore, aiScore)

      return Response.json({
        scamScore: Math.min(finalScore, 100),
        keywords: [...new Set([...foundPatterns, ...(geminiResult.keywords || [])])].slice(0, 5),
      })
    } catch (aiError) {
      console.warn("[Analyze] Gemini analysis unavailable or failed, using pattern-based scoring only:", aiError)

      return Response.json({
        scamScore: baseScore,
        keywords: foundPatterns.slice(0, 5),
        note: "AI analysis unavailable - using pattern matching only",
      })

      /* Previous Groq-based implementation (kept for reference):
      // Check if Groq API key is available
      if (!process.env.GROQ_API_KEY) {
        console.warn("[Analyze] GROQ_API_KEY not set, using pattern-based scoring only")
        return Response.json({
          scamScore: baseScore,
          keywords: foundPatterns.slice(0, 5),
          note: "AI analysis unavailable - using pattern matching only",
        })
      }

      const result = await generateText({
        model: groq("llama-3.3-70b-versatile"),
        prompt: promptText,
        maxTokens: 300,
      })

      const analysis = JSON.parse(result.text)
      const aiScore = analysis.scamScore || 0
      const finalScore = Math.max(baseScore, aiScore)

      return Response.json({
        scamScore: Math.min(finalScore, 100),
        keywords: [...new Set([...foundPatterns, ...(analysis.keywords || [])])].slice(0, 5),
      })
      */
    }
  } catch (error) {
    console.error("[Analyze] Analysis error:", error)
    return Response.json({
      scamScore: 0,
      keywords: [],
      error: error instanceof Error ? error.message : "Unknown error",
    })
  }
}

/**
 * Extracts the call purpose from transcript using AI
 */
async function extractPurpose(transcript: any[]): Promise<Response> {
  try {
    // Get caller messages only
    const callerMessages = transcript
      .filter((entry: { speaker: string; text: string }) => entry.speaker === 'Caller')
      .map((entry: { speaker: string; text: string }) => entry.text)
      .join(' ')

    if (!callerMessages.trim()) {
      return Response.json({ purpose: 'General inquiry' })
    }

    // Use Gemini to extract purpose
    try {
      const { GoogleGenerativeAI } = await import('@google/generative-ai')
      
      const apiKey = process.env.GEMINI_API_KEY
      if (!apiKey) {
        throw new Error('GEMINI_API_KEY not set')
      }

      const genAI = new GoogleGenerativeAI(apiKey)
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' })

      const fullTranscript = transcript
        .map((entry: { speaker: string; text: string }) => `${entry.speaker}: ${entry.text}`)
        .join("\n")

      const prompt = `Analyze this phone call transcript and extract the main purpose or reason for the call. Be concise and specific in 1-2 sentences.

Transcript:
${fullTranscript}

Respond ONLY with valid minified JSON in this exact shape:
{"purpose": "brief description of why they called"}

Examples:
{"purpose": "Scheduling a service appointment for next week"}
{"purpose": "Following up on a previous order inquiry"}
{"purpose": "Confirming delivery time for a package"}

Do not include any explanation or extra text.`

      const result = await model.generateContent(prompt)
      const text = result.response.text()

      let parsed: { purpose?: string }
      try {
        parsed = JSON.parse(text)
      } catch (error) {
        // Sometimes models wrap JSON in backticks or code fences; try to sanitize.
        const sanitized = text
          .trim()
          .replace(/```json/gi, '')
          .replace(/```/g, '')
        parsed = JSON.parse(sanitized)
      }

      const purpose = parsed.purpose || 'General inquiry'
      return Response.json({ purpose })
    } catch (aiError) {
      console.warn("[Analyze] Purpose extraction failed, using fallback:", aiError)
      
      // Fallback: use first caller message
      const firstCallerMessage = transcript.find(
        (entry: { speaker: string; text: string }) => entry.speaker === 'Caller'
      )?.text || 'General inquiry'
      
      // Extract first sentence or first 100 characters
      let purpose = firstCallerMessage.split('.')[0] || firstCallerMessage.substring(0, 100)
      purpose = purpose.trim().replace(/\.$/, '') || 'General inquiry'
      
      return Response.json({ purpose })
    }
  } catch (error) {
    console.error("[Analyze] Purpose extraction error:", error)
    return Response.json({ purpose: 'General inquiry' })
  }
}
