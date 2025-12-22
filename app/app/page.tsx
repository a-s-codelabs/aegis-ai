"use client"
import { ShieldLockLogo } from "@/components/brand-logo"

export default function AppPage() {
  return (
    <div className="relative flex min-h-screen min-h-[884px] w-full flex-col items-center justify-center overflow-hidden bg-[#020617] text-foreground">
      {/* 1. Grid pattern background from provided design */}
      <div className="pointer-events-none absolute inset-0 h-full w-full bg-grid-pattern opacity-100" />

      {/* 2. Central radial glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(38,217,187,0.1)_0,_rgba(18,32,30,0.8)_55%,_#12201e_100%)]" />

      {/* Main content */}
      <div className="relative z-10 flex w-full max-w-md flex-col items-center justify-center px-6">
        {/* Icon / logo with glow rings */}
        <div className="relative mb-8 flex items-center justify-center">
          {/* Outer glow rings */}
          <div className="absolute h-32 w-32 rounded-full bg-[#26d9bb33] blur-3xl animate-pulse" />
          <div className="absolute h-24 w-24 rounded-full bg-[#26d9bb1a] blur-2xl" />

          {/* Shield + lock logo */}
          <div className="relative z-10 text-[#26d9bb] drop-shadow-[0_0_15px_rgba(38,217,187,0.3)]">
            <ShieldLockLogo size={96} />
          </div>
        </div>

        {/* Branding text */}
        <div className="flex flex-col items-center space-y-3 text-center">
          <h1 className="text-4xl font-bold leading-tight tracking-tight text-[#26d9bb]">
            Anti-scam
          </h1>
          <p className="max-w-[260px] text-base font-normal leading-relaxed tracking-wide text-slate-400">
            Your Shield Against Fraud
          </p>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#12201e] to-transparent" />
    </div>
  );
}

