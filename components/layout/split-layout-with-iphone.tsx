'use client';

import { ReactNode } from 'react';

interface SplitLayoutWithIPhoneProps {
  /** Content to display on the left side (instructions/info) */
  leftContent: ReactNode;
  /** Content to display inside the iPhone mockup */
  iphoneContent: ReactNode;
  /** Optional custom left side width basis (default: 50%) */
  leftBasis?: string;
}

/**
 * Reusable split layout component with fixed iPhone mockup on the right.
 * 
 * Desktop: Left content scrolls, iPhone fixed on right
 * Mobile: Content stacks vertically, iPhone appears below
 */
export function SplitLayoutWithIPhone({
  leftContent,
  iphoneContent,
  leftBasis = '50%',
}: SplitLayoutWithIPhoneProps) {
  return (
    <div className="relative flex min-h-screen w-full overflow-hidden bg-[#020617] text-foreground">
      {/* Grid pattern background */}
      <div className="pointer-events-none absolute inset-0 h-full w-full bg-grid-pattern opacity-100" />

      {/* Central radial glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(38,217,187,0.1)_0,_rgba(18,32,30,0.8)_55%,_#12201e_100%)]" />

      {/* Split Layout Container */}
      <div className="relative z-10 flex w-full flex-col lg:flex-row items-start justify-start min-h-screen">
        {/* Left Side - Instructions (Scrollable) */}
        <div
          // NOTE: keep text left-aligned with `items-start`, but vertically center
          // the whole left content block. Use symmetric horizontal padding so that
          // the content can sit visually in the center of the left side.
          className="flex flex-col items-start justify-center px-8 py-12 lg:py-0 lg:px-12 w-full lg:w-auto lg:min-h-screen overflow-y-auto scrollbar-hide"
          style={{ flexBasis: leftBasis }}
        >
          <div className="w-full max-w-2xl lg:mx-auto space-y-8 text-left">
            {leftContent}
          </div>
        </div>

        {/* Right Side - iPhone Mockup (Fixed Position on Desktop) */}
        <div className="hidden lg:flex items-center justify-center lg:fixed lg:right-0 lg:top-0 lg:bottom-0 lg:w-[40%] lg:h-screen lg:py-0 z-20">
          <div className="relative flex items-center justify-center">
            {/* iPhone Frame */}
            <div className="relative w-[320px] sm:w-[360px] md:w-[375px] h-[680px] sm:h-[760px] md:h-[812px] bg-gradient-to-b from-slate-900 to-black rounded-[3rem] p-2 shadow-2xl border-[3px] border-slate-800">
              {/* Notch/Dynamic Island */}
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-32 h-8 bg-black rounded-full z-30" />

              {/* Screen with Content */}
              <div className="relative w-full h-full bg-[#0B1121] rounded-[2.5rem] overflow-hidden">
                {/* iPhone Screen Content Container */}
                <div className="absolute inset-0 w-full h-full overflow-hidden">
                  <div className="w-full h-full">{iphoneContent}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile View - iPhone Mockup (Visible on small screens) */}
        <div className="flex lg:hidden items-center justify-center px-4 sm:px-6 py-12 w-full">
          <div className="relative flex items-center justify-center">
            {/* iPhone Frame */}
            <div className="relative w-[320px] sm:w-[360px] h-[680px] sm:h-[760px] bg-gradient-to-b from-slate-900 to-black rounded-[3rem] p-2 shadow-2xl border-[3px] border-slate-800">
              {/* Notch/Dynamic Island */}
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-32 h-8 bg-black rounded-full z-30" />

              {/* Screen with Content */}
              <div className="relative w-full h-full bg-[#0B1121] rounded-[2.5rem] overflow-hidden">
                {/* iPhone Screen Content Container */}
                <div className="absolute inset-0 w-full h-full overflow-hidden">
                  <div className="w-full h-full">{iphoneContent}</div>
                </div>
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

