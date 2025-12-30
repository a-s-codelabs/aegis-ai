"use client"

import { useState } from "react"
import { Shield, Phone, AlertTriangle, TrendingUp, Clock, Search, Download } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"

interface CallDetail {
  id: string
  number: string
  timestamp: Date
  duration: number
  status: "scam" | "safe" | "diverted"
  scamScore?: number
  keywords?: string[]
  transcript?: { speaker: string; text: string }[]
  userId: string
}

export default function AdminDashboard() {
  const [calls, setCalls] = useState<CallDetail[]>([
    {
      id: "1",
      number: "+1 (555) 123-4567",
      timestamp: new Date(Date.now() - 3600000),
      duration: 145,
      status: "scam",
      scamScore: 87,
      keywords: ["urgent", "bank account", "verify", "immediately"],
      userId: "user-001",
      transcript: [
        { speaker: "Caller", text: "Hello, this is urgent regarding your bank account." },
        { speaker: "AI Agent", text: "Hello, how can I help you?" },
        { speaker: "Caller", text: "We need to verify your account immediately or it will be closed." },
      ],
    },
    {
      id: "2",
      number: "+1 (555) 987-6543",
      timestamp: new Date(Date.now() - 7200000),
      duration: 89,
      status: "safe",
      scamScore: 12,
      keywords: [],
      userId: "user-002",
    },
  ])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCall, setSelectedCall] = useState<CallDetail | null>(null)

  const stats = {
    totalCalls: calls.length,
    scamBlocked: calls.filter((c) => c.status === "scam").length,
    safeForwarded: calls.filter((c) => c.status === "safe").length,
    avgScamScore:
      calls.length > 0 ? Math.round(calls.reduce((acc, c) => acc + (c.scamScore || 0), 0) / calls.length) : 0,
  }

  const filteredCalls = calls.filter(
    (call) =>
      call.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      call.userId.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getStatusBadge = (status: CallDetail["status"]) => {
    switch (status) {
      case "scam":
        return (
          <Badge variant="destructive" className="gap-1">
            <AlertTriangle className="h-3 w-3" />
            Scam
          </Badge>
        )
      case "safe":
        return <Badge className="gap-1 bg-green-600">Safe</Badge>
      case "diverted":
        return <Badge variant="secondary">Diverted</Badge>
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
            <span className="text-xl font-semibold text-foreground">Aegis AI Admin</span>
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Home
            </Link>
            <Link href="/user" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Dashboard
            </Link>
            <Link href="/admin" className="text-sm text-foreground font-medium">
              Admin
            </Link>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Monitor system-wide scam detection and call handling</p>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 bg-card border-border">
            <div className="flex items-center justify-between mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Phone className="h-5 w-5 text-primary" />
              </div>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </div>
            <p className="text-sm text-muted-foreground mb-1">Total Calls Processed</p>
            <p className="text-3xl font-bold text-foreground">{stats.totalCalls}</p>
          </Card>

          <Card className="p-6 bg-card border-border">
            <div className="flex items-center justify-between mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-600/10">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <TrendingUp className="h-4 w-4 text-red-600" />
            </div>
            <p className="text-sm text-muted-foreground mb-1">Scam Calls Blocked</p>
            <p className="text-3xl font-bold text-foreground">{stats.scamBlocked}</p>
          </Card>

          <Card className="p-6 bg-card border-border">
            <div className="flex items-center justify-between mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-600/10">
                <Phone className="h-5 w-5 text-green-600" />
              </div>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </div>
            <p className="text-sm text-muted-foreground mb-1">Safe Calls Forwarded</p>
            <p className="text-3xl font-bold text-foreground">{stats.safeForwarded}</p>
          </Card>

          <Card className="p-6 bg-card border-border">
            <div className="flex items-center justify-between mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-1">Avg Scam Score</p>
            <p className="text-3xl font-bold text-foreground">{stats.avgScamScore}%</p>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 p-6 bg-card border-border">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-foreground">All Call Details</h2>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by number or user..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 w-64"
                  />
                </div>
                <Button size="sm" variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              {filteredCalls.map((call) => (
                <div
                  key={call.id}
                  className="p-4 rounded-lg bg-background hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => setSelectedCall(call)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-medium text-foreground">{call.number}</p>
                      <p className="text-xs text-muted-foreground">User: {call.userId}</p>
                    </div>
                    {getStatusBadge(call.status)}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {call.timestamp.toLocaleString()}
                    </span>
                    <span>{call.duration}s</span>
                    {call.scamScore !== undefined && <span className="font-medium">Risk: {call.scamScore}%</span>}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6 bg-card border-border">
            <h2 className="text-lg font-semibold text-foreground mb-6">
              {selectedCall ? "Call Details" : "Scam Report Summary"}
            </h2>

            {selectedCall ? (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Phone Number</p>
                  <p className="font-medium text-foreground">{selectedCall.number}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-1">Status</p>
                  {getStatusBadge(selectedCall.status)}
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-1">Scam Score</p>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full ${
                          (selectedCall.scamScore || 0) > 70
                            ? "bg-red-600"
                            : (selectedCall.scamScore || 0) > 40
                              ? "bg-yellow-600"
                              : "bg-green-600"
                        }`}
                        style={{ width: `${selectedCall.scamScore}%` }}
                      />
                    </div>
                    <span className="font-bold text-foreground">{selectedCall.scamScore}%</span>
                  </div>
                </div>

                {selectedCall.keywords && selectedCall.keywords.length > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Scam Keywords Detected</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedCall.keywords.map((keyword, idx) => (
                        <Badge key={idx} variant="destructive" className="text-xs">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {selectedCall.transcript && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Conversation Transcript</p>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {selectedCall.transcript.map((entry, idx) => (
                        <div
                          key={idx}
                          className={`p-2 rounded text-xs ${
                            entry.speaker === "AI Agent" ? "bg-primary/10" : "bg-muted"
                          }`}
                        >
                          <p className="font-semibold text-foreground mb-1">{entry.speaker}</p>
                          <p className="text-foreground">{entry.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Button onClick={() => setSelectedCall(null)} variant="outline" className="w-full">
                  Close Details
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-3">Top Scam Keywords</p>
                  <div className="space-y-2">
                    {["urgent", "bank account", "verify", "suspended", "immediately"].map((keyword, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <span className="text-sm text-foreground">{keyword}</span>
                        <Badge variant="outline">{Math.floor(Math.random() * 20) + 5}</Badge>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-3">Detection Accuracy</p>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl font-bold text-foreground">94.2%</span>
                    <Badge className="bg-green-600">Excellent</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">Based on verified scam patterns</p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </main>
    </div>
  )
}
