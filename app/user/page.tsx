"use client"

import { useState, useEffect, useRef } from "react"
import { Shield, Phone, PhoneOff, AlertTriangle, CheckCircle } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Call {
  id: string
  number: string
  timestamp: Date
  duration: number
  status: "incoming" | "diverted" | "scam" | "safe" | "active"
  transcript?: { speaker: string; text: string }[]
  scamScore?: number
  scamKeywords?: string[]
}

export default function UserDashboard() {
  const [calls, setCalls] = useState<Call[]>([])
  const [incomingCall, setIncomingCall] = useState<string | null>(null)
  const [activeCall, setActiveCall] = useState<Call | null>(null)
  const [isMonitoring, setIsMonitoring] = useState(false)
  const wsRef = useRef<WebSocket | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)

  const cleanup = () => {
    console.log("[v0] Starting cleanup")

    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }

    if (audioContextRef.current) {
      try {
        audioContextRef.current.close()
      } catch (e) {
        console.log("[v0] Audio context already closed")
      }
      audioContextRef.current = null
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => {
        track.stop()
        console.log("[v0] Stopped media track")
      })
      mediaStreamRef.current = null
    }
  }

  useEffect(() => {
    return () => cleanup()
  }, [])

  // Simulate incoming call
  const simulateIncomingCall = () => {
    const phoneNumber = `+1 (${Math.floor(Math.random() * 900) + 100}) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`
    setIncomingCall(phoneNumber)
  }

  const handleUserAnswer = () => {
    if (!incomingCall) return
    setIncomingCall(null)
  }

  const handleDivert = async () => {
    if (!incomingCall) return

    const newCall: Call = {
      id: Date.now().toString(),
      number: incomingCall,
      timestamp: new Date(),
      duration: 0,
      status: "active",
      transcript: [],
    }

    setActiveCall(newCall)
    setCalls((prev) => [newCall, ...prev])
    setIncomingCall(null)
    setIsMonitoring(true)

    // Start AI conversation monitoring
    await startAIMonitoring(newCall)
  }

  const startAIMonitoring = async (call: Call) => {
    try {
      // Get signed URL for ElevenLabs
      const response = await fetch("/api/elevenlabs-signed-url")
      const data = await response.json()

      if (!data.signedUrl) {
        throw new Error("Failed to get signed URL")
      }

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaStreamRef.current = stream

      // Setup audio context
      audioContextRef.current = new AudioContext({ sampleRate: 24000 })

      // Connect to ElevenLabs WebSocket
      const ws = new WebSocket(data.signedUrl)
      wsRef.current = ws

      ws.onopen = () => {
        console.log("[v0] WebSocket connected for AI monitoring")
      }

      ws.onmessage = async (event) => {
        try {
          const eventData = JSON.parse(event.data)

          if (eventData.type === "user_transcript" && eventData.user_transcription_event) {
            const userText = eventData.user_transcription_event.user_transcript
            setActiveCall((prev) => {
              if (!prev) return prev
              return {
                ...prev,
                transcript: [...(prev.transcript || []), { speaker: "Caller", text: userText }],
              }
            })
          }

          if (eventData.type === "agent_response" && eventData.agent_response_event) {
            const agentText = eventData.agent_response_event.agent_response
            setActiveCall((prev) => {
              if (!prev) return prev
              const newTranscript = [...(prev.transcript || []), { speaker: "AI Agent", text: agentText }]

              // Analyze conversation with Gemini
              analyzeConversation(call.id, newTranscript)

              return {
                ...prev,
                transcript: newTranscript,
              }
            })
          }

          if (eventData.type === "audio" && eventData.audio_event) {
            await playAudio(eventData.audio_event.audio_base_64)
          }
        } catch (error) {
          console.error("[v0] Error processing WebSocket message:", error)
        }
      }

      ws.onclose = () => {
        console.log("[v0] WebSocket closed")
      }

      // Start sending audio
      const source = audioContextRef.current.createMediaStreamSource(stream)
      const processor = audioContextRef.current.createScriptProcessor(4096, 1, 1)

      processor.onaudioprocess = (e) => {
        if (ws.readyState === WebSocket.OPEN) {
          const inputData = e.inputBuffer.getChannelData(0)
          const pcm16 = new Int16Array(inputData.length)
          for (let i = 0; i < inputData.length; i++) {
            pcm16[i] = Math.max(-32768, Math.min(32767, inputData[i] * 32768))
          }
          ws.send(
            JSON.stringify({
              user_audio_chunk: btoa(String.fromCharCode(...new Uint8Array(pcm16.buffer))),
            }),
          )
        }
      }

      source.connect(processor)
      processor.connect(audioContextRef.current.destination)
    } catch (error) {
      console.error("[v0] Error starting AI monitoring:", error)
    }
  }

  const playAudio = async (base64Audio: string) => {
    if (!audioContextRef.current) return

    try {
      const binaryString = atob(base64Audio)
      const bytes = new Uint8Array(binaryString.length)
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i)
      }

      const int16Array = new Int16Array(bytes.buffer)
      const float32Array = new Float32Array(int16Array.length)
      for (let i = 0; i < int16Array.length; i++) {
        float32Array[i] = int16Array[i] / 32768.0
      }

      const audioBuffer = audioContextRef.current.createBuffer(1, float32Array.length, 24000)
      audioBuffer.getChannelData(0).set(float32Array)

      const source = audioContextRef.current.createBufferSource()
      source.buffer = audioBuffer
      source.connect(audioContextRef.current.destination)
      source.start()
    } catch (error) {
      // Silently handle audio decode errors
    }
  }

  const analyzeConversation = async (callId: string, transcript: { speaker: string; text: string }[]) => {
    try {
      const response = await fetch("/api/analyze-transcript", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript }),
      })

      if (response.ok) {
        const result = await response.json()
        setActiveCall((prev) => {
          if (!prev || prev.id !== callId) return prev
          return {
            ...prev,
            scamScore: result.scamScore,
            scamKeywords: result.keywords,
          }
        })
      }
    } catch (error) {
      console.error("[v0] Error analyzing conversation:", error)
    }
  }

  const endCall = () => {
    if (!activeCall) return

    cleanup()

    const duration = Math.floor((Date.now() - activeCall.timestamp.getTime()) / 1000)
    const isScam = (activeCall.scamScore || 0) > 60

    const updatedCall: Call = {
      ...activeCall,
      duration,
      status: isScam ? "scam" : "safe",
    }

    setCalls((prev) => prev.map((c) => (c.id === activeCall.id ? updatedCall : c)))
    setActiveCall(null)
    setIsMonitoring(false)
  }

  const getStatusBadge = (status: Call["status"]) => {
    switch (status) {
      case "scam":
        return (
          <Badge variant="destructive" className="gap-1">
            <AlertTriangle className="h-3 w-3" />
            Scam Detected
          </Badge>
        )
      case "safe":
        return (
          <Badge className="gap-1 bg-green-600">
            <CheckCircle className="h-3 w-3" />
            Safe
          </Badge>
        )
      case "diverted":
        return <Badge variant="secondary">Diverted to AI</Badge>
      case "active":
        return (
          <Badge className="gap-1 bg-blue-600">
            <Phone className="h-3 w-3" />
            Active
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <Shield className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold text-foreground">Anti-Scam</span>
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Home
            </Link>
            <Link href="/user" className="text-sm text-foreground font-medium">
              Dashboard
            </Link>
            <Link href="/admin" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Admin
            </Link>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Call Protection Dashboard</h1>
            <p className="text-muted-foreground">Monitor and manage your protected calls</p>
          </div>
          <Button onClick={simulateIncomingCall} disabled={!!incomingCall || isMonitoring}>
            <Phone className="mr-2 h-4 w-4" />
            Simulate Incoming Call
          </Button>
        </div>

        {activeCall && (
          <Card className="p-6 mb-8 bg-card border-blue-600">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-1">Active Call Monitoring</h3>
                <p className="text-sm text-muted-foreground">{activeCall.number}</p>
              </div>
              <Button variant="destructive" onClick={endCall}>
                <PhoneOff className="mr-2 h-4 w-4" />
                End Call
              </Button>
            </div>

            {activeCall.scamScore !== undefined && (
              <div className="mb-4 p-4 rounded-lg bg-background">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">Scam Risk Level</span>
                  <span className="text-2xl font-bold text-foreground">{activeCall.scamScore}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      activeCall.scamScore > 70
                        ? "bg-red-600"
                        : activeCall.scamScore > 40
                          ? "bg-yellow-600"
                          : "bg-green-600"
                    }`}
                    style={{ width: `${activeCall.scamScore}%` }}
                  />
                </div>
                {activeCall.scamKeywords && activeCall.scamKeywords.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {activeCall.scamKeywords.map((keyword, idx) => (
                      <Badge key={idx} variant="destructive" className="text-xs">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {activeCall.transcript?.map((entry, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-lg ${entry.speaker === "AI Agent" ? "bg-primary/10" : "bg-muted"}`}
                >
                  <p className="text-xs font-semibold text-foreground mb-1">{entry.speaker}</p>
                  <p className="text-sm text-foreground">{entry.text}</p>
                </div>
              ))}
            </div>
          </Card>
        )}

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 bg-card border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Calls</p>
                <p className="text-3xl font-bold text-foreground">{calls.length}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Phone className="h-6 w-6 text-primary" />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-card border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Scam Blocked</p>
                <p className="text-3xl font-bold text-foreground">{calls.filter((c) => c.status === "scam").length}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-600/10">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-card border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Safe Calls</p>
                <p className="text-3xl font-bold text-foreground">{calls.filter((c) => c.status === "safe").length}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-600/10">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </Card>
        </div>

        <Card className="p-6 bg-card border-border">
          <h2 className="text-lg font-semibold text-foreground mb-4">Recent Calls</h2>
          <div className="space-y-3">
            {calls.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No calls yet. Simulate an incoming call to get started.
              </p>
            ) : (
              calls.map((call) => (
                <div key={call.id} className="flex items-center justify-between p-4 rounded-lg bg-background">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                      <Phone className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{call.number}</p>
                      <p className="text-sm text-muted-foreground">
                        {call.timestamp.toLocaleString()} • {call.duration}s
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {call.scamScore !== undefined && (
                      <span className="text-sm text-muted-foreground">Risk: {call.scamScore}%</span>
                    )}
                    {getStatusBadge(call.status)}
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </main>

      {incomingCall && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <Card className="p-8 max-w-md w-full mx-4 bg-card border-border">
            <div className="text-center mb-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mx-auto mb-4">
                <Phone className="h-8 w-8 text-primary animate-pulse" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Incoming Call</h3>
              <p className="text-2xl font-bold text-foreground mb-1">{incomingCall}</p>
              <p className="text-sm text-muted-foreground">Unknown number - not in contacts</p>
            </div>

            <div className="space-y-3">
              <Button onClick={handleUserAnswer} className="w-full h-12 bg-transparent" variant="outline">
                <Phone className="mr-2 h-5 w-5" />
                Answer Myself
              </Button>
              <Button onClick={handleDivert} className="w-full h-12">
                <Shield className="mr-2 h-5 w-5" />
                Divert to AI Protection
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
