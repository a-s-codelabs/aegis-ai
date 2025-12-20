'use client';

import { AppLayout } from '@/components/layout/app-layout';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface UserSession {
  userId: string;
  phoneNumber: string;
  token: string;
  name?: string;
  role?: 'admin' | 'user';
}

interface DivertedCall {
  id: string;
  time: string;
  caller: string;
  reason: string;
  reasonType: 'high' | 'robocall' | 'ai';
}

interface Transcript {
  id: string;
  type: 'ongoing' | 'scam' | 'flagged' | 'safe';
  title: string;
  time: string;
  content: {
    speaker?: string;
    text?: string;
    description?: string;
    keywords?: string[];
  };
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [userSession, setUserSession] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const sessionData = localStorage.getItem('userSession');
      if (!sessionData) {
        console.log('[Admin Dashboard] No session found, redirecting to login');
        router.push('/auth/login');
        return;
      }

      try {
        const session: UserSession = JSON.parse(sessionData);
        console.log('[Admin Dashboard] Session found:', {
          userId: session.userId,
          role: session.role,
        });
        setUserSession(session);
        // Check if user is admin
        // Only redirect if role is explicitly set and not 'admin'
        // This allows access when role is undefined (for development/testing)
        // if (session.role !== 'admin') {
        if (session.role !== undefined && session.role !== 'admin') {
          console.log(
            '[Admin Dashboard] User is not admin, redirecting to dashboard'
          );
          router.push('/dashboard');
          return;
        }
        setIsLoading(false);
      } catch (error) {
        console.error('[Admin Dashboard] Error parsing session:', error);
        router.push('/auth/login');
      }
    }
  }, [router]);

  const blocklist = [
    { number: '+1 (555)...', time: '2m' },
    { number: '+44 79...', time: '15m' },
  ];

  const whitelist = [
    { number: '+1 (212)...', time: '5m' },
    { number: '+61 41...', time: '1h' },
  ];

  const divertedCalls: DivertedCall[] = [
    {
      id: '1',
      time: '10:42 AM',
      caller: '+1 (800) 555-0199',
      reason: 'Scam Prob. High',
      reasonType: 'high',
    },
    {
      id: '2',
      time: '10:15 AM',
      caller: 'Unknown ID',
      reason: 'Robocall Pattern',
      reasonType: 'robocall',
    },
    {
      id: '3',
      time: '09:58 AM',
      caller: '+44 20 7946 0958',
      reason: 'AI Screened',
      reasonType: 'ai',
    },
  ];

  const transcripts: Transcript[] = [
    {
      id: '1',
      type: 'ongoing',
      title: 'Ongoing Analysis',
      time: 'Now',
      content: {
        speaker: 'AI',
        text: '"Who am I speaking with regarding this refund?"',
      },
    },
    {
      id: '2',
      type: 'scam',
      title: 'Scam Attempt #8421',
      time: '18m ago',
      content: {
        description:
          "Caller attempted social engineering tactics using 'Grandchild in trouble' script. AI successfully...",
      },
    },
    {
      id: '3',
      type: 'flagged',
      title: 'Flagged Keyword Cluster',
      time: '42m ago',
      content: {
        description: 'Detected high-risk pattern related to "IRS Tax Debt".',
        keywords: ['gift card', 'immediate payment'],
      },
    },
    {
      id: '4',
      type: 'safe',
      title: 'Verified Safe Call',
      time: '1h 15m ago',
      content: {
        speaker: 'Caller',
        text: '"Hi, just confirming our dental appointment for tomorrow at 2 PM."',
      },
    },
  ];

  const getReasonBadgeClass = (type: DivertedCall['reasonType']) => {
    switch (type) {
      case 'high':
        return 'bg-red-900/40 text-red-300';
      case 'robocall':
        return 'bg-yellow-900/40 text-yellow-300';
      case 'ai':
        return 'bg-blue-900/40 text-blue-300';
      default:
        return 'bg-gray-900/40 text-gray-300';
    }
  };

  const getTranscriptIcon = (type: Transcript['type']) => {
    switch (type) {
      case 'ongoing':
        return null; // Uses red dot
      case 'scam':
        return 'history';
      case 'flagged':
        return 'warning';
      case 'safe':
        return 'check_circle';
      default:
        return 'description';
    }
  };

  const getTranscriptIconColor = (type: Transcript['type']) => {
    switch (type) {
      case 'scam':
        return 'text-gray-500';
      case 'flagged':
        return 'text-yellow-500';
      case 'safe':
        return 'text-green-500';
      default:
        return 'text-gray-500';
    }
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#26d9bb] mx-auto mb-4"></div>
            <p className="text-gray-400 text-sm">Loading admin dashboard...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="relative flex flex-1 flex-col overflow-y-auto no-scrollbar space-y-5 z-10">
        {/* Header Section */}
        <div className="sticky top-0 z-50 bg-[#0B1121]/90 backdrop-blur-md border-b border-gray-800 px-4 py-3 -mx-4 -mt-6 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="flex items-center justify-center p-1 -ml-1 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
            >
              <span className="material-symbols-outlined text-2xl">arrow_back</span>
            </Link>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#26d9bb] text-2xl">shield_lock</span>
              <h1 className="text-lg font-bold tracking-tight text-gray-900 dark:text-white">
                Admin Dashboard
              </h1>
            </div>
          </div>
          <div className="relative">
            {userSession ? (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-100 to-amber-200 border-2 border-gray-700 object-cover flex items-center justify-center">
                <span className="text-sm font-bold text-amber-900">
                  {userSession.name?.[0]?.toUpperCase() || 'A'}
                </span>
              </div>
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-700 border-2 border-gray-600"></div>
            )}
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#26d9bb] rounded-full border-2 border-[#0B1121]"></div>
          </div>
        </div>

        {/* Detailed Insights Section */}
        <div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Detailed Insights</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            System-wide data and call monitoring.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Blocklist Card */}
          <div className="bg-white dark:bg-[#151A23] border border-gray-200 dark:border-[#272E3B] rounded-xl p-4 shadow-sm flex flex-col h-full">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-1">
                <span className="material-symbols-outlined text-red-500 text-lg">block</span>
                Blocklist
              </h3>
              <button className="text-[10px] text-[#26d9bb] hover:text-white transition-colors">
                View All
              </button>
            </div>
            <div className="space-y-2 flex-grow">
              {blocklist.map((item, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-center bg-[#0B0E14]/50 p-2 rounded border border-[#272E3B]/50"
                >
                  <span className="text-xs font-mono text-gray-300">{item.number}</span>
                  <span className="text-[10px] text-gray-500">{item.time}</span>
                </div>
              ))}
              <div className="mt-auto pt-2">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">1,294</div>
                <div className="text-[10px] text-gray-500 dark:text-gray-400">Total Blocked</div>
              </div>
            </div>
          </div>

          {/* Whitelist Card */}
          <div className="bg-white dark:bg-[#151A23] border border-gray-200 dark:border-[#272E3B] rounded-xl p-4 shadow-sm flex flex-col h-full">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-1">
                <span className="material-symbols-outlined text-green-500 text-lg">verified</span>
                Whitelist
              </h3>
              <button className="text-[10px] text-[#26d9bb] hover:text-white transition-colors">
                View All
              </button>
            </div>
            <div className="space-y-2 flex-grow">
              {whitelist.map((item, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-center bg-[#0B0E14]/50 p-2 rounded border border-[#272E3B]/50"
                >
                  <span className="text-xs font-mono text-gray-300">{item.number}</span>
                  <span className="text-[10px] text-gray-500">{item.time}</span>
                </div>
              ))}
              <div className="mt-auto pt-2">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">842</div>
                <div className="text-[10px] text-gray-500 dark:text-gray-400">Total Trusted</div>
              </div>
            </div>
          </div>
        </div>

        {/* Diverted Calls Section */}
        <div className="bg-white dark:bg-[#151A23] border border-gray-200 dark:border-[#272E3B] rounded-xl p-5 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-800 dark:text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-yellow-500">call_split</span>
              Diverted Calls
            </h3>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span>
                Today: <span className="text-white font-bold">143</span>
              </span>
            </div>
          </div>
          <div className="overflow-x-auto pb-2">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-gray-500 border-b border-gray-800">
                  <th className="pb-2 font-medium">Time</th>
                  <th className="pb-2 font-medium">Caller</th>
                  <th className="pb-2 font-medium">Reason</th>
                  <th className="pb-2 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {divertedCalls.map((call) => (
                  <tr key={call.id}>
                    <td className="py-3 text-gray-400">{call.time}</td>
                    <td className="py-3 font-mono text-gray-300">{call.caller}</td>
                    <td className="py-3">
                      <span
                        className={`${getReasonBadgeClass(
                          call.reasonType
                        )} px-1.5 py-0.5 rounded text-[10px]`}
                      >
                        {call.reason}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <span className="material-symbols-outlined text-gray-500 text-sm">info</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button className="w-full mt-2 text-xs text-center text-gray-500 hover:text-[#26d9bb] transition-colors py-1">
            View All Diverted Logs
          </button>
        </div>

        {/* Transcribed Content Section */}
        <div className="bg-gradient-to-br from-[#151A23] to-[#0B0E14] border border-gray-200 dark:border-[#272E3B] rounded-xl p-5 shadow-sm relative overflow-hidden flex flex-col flex-grow min-h-[420px]">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#26d9bb]/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
          <div className="flex justify-between items-center mb-4 relative z-10">
            <h3 className="font-semibold text-gray-800 dark:text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-[#26d9bb]">record_voice_over</span>
              Transcribed Content
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-gray-500">Live & Recent</span>
              <span className="bg-[#26d9bb]/10 text-[#26d9bb] text-xs px-2 py-1 rounded-full border border-[#26d9bb]/20">
                Active
              </span>
            </div>
          </div>
          <div className="space-y-3 relative z-10 flex-grow overflow-y-auto no-scrollbar">
            {transcripts.map((transcript) => (
              <div
                key={transcript.id}
                className="bg-[#0B0E14]/80 backdrop-blur-sm border border-[#272E3B] p-3 rounded-lg hover:border-[#26d9bb]/50 transition-colors group cursor-pointer"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    {transcript.type === 'ongoing' ? (
                      <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                    ) : (
                      <span
                        className={`material-symbols-outlined ${getTranscriptIconColor(
                          transcript.type
                        )} text-sm`}
                      >
                        {getTranscriptIcon(transcript.type)}
                      </span>
                    )}
                    <span className="text-xs font-bold text-white">{transcript.title}</span>
                  </div>
                  <span className="text-[10px] text-gray-400">{transcript.time}</span>
                </div>
                <div className="space-y-2 mb-2">
                  {transcript.content.speaker && transcript.content.text && (
                    <div className="flex gap-2">
                      <span className="text-[10px] font-bold text-[#26d9bb] w-8 shrink-0">
                        {transcript.content.speaker}:
                      </span>
                      <p className="text-xs text-gray-300 italic">{transcript.content.text}</p>
                    </div>
                  )}
                  {transcript.content.description && (
                    <p className="text-xs text-gray-400 line-clamp-2">
                      {transcript.content.description}
                    </p>
                  )}
                  {transcript.content.keywords && transcript.content.keywords.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {transcript.content.keywords.map((keyword, idx) => (
                        <span
                          key={idx}
                          className="text-[9px] bg-red-900/30 text-red-300 px-1.5 rounded border border-red-900/50"
                        >
                          "{keyword}"
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex justify-end">
                  <span className="text-[10px] text-[#26d9bb] group-hover:underline flex items-center gap-1">
                    {transcript.type === 'ongoing' && 'Monitor Live '}
                    {transcript.type === 'scam' && 'Full Transcript '}
                    {transcript.type === 'flagged' && 'Analysis Report '}
                    {transcript.type === 'safe' && 'Log '}
                    {transcript.type === 'ongoing' && (
                      <span className="material-symbols-outlined text-[10px]">open_in_new</span>
                    )}
                    {transcript.type === 'scam' && (
                      <span className="material-symbols-outlined text-[10px]">arrow_forward</span>
                    )}
                    {transcript.type === 'flagged' && (
                      <span className="material-symbols-outlined text-[10px]">analytics</span>
                    )}
                    {transcript.type === 'safe' && (
                      <span className="material-symbols-outlined text-[10px]">description</span>
                    )}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-auto pt-2 text-center relative z-10">
            <button className="text-xs text-[#26d9bb] hover:text-white transition-colors flex items-center justify-center gap-1 w-full py-1">
              View All 24h Transcripts{' '}
              <span className="material-symbols-outlined text-xs">expand_more</span>
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

