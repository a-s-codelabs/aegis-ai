"use client"

// import { Shield } from "lucide-react"
import { ShieldLockLogo } from "@/components/brand-logo"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export default function AppEntryPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#020617] text-foreground">
      {/* Background layers reuse the same grid + glow for consistency */}
      <div className="pointer-events-none absolute inset-0 bg-security-grid opacity-40" />
      <div className="pointer-events-none absolute inset-0 bg-security-radial" />

      <main className="relative z-10 w-full max-w-[414px] px-8 pb-10 pt-16">
        <div className="flex flex-col items-center">
          <Card className="relative w-full max-w-[320px] rounded-[32px] border border-teal-400/24 bg-gradient-to-b from-[#020617] via-[#020617] to-slate-950/95 px-12 py-10 shadow-[0_40px_140px_rgba(15,23,42,1)]">
            <div className="absolute right-7 top-7 h-[10px] w-[10px] rounded-full bg-teal-400 shadow-[0_0_18px_rgba(45,212,191,0.9)]" />

            <div className="flex items-center justify-center">
              <ShieldLockLogo size={60} />
            </div>
          </Card>

          <section className="mt-10 w-full max-w-sm text-center">
            <h1 className="text-[30px] font-extrabold tracking-tight text-slate-50">
              Anti-scam
            </h1>
            <p className="mt-2 text-sm text-slate-300">
              Your Shield Against Fraud
            </p>

            <div className="mt-10 space-y-4">
              <Link href="/register" className="block">
                <Button
                  size="lg"
                  className="h-12 w-full rounded-full bg-teal-400 text-sm font-semibold text-slate-950 shadow-[0_22px_60px_rgba(45,212,191,0.55)] hover:bg-teal-300"
                >
                  Sign Up
                </Button>
              </Link>

              <Link href="/login" className="block">
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 w-full rounded-full border-teal-400/40 bg-transparent text-sm font-semibold text-slate-50 hover:bg-slate-900/60"
                >
                  Log In
                </Button>
              </Link>
            </div>

            <p className="mt-12 text-[10px] font-medium uppercase tracking-[0.2em] text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                <span className="inline-block h-[9px] w-[9px] rounded-full bg-teal-400/80" />
                Powered by Google AI &amp; Eleven Labs
              </span>
            </p>
          </section>
        </div>
      </main>
    </div>
  )
}


