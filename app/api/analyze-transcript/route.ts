import { generateText } from "ai"
import { groq } from "@ai-sdk/groq"

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
]

export async function POST(req: Request) {
  try {
    const body = await req.json()

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
    const promptText = `Analyze this phone call transcript for scam indicators and respond with a JSON object containing a scamScore (0-100) and keywords array.

Transcript:
${fullTranscript}

Common scam patterns: ${SCAM_PATTERNS.join(", ")}

Look for:
- Urgency or threats
- Requests for personal/financial info
- Impersonation of authorities
- Pressure tactics
- Payment requests (gift cards, wire transfers)

Respond ONLY with valid JSON: {"scamScore": 75, "keywords": ["urgent", "verify"]}
If safe, respond: {"scamScore": 5, "keywords": []}`

    try {
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
    } catch (parseError) {
      console.error("[Analyze] Error parsing AI response:", parseError)

      return Response.json({
        scamScore: baseScore,
        keywords: foundPatterns.slice(0, 5),
        note: "AI analysis failed - using pattern matching",
      })
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
