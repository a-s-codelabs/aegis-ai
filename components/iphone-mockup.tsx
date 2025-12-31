"use client"

import { useRouter } from "next/navigation"

interface IPhoneMockupProps {
  onAppClick?: () => void
}

/**
 * iPhone mockup component showing the home screen with app icons.
 * Clicking the Aegis AI app icon navigates to /app page.
 */
export function IPhoneMockup({ onAppClick }: IPhoneMockupProps) {
  const router = useRouter()

  const handleAppClick = () => {
    if (onAppClick) {
      onAppClick()
    } else {
      router.push("/app")
    }
  }

  return (
    <div className="relative flex items-center justify-center">
      {/* iPhone Frame */}
      <div className="relative w-[375px] h-[812px] bg-gradient-to-b from-slate-900 to-black rounded-[3rem] p-2 shadow-2xl border-[3px] border-slate-800">
        {/* Notch/Dynamic Island */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-32 h-8 bg-black rounded-full z-30" />
        
        {/* Screen */}
        <div className="relative w-full h-full bg-gradient-to-b from-[#1a7bff] via-[#3b1fa8] to-[#050816] rounded-[2.5rem] overflow-hidden backdrop-blur-sm">
          {/* Status Bar */}
          <div className="absolute top-2 left-0 right-0 h-10 flex items-center justify-between px-8 z-20">
            <span className="text-black text-sm font-semibold">10:32</span>
            <div className="flex items-center gap-1">
              <div className="w-4 h-3 border border-black/30 rounded-sm bg-black/20">
                <div className="w-3 h-2 bg-black rounded-sm m-0.5" />
              </div>
              <div className="w-4 h-3 border border-black/30 rounded-sm bg-black/20">
                <div className="w-3 h-2 bg-black rounded-sm m-0.5" />
              </div>
              <div className="w-6 h-3 border border-black/30 rounded-sm bg-black/20">
                <div className="w-5 h-2 bg-black rounded-sm m-0.5" />
              </div>
            </div>
          </div>

          {/* Widgets Section */}
          <div className="absolute top-16 left-4 right-4 flex gap-4">
            {/* Weather Widget */}
            <div className="flex-1 bg-blue-500/90 backdrop-blur-sm rounded-2xl p-4 text-white">
              <div className="text-sm opacity-90">Greenwich</div>
              <div className="text-3xl font-bold mt-1">47°</div>
              <div className="text-xs mt-2 opacity-80">H:57° L:39°</div>
            </div>

            {/* Calendar Widget */}
            <div className="flex-1 bg-white/90 backdrop-blur-sm rounded-2xl p-4">
              <div className="text-xs text-gray-600 uppercase">Monday</div>
              <div className="text-3xl font-bold text-black mt-1">19</div>
              <div className="text-xs text-gray-500 mt-2">No events</div>
            </div>
          </div>

          {/* App Icons Grid */}
          <div className="absolute top-56 left-4 right-4 grid grid-cols-4 gap-4">
            {/* Row 1 */}
            <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center">
              <span className="text-white text-2xl">📞</span>
            </div>
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center border border-gray-200">
              <span className="text-2xl">📅</span>
            </div>
            <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center">
              <span className="text-2xl">📷</span>
            </div>
            <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl flex items-center justify-center">
              <span className="text-2xl">🖼️</span>
            </div>

            {/* Row 2 */}
            <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center">
              <span className="text-white text-xl font-bold">1</span>
            </div>
            <div className="w-16 h-16 bg-blue-400 rounded-2xl flex items-center justify-center">
              <span className="text-white text-2xl font-bold">A</span>
            </div>
            <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center">
              <span className="text-white text-2xl">✓</span>
            </div>
            <div className="w-16 h-16 bg-gray-300 rounded-2xl flex items-center justify-center">
              <span className="text-2xl">⚙️</span>
            </div>

            {/* Row 3 */}
            <div className="w-16 h-16 bg-red-500 rounded-2xl flex items-center justify-center">
              <span className="text-white text-2xl">🎵</span>
            </div>
            <div className="w-16 h-16 bg-gray-200 rounded-2xl flex items-center justify-center">
              <span className="text-2xl">📁</span>
            </div>
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center">
              <span className="text-white text-xl">🤖</span>
            </div>
            <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center">
              <span className="text-white text-2xl">💬</span>
            </div>

            {/* Row 4 - Aegis AI App (Clickable) */}
            <div
              onClick={handleAppClick}
              className="w-16 h-16 bg-gradient-to-br from-slate-800 to-slate-900 rounded-[1.25rem] flex items-center justify-center cursor-pointer hover:scale-110 active:scale-95 transition-all duration-200 shadow-xl shadow-black/30 border border-slate-700/50 group relative"
            >
              {/* Inner border */}
              <div className="absolute inset-2.5 rounded-[0.875rem] border border-white/5 pointer-events-none" />
              
              {/* Shield icon */}
              <div className="drop-shadow-[0_0_10px_rgba(45,212,191,0.4)] group-hover:drop-shadow-[0_0_20px_rgba(45,212,191,0.6)] transition-all">
                <div className="w-10 h-10 bg-[#26d9bb]/20 rounded-full flex items-center justify-center overflow-visible">
                  <span
                    className="material-symbols-outlined text-[#26d9bb]"
                    style={{ fontVariationSettings: '"FILL" 1, "wght" 600', fontSize: '28px' }}
                  >
                    shield
                  </span>
                </div>
              </div>

              {/* Glowing dot indicator */}
              <div className="absolute top-2.5 right-2.5 w-1.5 h-1.5 rounded-full bg-teal-400 shadow-[0_0_6px_#2dd4bf] animate-pulse" />
            </div>
            <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center">
              <span className="text-white text-2xl">💬</span>
            </div>
            <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center">
              <span className="text-white text-2xl">🏠</span>
            </div>
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center">
              <span className="text-white text-xl">⚙️</span>
            </div>
          </div>

          {/* Search Bar */}
          <div className="absolute bottom-32 left-4 right-4">
            <div className="bg-gray-200/80 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-2">
              <span className="text-gray-500">🔍</span>
              <span className="text-gray-500 text-sm">Search</span>
            </div>
          </div>

          {/* Dock */}
          <div className="absolute bottom-4 left-4 right-4 bg-gray-300/60 backdrop-blur-xl rounded-3xl p-3 flex items-center justify-around">
            <div className="w-14 h-14 bg-blue-500 rounded-2xl flex items-center justify-center">
              <span className="text-white text-xl">📧</span>
            </div>
            <div className="w-14 h-14 bg-blue-400 rounded-2xl flex items-center justify-center">
              <span className="text-white text-xl">🌐</span>
            </div>
            <div className="w-14 h-14 bg-gray-400 rounded-2xl flex items-center justify-center">
              <span className="text-white text-xl">📁</span>
            </div>
            <div className="w-14 h-14 bg-blue-500 rounded-2xl flex items-center justify-center">
              <span className="text-white text-xl">🧭</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

