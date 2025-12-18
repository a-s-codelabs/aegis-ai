'use client';

import { AppLayout } from '@/components/layout/app-layout';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

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
    transcript: { speaker: string; text: string }[];
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

  // Simulate active call monitoring
  useEffect(() => {
    const hasActiveCall = Math.random() > 0.5; // 50% chance
    if (hasActiveCall) {
      setActiveCall({
        number: '+1 (184) 768 4419',
        risk: 95,
        keywords: ['WIRE TRANSFER', 'GIFT CARD', 'BITCOIN'],
        transcript: [
          {
            speaker: 'Caller',
            text: "Congratulations! You've won $1 million in our lottery! You just need to claim your prize.",
          },
          {
            speaker: 'AI Agent',
            text: "I don't remember entering any lottery. How did I win?",
          },
          {
            speaker: 'Caller',
            text: 'You were automatically entered. To claim your prize, you need to pay a small processing fee of $500.',
          },
        ],
      });
    }
  }, []);

  const endCall = () => {
    setActiveCall(null);
  };

  const simulateScamCall = () => {
    const phoneNumber = `+1 (${Math.floor(Math.random() * 900) + 100}) ${
      Math.floor(Math.random() * 900) + 100
    }-${Math.floor(Math.random() * 9000) + 1000}`;

    const newCall: Call = {
      id: Date.now().toString(),
      number: phoneNumber,
      timestamp: new Date(),
      duration: 0,
      status: 'scam',
      risk: Math.floor(Math.random() * 30) + 70, // 70-100% risk
    };

    setCalls((prev) => [newCall, ...prev]);
    setActiveCall({
      number: phoneNumber,
      risk: newCall.risk || 95,
      keywords: ['WIRE TRANSFER', 'GIFT CARD', 'BITCOIN'],
      transcript: [
        {
          speaker: 'Caller',
          text: "Congratulations! You've won $1 million in our lottery! You just need to claim your prize.",
        },
        {
          speaker: 'AI Agent',
          text: "I don't remember entering any lottery. How did I win?",
        },
        {
          speaker: 'Caller',
          text: 'You were automatically entered. To claim your prize, you need to pay a small processing fee of $500.',
        },
      ],
    });
  };

  const simulateSafeCall = () => {
    const phoneNumber = `+1 (${Math.floor(Math.random() * 900) + 100}) ${
      Math.floor(Math.random() * 900) + 100
    }-${Math.floor(Math.random() * 9000) + 1000}`;

    const newCall: Call = {
      id: Date.now().toString(),
      number: phoneNumber,
      timestamp: new Date(),
      duration: Math.floor(Math.random() * 300) + 60, // 1-6 minutes
      status: 'safe',
      risk: Math.floor(Math.random() * 10), // 0-10% risk
    };

    setCalls((prev) => [newCall, ...prev]);
  };

  const simulateIncomingCall = () => {
    const phoneNumber = `+1 (${Math.floor(Math.random() * 900) + 100}) ${
      Math.floor(Math.random() * 900) + 100
    }-${Math.floor(Math.random() * 9000) + 1000}`;

    const newCall: Call = {
      id: Date.now().toString(),
      number: phoneNumber,
      timestamp: new Date(),
      duration: 0,
      status: 'unknown',
    };

    setCalls((prev) => [newCall, ...prev]);
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
    <AppLayout>
      <div className="relative flex flex-1 flex-col z-10 h-full overflow-y-auto scrollbar-hide">
        {/* Active Call Monitoring Card */}
        {activeCall && (
          <div className="w-full bg-slate-800/40 border border-slate-700/50 rounded-2xl p-4 mb-6 shadow-lg shadow-black/20 backdrop-blur-sm">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-white font-semibold text-base flex items-center gap-2">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                  </span>
                  Active Call Monitoring
                </h2>
                <p className="text-slate-400 text-xs mt-1">
                  {activeCall.number}
                </p>
              </div>
              <button
                onClick={endCall}
                className="bg-red-500 hover:bg-red-600 text-white text-xs font-bold py-1.5 px-3 rounded-lg transition-colors flex items-center gap-1 shadow-lg shadow-red-900/30"
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
                <span className="text-red-500 font-bold">
                  {activeCall.risk}%
                </span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div
                  className="bg-red-500 h-2 rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]"
                  style={{ width: `${activeCall.risk}%` }}
                ></div>
              </div>
            </div>

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
                <span className="material-symbols-outlined text-sm">call</span>
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
                <span className="material-symbols-outlined text-sm">block</span>
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
            <h3 className="text-white font-semibold text-sm">Recent Calls</h3>
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
                      Risk: <span className="text-slate-400 font-bold">--</span>
                    </span>
                  )}
                  {getCallStatusBadge(call.status, call.risk)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Simulation Buttons - Fixed at Bottom */}
      <div className="fixed bottom-20 left-0 right-0 z-30 px-4 pb-2">
        <div className="max-w-lg mx-auto grid grid-cols-3 gap-2">
          <button
            onClick={simulateScamCall}
            disabled={!!activeCall}
            className="flex flex-col items-center justify-center gap-1.5 bg-slate-800/90 border border-red-500/30 rounded-xl p-3 hover:bg-slate-700/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-md shadow-lg"
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
            disabled={!!activeCall}
            className="flex flex-col items-center justify-center gap-1.5 bg-slate-800/90 border border-green-500/30 rounded-xl p-3 hover:bg-slate-700/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-md shadow-lg"
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
            disabled={!!activeCall}
            className="flex flex-col items-center justify-center gap-1.5 bg-slate-800/90 border border-[#26d9bb]/30 rounded-xl p-3 hover:bg-slate-700/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-md shadow-lg"
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
    </AppLayout>
  );
}
