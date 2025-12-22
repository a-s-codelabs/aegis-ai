"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { ShieldLockLogo } from "@/components/brand-logo"

export default function AppPage() {
  const router = useRouter()

  useEffect(() => {
    // Splash logic: wait ~2 seconds, then redirect.
    // If a user session exists -> go to /home, else -> /auth.
    const timer = setTimeout(() => {
      if (typeof window === "undefined") return

      try {
        const session = window.localStorage.getItem("userSession")
        const hasSession = !!session

        if (hasSession) {
          router.push("/home")
        } else {
          router.push("/auth")
        }
      } catch {
        // Fallback to auth if anything goes wrong reading storage
        router.push("/auth")
      }
    }, 2000)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="relative flex min-h-screen w-full overflow-hidden bg-[#020617] text-foreground">
      {/* Grid pattern background */}
      <div className="pointer-events-none absolute inset-0 h-full w-full bg-grid-pattern opacity-100" />

      {/* Central radial glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(38,217,187,0.1)_0,_rgba(18,32,30,0.8)_55%,_#12201e_100%)]" />

      {/* Split Layout Container */}
      <div className="relative z-10 flex w-full flex-col lg:flex-row items-center justify-center min-h-screen">
        {/* Left Side - Instructions */}
        <div className="flex flex-col items-center justify-center px-6 py-12 lg:py-0 lg:px-20 lg:basis-[60%]">
          <div className="w-full max-w-3xl space-y-6 text-left">
            <h1 className="text-5xl lg:text-6xl font-bold leading-tight tracking-tight text-[#26d9bb]">
              Redirecting to Anti-scam
            </h1>
            <p className="text-lg lg:text-xl text-slate-400 leading-relaxed">
              Please wait while we redirect you to the Anti-scam app...
            </p>
            <div className="space-y-4 text-base lg:text-lg text-slate-300">
              <p>
                If you already have an account, you&apos;ll be taken directly to your home screen.
              </p>
              <p>
                If you&apos;re new, you&apos;ll be redirected to the login or register page to get started.
              </p>
            </div>
          </div>
        </div>

        {/* Right Side - iPhone Mockup with Splash Screen */}
        <div className="flex items-center justify-center px-6 py-12 lg:py-0 lg:basis-[40%]">
          <div className="relative flex items-center justify-center">
            {/* iPhone Frame */}
            <div className="relative w-[375px] h-[812px] bg-gradient-to-b from-slate-900 to-black rounded-[3rem] p-2 shadow-2xl border-[3px] border-slate-800">
              {/* Notch/Dynamic Island */}
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-32 h-8 bg-black rounded-full z-30" />
              
              {/* Screen with Splash Screen Content */}
              <div className="relative w-full h-full bg-[#020617] rounded-[2.5rem] overflow-hidden">
                {/* Grid pattern background */}
                <div className="pointer-events-none absolute inset-0 h-full w-full bg-grid-pattern opacity-100" />

                {/* Central radial glow */}
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(38,217,187,0.1)_0,_rgba(18,32,30,0.8)_55%,_#12201e_100%)]" />

                {/* Splash Screen Content */}
                <div className="relative z-10 flex w-full h-full flex-col items-center justify-center px-6">
                  {/* Icon / logo with glow rings */}
                  <div className="relative mb-8 flex items-center justify-center">
                    {/* Outer glow rings */}
                    <div className="absolute h-32 w-32 rounded-full bg-[#26d9bb33] blur-3xl animate-pulse" />
                    <div className="absolute h-24 w-24 rounded-full bg-[#26d9bb1a] blur-2xl" />

                    {/* Shield + lock logo */}
                    <div className="relative z-10 text-[#26d9bb] drop-shadow-[0_0_15px_rgba(38,217,187,0.3)]">
                      <ShieldLockLogo size={72} />
                    </div>
                  </div>

                  {/* Branding text */}
                  <div className="flex flex-col items-center space-y-3 text-center">
                    <h1 className="text-3xl font-bold leading-tight tracking-tight text-[#26d9bb]">
                      Anti-scam
                    </h1>
                    <p className="max-w-[220px] text-sm font-normal leading-relaxed tracking-wide text-slate-400">
                      Your Shield Against Fraud
                    </p>
                  </div>
                </div>

                {/* Bottom fade */}
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#12201e] to-transparent" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#12201e] to-transparent" />
    </div>
  );
}

