"use client"

import { ShieldLockLogo } from "@/components/brand-logo"
import Link from "next/link"
import { Button } from '@/components/ui/button';

export default function AppEntryPage() {
  return (
    <div className="relative flex h-full min-h-screen w-full flex-col overflow-hidden bg-[#0f172a] text-slate-100">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-[#111827] to-[#020617]" />
      <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-br from-teal-900/10 to-transparent opacity-50 pointer-events-none" />
      {/* Grid pattern - matching login page */}
      <div
        className="absolute inset-0 bg-[url('https://placeholder.pics/svg/20')] bg-repeat opacity-[0.03] pointer-events-none"
        style={{ backgroundSize: '24px 24px', filter: 'invert(1)' }}
      />

      <div className="relative flex flex-1 flex-col items-center justify-between px-6 py-12 z-10">
        {/* Top spacer */}
        <div className="flex-1" />

        {/* Icon section */}
        <div className="flex flex-col items-center justify-center w-full max-w-md">
          <div className="relative mb-12 group">
            {/* Glow effect */}
            <div className="absolute inset-0 rounded-full bg-teal-500/20 blur-3xl animate-pulse scale-110" />

            {/* Icon container - matching reference: w-36 h-36 rounded-[2.5rem] */}
            <div className="relative flex items-center justify-center w-36 h-36 rounded-[2.5rem] bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 shadow-2xl shadow-black/40 backdrop-blur-md">
              {/* Inner border */}
              <div className="absolute inset-3 rounded-[2rem] border border-white/5 pointer-events-none" />

              {/* Shield icon - size 72 to match reference */}
              <div className="drop-shadow-[0_0_15px_rgba(45,212,191,0.4)]">
                <ShieldLockLogo size={72} />
              </div>

              {/* Glowing dot in top-right */}
              <div className="absolute top-5 right-5 w-2 h-2 rounded-full bg-teal-400 shadow-[0_0_8px_#2dd4bf]" />
            </div>
          </div>

          {/* Title section */}
          <div className="text-center space-y-3 mb-8">
            <h1 className="text-white text-[38px] font-black leading-tight tracking-tight drop-shadow-lg">
              Anti-scam
            </h1>
            <p className="text-slate-400 text-lg font-medium tracking-wide">
              Your Shield Against Fraud
            </p>
          </div>
        </div>

        {/* Bottom spacer */}
        <div className="flex-1" />

        {/* Buttons and footer section */}
        <div className="w-full max-w-sm space-y-8">
          <div className="flex flex-col gap-4">
            <Link href="/auth/register" className="block">
              <Button
                size="lg"
                className="flex w-full h-14 rounded-2xl bg-teal-400 hover:bg-teal-300 text-slate-900 text-[17px] font-bold leading-normal tracking-wide shadow-lg shadow-teal-900/30 transition-all active:scale-95"
              >
                Register
              </Button>
            </Link>

            <Link href="/auth/login" className="block">
              <Button
                size="lg"
                variant="outline"
                className="flex w-full h-14 rounded-2xl bg-slate-800/40 border border-slate-700 text-slate-200 text-[17px] font-bold leading-normal tracking-wide hover:bg-slate-800 transition-colors active:scale-95"
              >
                Log In
              </Button>
            </Link>
          </div>

          {/* Footer with separator */}
          <div className="flex flex-col items-center gap-3 pt-2">
            <div className="h-px w-12 bg-slate-700" />
            <div className="flex cursor-default items-center gap-2 opacity-50 transition-opacity hover:opacity-100">
            <span
              className="material-symbols-outlined text-sm text-[#26d9bb]"
              style={{ fontVariationSettings: '"FILL" 1, "wght" 600' }}
            >
              verified_user
            </span>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              Powered by Google AI &amp; Eleven Labs
            </p>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}


