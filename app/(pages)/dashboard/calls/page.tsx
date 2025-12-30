'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AppLayout } from '@/components/layout/app-layout';
import { SplitLayoutWithIPhone } from '@/components/layout/split-layout-with-iphone';

interface Call {
  id: string;
  number: string;
  timestamp: Date;
  duration: number;
  status: 'scam' | 'safe' | 'unknown';
  risk?: number;
}

interface UserSession {
  userId: string;
  phoneNumber: string;
  token: string;
  name?: string;
  role?: 'admin' | 'user';
}

function CallsContent({ calls, filterType }: { calls: Call[]; filterType: string }) {
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

  const getTitle = () => {
    switch (filterType) {
      case 'scam':
        return 'Scam Blocked Calls';
      case 'safe':
        return 'Safe Calls';
      default:
        return 'All Calls';
    }
  };

  return (
    <AppLayout fullWidth>
      <div className="relative flex flex-1 flex-col z-10 h-full overflow-y-auto scrollbar-hide">
        {/* Header */}
        <div className="mb-2">
          <div className="flex items-center gap-3 mb-2">
            <button
              onClick={() => window.history.back()}
              className="p-2 hover:bg-slate-800/50 rounded-lg transition-colors"
            >
              <span className="material-symbols-outlined text-white text-xl">
                arrow_back
              </span>
            </button>
            <h1 className="text-2xl font-bold text-white">{getTitle()}</h1>
          </div>
        </div>

        {/* Calls List */}
        {calls.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <span className="material-symbols-outlined text-slate-500 text-6xl mb-4">
              call_missed
            </span>
            <p className="text-slate-400 text-sm">No calls found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {calls.map((call) => (
              <div
                key={call.id}
                className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-3 flex items-center justify-between hover:bg-slate-800/60 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full bg-slate-700/50 flex items-center justify-center border border-slate-600/50 ${
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
                    <p className="text-white text-sm font-medium">{call.number}</p>
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
                  <div className="flex items-center gap-1">
                    {getCallStatusBadge(call.status, call.risk)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}

function CallsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [userSession, setUserSession] = useState<UserSession | null>(null);
  const [calls, setCalls] = useState<Call[]>([]);

  const filterType = searchParams.get('type') || 'all';

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
        console.error('[CallsPage] Error parsing session:', error);
        router.push('/auth/login');
      }

      // Load calls from localStorage (shared with dashboard)
      // In a real app, this would come from an API
      const savedCalls = localStorage.getItem('calls');
      if (savedCalls) {
        try {
          const parsedCalls = JSON.parse(savedCalls).map((call: any) => ({
            ...call,
            timestamp: new Date(call.timestamp),
          }));
          setCalls(parsedCalls);
        } catch (error) {
          console.error('[CallsPage] Error parsing calls:', error);
        }
      }
    }
  }, [router]);

  // Filter calls based on type
  const filteredCalls = React.useMemo(() => {
    if (filterType === 'all') {
      return calls;
    } else if (filterType === 'scam') {
      return calls.filter((c) => c.status === 'scam');
    } else if (filterType === 'safe') {
      return calls.filter((c) => c.status === 'safe');
    }
    return calls;
  }, [calls, filterType]);

  // Listen for call updates from dashboard
  useEffect(() => {
    const handleStorageChange = () => {
      const savedCalls = localStorage.getItem('calls');
      if (savedCalls) {
        try {
          const parsedCalls = JSON.parse(savedCalls).map((call: any) => ({
            ...call,
            timestamp: new Date(call.timestamp),
          }));
          setCalls(parsedCalls);
        } catch (error) {
          console.error('[CallsPage] Error parsing calls:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    // Also check periodically for updates (since storage event only fires in other tabs)
    const interval = setInterval(handleStorageChange, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  // Prepare iPhone content (same as dashboard but showing calls)
  const iphoneContent = (
    <CallsContent calls={filteredCalls} filterType={filterType} />
  );

  // Prepare left content
  const leftContent = (
    <>
      <div>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-4xl lg:text-5xl font-bold leading-tight tracking-tight text-[#26d9bb]">
            Call History
          </h1>
        </div>
        <p className="text-lg lg:text-xl text-slate-400 leading-relaxed">
          View detailed information about your calls. Filter by type to see specific call categories.
        </p>
      </div>

      <div className="space-y-4 text-base lg:text-lg text-slate-300">
        <div className="flex items-start gap-3">
          <span className="material-symbols-outlined text-[#26d9bb] text-xl mt-0.5">
            call
          </span>
          <div>
            <strong className="text-[#26d9bb]">All Calls:</strong> Complete history of all incoming calls.
          </div>
        </div>
        <div className="flex items-start gap-3">
          <span className="material-symbols-outlined text-[#26d9bb] text-xl mt-0.5">
            block
          </span>
          <div>
            <strong className="text-[#26d9bb]">Scam Blocked:</strong> Calls identified as scams and automatically blocked.
          </div>
        </div>
        <div className="flex items-start gap-3">
          <span className="material-symbols-outlined text-[#26d9bb] text-xl mt-0.5">
            verified_user
          </span>
          <div>
            <strong className="text-[#26d9bb]">Safe Calls:</strong> Calls verified as safe and allowed through.
          </div>
        </div>
      </div>
    </>
  );

  return (
    <SplitLayoutWithIPhone
      leftContent={leftContent}
      iphoneContent={iphoneContent}
      leftBasis="60%"
    />
  );
}

export default function CallsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-slate-400">Loading...</div>
      </div>
    }>
      <CallsPageContent />
    </Suspense>
  );
}

