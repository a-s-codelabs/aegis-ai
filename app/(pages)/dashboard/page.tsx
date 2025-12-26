'use client';

import React from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { SplitLayoutWithIPhone } from '@/components/layout/split-layout-with-iphone';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { analyzeConversation } from '@/lib/utils/conversation-analysis';
import type { TranscriptEntry } from '@/lib/utils/conversation-analysis';
import {
  ALL_CONVERSATIONS,
  getRandomConversation,
} from '@/lib/utils/call-conversations';
import { ElevenLabsClient } from '@/lib/utils/elevenlabs-client';

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

// Dashboard Content Component (to be rendered inside iPhone)
interface DashboardContentProps {
  activeCall: {
    number: string;
    risk: number;
    keywords: string[];
    transcript: TranscriptEntry[];
    startTime?: Date;
  } | null;
  isFullPageMonitoring: boolean;
  calls: Call[];
  stats: {
    totalCalls: number;
    scamBlocked: number;
    safeCalls: number;
  };
  blocklist: string[];
  realtimeScamScore: number;
  realtimeKeywords: string[];
  onEndCall: () => void;
  onViewFullMonitoring: () => void;
  getCallIcon: (status: Call['status']) => string;
  getCallStatusBadge: (status: Call['status'], risk?: number) => React.ReactElement;
  formatDuration: (seconds: number) => string;
}

// Full Page Monitoring Content Component (to be rendered inside iPhone)
interface FullPageMonitoringContentProps {
  activeCall: {
    number: string;
    risk: number;
    keywords: string[];
    transcript: TranscriptEntry[];
    startTime?: Date;
  };
  visibleTranscript: TranscriptEntry[];
  realtimeScamScore: number;
  realtimeKeywords: string[];
  onEndCall: () => void;
  onTakeOverCall: () => void;
  onGoToDashboard: () => void;
}

// Incoming Call Content Component (to be rendered inside iPhone)
interface IncomingCallContentProps {
  incomingCall: {
    number: string;
    purpose?: string;
    isSafe?: boolean;
  };
  onDecline: () => void;
  onDivertToAI: () => void;
  onAccept: () => void;
}

function DashboardContent({
  activeCall,
  isFullPageMonitoring,
  calls,
  stats,
  blocklist,
  realtimeScamScore,
  realtimeKeywords,
  onEndCall,
  onViewFullMonitoring,
  getCallIcon,
  getCallStatusBadge,
  formatDuration,
}: DashboardContentProps) {
  return (
    <AppLayout fullWidth>
      <div className="relative flex flex-1 flex-col z-10 h-full overflow-y-auto scrollbar-hide">
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
                onClick={onEndCall}
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
                <span className="text-slate-300 font-medium flex items-center gap-2">
                  Scam Risk Level
                  {realtimeScamScore > 0 && (
                    <span className="px-1.5 py-0.5 bg-red-500/20 border border-red-500/40 text-red-400 text-[10px] font-bold rounded uppercase tracking-wide animate-pulse">
                      Live
                    </span>
                  )}
                </span>
                <span
                  className={`font-bold ${
                    activeCall.risk < 20 ? 'text-green-500' : 'text-red-500'
                  }`}
                >
                  {Math.max(activeCall.risk, realtimeScamScore)}%
                </span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    Math.max(activeCall.risk, realtimeScamScore) < 20
                      ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]'
                      : 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]'
                  }`}
                  style={{
                    width: `${Math.max(activeCall.risk, realtimeScamScore)}%`,
                  }}
                ></div>
              </div>
            </div>

            {(activeCall.keywords.length > 0 || realtimeKeywords.length > 0) && (
              <div className="flex flex-wrap gap-2 mb-4">
                {[
                  ...new Set([...activeCall.keywords, ...realtimeKeywords]),
                ].map((keyword, idx) => (
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
                        {(() => {
                          let highlightedText = entry.text;
                          const allKeywords = [
                            ...activeCall.keywords,
                            ...realtimeKeywords,
                          ];
                          allKeywords.forEach((keyword) => {
                            const regex = new RegExp(
                              `(${keyword})`,
                              'gi'
                            );
                            highlightedText = highlightedText.replace(
                              regex,
                              '<mark class="bg-red-500/30 text-red-300 px-0.5 rounded">$1</mark>'
                            );
                          });
                          return (
                            <span
                              dangerouslySetInnerHTML={{
                                __html: highlightedText,
                              }}
                            />
                          );
                        })()}
                      </p>
                    </>
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={onViewFullMonitoring}
              className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">
                visibility
              </span>
              View Full Monitoring
            </button>
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
                  <div className="flex items-center gap-1">
                    {getCallStatusBadge(call.status, call.risk)}
                    {blocklist.includes(call.number) && (
                      <span className="px-1.5 py-0.5 bg-red-600/20 border border-red-500/40 text-red-400 text-[9px] font-bold rounded flex items-center gap-1">
                        <span className="material-symbols-outlined text-[10px]">
                          block
                        </span>
                        Blocked by AI
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

function FullPageMonitoringContent({
  activeCall,
  visibleTranscript,
  realtimeScamScore,
  realtimeKeywords,
  onEndCall,
  onTakeOverCall,
  onGoToDashboard,
}: FullPageMonitoringContentProps) {
  return (
    <div className="relative flex flex-col h-full w-full overflow-hidden bg-black">
      {/* Scrollable Content Area */}
      <div className="relative flex flex-1 flex-col z-10 overflow-y-auto scrollbar-hide pb-24">
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

        {/* Header */}
        <div className="sticky top-0 bg-black/80 backdrop-blur-md border-b border-slate-800/50 z-20 p-4 pt-10 space-y-2">
          <div className="flex justify-between items-center w-full">
            <div className="flex items-center gap-2">
              <div
                className={`relative flex h-3 w-3 ${
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
                <h2 className="text-white font-semibold text-sm">
                  Active Call Monitoring
                </h2>
                <p className="text-slate-400 text-xs">
                  {activeCall.number}
                </p>
              </div>
            </div>
            <button
              onClick={onEndCall}
              className="bg-red-500 hover:bg-red-600 text-white text-xs font-bold py-1.5 px-3 rounded-lg transition-colors flex items-center gap-1 shadow-lg"
            >
              <span className="material-symbols-outlined text-sm">
                call_end
              </span>
              End
            </button>
          </div>

          {/* Safe handoff banner when risk is clearly low */}
          {activeCall.risk < 30 && (
            <div className="mt-1 flex items-center justify-between rounded-lg border border-emerald-500/40 bg-emerald-900/30 px-3 py-2 text-[11px] text-emerald-200">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-xs text-emerald-300">
                  verified_user
                </span>
                <p className="font-semibold">
                  AI has confirmed this caller looks safe. The call is now handed back to you.
                </p>
              </div>
              <span className="hidden sm:inline-flex text-[10px] text-emerald-300/80">
                You can take over the conversation at any time.
              </span>
            </div>
          )}
        </div>

          {/* Risk Level Section */}
        <div className="w-full p-4">
          <div className="bg-slate-900/60 border border-slate-700/50 rounded-xl p-4 mb-3">
            <div className="flex justify-between items-center mb-2">
              <span className="text-slate-300 font-medium text-xs flex items-center gap-2">
                Scam Risk Level
                {realtimeScamScore > 0 && (
                  <span className="px-1.5 py-0.5 bg-red-500/20 border border-red-500/40 text-red-400 text-[10px] font-bold rounded uppercase tracking-wide animate-pulse">
                    Live
                  </span>
                )}
              </span>
              <span
                className={`font-bold text-lg ${
                  Math.max(activeCall.risk, realtimeScamScore) < 20
                    ? 'text-green-500'
                    : Math.max(activeCall.risk, realtimeScamScore) < 50
                    ? 'text-yellow-500'
                    : Math.max(activeCall.risk, realtimeScamScore) < 70
                    ? 'text-orange-500'
                    : 'text-red-500'
                }`}
              >
                {Math.max(activeCall.risk, realtimeScamScore)}%
              </span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  Math.max(activeCall.risk, realtimeScamScore) < 20
                    ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]'
                    : Math.max(activeCall.risk, realtimeScamScore) < 50
                    ? 'bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]'
                    : Math.max(activeCall.risk, realtimeScamScore) < 70
                    ? 'bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]'
                    : 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]'
                }`}
                style={{
                  width: `${Math.max(activeCall.risk, realtimeScamScore)}%`,
                }}
              ></div>
            </div>
          </div>

          {/* Keywords */}
          {(activeCall.keywords.length > 0 || realtimeKeywords.length > 0) && (
            <div className="flex flex-wrap gap-2 mb-3">
              {[
                ...new Set([...activeCall.keywords, ...realtimeKeywords]),
              ].map((keyword, idx) => (
                <span
                  key={idx}
                  className="px-2 py-1 bg-red-900/30 border border-red-500/30 text-red-400 text-[10px] font-medium rounded-md uppercase tracking-wide"
                >
                  {keyword}
                </span>
              ))}
            </div>
          )}

          {/* Transcript Section */}
          <div className="bg-slate-900/60 border border-slate-700/50 rounded-xl p-4 mb-20">
            <h3 className="text-white font-semibold text-xs mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-sm text-[#26d9bb]">
                transcript
              </span>
              Live Transcript
            </h3>
            {/* Increased height to show more transcript content while remaining scrollable */}
            <div className="space-y-3 max-h-[400px] overflow-y-auto scrollbar-hide">
              {visibleTranscript.length === 0 ? (
                <div className="text-center py-6">
                  <div className="inline-flex items-center gap-2 text-slate-400 text-xs">
                    <span className="material-symbols-outlined animate-spin text-sm">
                      sync
                    </span>
                    <span>Waiting for conversation to start...</span>
                  </div>
                </div>
              ) : (
                visibleTranscript.map((entry, idx) => (
                  <div
                    key={idx}
                    className={`text-xs animate-in fade-in slide-in-from-bottom-2 duration-300 ${
                      entry.speaker === 'AI Agent'
                        ? 'bg-slate-800/50 p-3 rounded-lg border border-slate-700/30'
                        : 'bg-slate-800/30 p-3 rounded-lg'
                    }`}
                  >
                    {entry.speaker === 'AI Agent' ? (
                      <>
                        <p className="text-[#26d9bb] font-bold mb-1 flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs">
                            smart_toy
                          </span>
                          {entry.speaker}
                        </p>
                        <p className="text-slate-200 leading-relaxed text-xs">
                          {entry.text}
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="text-red-400 font-bold mb-1 text-xs">
                          {entry.speaker}:
                        </p>
                        <p className="text-slate-300 leading-relaxed text-xs">
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
      </div>

      {/* Fixed Go to Dashboard Button at Bottom */}
      <div className="absolute bottom-0 left-0 right-0 bg-black/90 backdrop-blur-md border-t border-slate-800/50 z-30 p-3">
        <button
          onClick={onGoToDashboard}
          className="w-full bg-slate-800/90 hover:bg-slate-700/90 border border-slate-600/50 text-white font-semibold py-2.5 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg text-xs"
        >
          <span className="material-symbols-outlined text-sm">
            dashboard
          </span>
          Go to Dashboard
        </button>
      </div>
    </div>
  );
}

function IncomingCallContent({
  incomingCall,
  onDecline,
  onDivertToAI,
  onAccept,
}: IncomingCallContentProps) {
  const isSafeCall = incomingCall.isSafe === true;
  const callPurpose = incomingCall.purpose || '';
  return (
    <div className="absolute inset-0 flex flex-col h-full w-full overflow-hidden bg-black">
      <div className="relative flex flex-1 flex-col items-center justify-between h-full w-full overflow-hidden">
        {/* Background Pattern */}
        <div
          className="absolute inset-0 opacity-[0.15] pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(to right, #333 1px, transparent 1px), linear-gradient(to bottom, #333 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        {/* Gradient Blurs */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[40%] bg-[#2dd4bf]/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[40%] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none"></div>

        {/* Main Content */}
        <div className="relative flex-1 flex flex-col items-center justify-center w-full z-10">
          {/* Phone Icon with Animations */}
          <div
            className="relative mb-6"
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
            <div className="relative w-24 h-24 bg-black/60 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(45,212,191,0.25)] border border-white/10 backdrop-blur-md">
              <span
                className="material-symbols-outlined text-[#2dd4bf] drop-shadow-[0_0_10px_rgba(45,212,191,0.5)]"
                style={{
                  animation: 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                  fontVariationSettings: "'FILL' 1, 'wght' 700",
                  fontSize: '36px',
                }}
              >
                call
              </span>
            </div>
          </div>

          {/* Text Content */}
          <div className="text-center space-y-3 z-10">
            <h2 className="text-[10px] font-bold tracking-[0.25em] text-zinc-400 uppercase">
              Incoming Call
            </h2>
            <h1 className="text-2xl font-bold text-white tracking-tight leading-tight drop-shadow-xl">
              {incomingCall.number}
            </h1>

            {/* Safe Call Badge or Unknown Number Badge */}
            {isSafeCall ? (
              <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-green-400 bg-green-950/40 border border-green-500/30 px-3 py-1.5 rounded-full w-fit mx-auto backdrop-blur-md shadow-lg">
                <span className="material-symbols-outlined text-sm">
                  verified
                </span>
                <span>Verified Safe</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-amber-400 bg-amber-950/40 border border-amber-500/30 px-3 py-1.5 rounded-full w-fit mx-auto backdrop-blur-md shadow-lg">
                <span className="material-symbols-outlined text-sm">
                  warning
                </span>
                <span>Unknown Number</span>
              </div>
            )}

            {/* Safe Call Message or Default Message */}
            {isSafeCall ? (
              <div className="space-y-2">
                <p className="text-sm text-green-400 font-medium tracking-wide">
                  We detected this caller is not a scammer
                </p>
                {callPurpose && (
                  <p className="text-xs text-zinc-400 font-normal italic max-w-xs mx-auto">
                    They called for: "{callPurpose}"
                  </p>
                )}
                <p className="text-xs text-zinc-500 font-medium tracking-wide">
                  So diverted to you
                </p>
              </div>
            ) : (
              <p className="text-xs text-zinc-500 font-medium tracking-wide">
                Caller not in contacts
              </p>
            )}
          </div>
        </div>

        {/* Action Buttons Section */}
        <div className="w-full pb-4 z-20">
          <div className="flex items-end justify-between px-4">
            {/* DECLINE Button */}
            <button
              onClick={onDecline}
              className="flex flex-col items-center gap-2 group active:scale-95 transition-transform"
            >
              <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center group-hover:bg-red-500/20 transition-colors backdrop-blur-md shadow-[0_0_15px_rgba(239,68,68,0.1)]">
                <span
                  className="material-symbols-outlined text-2xl text-red-500 group-hover:text-red-400"
                  style={{
                    fontVariationSettings: "'FILL' 1, 'wght' 700",
                  }}
                >
                  call_end
                </span>
              </div>
              <span className="text-[9px] font-bold text-red-400/80 uppercase tracking-widest">
                Decline
              </span>
            </button>

            {/* DIVERT TO AI PROTECTION Button */}
            <button
              onClick={onDivertToAI}
              className="flex flex-col items-center gap-2 group active:scale-[0.98] transition-transform"
            >
              <div className="flex flex-col items-center -space-y-3 pb-1">
                <span
                  className="material-symbols-outlined text-2xl text-[#2dd4bf]/40"
                  style={{
                    animation: 'swipe 2s infinite ease-out',
                    animationDelay: '0.3s',
                  }}
                >
                  keyboard_arrow_up
                </span>
                <span
                  className="material-symbols-outlined text-2xl text-[#2dd4bf]/70"
                  style={{
                    animation: 'swipe 2s infinite ease-out',
                    animationDelay: '0.15s',
                  }}
                >
                  keyboard_arrow_up
                </span>
                <span
                  className="material-symbols-outlined text-2xl text-[#2dd4bf]"
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
                <div className="w-12 h-12 rounded-full bg-[#2dd4bf] flex items-center justify-center shadow-[0_0_40px_rgba(45,212,191,0.3)] hover:shadow-[0_0_60px_rgba(45,212,191,0.5)] border-2 border-white/20 relative overflow-hidden z-10">
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent z-0 transition-transform duration-1000"></div>
                  <span
                    className="material-symbols-outlined text-black z-10 text-2xl"
                    style={{
                      fontVariationSettings: "'FILL' 1, 'wght' 700",
                    }}
                  >
                    shield
                  </span>
                </div>
              </div>
              <span className="text-[9px] font-bold text-[#2dd4bf] tracking-widest uppercase drop-shadow-lg text-center leading-tight">
                Divert to AI Protection
              </span>
            </button>

            {/* ACCEPT Button */}
            <button
              onClick={onAccept}
              className="flex flex-col items-center gap-2 group active:scale-95 transition-transform"
            >
              <div className="w-12 h-12 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center group-hover:bg-green-500/20 transition-colors backdrop-blur-md shadow-[0_0_15px_rgba(34,197,94,0.1)]">
                <span
                  className="material-symbols-outlined text-2xl text-green-500 group-hover:text-green-400"
                  style={{
                    fontVariationSettings: "'FILL' 1, 'wght' 700",
                  }}
                >
                  call
                </span>
              </div>
              <span className="text-[9px] font-bold text-green-400/80 uppercase tracking-widest">
                Accept
              </span>
            </button>
          </div>

          {/* Powered by Anti-Scam AI */}
          <div className="mt-4 pt-4 flex items-center justify-center gap-1.5 opacity-50">
            <span
              className="material-symbols-outlined text-xs text-[#26d9bb]"
              style={{ fontVariationSettings: '"FILL" 1, "wght" 600' }}
            >
              verified_user
            </span>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
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
          @keyframes swipe {
            0% { transform: translateY(10px); opacity: 0; }
            40% { opacity: 1; }
            100% { transform: translateY(-12px); opacity: 0; }
          }
        `,
          }}
        />
      </div>
    </div>
  );
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
  const [realtimeScamScore, setRealtimeScamScore] = useState(0);
  const [realtimeKeywords, setRealtimeKeywords] = useState<string[]>([]);
  const transcriptIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const analysisTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastProcessedLengthRef = useRef<number>(0);
  // Single shared ringtone audio instance (HTML5 Audio API)
  const ringtoneAudioRef = useRef<HTMLAudioElement | null>(null);
  const [incomingCall, setIncomingCall] = useState<{
    number: string;
    purpose?: string;
    isSafe?: boolean;
  } | null>(null);
  const hasTriggeredSafeReRingRef = useRef<boolean>(false);
  const [lastDivertType, setLastDivertType] = useState<'scam' | 'safe'>(
    'safe'
  );
  // Track dialogue count to ensure we have enough conversation before final analysis
  const dialogueCountRef = useRef(0);
  const MIN_DIALOGUES_FOR_ANALYSIS = 10; // Minimum dialogues before comprehensive analysis
  const [blocklist, setBlocklist] = useState<string[]>([]);
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
  // ElevenLabs AI voice session (ConvAI) - manages \"AI assistant\" voice greeting
  const aiVoiceClientRef = useRef<ElevenLabsClient | null>(null);

  // Helper: lazily create & configure the shared ringtone audio instance
  const ensureRingtoneAudio = () => {
    if (typeof window === 'undefined') return null;

    if (!ringtoneAudioRef.current) {
      const audio = new Audio('/sounds/ringtone.mp3');
      audio.loop = true;
      ringtoneAudioRef.current = audio;
    }

    return ringtoneAudioRef.current;
  };

  // Helper: start/loop the ringtone (called only from user-initiated handlers)
  const startRingtone = () => {
    const audio = ensureRingtoneAudio();
    if (!audio) return;

    try {
      // Prevent overlapping instances by reusing the same Audio object
      if (audio.paused) {
        audio.currentTime = 0;
        void audio.play().catch((error) => {
          // In production we log and fail gracefully without breaking UX
          console.error('[Dashboard] Error playing ringtone:', error);
        });
      }
    } catch (error) {
      console.error('[Dashboard] Unexpected error starting ringtone:', error);
    }
  };

  // Helper: stop and reset the ringtone cleanly
  const stopRingtone = () => {
    const audio = ringtoneAudioRef.current;
    if (!audio) return;

    try {
      if (!audio.paused) {
        audio.pause();
      }
      audio.currentTime = 0;
    } catch (error) {
      console.error('[Dashboard] Unexpected error stopping ringtone:', error);
    }
  };

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
        // CRITICAL: Add missing entries immediately for real-time conversation
        // No delay - show caller and AI messages as they come in
        const missingEntries = activeCall.transcript.slice(visibleLength);
        setVisibleTranscript((prev) => {
          // Filter out any duplicates that might have been added via callbacks
          const existingTexts = new Set(prev.map(e => `${e.speaker}:${e.text}`));
          const newEntries = missingEntries.filter(
            entry => !existingTexts.has(`${entry.speaker}:${entry.text}`)
          );
          return [...prev, ...newEntries];
        });
        lastProcessedLengthRef.current = transcriptLength;
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

    // Capture activeCall.number in closure to avoid dependency issues
    const currentCallNumber = activeCall.number;

    analysisTimeoutRef.current = setTimeout(async () => {
      try {
        const result = await analyzeConversation(visibleTranscript);
        const isSafe = result.scamScore <= 40; // Safe if score is 40% or below
        
        setActiveCall((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            risk: result.scamScore,
            keywords: result.keywords,
          };
        });

        // CRITICAL: Only redial to user AFTER sufficient conversation (10+ dialogues)
        // AND only if NO scam keywords detected (safe call)
        const callerMessages = visibleTranscript.filter((e) => e.speaker === 'Caller');
        const hasEnoughDialogue = callerMessages.length >= MIN_DIALOGUES_FOR_ANALYSIS;
        const hasScamKeywords = result.keywords && result.keywords.length > 0;
        
        // Only redial if:
        // 1. We have enough dialogue (10+ caller messages)
        // 2. No scam keywords detected
        // 3. Scam score is low (< 40 for safety)
        // 4. We haven't already triggered re-ring
        if (
          isSafe && 
          !hasTriggeredSafeReRingRef.current && 
          hasEnoughDialogue &&
          !hasScamKeywords &&
          result.scamScore < 40
        ) {
          console.log('[Dashboard] ✅ Safe call confirmed after sufficient conversation:');
          console.log(`[Dashboard] - Dialogues: ${callerMessages.length}/${MIN_DIALOGUES_FOR_ANALYSIS}`);
          console.log(`[Dashboard] - Scam score: ${result.scamScore}`);
          console.log(`[Dashboard] - Keywords: ${result.keywords.length > 0 ? result.keywords.join(', ') : 'None (safe)'}`);
          console.log('[Dashboard] - Redialing to user...');
          
          hasTriggeredSafeReRingRef.current = true;
          
          // Extract call purpose from caller's messages
          try {
            const callerMessages = visibleTranscript.filter((e) => e.speaker === 'Caller');
            const callerText = callerMessages.map((e) => e.text).join(' ');
            
            // Use caller's own words as purpose
            let purpose = 'General inquiry';
            if (callerText.length > 0) {
              // Take first 150 characters of caller's combined messages as purpose
              purpose = callerText.length > 150 
                ? callerText.substring(0, 150) + '...'
                : callerText;
            }

            // End the current monitoring call first
            // Stop any active ElevenLabs AI voice session
            if (aiVoiceClientRef.current) {
              aiVoiceClientRef.current.stop();
              aiVoiceClientRef.current = null;
            }

            // Immediately ring the user again with safe call info
            setIncomingCall({
              number: currentCallNumber,
              purpose,
              isSafe: true,
            });
            
            // Close the monitoring view
            setIsFullPageMonitoring(false);
            
            // Start ringtone
            startRingtone();
          } catch (error) {
            console.error('[Dashboard] Error extracting purpose:', error);
            // Still trigger re-ring even if purpose extraction fails
            // End the current monitoring call first
            if (aiVoiceClientRef.current) {
              aiVoiceClientRef.current.stop();
              aiVoiceClientRef.current = null;
            }
            
            setIncomingCall({
              number: currentCallNumber,
              purpose: 'General inquiry',
              isSafe: true,
            });
            
            setIsFullPageMonitoring(false);
            startRingtone();
          }
        }
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
      const isScam = activeCall.risk > 40;

      const newCall: Call = {
        id: Date.now().toString(),
        number: activeCall.number,
        timestamp: activeCall.startTime || new Date(),
        duration,
        status: isScam ? 'scam' : 'safe',
        risk: activeCall.risk,
      };

      setCalls((prev) => [newCall, ...prev]);

      // Add high-risk callers (>40% scam risk) to blocklist
      if (isScam) {
        setBlocklist((prev) =>
          prev.includes(activeCall.number) ? prev : [activeCall.number, ...prev]
        );
        console.log(`[Dashboard] 🚫 Added ${activeCall.number} to blocklist (scam risk: ${activeCall.risk}%)`);
      }
    }

    // Stop any active ElevenLabs AI voice session when the call ends
    if (aiVoiceClientRef.current) {
      aiVoiceClientRef.current.stop();
      aiVoiceClientRef.current = null;
    }

    // Cleanup
    setActiveCall(null);
    setIsFullPageMonitoring(false);
    setVisibleTranscript([]);
    setRealtimeScamScore(0);
    setRealtimeKeywords([]);
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
    // End AI monitoring and return to normal dashboard.
    // For the hackathon demo, we treat this as the human taking over the call,
    // so we stop the AI voice session and end monitoring.
    endCall();
  };

  // Helper to generate a random US-style phone number
  const generateRandomPhoneNumber = () =>
    `+1 (${Math.floor(Math.random() * 900) + 100}) ${
      Math.floor(Math.random() * 900) + 100
    }-${Math.floor(Math.random() * 9000) + 1000}`;

  // Helper to start a simulated call (scam or safe) in a single place
  const startSimulatedCall = ({
    type,
    number,
  }: {
    type: 'scam' | 'safe';
    number?: string;
  }) => {
    const phoneNumber = number ?? generateRandomPhoneNumber();
    const conversation = getRandomConversation(type);
    const startTime = new Date();

    // Reset the safe re-ring flag when starting a new call
    hasTriggeredSafeReRingRef.current = false;

    const newCall: Call = {
      id: Date.now().toString(),
      number: phoneNumber,
      timestamp: startTime,
      duration: 0,
      status: type,
      risk: conversation.expectedRisk,
    };

    setCalls((prev) => [newCall, ...prev]);
    setActiveCall({
      number: phoneNumber,
      risk: conversation.expectedRisk,
      // Start with no keywords – they will be populated by analysis
      keywords: [],
      transcript: conversation.transcript,
      startTime,
    });
    // Always show full page monitoring in iPhone view when a simulated call starts
    setIsFullPageMonitoring(true);
  };

  const simulateScamCall = () => {
    // NOTE: Kept for future/manual testing via code – UI buttons are commented out.
    startSimulatedCall({ type: 'scam' });
  };

  const simulateSafeCall = () => {
    // NOTE: Kept for future/manual testing via code – UI buttons are commented out.
    startSimulatedCall({ type: 'safe' });
  };

  const simulateIncomingCall = () => {
    const phoneNumber = generateRandomPhoneNumber();

    setIncomingCall({
      number: phoneNumber,
    });
    // Start ringtone after explicit user interaction (button click)
    startRingtone();
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
    // Stop ringtone when call is declined
    stopRingtone();
    setIncomingCall(null);
  };

  // Helper: Add transcript entry to active call (DRY)
  const addTranscriptEntry = (entry: TranscriptEntry) => {
    setActiveCall((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        transcript: [...prev.transcript, entry],
      };
    });
  };

  // Helper: Analyze caller text and update risk scores (DRY)
  // CRITICAL: This analyzes ONLY the caller's speech to determine if they're a scammer
  const analyzeCallerText = async (text: string, currentTranscript: TranscriptEntry[]) => {
    if (!text.trim() || !activeCall) {
      console.warn('[Dashboard] Skipping analysis: empty text or no active call');
      return;
    }

    // Increment dialogue count (only count caller messages)
    dialogueCountRef.current += 1;
    const currentDialogueCount = dialogueCountRef.current;

    try {
      // Build conversation context - ONLY include caller's messages for analysis
      // Filter out AI agent responses - we only care about what the CALLER says
      const callerOnlyTranscript = currentTranscript.filter(
        (e) => e.speaker === 'Caller'
      );
      const conversationContext = callerOnlyTranscript.map(
        (e) => `${e.speaker}: ${e.text}`
      );

      console.log('[Dashboard] 🎤 Analyzing caller speech:', {
        callerText: text,
        callerMessagesCount: callerOnlyTranscript.length,
        totalTranscriptLength: currentTranscript.length,
        dialogueCount: `${currentDialogueCount}/${MIN_DIALOGUES_FOR_ANALYSIS}`,
      });

      const response = await fetch('/api/analyze-realtime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          callerText: text,
          conversationContext,
          dialogueCount: currentDialogueCount, // Pass dialogue count to API
        }),
      });

      if (response.ok) {
        const analysis = await response.json();
        const scamScore = analysis.scamScore || 0;
        const keywords = analysis.keywords || [];

        console.log('[Dashboard] ✅ Scam analysis result:', {
          scamScore,
          keywords,
          isScam: scamScore > 40,
          dialogueCount: `${currentDialogueCount}/${MIN_DIALOGUES_FOR_ANALYSIS}`,
        });

        // Log analysis status
        if (currentDialogueCount < MIN_DIALOGUES_FOR_ANALYSIS) {
          console.log(`[Dashboard] ⏳ Collecting more conversation data... (${currentDialogueCount}/${MIN_DIALOGUES_FOR_ANALYSIS} dialogues)`);
          console.log(`[Dashboard] Current scam score: ${scamScore} (preliminary - need more data)`);
          console.log(`[Dashboard] ⚠️ Conversation must continue - not enough data for final decision yet`);
        } else {
          console.log(`[Dashboard] ✅ Sufficient conversation data collected (${currentDialogueCount} dialogues)`);
          console.log(`[Dashboard] Final scam score: ${scamScore}`);
          console.log(`[Dashboard] Detected keywords: ${keywords.length > 0 ? keywords.join(', ') : 'None'}`);
          
          // Make final decision after sufficient dialogue (threshold: >40% = scam)
          if (scamScore > 40 || keywords.length > 0) {
            console.log(`[Dashboard] 🚨 SCAM DETECTED: Score ${scamScore}% (threshold: >40%), Keywords: ${keywords.join(', ')}`);
            console.log(`[Dashboard] ❌ Call will be marked as SCAM and added to blocklist`);
            
            // Add to blocklist immediately if scam detected during conversation
            if (activeCall && scamScore > 40) {
              setBlocklist((prev) =>
                prev.includes(activeCall.number) ? prev : [activeCall.number, ...prev]
              );
              console.log(`[Dashboard] 🚫 Added ${activeCall.number} to blocklist (scam risk: ${scamScore}%)`);
            }
          } else if (scamScore <= 40 && keywords.length === 0) {
            console.log(`[Dashboard] ✅ SAFE CALL: No scam keywords, low score (${scamScore}%)`);
            console.log(`[Dashboard] 📞 Call will be redialed to user after conversation ends`);
          } else {
            console.log(`[Dashboard] ⚠️ UNCERTAIN: Score ${scamScore}%, needs review`);
          }
        }

        // Update real-time scores
        setRealtimeScamScore(scamScore);
        setRealtimeKeywords(keywords);

        // Update active call with latest risk assessment
        setActiveCall((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            risk: Math.max(prev.risk, scamScore), // Keep highest risk
            keywords: [
              ...new Set([...prev.keywords, ...keywords]),
            ].slice(0, 10), // Max 10 keywords
          };
        });
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('[Dashboard] Analysis API error:', response.status, errorData);
      }
    } catch (error) {
      console.error('[Dashboard] Real-time analysis error:', error);
    }
  };

  const handleDivertToAI = () => {
    // Reset dialogue count when starting a new conversation
    dialogueCountRef.current = 0;
    
    if (incomingCall) {
      // If this is already a safe call being re-rung, don't divert again
      // Just accept it directly
      if (incomingCall.isSafe) {
        handleAcceptCall();
        return;
      }

      const phoneNumber = incomingCall.number;
      const startTime = new Date();

      // Initialize active call for real-time monitoring (NO simulated data)
      setActiveCall({
        number: phoneNumber,
        risk: 0,
        keywords: [],
        transcript: [], // Start with empty transcript for real-time conversation
        startTime,
      });
      setRealtimeScamScore(0);
      setRealtimeKeywords([]);
      setIsFullPageMonitoring(true);

      // Note: Call will be added to history when it ends (in endCall function)

      // Start ElevenLabs ConvAI session with real-time callbacks
      if (typeof window !== 'undefined') {
        // Clean up any existing client
        if (aiVoiceClientRef.current) {
          aiVoiceClientRef.current.stop();
          aiVoiceClientRef.current = null;
        }

        aiVoiceClientRef.current = new ElevenLabsClient({
          // Optional local fallback greeting; add the file under /public/sounds if desired.
          // fallbackGreetingAudioUrl: '/sounds/ai-greeting.mp3',
          playbackRate: 0.6, // 60% speed - slower and clearer for better understanding
          onUserTranscript: async (text: string) => {
            console.log('[Dashboard] Caller said:', text);

            // Add caller transcript entry and analyze in one update
            const callerEntry: TranscriptEntry = { speaker: 'Caller', text };
            
            setActiveCall((prev) => {
              if (!prev) return prev;
              const updatedTranscript = [...prev.transcript, callerEntry];
              // Analyze with the updated transcript (includes the new entry)
              void analyzeCallerText(text, updatedTranscript);
              return {
                ...prev,
                transcript: updatedTranscript,
              };
            });
            
            // CRITICAL: Also add to visibleTranscript immediately (no delay for caller messages)
            setVisibleTranscript((prev) => {
              // Check if this entry is already in visibleTranscript to avoid duplicates
              const isDuplicate = prev.some(
                (entry, idx) => entry.speaker === 'Caller' && entry.text === text && idx === prev.length - 1
              );
              if (isDuplicate) {
                return prev;
              }
              return [...prev, callerEntry];
            });
          },
          onAgentResponse: (text: string) => {
            console.log('[Dashboard] AI Agent responded:', text);

            // Add agent response to transcript
            const agentEntry: TranscriptEntry = { speaker: 'AI Agent', text };
            addTranscriptEntry(agentEntry);
            
            // CRITICAL: Also add to visibleTranscript immediately (no delay for agent messages)
            setVisibleTranscript((prev) => {
              // Check if this entry is already in visibleTranscript to avoid duplicates
              const isDuplicate = prev.some(
                (entry, idx) => entry.speaker === 'AI Agent' && entry.text === text && idx === prev.length - 1
              );
              if (isDuplicate) {
                return prev;
              }
              return [...prev, agentEntry];
            });
          },
          onConversationStart: () => {
            console.log('[Dashboard] Conversation started with ElevenLabs');
            // Add a greeting message that encourages the caller to explain their purpose
            addTranscriptEntry({
              speaker: 'AI Agent',
              text: 'Hello?'});
          },
          onConversationEnd: () => {
            console.log('[Dashboard] Conversation ended');
            
            // After conversation ends, check if we should redial
            // Only redial if we have enough dialogue (10+) and it's safe (no scam keywords)
            const finalCallerMessages = activeCall?.transcript.filter((e) => e.speaker === 'Caller') || [];
            const finalDialogueCount = finalCallerMessages.length;
            const finalScamScore = activeCall?.risk || 0;
            const finalKeywords = activeCall?.keywords || [];
            
            console.log('[Dashboard] 📊 Final conversation analysis:', {
              dialogueCount: finalDialogueCount,
              scamScore: finalScamScore,
              keywords: finalKeywords,
              hasEnoughDialogue: finalDialogueCount >= MIN_DIALOGUES_FOR_ANALYSIS,
              hasScamKeywords: finalKeywords.length > 0,
              isSafe: finalScamScore < 40 && finalKeywords.length === 0,
            });
            
            // Only redial if we have enough dialogue AND it's safe (no scam keywords)
            if (
              finalDialogueCount >= MIN_DIALOGUES_FOR_ANALYSIS &&
              finalScamScore < 40 &&
              finalKeywords.length === 0 &&
              !hasTriggeredSafeReRingRef.current
            ) {
              console.log('[Dashboard] ✅ Safe call confirmed - redialing to user...');
              
              // Extract call purpose from caller's messages
              const callerText = finalCallerMessages.map((e) => e.text).join(' ');
              const purpose = callerText.length > 150 
                ? callerText.substring(0, 150) + '...'
                : callerText || 'General inquiry';
              
              // Redial to user
              setIncomingCall({
                number: activeCall?.number || '',
                purpose,
                isSafe: true,
              });
              
              setIsFullPageMonitoring(false);
              startRingtone();
              hasTriggeredSafeReRingRef.current = true;
            } else if (finalDialogueCount < MIN_DIALOGUES_FOR_ANALYSIS) {
              console.log('[Dashboard] ⚠️ Conversation ended too early - not enough dialogue for decision');
              console.log(`[Dashboard] Had ${finalDialogueCount} dialogues, needed ${MIN_DIALOGUES_FOR_ANALYSIS}`);
            } else if (finalScamScore >= 40 || finalKeywords.length > 0) {
              console.log('[Dashboard] 🚨 Scam detected - call will NOT be redialed');
              console.log(`[Dashboard] Scam score: ${finalScamScore}, Keywords: ${finalKeywords.join(', ')}`);
            }
          },
          onError: (error: Error) => {
            console.error('[Dashboard] ElevenLabs error:', error);
            
            // Parse error message to provide better user guidance
            let errorMessage = error.message;
            
            // Microphone-related errors
            if (errorMessage.includes('microphone') || errorMessage.includes('Microphone')) {
              // Keep the detailed microphone error message as-is (already user-friendly)
              errorMessage = `AI Protection Error: ${errorMessage}`;
            } 
            // API permission errors
            else if (errorMessage.includes('convai_write') || errorMessage.includes('missing_permissions')) {
              errorMessage = 'AI Protection is not available: Your ElevenLabs API key needs the "convai_write" permission. Please update your API key settings.';
            } 
            // Authentication errors
            else if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
              errorMessage = 'AI Protection is not available: Invalid or missing ElevenLabs API key. Please check your environment configuration.';
            } 
            // Network errors
            else if (errorMessage.includes('Failed to fetch signed URL')) {
              errorMessage = 'AI Protection is not available: Could not connect to ElevenLabs service. Please check your internet connection and try again.';
            }
            // Generic errors
            else {
              errorMessage = `AI Protection Error: ${errorMessage}`;
            }
            
            // Show user-friendly error message
            addTranscriptEntry({
              speaker: 'System',
              text: errorMessage,
            });
          },
        });

        // Start the session
        void aiVoiceClientRef.current.start().catch((error) => {
          console.error('[Dashboard] Failed to start ElevenLabs session:', error);
          
          // Parse error message to provide better user guidance
          let errorMessage = error instanceof Error ? error.message : 'Unknown error';
          
          // Microphone-related errors
          if (errorMessage.includes('microphone') || errorMessage.includes('Microphone') || errorMessage.includes('device not found')) {
            errorMessage = `AI Protection Error: ${errorMessage}`;
          }
          // API permission errors
          else if (errorMessage.includes('convai_write') || errorMessage.includes('missing_permissions')) {
            errorMessage = 'AI Protection is not available: Your ElevenLabs API key needs the "convai_write" permission. Please update your API key settings in the ElevenLabs dashboard.';
          } 
          // Authentication errors
          else if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
            errorMessage = 'AI Protection is not available: Invalid or missing ElevenLabs API key. Please check your .env.local file for ELEVENLABS_API_KEY.';
          }
          // Generic errors
          else {
            errorMessage = `AI Protection Error: ${errorMessage}`;
          }
          
          addTranscriptEntry({
            speaker: 'System',
            text: errorMessage,
          });
        });
      }
    }
    // Stop ringtone when call is diverted to AI protection
    stopRingtone();
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
    // Stop ringtone when call is accepted
    stopRingtone();
    setIncomingCall(null);
  };

  // Cleanup ringtone audio on unmount for safety
  useEffect(() => {
    return () => {
      stopRingtone();
    };
  }, []);

  const stats = {
    totalCalls: calls.length,
    scamBlocked: calls.filter((c) => c.status === 'scam').length,
    safeCalls: calls.filter((c) => c.status === 'safe').length,
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

  // Prepare iPhone content
  const iphoneContent = incomingCall ? (
    <IncomingCallContent
      incomingCall={incomingCall}
      onDecline={handleDeclineCall}
      onDivertToAI={handleDivertToAI}
      onAccept={handleAcceptCall}
    />
  ) : activeCall && isFullPageMonitoring ? (
    <FullPageMonitoringContent
      activeCall={activeCall}
      visibleTranscript={visibleTranscript}
      realtimeScamScore={realtimeScamScore}
      realtimeKeywords={realtimeKeywords}
      onEndCall={endCall}
      onTakeOverCall={handleTakeOverCall}
      onGoToDashboard={() => setIsFullPageMonitoring(false)}
    />
  ) : (
    <DashboardContent
      activeCall={activeCall}
      isFullPageMonitoring={isFullPageMonitoring}
      calls={calls}
      stats={stats}
      blocklist={blocklist}
      realtimeScamScore={realtimeScamScore}
      realtimeKeywords={realtimeKeywords}
      onEndCall={endCall}
      onViewFullMonitoring={() => setIsFullPageMonitoring(true)}
      getCallIcon={getCallIcon}
      getCallStatusBadge={getCallStatusBadge}
      formatDuration={formatDuration}
    />
  );

  // Prepare left content (instructions)
  const leftContent = (
    <>
      <div>
        <h1 className="text-4xl lg:text-5xl font-bold leading-tight tracking-tight text-[#26d9bb] mb-4">
          Anti-Scam Dashboard
        </h1>
        <p className="text-lg lg:text-xl text-slate-400 leading-relaxed">
          Monitor and manage your call protection in real-time. View call statistics, recent activity, and active call monitoring.
        </p>
      </div>

      <div className="space-y-4 text-base lg:text-lg text-slate-300">
        <div className="flex items-start gap-3">
          <span className="material-symbols-outlined text-[#26d9bb] text-xl mt-0.5">
            call
          </span>
          <div>
            <strong className="text-[#26d9bb]">Active Call Monitoring:</strong> Real-time AI-powered analysis of ongoing calls with scam risk detection.
          </div>
        </div>
        <div className="flex items-start gap-3">
          <span className="material-symbols-outlined text-[#26d9bb] text-xl mt-0.5">
            bar_chart
          </span>
          <div>
            <strong className="text-[#26d9bb]">Call Statistics:</strong> Track total calls, blocked scams, and safe calls.
          </div>
        </div>
        <div className="flex items-start gap-3">
          <span className="material-symbols-outlined text-[#26d9bb] text-xl mt-0.5">
            history
          </span>
          <div>
            <strong className="text-[#26d9bb]">Recent Calls:</strong> View your call history with risk assessments and status indicators.
          </div>
        </div>
      </div>

      {/* Simulation Buttons */}
      <div className="pt-4">
        <h3 className="text-lg font-semibold text-white mb-4">
          Test Features
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* 
            NOTE: The explicit "Simulate Scam" and "Simulate Safe" buttons have been
            removed from the UI per request, but the underlying handlers remain
            available for future/manual testing. 
          
          <button
            onClick={simulateScamCall}
            disabled={!!activeCall || !!incomingCall}
            className="flex flex-col items-center justify-center gap-2 bg-slate-800/90 border border-red-500/30 rounded-xl p-4 hover:bg-slate-700/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            <span className="material-symbols-outlined text-red-500 text-2xl">
              bug_report
            </span>
            <span className="text-xs font-semibold text-white">
              Simulate Scam
            </span>
          </button>

          <button
            onClick={simulateSafeCall}
            disabled={!!activeCall || !!incomingCall}
            className="flex flex-col items-center justify-center gap-2 bg-slate-800/90 border border-green-500/30 rounded-xl p-4 hover:bg-slate-700/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            <span className="material-symbols-outlined text-green-500 text-2xl">
              security
            </span>
            <span className="text-xs font-semibold text-white">
              Simulate Safe
            </span>
          </button>
          */}

          <button
            onClick={simulateIncomingCall}
            disabled={!!activeCall || !!incomingCall}
            className="flex flex-col items-center justify-center gap-2 bg-slate-800/90 border border-[#26d9bb]/30 rounded-xl p-4 hover:bg-slate-700/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            <span className="material-symbols-outlined text-[#26d9bb] text-2xl">
              ring_volume
            </span>
            <span className="text-xs font-semibold text-white">
              Incoming Call
            </span>
          </button>
        </div>
      </div>

      <p className="text-sm lg:text-base text-slate-400 italic pt-2">
        Use the Incoming Call button to test call scenarios. The mobile view on
        the right will update in real-time, and diverting to AI will alternate
        between scam and safe transcripts.
      </p>
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
