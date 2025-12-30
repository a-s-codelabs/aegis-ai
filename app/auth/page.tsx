"use client"

import { ShieldLockLogo } from "@/components/brand-logo"
import Link from "next/link"
import { Button } from '@/components/ui/button';
import { SplitLayoutWithIPhone } from '@/components/layout/split-layout-with-iphone';

export default function AppEntryPage() {
  // Auth Content Component (to be rendered inside iPhone)
  function AuthContent() {
    return (
      <div className="relative flex flex-1 flex-col items-center justify-between px-6 py-12 h-full pt-16 overflow-y-auto bg-[#0f172a]">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-[#111827] to-[#020617]" />
        <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-br from-teal-900/10 to-transparent opacity-50 pointer-events-none" />
        {/* Grid pattern - matching login page */}
        <div
          className="absolute inset-0 bg-[url('https://placeholder.pics/svg/20')] bg-repeat opacity-[0.03] pointer-events-none"
          style={{ backgroundSize: '24px 24px', filter: 'invert(1)' }}
        />

        {/* Status Bar */}
        <div className="absolute top-2 left-0 right-0 h-10 flex items-center justify-between px-8 z-20">
          <span className="text-white text-sm font-semibold">10:32</span>
          <div className="flex items-center gap-1">
            <div className="w-4 h-3 border border-white/30 rounded-sm bg-white/20">
              <div className="w-3 h-2 bg-white rounded-sm m-0.5" />
            </div>
            <div className="w-4 h-3 border border-white/30 rounded-sm bg-white/20">
              <div className="w-3 h-2 bg-white rounded-sm m-0.5" />
            </div>
            <div className="w-6 h-3 border border-white/30 rounded-sm bg-white/20">
              <div className="w-5 h-2 bg-white rounded-sm m-0.5" />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-1 flex-col items-center justify-between w-full">
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
                Aegis AI
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

  // Prepare left content (instructions)
  const leftContent = (
    <>
      <h1 className="text-4xl lg:text-5xl font-bold leading-tight tracking-tight text-[#26d9bb] mb-4">
        Welcome to Aegis AI
      </h1>
      <p className="text-lg lg:text-xl text-slate-400 leading-relaxed">
        Your intelligent shield against fraud. Get started by creating an account or logging in to access AI-powered call protection.
      </p>
      <div className="space-y-4 text-base lg:text-lg text-slate-300">
        <div className="flex items-start gap-3">
          <span className="material-symbols-outlined text-[#26d9bb] text-xl mt-0.5">
            shield_lock
          </span>
          <div>
            <strong className="text-[#26d9bb]">AI-Powered Protection:</strong> Our advanced AI system screens incoming calls in real-time to identify and block potential scams before they reach you.
          </div>
        </div>
        <div className="flex items-start gap-3">
          <span className="material-symbols-outlined text-[#26d9bb] text-xl mt-0.5">
            smart_toy
          </span>
          <div>
            <strong className="text-[#26d9bb]">Intelligent Screening:</strong> Every call is analyzed by our AI agent, which can handle conversations, assess risk levels, and protect you from fraudulent attempts.
          </div>
        </div>
        <div className="flex items-start gap-3">
          <span className="material-symbols-outlined text-[#26d9bb] text-xl mt-0.5">
            history
          </span>
          <div>
            <strong className="text-[#26d9bb]">Call Logs & Transcripts:</strong> Review detailed logs of all screened calls, including full conversation transcripts and risk assessments.
          </div>
        </div>
        <div className="flex items-start gap-3">
          <span className="material-symbols-outlined text-[#26d9bb] text-xl mt-0.5">
            verified_user
          </span>
          <div>
            <strong className="text-[#26d9bb]">Powered by Google AI & Eleven Labs:</strong> Built with cutting-edge AI technology to provide the most accurate fraud detection and natural conversation handling.
          </div>
        </div>
      </div>
    </>
  );

  return (
    <SplitLayoutWithIPhone
      leftContent={leftContent}
      iphoneContent={<AuthContent />}
      leftBasis="60%"
    />
  );
}


