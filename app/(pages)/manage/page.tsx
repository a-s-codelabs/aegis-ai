'use client';

import { AppLayout } from '@/components/layout/app-layout';
import { SplitLayoutWithIPhone } from '@/components/layout/split-layout-with-iphone';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type SensitivityLevel = 'LOW' | 'STANDARD' | 'HIGH';
type VoiceStyle = 'Direct' | 'Neutral' | 'Empathetic';
type VoiceAgent = 'Rachel' | 'Josh';

export default function ManagePage() {
  const router = useRouter();
  const [isAiGuardianEnabled, setIsAiGuardianEnabled] = useState(true);
  const [sensitivityLevel, setSensitivityLevel] =
    useState<SensitivityLevel>('HIGH');
  const [sensitivityValue, setSensitivityValue] = useState(75); // 0-33: LOW, 34-66: STANDARD, 67-100: HIGH
  const [voiceStyle, setVoiceStyle] = useState<VoiceStyle>('Empathetic');
  const [voiceStyleValue, setVoiceStyleValue] = useState(65); // 0-33: Direct, 34-66: Neutral, 67-100: Empathetic
  const [selectedVoiceAgent, setSelectedVoiceAgent] =
    useState<VoiceAgent>('Rachel');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const sessionData = localStorage.getItem('userSession');
      if (!sessionData) {
        router.push('/auth/login');
        return;
      }
    }
  }, [router]);

  // Update sensitivity level based on slider value
  useEffect(() => {
    if (sensitivityValue <= 33) {
      setSensitivityLevel('LOW');
    } else if (sensitivityValue <= 66) {
      setSensitivityLevel('STANDARD');
    } else {
      setSensitivityLevel('HIGH');
    }
  }, [sensitivityValue]);

  // Update voice style based on slider value
  useEffect(() => {
    if (voiceStyleValue <= 33) {
      setVoiceStyle('Direct');
    } else if (voiceStyleValue <= 66) {
      setVoiceStyle('Neutral');
    } else {
      setVoiceStyle('Empathetic');
    }
  }, [voiceStyleValue]);

  const handleSensitivityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSensitivityValue(Number(e.target.value));
  };

  const handleVoiceStyleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVoiceStyleValue(Number(e.target.value));
  };

  // Manage Content Component (to be rendered inside iPhone)
  function ManageContent() {
    return (
      <AppLayout hideTopNavbar fullWidth>
      <div className="flex flex-col gap-6 p-0">
        {/* Custom Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="text-white flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-white/10 transition-colors"
          >
            <span className="material-symbols-outlined text-white">
              arrow_back
            </span>
          </button>
          <h2 className="text-white text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center">
            Smart Call Diversion
          </h2>
          <div className="flex size-10 items-center justify-center">
            <div
              className="h-9 w-9 rounded-full bg-cover bg-center border-2 border-[#26d9bb]/50 shadow-[0_0_10px_rgba(38,217,187,0.2)]"
              style={{
                backgroundImage:
                  'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCl96waA_f8iWLSu-peVKVNbtjqeREe240BiESXm3AgPfDS8Zy1ZvEgUQrnuXMgxtVRzzV4AylkAXSwncuWZWSmbvswJmtAHlGRYl6Rv2eDJD4e-pyWt12ofpFd0qm2O9K6M1gr18o-CLqe7D-HhCxhd0p7TujTs4Yvwk71F1jjLGN_h9G9JlwIyaCb-E5_sG91XeNxWZQ4bkZuEdptq6AEKLvzrevN8bJO4zBhjROteNjj2woMZOegqb1V0LOi2656MNME9g3HA01w")',
              }}
            ></div>
          </div>
        </div>

        {/* AI Call Guardian Section */}

          <div className="rounded-2xl border border-[rgba(38,217,187,0.15)] bg-[#131b26] p-6 shadow-xl relative overflow-hidden group">
            <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-[#26d9bb]/10 blur-[60px] pointer-events-none group-hover:bg-[#26d9bb]/15 transition-all duration-500"></div>
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#26d9bb]/20 to-[#26d9bb]/5 text-[#26d9bb] border border-[#26d9bb]/20 shadow-[0_0_15px_rgba(38,217,187,0.15)]">
                    <span className="material-symbols-outlined text-[28px]">
                      shield_lock
                    </span>
                  </div>
                  <div>
                    <h1 className="text-white text-xl font-bold tracking-tight">
                      AI Call Guardian
                    </h1>
                    <p className="text-[#94a3b8] text-xs font-medium mt-0.5">
                      Powered by Google & Eleven Labs
                    </p>
                  </div>
                </div>
                <label className="relative flex h-[28px] w-[48px] cursor-pointer items-center rounded-full border border-white/10 bg-[#1e2936] p-0.5 has-[:checked]:justify-end has-[:checked]:bg-[#26d9bb] has-[:checked]:border-[#26d9bb] transition-all duration-300 shadow-inner">
                  <input
                    type="checkbox"
                    checked={isAiGuardianEnabled}
                    onChange={(e) => setIsAiGuardianEnabled(e.target.checked)}
                    className="peer sr-only"
                  />
                  <div className="h-[22px] w-[22px] rounded-full bg-white shadow-sm transition-all duration-300"></div>
                </label>
              </div>
              <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent my-4"></div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#26d9bb] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#26d9bb]"></span>
                  </div>
                  <span className="text-[#26d9bb] font-semibold text-xs tracking-wide uppercase">
                    Protection Active
                  </span>
                </div>
                <button className="text-xs font-medium text-[#94a3b8] hover:text-white transition-colors flex items-center gap-1">
                  View Log{' '}
                  <span className="material-symbols-outlined text-[14px]">
                    arrow_forward
                  </span>
                </button>
              </div>
            </div>
          </div>
        

        {/* Description Text */}
        <div>
          <p className="text-[#94a3b8] text-sm leading-relaxed">
            When enabled, suspicious calls are automatically diverted to our AI
            agent. The AI engages the caller to determine intent, and you'll
            receive a real-time transcript.
          </p>
        </div>

        {/* Configuration Section */}
        <div>
          <h3 className="text-white text-lg font-bold leading-tight px-1 pt-2 flex items-center gap-2 mb-4">
            <span className="w-1 h-5 bg-[#26d9bb] rounded-full"></span>
            Configuration
          </h3>

          {/* Diversion Sensitivity */}
          <div className="rounded-xl border border-white/5 bg-[#131b26] p-5 shadow-lg mb-4">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[#94a3b8]">
                  tune
                </span>
                <span className="text-white font-medium">
                  Diversion Sensitivity
                </span>
              </div>
              <span className="text-[#26d9bb] font-bold text-sm bg-[#26d9bb]/10 px-2.5 py-1 rounded-md border border-[#26d9bb]/20">
                {sensitivityLevel === 'LOW'
                  ? 'Low'
                  : sensitivityLevel === 'STANDARD'
                  ? 'Standard'
                  : 'High'}
              </span>
            </div>
            <div className="relative w-full h-12 flex items-center justify-center px-1">
              <div className="absolute w-full h-1.5 bg-[#1e2936] rounded-full overflow-hidden border border-white/5">
                <div
                  className="h-full bg-gradient-to-r from-[#26d9bb]/40 to-[#26d9bb] rounded-full transition-all duration-300"
                  style={{ width: `${sensitivityValue}%` }}
                ></div>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={sensitivityValue}
                onChange={handleSensitivityChange}
                className="absolute w-full h-6 opacity-0 cursor-pointer z-20"
                style={{
                  background: 'transparent',
                  WebkitAppearance: 'none',
                }}
              />
              <div
                className="absolute w-6 h-6 bg-[#0B1121] rounded-full shadow-[0_0_15px_rgba(38,217,187,0.4)] border-[3px] border-[#26d9bb] -translate-x-1/2 cursor-pointer hover:scale-110 transition-transform z-10 pointer-events-none"
                style={{ left: `${sensitivityValue}%` }}
              ></div>
              <div className="absolute -bottom-2 w-full flex justify-between text-[10px] text-[#94a3b8] font-semibold uppercase tracking-wider">
                <span className="translate-y-1">Low</span>
                <span className="translate-y-1">Standard</span>
                <span className="translate-y-1">High</span>
              </div>
            </div>
            <p className="text-xs text-[#94a3b8] mt-5 border-t border-white/5 pt-3">
              "High" sensitivity will screen calls from unknown numbers more
              aggressively.
            </p>
          </div>

          {/* Custom Diversion Message */}
          <div className="rounded-xl border border-white/5 bg-[#131b26] p-1 shadow-lg mb-4">
            <button className="flex w-full items-center justify-between p-4 hover:bg-white/5 rounded-lg transition-colors group">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1e2936] text-[#26d9bb] border border-white/5">
                  <span className="material-symbols-outlined">graphic_eq</span>
                </div>
                <div className="text-left">
                  <p className="text-white font-medium">
                    Custom Diversion Message
                  </p>
                  <p className="text-xs text-[#94a3b8] mt-0.5">
                    Current: "Standard Anti-Scam Warning"
                  </p>
                </div>
              </div>
              <span className="material-symbols-outlined text-[#94a3b8] group-hover:text-[#26d9bb] group-hover:translate-x-1 transition-all">
                chevron_right
              </span>
            </button>
          </div>

          {/* Eleven Labs Settings */}
          <div className="rounded-xl border border-[rgba(38,217,187,0.15)] bg-[#131b26] p-5 overflow-hidden relative shadow-lg mb-4">
            <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-transparent via-[#26d9bb]/50 to-transparent opacity-30"></div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#26d9bb]/20 to-blue-500/20 text-white border border-white/10 shadow-inner">
                  <span className="material-symbols-outlined text-[18px] text-[#26d9bb]">
                    record_voice_over
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-white font-semibold">
                    Eleven Labs Settings
                  </span>
                  <span className="text-[10px] text-[#26d9bb] font-bold tracking-wider uppercase opacity-80">
                    AI Enhanced
                  </span>
                </div>
              </div>
            </div>

            {/* AI Voice Agent */}
            <div className="mb-7">
              <div className="flex justify-between items-center mb-3">
                <label className="text-[11px] text-[#94a3b8] font-bold uppercase tracking-widest">
                  AI Voice Agent
                </label>
                <button className="flex items-center gap-1 text-[11px] text-[#26d9bb] hover:text-white transition-colors font-medium">
                  <span className="material-symbols-outlined text-[14px]">
                    play_circle
                  </span>{' '}
                  Listen Preview
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {/* Rachel - Selected */}
                <button
                  onClick={() => setSelectedVoiceAgent('Rachel')}
                  className={`relative p-3 rounded-xl border transition-all shadow-[0_0_20px_rgba(38,217,187,0.05)] ${
                    selectedVoiceAgent === 'Rachel'
                      ? 'border-[#26d9bb] bg-[#26d9bb]/10 cursor-pointer'
                      : 'border-white/5 bg-[#1e2936] cursor-pointer hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className={`h-9 w-9 rounded-full border flex items-center justify-center ${
                        selectedVoiceAgent === 'Rachel'
                          ? 'bg-[#1e2936] border-[#26d9bb]/30 text-[#26d9bb] shadow-sm'
                          : 'bg-[#0B1121] border-white/5 text-[#94a3b8]'
                      }`}
                    >
                      <span className="material-symbols-outlined text-lg">
                        face_3
                      </span>
                    </div>
                    <div>
                      <div className="text-white text-xs font-bold">Rachel</div>
                      <div className="text-[#26d9bb]/70 text-[10px] font-medium">
                        Professional
                      </div>
                    </div>
                  </div>
                  {selectedVoiceAgent === 'Rachel' && (
                    <div className="absolute top-2 right-2 text-[#26d9bb] drop-shadow-[0_0_8px_rgba(38,217,187,0.6)]">
                      <span
                        className="material-symbols-outlined text-[18px]"
                        style={{ fontVariationSettings: '"FILL" 1' }}
                      >
                        check_circle
                      </span>
                    </div>
                  )}
                </button>

                {/* Josh - Unselected */}
                <button
                  onClick={() => setSelectedVoiceAgent('Josh')}
                  className={`relative p-3 rounded-xl border transition-all group ${
                    selectedVoiceAgent === 'Josh'
                      ? 'border-[#26d9bb] bg-[#26d9bb]/10 shadow-[0_0_20px_rgba(38,217,187,0.05)] cursor-pointer'
                      : 'border-white/5 bg-[#1e2936] cursor-pointer hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className={`h-9 w-9 rounded-full border flex items-center justify-center ${
                        selectedVoiceAgent === 'Josh'
                          ? 'bg-[#1e2936] border-[#26d9bb]/30 text-[#26d9bb] shadow-sm'
                          : 'bg-[#0B1121] border-white/5 flex items-center justify-center text-[#94a3b8] group-hover:text-white transition-colors'
                      }`}
                    >
                      <span className="material-symbols-outlined text-lg">
                        face_6
                      </span>
                    </div>
                    <div>
                      <div
                        className={`text-xs font-medium group-hover:text-white transition-colors ${
                          selectedVoiceAgent === 'Josh'
                            ? 'text-white font-bold'
                            : 'text-gray-300'
                        }`}
                      >
                        Josh
                      </div>
                      <div
                        className={`text-[10px] group-hover:text-gray-400 transition-colors ${
                          selectedVoiceAgent === 'Josh'
                            ? 'text-[#26d9bb]/70 font-medium'
                            : 'text-gray-600'
                        }`}
                      >
                        Friendly
                      </div>
                    </div>
                  </div>
                  {selectedVoiceAgent === 'Josh' && (
                    <div className="absolute top-2 right-2 text-[#26d9bb] drop-shadow-[0_0_8px_rgba(38,217,187,0.6)]">
                      <span
                        className="material-symbols-outlined text-[18px]"
                        style={{ fontVariationSettings: '"FILL" 1' }}
                      >
                        check_circle
                      </span>
                    </div>
                  )}
                </button>
              </div>
              <p className="text-[10px] text-[#94a3b8] mt-2 text-right italic opacity-60">
                More voices available in Premium
              </p>
            </div>

            {/* Voice Style */}
            <div className="mb-6">
              <div className="flex justify-between items-end mb-4">
                <label className="text-[11px] text-[#94a3b8] font-bold uppercase tracking-widest">
                  Voice Style
                </label>
                <span className="text-[#26d9bb] text-[10px] font-bold bg-[#26d9bb]/10 border border-[#26d9bb]/20 px-2 py-0.5 rounded uppercase tracking-wide">
                  {voiceStyle === 'Direct'
                    ? 'Direct'
                    : voiceStyle === 'Neutral'
                    ? 'Neutral'
                    : 'Empathetic'}
                </span>
              </div>
              <div className="relative w-full h-10 flex items-center justify-center px-1">
                <div className="absolute w-full h-1.5 bg-[#1e2936] rounded-full overflow-hidden border border-white/5">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 via-[#26d9bb] to-purple-500 rounded-full opacity-90 transition-all duration-300"
                    style={{ width: `${voiceStyleValue}%` }}
                  ></div>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={voiceStyleValue}
                  onChange={handleVoiceStyleChange}
                  className="absolute w-full h-6 opacity-0 cursor-pointer z-20"
                  style={{
                    background: 'transparent',
                    WebkitAppearance: 'none',
                  }}
                />
                <div
                  className="absolute w-6 h-6 bg-[#0B1121] rounded-full shadow-[0_0_15px_rgba(38,217,187,0.5)] border-[3px] border-[#26d9bb] -translate-x-1/2 cursor-pointer hover:scale-110 transition-transform z-10 pointer-events-none"
                  style={{ left: `${voiceStyleValue}%` }}
                ></div>
                <div className="absolute -bottom-1 w-full flex justify-between text-[10px] text-[#94a3b8] font-medium">
                  <span>Direct</span>
                  <span>Neutral</span>
                  <span>Empathetic</span>
                </div>
              </div>
            </div>

            {/* Custom Prompting Guide */}
            <div className="mt-4 pt-4 border-t border-white/5">
              <button className="flex items-start gap-3 group hover:bg-white/5 -m-2 p-3 rounded-lg transition-colors w-full text-left">
                <div className="mt-0.5 p-1 rounded-md bg-yellow-500/10 text-yellow-500">
                  <span className="material-symbols-outlined text-[16px]">
                    lightbulb
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-200 font-medium group-hover:text-[#26d9bb] transition-colors">
                    Custom Prompting Guide
                  </p>
                  <p className="text-[10px] text-[#94a3b8] leading-tight mt-0.5">
                    Learn how to instruct the AI for specific scenarios.
                  </p>
                </div>
                <span className="material-symbols-outlined text-[#94a3b8] text-sm self-center group-hover:text-white transition-colors">
                  chevron_right
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
    );
  }

  // Prepare left content (instructions)
  const leftContent = (
    <>
      <h1 className="text-4xl lg:text-5xl font-bold leading-tight tracking-tight text-[#26d9bb] mb-4">
        Smart Call Diversion
      </h1>
      <p className="text-lg lg:text-xl text-slate-400 leading-relaxed">
        Configure your AI-powered call protection settings. Customize sensitivity levels, voice agents, and diversion messages to match your preferences.
      </p>
      <div className="space-y-4 text-base lg:text-lg text-slate-300">
        <div className="flex items-start gap-3">
          <span className="material-symbols-outlined text-[#26d9bb] text-xl mt-0.5">
            shield_lock
          </span>
          <div>
            <strong className="text-[#26d9bb]">AI Call Guardian:</strong> Automatically divert suspicious calls to our AI agent for screening.
          </div>
        </div>
        <div className="flex items-start gap-3">
          <span className="material-symbols-outlined text-[#26d9bb] text-xl mt-0.5">
            tune
          </span>
          <div>
            <strong className="text-[#26d9bb]">Diversion Sensitivity:</strong> Adjust how aggressively unknown numbers are screened.
          </div>
        </div>
        <div className="flex items-start gap-3">
          <span className="material-symbols-outlined text-[#26d9bb] text-xl mt-0.5">
            record_voice_over
          </span>
          <div>
            <strong className="text-[#26d9bb]">Voice Settings:</strong> Choose AI voice agents and customize voice style for call interactions.
          </div>
        </div>
      </div>
    </>
  );

  return (
    <SplitLayoutWithIPhone
      leftContent={leftContent}
      iphoneContent={<ManageContent />}
      leftBasis="50%"
    />
  );
}




