'use client';

import { AppLayout } from '@/components/layout/app-layout';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

// Constants
const ACCENT_COLOR = '#26d9bb';

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

interface ListItem {
  number: string;
  time: string;
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

  // Helper functions (DRY)
  const getReasonBadgeClass = (type: DivertedCall['reasonType']) => {
    const badgeClasses = {
      high: 'bg-red-900/40 text-red-300',
      robocall: 'bg-yellow-900/40 text-yellow-300',
      ai: 'bg-blue-900/40 text-blue-300',
    };
    return badgeClasses[type] || 'bg-gray-900/40 text-gray-300';
  };

  const getTranscriptIcon = (type: Transcript['type']) => {
    const icons = {
      ongoing: null,
      scam: 'history',
      flagged: 'warning',
      safe: 'check_circle',
    };
    return icons[type] || 'description';
  };

  const getTranscriptIconColor = (type: Transcript['type']) => {
    const colors: Record<Transcript['type'], string> = {
      ongoing: 'text-gray-500',
      scam: 'text-gray-500',
      flagged: 'text-yellow-500',
      safe: 'text-green-500',
    };
    return colors[type] || 'text-gray-500';
  };

  // Reusable card component for Blocklist/Whitelist
  const ListCard = ({
    title,
    icon,
    iconColor,
    items,
    total,
    totalLabel,
  }: {
    title: string;
    icon: string;
    iconColor: string;
    items: ListItem[];
    total: string;
    totalLabel: string;
  }) => (
    <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4 shadow-md flex flex-col h-full">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-semibold text-white flex items-center gap-1">
          <span className={`material-symbols-outlined ${iconColor} text-lg`}>
            {icon}
          </span>
          {title}
        </h3>
        <button
          className="text-[10px] transition-colors hover:opacity-80"
          style={{ color: ACCENT_COLOR }}
        >
          View All
        </button>
      </div>
      <div className="space-y-2 grow">
        {items.map((item, idx) => (
          <div key={idx} className="flex justify-between items-center">
            <span className="text-xs font-mono text-gray-300">
              {item.number}
            </span>
            <span className="text-[10px] text-gray-500">{item.time}</span>
          </div>
        ))}
        <div className="mt-auto pt-2">
          <div className="text-2xl font-bold text-white">{total}</div>
          <div className="text-[10px] text-gray-400">{totalLabel}</div>
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div
              className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto mb-4"
              style={{ borderColor: ACCENT_COLOR }}
            ></div>
            <p className="text-gray-400 text-sm">Loading admin dashboard...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout navbarTitle="Admin Dashboard" navbarIcon="shield_lock">
      <div className="relative flex flex-1 flex-col overflow-y-auto no-scrollbar space-y-5 z-10">
        {/* Detailed Insights Section */}
        <div>
          <h2 className="text-xl font-bold text-white">Detailed Insights</h2>
          <p className="text-sm text-gray-400">
            System-wide data and call monitoring.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Blocklist Card */}
          <ListCard
            title="Blocklist"
            icon="block"
            iconColor="text-red-500"
            items={blocklist}
            total="1,294"
            totalLabel="Total Blocked"
          />

          {/* Whitelist Card */}
          <ListCard
            title="Whitelist"
            icon="verified"
            iconColor="text-green-500"
            items={whitelist}
            total="842"
            totalLabel="Total Trusted"
          />
        </div>

        {/* Diverted Calls Section */}
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-5 shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-yellow-500">
                call_split
              </span>
              <span>Diverted Calls</span>
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
                    <td className="py-3 font-mono text-gray-300">
                      {call.caller}
                    </td>
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
                      <span className="material-symbols-outlined text-gray-500 text-sm">
                        info
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button
            className="w-full mt-2 text-xs text-center text-gray-500 transition-colors py-1 hover:opacity-80"
            onMouseEnter={(e) => {
              e.currentTarget.style.color = ACCENT_COLOR;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '';
            }}
          >
            View All Diverted Logs
          </button>
        </div>

        {/* Transcribed Content Section */}
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-3 flex flex-col grow min-h-[420px] shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <span
                className="material-symbols-outlined"
                style={{ color: ACCENT_COLOR }}
              >
                record_voice_over
              </span>
              Transcribed Content
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-gray-500">Live & Recent</span>
              <span
                className="text-xs px-2 py-1 rounded-full border backdrop-blur-sm"
                style={{
                  backgroundColor: `${ACCENT_COLOR}1A`,
                  color: ACCENT_COLOR,
                  borderColor: `${ACCENT_COLOR}33`,
                }}
              >
                Active
              </span>
            </div>
          </div>
          <div className="space-y-3 grow overflow-y-auto no-scrollbar">
            {transcripts.map((transcript) => {
              const icon = getTranscriptIcon(transcript.type);
              const iconColor = getTranscriptIconColor(transcript.type);
              const actionLabels = {
                ongoing: 'Monitor Live',
                scam: 'Full Transcript',
                flagged: 'Analysis Report',
                safe: 'Log',
              };
              const actionIcons = {
                ongoing: 'open_in_new',
                scam: 'arrow_forward',
                flagged: 'analytics',
                safe: 'description',
              };

              return (
                <div
                  key={transcript.id}
                  className="bg-slate-800/40 border border-slate-700/50 p-3 rounded-lg transition-all group cursor-pointer hover:bg-slate-800/60"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      {transcript.type === 'ongoing' ? (
                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                      ) : (
                        icon && (
                          <span
                            className={`material-symbols-outlined ${iconColor} text-sm`}
                          >
                            {icon}
                          </span>
                        )
                      )}
                      <span className="text-xs font-bold text-white">
                        {transcript.title}
                      </span>
                    </div>
                    <span className="text-[10px] text-gray-400">
                      {transcript.time}
                    </span>
                  </div>
                  <div className="space-y-2 mb-2">
                    {transcript.content.speaker && transcript.content.text && (
                      <div className="flex gap-2">
                        <span
                          className="text-[10px] font-bold w-8 shrink-0"
                          style={{ color: ACCENT_COLOR }}
                        >
                          {transcript.content.speaker}:
                        </span>
                        <p className="text-xs text-gray-300 italic">
                          {transcript.content.text}
                        </p>
                      </div>
                    )}
                    {transcript.content.description && (
                      <p className="text-xs text-gray-400 line-clamp-2">
                        {transcript.content.description}
                      </p>
                    )}
                    {transcript.content.keywords &&
                      transcript.content.keywords.length > 0 && (
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
                    <span
                      className="text-[10px] group-hover:underline flex items-center gap-1"
                      style={{ color: ACCENT_COLOR }}
                    >
                      {actionLabels[transcript.type]}{' '}
                      {actionIcons[transcript.type] && (
                        <span className="material-symbols-outlined text-[10px]">
                          {actionIcons[transcript.type]}
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-auto pt-2 text-center">
            <button
              className="text-xs transition-colors flex items-center justify-center gap-1 w-full py-1"
              style={{ color: ACCENT_COLOR }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#ffffff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = ACCENT_COLOR;
              }}
            >
              View All 24h Transcripts{' '}
              <span className="material-symbols-outlined text-xs">
                expand_more
              </span>
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

