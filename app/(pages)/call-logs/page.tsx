'use client';

import { AppLayout } from '@/components/layout/app-layout';
import { SplitLayoutWithIPhone } from '@/components/layout/split-layout-with-iphone';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { TranscriptEntry } from '@/lib/utils/conversation-analysis';

interface UserSession {
  userId: string;
  phoneNumber: string;
  token: string;
  name?: string;
}

interface CallLog {
  id: string;
  number: string;
  timestamp: Date | string;
  duration: number;
  status: 'scam' | 'safe' | 'unknown';
  risk?: number;
  transcript?: TranscriptEntry[];
  keywords?: string[];
  audioUrl?: string; // URL to recorded audio from ElevenLabs
}

export default function CallLogsPage() {
  const router = useRouter();
  const [userSession, setUserSession] = useState<UserSession | null>(null);
  const [callLogs, setCallLogs] = useState<CallLog[]>([]);
  const [expandedCallId, setExpandedCallId] = useState<string | null>(null);

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
        console.error('[CallLogs] Error parsing session:', error);
        router.push('/auth/login');
      }

      // Function to load call logs from localStorage
      const loadCallLogs = () => {
        const storedLogs = localStorage.getItem('callLogs');
        if (storedLogs) {
          try {
            const logs = JSON.parse(storedLogs);
            // Convert timestamp strings back to Date objects
            const parsedLogs = logs.map((log: CallLog) => ({
              ...log,
              timestamp: new Date(log.timestamp),
            }));
            setCallLogs(parsedLogs);
          } catch (error) {
            console.error('[CallLogs] Error parsing call logs:', error);
          }
        }
        return storedLogs;
      };

      // Load call logs initially
      const storedLogs = loadCallLogs();

      // Listen for storage changes and custom events to update call logs in real-time
      const handleStorageChange = () => {
        loadCallLogs();
      };

      const handleCallLogsUpdated = () => {
        const logs = loadCallLogs();
        if (logs) {
          const parsedLogs = JSON.parse(logs);
          console.log('[CallLogs] Call logs updated, audio URLs:', 
            parsedLogs.map((log: CallLog) => ({ id: log.id, audioUrl: log.audioUrl }))
          );
        }
      };

      window.addEventListener('storage', handleStorageChange);
      window.addEventListener('callLogsUpdated', handleCallLogsUpdated);

      // Load demo call logs if no logs exist (for initial display)
      if (!storedLogs || JSON.parse(storedLogs).length === 0) {
        const demoLogs: CallLog[] = [
          {
            id: '1',
            number: '+1 (184) 768-4419',
            timestamp: new Date('2025-12-18T12:14:00'),
            duration: 0,
            status: 'scam',
            risk: 95,
            transcript: [
              { speaker: 'AI Agent', text: 'Hello, how can I help you?' },
              { speaker: 'Caller', text: 'Congratulations! You have won $1 million in our lottery!' },
              { speaker: 'AI Agent', text: 'I don\'t remember entering any lottery. How did I win?' },
              { speaker: 'Caller', text: 'You were automatically entered. To claim your prize, you need to pay a small processing fee of $500.' },
              { speaker: 'AI Agent', text: 'I\'m not interested. This sounds like a scam.' },
            ],
            keywords: ['lottery', 'processing fee', 'prize'],
            audioUrl: '/recordings/demo-call-1.wav', // Demo audio URL
          },
          {
            id: '2',
            number: '+1 (724) 719-4042',
            timestamp: new Date('2025-12-18T11:32:00'),
            duration: 252,
            status: 'safe',
            risk: 5,
            transcript: [
              { speaker: 'AI Agent', text: 'Hello, how can I help you?' },
              { speaker: 'Caller', text: 'Hi, I\'m calling from ABC Company to schedule a delivery.' },
              { speaker: 'AI Agent', text: 'What is the delivery for?' },
              { speaker: 'Caller', text: 'It\'s a package that was ordered last week. We need to confirm the delivery address.' },
              { speaker: 'AI Agent', text: 'I understand. Let me connect you with the right person.' },
            ],
            keywords: [],
            audioUrl: '/recordings/demo-call-2.wav', // Demo audio URL
          },
        ];
        setCallLogs(demoLogs);
      }

      return () => {
        window.removeEventListener('storage', handleStorageChange);
        window.removeEventListener('callLogsUpdated', handleCallLogsUpdated);
      };
    }
  }, [router]);

  const getCallIcon = (status: CallLog['status']) => {
    switch (status) {
      case 'scam':
        return 'phone_missed';
      case 'safe':
        return 'call_received';
      default:
        return 'call_missed';
    }
  };

  const getCallStatusBadge = (status: CallLog['status'], risk?: number) => {
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

  const formatDate = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const toggleCallExpansion = (callId: string) => {
    setExpandedCallId(expandedCallId === callId ? null : callId);
  };

  // Call Logs Content Component (to be rendered inside iPhone)
  function CallLogsContent() {
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
              Call Logs
            </h2>
            <div className="w-10" /> {/* Spacer for centering */}
          </div>

          {/* Call Logs Section */}
          <div className="w-full">
            <div className="flex justify-between items-center mb-3 px-1">
              <h3 className="text-white font-semibold text-sm">
                AI Conversation Logs
              </h3>
            </div>

            <div className="space-y-3">
              {callLogs.length === 0 ? (
                <div className="text-center py-8">
                  <span className="material-symbols-outlined text-slate-500 text-4xl mb-2">
                    history
                  </span>
                  <p className="text-slate-400 text-sm">No call logs yet</p>
                </div>
              ) : (
                callLogs.map((call) => (
                  <div
                    key={call.id}
                    className="bg-slate-800/40 border border-slate-700/50 rounded-xl overflow-hidden hover:bg-slate-800/60 transition-colors"
                  >
                    {/* Call Summary */}
                    <div
                      className="p-3 flex items-center justify-between cursor-pointer"
                      onClick={() => toggleCallExpansion(call.id)}
                    >
                      <div className="flex items-center gap-3 flex-1">
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
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-medium">
                            {call.number}
                          </p>
                          <p className="text-slate-500 text-[10px]">
                            {formatDate(call.timestamp)} • {formatDuration(call.duration)}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        {call.risk !== undefined ? (
                          <span className="text-[10px] text-slate-400">
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
                        ) : null}
                        <div className="flex items-center gap-1">
                          {getCallStatusBadge(call.status, call.risk)}
                        </div>
                      </div>
                      <button className="ml-2 text-slate-400 hover:text-white transition-colors">
                        <span className="material-symbols-outlined text-lg">
                          {expandedCallId === call.id ? 'expand_less' : 'expand_more'}
                        </span>
                      </button>
                    </div>

                    {/* Expanded Transcript */}
                    {expandedCallId === call.id && (
                      <div className="border-t border-slate-700/50 bg-slate-900/60">
                        {/* Recorded Audio Player - Above Transcript */}
                        <div className="p-4 border-b border-slate-700/30 bg-slate-800/30">
                          <h4 className="text-white font-semibold text-xs flex items-center gap-2 mb-3">
                            <span className="material-symbols-outlined text-sm text-[#26d9bb]">
                              library_music
                            </span>
                            Recorded Audio
                          </h4>
                          {call.audioUrl ? (
                            <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/30">
                              <audio
                                controls
                                className="w-full h-10"
                                src={call.audioUrl}
                                onError={(e) => {
                                  console.error('[CallLogs] Audio playback error:', call.audioUrl, e);
                                }}
                                onLoadStart={() => {
                                  console.log('[CallLogs] Loading audio:', call.audioUrl);
                                }}
                              >
                                Your browser does not support the audio element.
                              </audio>
                              <p className="text-slate-400 text-[10px] mt-1">
                                {call.audioUrl}
                              </p>
                            </div>
                          ) : (
                            <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/30">
                              <p className="text-slate-400 text-xs text-center py-2">
                                Audio recording not available for this call
                              </p>
                            </div>
                          )}
                        </div>
                        
                        {/* Transcript Section */}
                        <div className="p-4 space-y-3 max-h-96 overflow-y-auto scrollbar-hide">
                          {call.transcript && (
                            <>
                              <div className="mb-3">
                                <h4 className="text-white font-semibold text-xs flex items-center gap-2 mb-2">
                                  <span className="material-symbols-outlined text-sm text-[#26d9bb]">
                                    transcript
                                  </span>
                                  Conversation Transcript
                                </h4>
                                {call.keywords && call.keywords.length > 0 && (
                                  <div className="flex flex-wrap gap-1.5">
                                    {call.keywords.map((keyword, idx) => (
                                      <span
                                        key={idx}
                                        className="px-2 py-0.5 bg-red-900/30 border border-red-500/30 text-red-400 text-[10px] font-medium rounded uppercase"
                                      >
                                        {keyword}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                              {call.transcript.map((entry, idx) => (
                                <div key={idx} className="text-xs">
                                  {entry.speaker === 'AI Agent' ? (
                                    <div className="bg-slate-800/50 p-2 rounded-lg border border-slate-700/30">
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
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
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
        Call Logs
      </h1>
      <p className="text-lg lg:text-xl text-slate-400 leading-relaxed">
        Review your AI conversation logs. View detailed transcripts, risk assessments, and keywords for all AI-screened calls.
      </p>
      <div className="space-y-4 text-base lg:text-lg text-slate-300">
        <div className="flex items-start gap-3">
          <span className="material-symbols-outlined text-[#26d9bb] text-xl mt-0.5">
            history
          </span>
          <div>
            <strong className="text-[#26d9bb]">AI Conversation Logs:</strong> View detailed transcripts of all AI-screened calls with risk assessments and keywords.
          </div>
        </div>
        <div className="flex items-start gap-3">
          <span className="material-symbols-outlined text-[#26d9bb] text-xl mt-0.5">
            transcript
          </span>
          <div>
            <strong className="text-[#26d9bb]">Transcript Details:</strong> Expand any call to see the full conversation between the AI agent and caller.
          </div>
        </div>
        <div className="flex items-start gap-3">
          <span className="material-symbols-outlined text-[#26d9bb] text-xl mt-0.5">
            library_music
          </span>
          <div>
            <strong className="text-[#26d9bb]">Audio Recordings:</strong> Listen to the recorded audio of each call, displayed above the transcript for easy playback and review.
          </div>
        </div>
      </div>
    </>
  );

  return (
    <SplitLayoutWithIPhone
      leftContent={leftContent}
      iphoneContent={<CallLogsContent />}
      leftBasis="60%"
    />
  );
}

