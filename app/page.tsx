"use client"
import { Shield, Phone, TrendingUp } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <Shield className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold text-foreground">ScamGuard</span>
          </div>
          <nav className="flex items-center gap-6">
            <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Home
            </Link>
            <Link href="/user" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Dashboard
            </Link>
            <Link href="/admin" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Admin
            </Link>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-6 py-16">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h1 className="text-5xl font-bold text-foreground mb-6 text-balance">AI-Powered Scam Call Detection</h1>
          <p className="text-xl text-muted-foreground mb-8 text-pretty">
            Real-time protection against scam calls using advanced AI conversation analysis and intelligent call
            diversion
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/user">
              <Button size="lg" className="h-12 px-8">
                <Phone className="mr-2 h-5 w-5" />
                Start Protecting
              </Button>
            </Link>
            <Link href="/admin">
              <Button size="lg" variant="outline" className="h-12 px-8 bg-transparent">
                Admin Dashboard
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <Card className="p-6 bg-card border-border">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mb-4">
              <Phone className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Smart Call Diversion</h3>
            <p className="text-sm text-muted-foreground">
              Automatically diverts unknown calls to AI assistant for real-time scam detection
            </p>
          </Card>

          <Card className="p-6 bg-card border-border">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mb-4">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">AI Scam Detection</h3>
            <p className="text-sm text-muted-foreground">
              ElevenLabs AI converses naturally while Gemini analyzes patterns for scam indicators
            </p>
          </Card>

          <Card className="p-6 bg-card border-border">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mb-4">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Smart Whitelist</h3>
            <p className="text-sm text-muted-foreground">
              Legitimate calls are forwarded back to you and automatically whitelisted
            </p>
          </Card>
        </div>

        <Card className="p-8 bg-card border-border">
          <h2 className="text-2xl font-bold text-foreground mb-6">How ScamGuard Works</h2>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                1
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-1">Call Detection</h4>
                <p className="text-sm text-muted-foreground">
                  When a call comes in, we check if the number is in your contact list
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                2
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-1">Smart Diversion</h4>
                <p className="text-sm text-muted-foreground">
                  Unknown numbers trigger a popup allowing you to handle the call or divert to AI
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                3
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-1">AI Conversation</h4>
                <p className="text-sm text-muted-foreground">
                  ElevenLabs AI speaks naturally with the caller while Gemini AI analyzes the conversation
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                4
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-1">Intelligent Action</h4>
                <p className="text-sm text-muted-foreground">
                  Scam calls are blocked and logged. Legitimate calls are forwarded to you with whitelist status
                </p>
              </div>
            </div>
          </div>
        </Card>
      </main>
    </div>
  )
}
