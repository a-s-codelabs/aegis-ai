"use client"
import { IPhoneMockup } from "@/components/iphone-mockup"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="relative flex min-h-screen w-full overflow-hidden bg-[#020617] text-foreground">
      {/* Grid pattern background */}
      <div className="pointer-events-none absolute inset-0 h-full w-full bg-grid-pattern opacity-100" />

      {/* Central radial glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(38,217,187,0.1)_0,_rgba(18,32,30,0.8)_55%,_#12201e_100%)]" />

      {/* Split Layout Container */}
      <div className="relative z-10 flex w-full flex-col lg:flex-row items-center justify-center min-h-screen">
        {/* Left Side - Text Content */}
        <div className="flex flex-col items-center justify-center px-6 py-12 lg:py-0 lg:px-20 lg:basis-[60%]">
          <div className="w-full max-w-3xl space-y-6 text-left">
            <h1 className="text-5xl lg:text-6xl font-bold leading-tight tracking-tight text-[#26d9bb]">
              Go to Aegis AI
            </h1>
            <p className="text-lg lg:text-xl text-slate-400 leading-relaxed">
              Click and go to Aegis AI app
            </p>
            <Link
              href="/app"
              className="inline-flex items-center justify-center px-8 py-4 bg-[#26d9bb] hover:bg-[#20c4a8] text-black font-semibold rounded-xl transition-colors shadow-lg shadow-[#26d9bb]/20 hover:shadow-[#26d9bb]/30"
            >
              Launch App
            </Link>
          </div>
        </div>

        {/* Right Side - iPhone Mockup */}
        <div className="flex items-center justify-center px-6 py-12 lg:py-0 lg:basis-[40%]">
          <IPhoneMockup />
        </div>
      </div>

      {/* Bottom fade */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#12201e] to-transparent" />
    </div>
  );
}
