'use client';

import { AppLayout } from '@/components/layout/app-layout';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { analyzeConversation } from '@/lib/utils/conversation-analysis';
import type { TranscriptEntry } from '@/lib/utils/conversation-analysis';
import {
  ALL_CONVERSATIONS,
  getRandomConversation,
} from '@/lib/utils/call-conversations';

interface UserSession {
  userId: string;
  phoneNumber: string;
  token: string;
  name?: string;
  role?: 'admin' | 'user';
}

interface Call {
  id: string;
  number: string;
  timestamp: Date;
  duration: number;
  status: 'scam' | 'safe' | 'unknown';
  risk?: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [userSession, setUserSession] = useState<UserSession | null>(null);
  const [activeCall, setActiveCall] = useState<{
    number: string;
    risk: number;
    keywords: string[];
    transcript: TranscriptEntry[];
    startTime?: Date;
  } | null>(null);
  const [visibleTranscript, setVisibleTranscript] = useState<TranscriptEntry[]>(
    []
  );
  const [isFullPageMonitoring, setIsFullPageMonitoring] = useState(false);
  const transcriptIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const analysisTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastProcessedLengthRef = useRef<number>(0);
  const [incomingCall, setIncomingCall] = useState<{
    number: string;
  } | null>(null);
  const [calls, setCalls] = useState<Call[]>([
    {
      id: '1',
      number: '+1 (184) 768-4419',
      timestamp: new Date('2025-12-18T12:14:00'),
      duration: 0,
      status: 'scam',
      risk: 95,
    },
    {
      id: '2',
      number: '+1 (724) 719-4042',
      timestamp: new Date('2025-12-18T11:32:00'),
      duration: 252,
      status: 'safe',
      risk: 5,
    },
    {
      id: '3',
      number: '+1 (202) 555-0199',
      timestamp: new Date('2025-12-17T09:15:00'),
      duration: 0,
      status: 'unknown',
    },
  ]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const sessionData = localStorage.getItem('userSession');
      if (!sessionData) {
        router.push('/auth/login');
        return;
      }

      try {
        const session: UserSession = JSON.parse(sessionData);
        setUserSession(session);
      } catch (error) {
        console.error('[Dashboard] Error parsing session:', error);
        router.push('/auth/login');
      }
    }
  }, [router]);

  // Simulate active call monitoring (commented out - only for testing)
  // useEffect(() => {
  //   const hasActiveCall = Math.random() > 0.5; // 50% chance
  //   if (hasActiveCall) {
  //     setActiveCall({
  //       number: '+1 (184) 768 4419',
  //       risk: 95,
  //       keywords: ['WIRE TRANSFER', 'GIFT CARD', 'BITCOIN'],
  //       transcript: [
  //         {
  //           speaker: 'Caller',
  //           text: "Congratulations! You've won $1 million in our lottery! You just need to claim your prize.",
  //         },
  //         {
  //           speaker: 'AI Agent',
  //           text: "I don't remember entering any lottery. How did I win?",
  //         },
  //         {
  //           speaker: 'Caller',
  //           text: 'You were automatically entered. To claim your prize, you need to pay a small processing fee of $500.',
  //         },
  //       ],
  //     });
  //   }
  // }, []);

  // Handle transcript animation - show entries one by one
  useEffect(() => {
    if (!activeCall || !isFullPageMonitoring) {
      setVisibleTranscript([]);
      lastProcessedLengthRef.current = 0;
      if (transcriptIntervalRef.current) {
        clearInterval(transcriptIntervalRef.current);
        transcriptIntervalRef.current = null;
      }
      return;
    }

    const transcriptLength = activeCall.transcript.length;
    const visibleLength = visibleTranscript.length;

    // Only process if there are new entries we haven't shown yet
    if (transcriptLength > lastProcessedLengthRef.current) {
      // Clean up existing interval if any
      if (transcriptIntervalRef.current) {
        clearInterval(transcriptIntervalRef.current);
        transcriptIntervalRef.current = null;
      }

      // If we have no visible transcript yet, start showing from the beginning
      if (visibleLength === 0 && transcriptLength > 0) {
        // Show first entry immediately
        setVisibleTranscript([activeCall.transcript[0]]);
        lastProcessedLengthRef.current = 1;

        // If there are more entries, set up interval to show them one by one
        if (transcriptLength > 1) {
          let nextIndex = 1;
          transcriptIntervalRef.current = setInterval(() => {
            setVisibleTranscript((prev) => {
              if (nextIndex < activeCall.transcript.length) {
                const newEntry = activeCall.transcript[nextIndex];
                nextIndex++;
                lastProcessedLengthRef.current = nextIndex;
                return [...prev, newEntry];
              }
              // All entries shown, clear interval
              if (transcriptIntervalRef.current) {
                clearInterval(transcriptIntervalRef.current);
                transcriptIntervalRef.current = null;
              }
              return prev;
            });
          }, 2000); // Show next entry every 2 seconds
        }
      }
      // If we have some visible transcript but there are new entries
      else if (visibleLength > 0 && visibleLength < transcriptLength) {
        // Add missing entries one by one
        let nextIndex = visibleLength;
        transcriptIntervalRef.current = setInterval(() => {
          setVisibleTranscript((prev) => {
            if (nextIndex < activeCall.transcript.length) {
              const newEntry = activeCall.transcript[nextIndex];
              nextIndex++;
              lastProcessedLengthRef.current = nextIndex;
              return [...prev, newEntry];
            }
            // All entries shown, clear interval
            if (transcriptIntervalRef.current) {
              clearInterval(transcriptIntervalRef.current);
              transcriptIntervalRef.current = null;
            }
            return prev;
          });
        }, 2000);
      }
    }

    return () => {
      if (transcriptIntervalRef.current) {
        clearInterval(transcriptIntervalRef.current);
        transcriptIntervalRef.current = null;
      }
    };
  }, [activeCall?.transcript, isFullPageMonitoring]);

  // Analyze conversation and update risk level dynamically
  useEffect(() => {
    if (
      !activeCall ||
      !isFullPageMonitoring ||
      visibleTranscript.length === 0
    ) {
      return;
    }

    // Debounce analysis - only analyze after new entries are added
    if (analysisTimeoutRef.current) {
      clearTimeout(analysisTimeoutRef.current);
    }

    analysisTimeoutRef.current = setTimeout(async () => {
      try {
        const result = await analyzeConversation(visibleTranscript);
        setActiveCall((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            risk: result.scamScore,
            keywords: result.keywords,
          };
        });
      } catch (error) {
        console.error('[Dashboard] Error analyzing conversation:', error);
      }
    }, 1000); // Wait 1 second after transcript update before analyzing

    return () => {
      if (analysisTimeoutRef.current) {
        clearTimeout(analysisTimeoutRef.current);
        analysisTimeoutRef.current = null;
      }
    };
  }, [visibleTranscript, isFullPageMonitoring]);

  const endCall = () => {
    // Save call to history before clearing
    if (activeCall) {
      const duration = activeCall.startTime
        ? Math.floor((Date.now() - activeCall.startTime.getTime()) / 1000)
        : 0;
      const isScam = activeCall.risk >= 60;

      const newCall: Call = {
        id: Date.now().toString(),
        number: activeCall.number,
        timestamp: activeCall.startTime || new Date(),
        duration,
        status: isScam ? 'scam' : 'safe',
        risk: activeCall.risk,
      };

      setCalls((prev) => [newCall, ...prev]);
    }

    // Cleanup
    setActiveCall(null);
    setIsFullPageMonitoring(false);
    setVisibleTranscript([]);
    if (transcriptIntervalRef.current) {
      clearInterval(transcriptIntervalRef.current);
      transcriptIntervalRef.current = null;
    }
    if (analysisTimeoutRef.current) {
      clearTimeout(analysisTimeoutRef.current);
      analysisTimeoutRef.current = null;
    }
  };

  const handleTakeOverCall = () => {
    // End AI monitoring and return to normal dashboard
    endCall();
  };

  const simulateScamCall = () => {
    const phoneNumber = `+1 (${Math.floor(Math.random() * 900) + 100}) ${
      Math.floor(Math.random() * 900) + 100
    }-${Math.floor(Math.random() * 9000) + 1000}`;

    // Get a random scam conversation
    const conversation = getRandomConversation('scam');

    const newCall: Call = {
      id: Date.now().toString(),
      number: phoneNumber,
      timestamp: new Date(),
      duration: 0,
      status: 'scam',
      risk: conversation.expectedRisk,
    };

    setCalls((prev) => [newCall, ...prev]);
    setActiveCall({
      number: phoneNumber,
      risk: conversation.expectedRisk,
      keywords: [],
      transcript: conversation.transcript,
      startTime: new Date(),
    });
  };

  const simulateSafeCall = () => {
    const phoneNumber = `+1 (${Math.floor(Math.random() * 900) + 100}) ${
      Math.floor(Math.random() * 900) + 100
    }-${Math.floor(Math.random() * 9000) + 1000}`;

    // Get a random safe conversation
    const conversation = getRandomConversation('safe');

    const newCall: Call = {
      id: Date.now().toString(),
      number: phoneNumber,
      timestamp: new Date(),
      duration: Math.floor(Math.random() * 300) + 60, // 1-6 minutes
      status: 'safe',
      risk: conversation.expectedRisk,
    };

    setCalls((prev) => [newCall, ...prev]);
    setActiveCall({
      number: phoneNumber,
      risk: conversation.expectedRisk,
      keywords: [], // No scam keywords for safe calls
      transcript: conversation.transcript,
      startTime: new Date(),
    });
  };

  const simulateIncomingCall = () => {
    const phoneNumber = `+1 (${Math.floor(Math.random() * 900) + 100}) ${
      Math.floor(Math.random() * 900) + 100
    }-${Math.floor(Math.random() * 9000) + 1000}`;

    setIncomingCall({
      number: phoneNumber,
    });
  };

  const handleDeclineCall = () => {
    if (incomingCall) {
      const newCall: Call = {
        id: Date.now().toString(),
        number: incomingCall.number,
        timestamp: new Date(),
        duration: 0,
        status: 'unknown',
      };
      setCalls((prev) => [newCall, ...prev]);
    }
    setIncomingCall(null);
  };

  const handleDivertToAI = () => {
    if (incomingCall) {
      // Get a random conversation (mix of scam and safe for unknown calls)
      // For unknown calls, we'll randomly pick between scam and safe
      const isScam = Math.random() > 0.3; // 70% chance it's a scam for unknown numbers
      const conversation = getRandomConversation(isScam ? 'scam' : 'safe');
      const startTime = new Date();

      setActiveCall({
        number: incomingCall.number,
        risk: conversation.expectedRisk,
        keywords: [],
        transcript: conversation.transcript,
        startTime,
      });
      setIsFullPageMonitoring(true);
    }
    setIncomingCall(null);
  };

  const handleAcceptCall = () => {
    if (incomingCall) {
      const newCall: Call = {
        id: Date.now().toString(),
        number: incomingCall.number,
        timestamp: new Date(),
        duration: 0,
        status: 'unknown',
      };
      setCalls((prev) => [newCall, ...prev]);
    }
    setIncomingCall(null);
  };

  const stats = {
    totalCalls: 12,
    scamBlocked: 4,
    safeCalls: 8,
  };

  const getCallIcon = (status: Call['status']) => {
    switch (status) {
      case 'scam':
        return 'phone_missed';
      case 'safe':
        return 'call_received';
      default:
        return 'call_missed';
    }
  };

  const getCallStatusBadge = (status: Call['status'], risk?: number) => {
    switch (status) {
      case 'scam':
        return (
          <span className="px-2 py-0.5 bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-bold rounded flex items-center gap-1">
            <span className="material-symbols-outlined text-[10px]">
              warning
            </span>
            Scam
          </span>
        );
      case 'safe':
        return (
          <span className="px-2 py-0.5 bg-green-500/10 border border-green-500/20 text-green-500 text-[10px] font-bold rounded flex items-center gap-1">
            <span className="material-symbols-outlined text-[10px]">
              verified
            </span>
            Safe
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 bg-slate-700/50 border border-slate-600/50 text-slate-300 text-[10px] font-bold rounded flex items-center gap-1">
            <span className="material-symbols-outlined text-[10px]">help</span>
            Unknown
          </span>
        );
    }
  };

  const formatDuration = (seconds: number) => {
    if (seconds === 0) return '0s';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  return (
    <>
      {/* Full Page Active Call Monitoring - Outside AppLayout to hide navbars */}
      {activeCall && isFullPageMonitoring ? (
        <div className="fixed inset-0 z-50 bg-black flex flex-col overflow-hidden">
          {/* Background Pattern */}
          <div
            className="absolute inset-0 opacity-[0.15] pointer-events-none"
            style={{
              backgroundImage:
                'linear-gradient(to right, #333 1px, transparent 1px), linear-gradient(to bottom, #333 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          ></div>

          {/* Gradient Blurs */}
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[40%] bg-[#2dd4bf]/10 rounded-full blur-[120px] pointer-events-none"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[40%] bg-red-500/10 rounded-full blur-[120px] pointer-events-none"></div>

          {/* Main Content */}
          <div className="relative flex-1 flex flex-col z-10 h-full overflow-y-auto scrollbar-hide">
            {/* Header */}
            <div className="sticky top-0 bg-black/80 backdrop-blur-md border-b border-slate-800/50 z-20 p-4">
              <div className="flex justify-between items-center max-w-4xl mx-auto w-full">
                <div className="flex items-center gap-3">
                  <div
                    className={`relative flex h-4 w-4 ${
                      activeCall.risk < 20
                        ? 'bg-green-500'
                        : activeCall.risk < 70
                        ? 'bg-orange-500'
                        : 'bg-red-500'
                    } rounded-full`}
                  >
                    <span
                      className={`absolute inline-flex h-full w-full rounded-full ${
                        activeCall.risk < 20
                          ? 'bg-green-400'
                          : activeCall.risk < 70
                          ? 'bg-orange-400'
                          : 'bg-red-400'
                      } opacity-75 animate-ping`}
                    ></span>
                  </div>
                  <div>
                    <h2 className="text-white font-semibold text-lg">
                      Active Call Monitoring
                    </h2>
                    <p className="text-slate-400 text-sm">
                      {activeCall.number}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleTakeOverCall}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold py-2 px-4 rounded-lg transition-colors flex items-center gap-2 shadow-lg"
                >
                  <span className="material-symbols-outlined text-lg">
                    call
                  </span>
                  Take Over Call
                </button>
              </div>
            </div>

            {/* Risk Level Section */}
            <div className="max-w-4xl mx-auto w-full p-4">
              <div className="bg-slate-900/60 border border-slate-700/50 rounded-2xl p-6 mb-4">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-slate-300 font-medium text-sm">
                    Scam Risk Level
                  </span>
                  <span
                    className={`font-bold text-2xl ${
                      activeCall.risk < 20
                        ? 'text-green-500'
                        : activeCall.risk < 50
                        ? 'text-yellow-500'
                        : activeCall.risk < 70
                        ? 'text-orange-500'
                        : 'text-red-500'
                    }`}
                  >
                    {activeCall.risk}%
                  </span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all duration-500 ${
                      activeCall.risk < 20
                        ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]'
                        : activeCall.risk < 50
                        ? 'bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]'
                        : activeCall.risk < 70
                        ? 'bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]'
                        : 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]'
                    }`}
                    style={{ width: `${activeCall.risk}%` }}
                  ></div>
                </div>
              </div>

              {/* Keywords */}
              {activeCall.keywords.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {activeCall.keywords.map((keyword, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 bg-red-900/30 border border-red-500/30 text-red-400 text-xs font-medium rounded-lg uppercase tracking-wide"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              )}

              {/* Transcript Section */}
              <div className="bg-slate-900/60 border border-slate-700/50 rounded-2xl p-6 mb-20">
                <h3 className="text-white font-semibold text-base mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg text-[#26d9bb]">
                    transcript
                  </span>
                  Live Transcript
                </h3>
                <div className="space-y-4 max-h-[calc(100vh-450px)] overflow-y-auto scrollbar-hide">
                  {visibleTranscript.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="inline-flex items-center gap-2 text-slate-400">
                        <span className="material-symbols-outlined animate-spin">
                          sync
                        </span>
                        <span>Waiting for conversation to start...</span>
                      </div>
                    </div>
                  ) : (
                    visibleTranscript.map((entry, idx) => (
                      <div
                        key={idx}
                        className={`text-sm animate-in fade-in slide-in-from-bottom-2 duration-300 ${
                          entry.speaker === 'AI Agent'
                            ? 'bg-slate-800/50 p-4 rounded-lg border border-slate-700/30'
                            : 'bg-slate-800/30 p-4 rounded-lg'
                        }`}
                      >
                        {entry.speaker === 'AI Agent' ? (
                          <>
                            <p className="text-[#26d9bb] font-bold mb-2 flex items-center gap-2">
                              <span className="material-symbols-outlined text-base">
                                smart_toy
                              </span>
                              {entry.speaker}
                            </p>
                            <p className="text-slate-200 leading-relaxed">
                              {entry.text}
                            </p>
                          </>
                        ) : (
                          <>
                            <p className="text-red-400 font-bold mb-2">
                              {entry.speaker}:
                            </p>
                            <p className="text-slate-300 leading-relaxed">
                              {entry.text}
                            </p>
                          </>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Fixed Go to Dashboard Button at Bottom */}
            <div className="fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-md border-t border-slate-800/50 z-30 p-4">
              <div className="max-w-4xl mx-auto">
                <button
                  onClick={() => {
                    setIsFullPageMonitoring(false);
                  }}
                  className="w-full bg-slate-800/90 hover:bg-slate-700/90 border border-slate-600/50 text-white font-semibold py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg"
                >
                  <span className="material-symbols-outlined text-lg">
                    dashboard
                  </span>
                  Go to Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : incomingCall ? (
        <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-between p-6 backdrop-blur-[2px] overflow-hidden">
          {/* Background Pattern */}
          <div
            className="absolute inset-0 opacity-[0.15] pointer-events-none"
            style={{
              backgroundImage:
                'linear-gradient(to right, #333 1px, transparent 1px), linear-gradient(to bottom, #333 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          ></div>

          {/* Gradient Blurs */}
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[40%] bg-[#2dd4bf]/10 rounded-full blur-[120px] pointer-events-none"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[40%] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none"></div>

          {/* Main Content */}
          <div className="relative flex-1 flex flex-col items-center justify-center w-full max-w-sm pt-12 z-10">
            {/* Phone Icon with Animations */}
            <div
              className="relative mb-10"
              style={{
                animation: 'float 6s ease-in-out infinite',
              }}
            >
              {/* Ripple Animations */}
              <div
                className="absolute inset-0 rounded-full bg-[#2dd4bf]/20"
                style={{
                  animation: 'ripple 1.5s linear infinite',
                  transform: 'scale(1)',
                }}
              ></div>
              <div
                className="absolute inset-0 rounded-full bg-[#2dd4bf]/20"
                style={{
                  animation: 'ripple 1.5s linear infinite',
                  animationDelay: '0.5s',
                  transform: 'scale(1)',
                }}
              ></div>

              {/* Phone Icon Container */}
              <div className="relative w-36 h-36 bg-black/60 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(45,212,191,0.25)] border border-white/10 backdrop-blur-md">
                <span
                  className="material-symbols-outlined text-[#2dd4bf] drop-shadow-[0_0_10px_rgba(45,212,191,0.5)]"
                  style={{
                    animation: 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                    fontVariationSettings: "'FILL' 1, 'wght' 700",
                    fontSize: '50px',
                  }}
                >
                  call
                </span>
              </div>
            </div>

            {/* Text Content */}
            <div className="text-center space-y-4 z-10">
              <h2 className="text-xs font-bold tracking-[0.25em] text-zinc-400 uppercase">
                Incoming Call
              </h2>
              <h1 className="text-4xl font-bold text-white tracking-tight leading-tight drop-shadow-xl">
                {incomingCall.number}
              </h1>

              {/* Unknown Number Badge */}
              <div className="flex items-center justify-center gap-2 text-sm font-semibold text-amber-400 bg-amber-950/40 border border-amber-500/30 px-5 py-2 rounded-full w-fit mx-auto backdrop-blur-md shadow-lg">
                <span className="material-symbols-outlined text-lg">
                  warning
                </span>
                <span>Unknown Number</span>
              </div>

              <p className="text-sm text-zinc-500 font-medium tracking-wide">
                Caller not in contacts
              </p>
            </div>
          </div>

          {/* Action Buttons Section */}
          <div className="w-full max-w-md pb-8 z-20">
            <div className="flex items-end justify-between px-4 sm:px-8 pb-10">
              {/* DECLINE Button */}
              <button
                onClick={handleDeclineCall}
                className="flex flex-col items-center gap-3 group active:scale-95 transition-transform"
              >
                <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center group-hover:bg-red-500/20 transition-colors backdrop-blur-md shadow-[0_0_15px_rgba(239,68,68,0.1)]">
                  <span
                    className="material-symbols-outlined text-3xl text-red-500 group-hover:text-red-400"
                    style={{
                      fontVariationSettings: "'FILL' 1, 'wght' 700",
                    }}
                  >
                    call_end
                  </span>
                </div>
                <span className="text-[10px] font-bold text-red-400/80 uppercase tracking-widest">
                  Decline
                </span>
              </button>

              {/* DIVERT TO AI PROTECTION Button */}
              <button
                onClick={handleDivertToAI}
                className="flex flex-col items-center gap-3 group active:scale-[0.98] transition-transform"
              >
                <div className="flex flex-col items-center -space-y-4 pb-2">
                  <span
                    className="material-symbols-outlined text-3xl text-[#2dd4bf]/40"
                    style={{
                      animation: 'swipe 2s infinite ease-out',
                      animationDelay: '0.3s',
                    }}
                  >
                    keyboard_arrow_up
                  </span>
                  <span
                    className="material-symbols-outlined text-3xl text-[#2dd4bf]/70"
                    style={{
                      animation: 'swipe 2s infinite ease-out',
                      animationDelay: '0.15s',
                    }}
                  >
                    keyboard_arrow_up
                  </span>
                  <span
                    className="material-symbols-outlined text-3xl text-[#2dd4bf]"
                    style={{
                      animation: 'swipe 2s infinite ease-out',
                      animationDelay: '0s',
                    }}
                  >
                    keyboard_arrow_up
                  </span>
                </div>
                <div className="relative">
                  <div
                    className="absolute inset-0 bg-[#2dd4bf]/30 rounded-full opacity-20"
                    style={{
                      animation: 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
                    }}
                  ></div>
                  <div className="w-16 h-16 rounded-full bg-[#2dd4bf] flex items-center justify-center shadow-[0_0_40px_rgba(45,212,191,0.3)] hover:shadow-[0_0_60px_rgba(45,212,191,0.5)] border-2 border-white/20 relative overflow-hidden z-10">
                    <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent z-0 transition-transform duration-1000"></div>
                    <span
                      className="material-symbols-outlined text-black z-10 text-3xl"
                      style={{
                        fontVariationSettings: "'FILL' 1, 'wght' 700",
                      }}
                    >
                      shield
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-[#2dd4bf] tracking-widest uppercase drop-shadow-lg text-center leading-tight">
                  Divert to AI Protection
                </span>
              </button>

              {/* ACCEPT Button */}
              <button
                onClick={handleAcceptCall}
                className="flex flex-col items-center gap-3 group active:scale-95 transition-transform"
              >
                <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center group-hover:bg-green-500/20 transition-colors backdrop-blur-md shadow-[0_0_15px_rgba(34,197,94,0.1)]">
                  <span
                    className="material-symbols-outlined text-3xl text-green-500 group-hover:text-green-400"
                    style={{
                      fontVariationSettings: "'FILL' 1, 'wght' 700",
                    }}
                  >
                    call
                  </span>
                </div>
                <span className="text-[10px] font-bold text-green-400/80 uppercase tracking-widest">
                  Accept
                </span>
              </button>
            </div>

            {/* Powered by Anti-Scam AI */}
            <div className="mt-auto pt-8 flex items-center justify-center gap-2 opacity-50">
              <span
                className="material-symbols-outlined text-sm text-[#26d9bb]"
                style={{ fontVariationSettings: '"FILL" 1, "wght" 600' }}
              >
                verified_user
              </span>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                Powered by Anti-Scam AI
              </p>
            </div>
          </div>

          {/* Custom Animations Styles */}
          <style
            dangerouslySetInnerHTML={{
              __html: `
            @keyframes ripple {
              0% { transform: scale(1); opacity: 0.4; }
              100% { transform: scale(2.5); opacity: 0; }
            }
            @keyframes float {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-10px); }
            }
            @keyframes shimmer {
              0% { transform: translateX(-100%); }
              100% { transform: translateX(100%); }
            }
            @keyframes swipe {
              0% { transform: translateY(10px); opacity: 0; }
              40% { opacity: 1; }
              100% { transform: translateY(-12px); opacity: 0; }
            }
          `,
            }}
          />
        </div>
      ) : (
        <AppLayout hideTopNavbar={false} hideBottomNavbar={false}>
          {/* Scrollable Content Area */}
          <div className="relative flex flex-1 flex-col z-10 h-full overflow-y-auto scrollbar-hide pb-24">
            {/* Active Call Monitoring Card - Only show when not in full-page mode */}
            {activeCall && !isFullPageMonitoring && (
              <div className="w-full bg-slate-800/40 border border-slate-700/50 rounded-2xl p-4 mb-6 shadow-lg shadow-black/20 backdrop-blur-sm">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-white font-semibold text-base flex items-center gap-2">
                      {activeCall.risk < 20 ? (
                        <span className="relative flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                        </span>
                      ) : (
                        <span className="relative flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                        </span>
                      )}
                      Active Call Monitoring
                    </h2>
                    <p className="text-slate-400 text-xs mt-1">
                      {activeCall.number}
                    </p>
                  </div>
                  <button
                    onClick={endCall}
                    className="bg-red-500 hover:bg-red-600 text-white text-xs font-bold py-1.5 px-3 rounded-lg transition-colors flex items-center gap-1 shadow-lg"
                  >
                    <span className="material-symbols-outlined text-sm">
                      call_end
                    </span>
                    End
                  </button>
                </div>

                <div className="mb-4">
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-slate-300 font-medium">
                      Scam Risk Level
                    </span>
                    <span
                      className={`font-bold ${
                        activeCall.risk < 20 ? 'text-green-500' : 'text-red-500'
                      }`}
                    >
                      {activeCall.risk}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        activeCall.risk < 20
                          ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]'
                          : 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]'
                      }`}
                      style={{ width: `${activeCall.risk}%` }}
                    ></div>
                  </div>
                </div>

                {activeCall.keywords.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {activeCall.keywords.map((keyword, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-red-900/30 border border-red-500/30 text-red-400 text-[10px] font-medium rounded-md uppercase tracking-wide"
                      >
                        {keyword.toLowerCase()}
                      </span>
                    ))}
                  </div>
                )}

                <div className="bg-slate-900/60 rounded-xl p-3 max-h-40 overflow-y-auto border border-slate-700/30 space-y-3 scrollbar-hide">
                  {activeCall.transcript.map((entry, idx) => (
                    <div key={idx} className="text-xs">
                      {entry.speaker === 'AI Agent' ? (
                        <div className="bg-slate-800/50 p-2 rounded-lg -mx-1 border border-slate-700/30">
                          <p className="text-[#26d9bb] font-bold mb-0.5 flex items-center gap-1">
                            <span className="material-symbols-outlined text-[10px]">
                              smart_toy
                            </span>
                            {entry.speaker}
                          </p>
                          <p className="text-slate-200 leading-relaxed">
                            {entry.text}
                          </p>
                        </div>
                      ) : (
                        <>
                          <p className="text-slate-500 font-bold mb-0.5">
                            {entry.speaker}
                          </p>
                          <p className="text-slate-300 leading-relaxed">
                            {entry.text}
                          </p>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-slate-800/40 border border-slate-700/50 p-3 rounded-xl flex flex-col justify-between h-24 shadow-md">
                <div className="flex justify-between items-start">
                  <span className="text-slate-400 text-[10px] font-medium uppercase leading-tight">
                    Total
                    <br />
                    Calls
                  </span>
                  <span className="p-1 rounded-md bg-blue-500/10 text-blue-400">
                    <span className="material-symbols-outlined text-sm">
                      call
                    </span>
                  </span>
                </div>
                <span className="text-2xl font-bold text-white mt-1">
                  {stats.totalCalls}
                </span>
              </div>

              <div className="bg-slate-800/40 border border-slate-700/50 p-3 rounded-xl flex flex-col justify-between h-24 shadow-md">
                <div className="flex justify-between items-start">
                  <span className="text-slate-400 text-[10px] font-medium uppercase leading-tight">
                    Scam
                    <br />
                    Blocked
                  </span>
                  <span className="p-1 rounded-md bg-red-500/10 text-red-500">
                    <span className="material-symbols-outlined text-sm">
                      block
                    </span>
                  </span>
                </div>
                <span className="text-2xl font-bold text-white mt-1">
                  {stats.scamBlocked}
                </span>
              </div>

              <div className="bg-slate-800/40 border border-slate-700/50 p-3 rounded-xl flex flex-col justify-between h-24 shadow-md">
                <div className="flex justify-between items-start">
                  <span className="text-slate-400 text-[10px] font-medium uppercase leading-tight">
                    Safe
                    <br />
                    Calls
                  </span>
                  <span className="p-1 rounded-md bg-green-500/10 text-green-500">
                    <span className="material-symbols-outlined text-sm">
                      verified_user
                    </span>
                  </span>
                </div>
                <span className="text-2xl font-bold text-white mt-1">
                  {stats.safeCalls}
                </span>
              </div>
            </div>

            {/* Recent Calls */}
            <div className="w-full">
              <div className="flex justify-between items-center mb-3 px-1">
                <h3 className="text-white font-semibold text-sm">
                  Recent Calls
                </h3>
                <button className="text-xs text-slate-400 hover:text-white transition-colors">
                  See all
                </button>
              </div>

              <div className="space-y-3">
                {calls.map((call) => (
                  <div
                    key={call.id}
                    className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-3 flex items-center justify-between hover:bg-slate-800/60 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-full bg-slate-700/50 flex items-center justify-center border border-slate-600/50 group-hover:border-slate-500/50 transition-colors ${
                          call.status === 'scam'
                            ? 'text-red-500'
                            : call.status === 'safe'
                            ? 'text-green-500'
                            : 'text-slate-400'
                        }`}
                      >
                        <span className="material-symbols-outlined text-xl">
                          {getCallIcon(call.status)}
                        </span>
                      </div>
                      <div>
                        <p className="text-white text-sm font-medium">
                          {call.number}
                        </p>
                        <p className="text-slate-500 text-[10px]">
                          {call.timestamp.toLocaleDateString('en-US', {
                            month: '2-digit',
                            day: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}{' '}
                          • {formatDuration(call.duration)}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      {call.risk !== undefined ? (
                        <span className="text-[10px] text-slate-400 mb-1">
                          Risk:{' '}
                          <span
                            className={`font-bold ${
                              call.status === 'scam'
                                ? 'text-red-500'
                                : call.status === 'safe'
                                ? 'text-green-500'
                                : 'text-slate-400'
                            }`}
                          >
                            {call.risk}%
                          </span>
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 mb-1">
                          Risk:{' '}
                          <span className="text-slate-400 font-bold">--</span>
                        </span>
                      )}
                      {getCallStatusBadge(call.status, call.risk)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Simulation Buttons - Separate Fixed Container at Bottom */}
          <div className="fixed bottom-20 left-0 right-0 z-40 bg-[#0B1121]/95 backdrop-blur-md border-t border-slate-800/50">
            <div className="max-w-lg mx-auto px-4 py-3">
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={simulateScamCall}
                  disabled={!!activeCall || !!incomingCall}
                  className="flex flex-col items-center justify-center gap-1.5 bg-slate-800/90 border border-red-500/30 rounded-xl p-3 hover:bg-slate-700/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                  <span className="material-symbols-outlined text-red-500 text-xl">
                    bug_report
                  </span>
                  <span className="text-[10px] font-semibold text-white">
                    Simulate Scam
                  </span>
                </button>

                <button
                  onClick={simulateSafeCall}
                  disabled={!!activeCall || !!incomingCall}
                  className="flex flex-col items-center justify-center gap-1.5 bg-slate-800/90 border border-green-500/30 rounded-xl p-3 hover:bg-slate-700/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                  <span className="material-symbols-outlined text-green-500 text-xl">
                    security
                  </span>
                  <span className="text-[10px] font-semibold text-white">
                    Simulate Safe
                  </span>
                </button>

                <button
                  onClick={simulateIncomingCall}
                  disabled={!!activeCall || !!incomingCall}
                  className="flex flex-col items-center justify-center gap-1.5 bg-slate-800/90 border border-[#26d9bb]/30 rounded-xl p-3 hover:bg-slate-700/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                  <span className="material-symbols-outlined text-[#26d9bb] text-xl">
                    ring_volume
                  </span>
                  <span className="text-[10px] font-semibold text-white">
                    Incoming Call
                  </span>
                </button>
              </div>
            </div>
          </div>
        </AppLayout>
      )}
    </>
  );
}
