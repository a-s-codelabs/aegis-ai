'use client';

import { AppLayout } from '@/components/layout/app-layout';
import { SplitLayoutWithIPhone } from '@/components/layout/split-layout-with-iphone';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface UserSession {
  userId: string;
  phoneNumber: string;
  token: string;
  name?: string;
  profilePicture?: string | null;
}

interface DiversionMessage {
  id: string;
  name: string;
  message: string;
  description: string;
  isDefault?: boolean;
}

const DIVERSION_MESSAGES: DiversionMessage[] = [
  {
    id: 'standard',
    name: 'Standard Anti-Scam Warning',
    message: 'This call cannot continue due to security verification issues. No further information will be shared. Please contact the account holder through official channels. Goodbye.',
    description: 'Professional and neutral message for general use',
    isDefault: true,
  },
  {
    id: 'firm',
    name: 'Firm Security Notice',
    message: 'This call cannot proceed due to security verification requirements. For account inquiries, please contact us through our official website or verified phone number. Thank you.',
    description: 'More formal tone with specific contact instructions',
  },
  {
    id: 'brief',
    message: 'This call cannot continue due to security issues. Please use official channels to contact the account holder. Goodbye.',
    description: 'Shorter, more direct message',
    name: 'Brief Security Alert',
  },
  {
    id: 'polite',
    message: 'I apologize, but this call cannot continue due to security verification concerns. Please reach out through our official contact channels. Thank you for understanding.',
    description: 'Polite and apologetic tone',
    name: 'Polite Security Notice',
  },
];

export default function DiversionMessagesPage() {
  const router = useRouter();
  const [userSession, setUserSession] = useState<UserSession | null>(null);
  const [userInitials, setUserInitials] = useState('U');
  const [selectedMessageId, setSelectedMessageId] = useState<string>('standard');
  const [isPlaying, setIsPlaying] = useState<string | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);

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

        if (session.name) {
          const names = session.name.trim().split(' ');
          if (names.length >= 2) {
            setUserInitials(
              (names[0][0] + names[names.length - 1][0]).toUpperCase()
            );
          } else {
            setUserInitials(session.name[0].toUpperCase());
          }
        } else if (session.phoneNumber) {
          setUserInitials(session.phoneNumber.slice(-1));
        }
      } catch (error) {
        console.error('[DiversionMessages] Error parsing session:', error);
        router.push('/auth/login');
        return;
      }

      // Load selected message from localStorage
      const savedMessageId = localStorage.getItem('diversionMessageId');
      if (savedMessageId && DIVERSION_MESSAGES.find(m => m.id === savedMessageId)) {
        setSelectedMessageId(savedMessageId);
      }
    }
  }, [router]);

  const handleSelectMessage = (messageId: string) => {
    setSelectedMessageId(messageId);
    localStorage.setItem('diversionMessageId', messageId);
    
    // Dispatch event to notify other components
    window.dispatchEvent(new CustomEvent('diversionMessageChanged', {
      detail: { messageId }
    }));
  };

  const handlePlayPreview = async (messageId: string) => {
    if (isPlaying === messageId) {
      setIsPlaying(null);
      setPreviewError(null);
      return;
    }

    setIsPlaying(messageId);
    setPreviewError(null);
    const message = DIVERSION_MESSAGES.find(m => m.id === messageId);
    if (!message) {
      setIsPlaying(null);
      return;
    }

    try {
      // Get current voice preference
      const voicePreference = localStorage.getItem('voicePreference') || 'default';
      
      // Generate audio via API
      const response = await fetch('/api/trigger-diversion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          voice: voicePreference,
          message: message.message, // Override default message
        }),
      });

      if (!response.ok) {
        // Get error details from response
        let errorMessage = 'Failed to generate audio';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch {
          // If JSON parsing fails, use status text
          errorMessage = `${errorMessage}: ${response.status} ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      if (!data.success || !data.audioDataUrl) {
        const errorMsg = data.error || 'Invalid audio response';
        throw new Error(errorMsg);
      }

      // Play audio
      const audio = new Audio(data.audioDataUrl);
      audio.onended = () => {
        setIsPlaying(null);
        setPreviewError(null);
      };
      audio.onerror = (e) => {
        console.error('[DiversionMessages] Audio playback error:', e);
        setIsPlaying(null);
        setPreviewError('Failed to play audio. Please check your audio settings.');
      };
      await audio.play();
    } catch (error) {
      console.error('[DiversionMessages] Error playing preview:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setPreviewError(errorMessage);
      setIsPlaying(null);
    }
  };

  function DiversionMessagesContent() {
    const selectedMessage = DIVERSION_MESSAGES.find(m => m.id === selectedMessageId);

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
              Custom Diversion Messages
            </h2>
            <button
              onClick={() => router.push('/settings')}
              className="relative flex size-10 items-center justify-center cursor-pointer hover:opacity-80 transition-opacity"
            >
              {userSession?.profilePicture ? (
                <div className="h-9 w-9 rounded-full overflow-hidden border-2 border-[#26d9bb]/50 shadow-[0_0_10px_rgba(38,217,187,0.2)]">
                  <img
                    src={userSession.profilePicture}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-amber-100 to-amber-200 border-2 border-[#26d9bb]/50 shadow-[0_0_10px_rgba(38,217,187,0.2)] flex items-center justify-center">
                  <span className="text-sm font-bold text-amber-900">
                    {userInitials}
                  </span>
                </div>
              )}
            </button>
          </div>

          {/* Description */}
          <div>
            <p className="text-[#94a3b8] text-sm leading-relaxed">
              Choose a diversion message that will be played to callers when scam risk exceeds 70%. The message will automatically terminate the call after playback.
            </p>
          </div>

          {/* Error Display */}
          {previewError && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4">
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-red-400 text-lg">
                  error
                </span>
                <div className="flex-1">
                  <p className="text-red-400 font-semibold text-sm mb-1">
                    Preview Error
                  </p>
                  <p className="text-red-300 text-xs">
                    {previewError}
                  </p>
                  {previewError.includes('ELEVENLABS_API_KEY') && (
                    <p className="text-red-300/80 text-xs mt-2">
                      Please check your .env.local file and ensure ELEVENLABS_API_KEY is set.
                    </p>
                  )}
                  {previewError.includes('missing_permissions') || previewError.includes('text_to_speech') ? (
                    <div className="text-red-300/80 text-xs mt-2 space-y-1">
                      <p className="font-semibold">How to fix:</p>
                      <ol className="list-decimal list-inside space-y-0.5 ml-2">
                        <li>Go to your ElevenLabs dashboard</li>
                        <li>Navigate to API Keys settings</li>
                        <li>Ensure your API key has the "text_to_speech" permission enabled</li>
                        <li>Update your ELEVENLABS_API_KEY in .env.local if needed</li>
                      </ol>
                      <p className="mt-2 italic">
                        Note: Preview requires text_to_speech permission. The actual scam warning during calls uses agent messages and doesn't require this permission.
                      </p>
                    </div>
                  ) : null}
                </div>
                <button
                  onClick={() => setPreviewError(null)}
                  className="text-red-400 hover:text-red-300 transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">
                    close
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* Selected Message Preview */}
          {selectedMessage && (
            <div className="rounded-xl border border-[rgba(38,217,187,0.15)] bg-[#131b26] p-5 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-transparent via-[#26d9bb]/50 to-transparent opacity-30"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#26d9bb] text-lg">
                      check_circle
                    </span>
                    <span className="text-white font-semibold text-sm">
                      Currently Selected
                    </span>
                  </div>
                  <button
                    onClick={() => handlePlayPreview(selectedMessage.id)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#26d9bb]/10 border border-[#26d9bb]/20 text-[#26d9bb] text-xs font-medium hover:bg-[#26d9bb]/20 transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm">
                      {isPlaying === selectedMessage.id ? 'pause' : 'play_arrow'}
                    </span>
                    {isPlaying === selectedMessage.id ? 'Playing...' : 'Preview'}
                  </button>
                </div>
                <div className="bg-[#1e2936] rounded-lg p-4 border border-white/5">
                  <p className="text-white text-sm leading-relaxed">
                    "{selectedMessage.message}"
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Available Messages */}
          <div>
            <h3 className="text-white text-lg font-bold leading-tight px-1 pt-2 flex items-center gap-2 mb-4">
              <span className="w-1 h-5 bg-[#26d9bb] rounded-full"></span>
              Available Messages
            </h3>

            <div className="space-y-3">
              {DIVERSION_MESSAGES.map((message) => {
                const isSelected = message.id === selectedMessageId;
                return (
                  <div
                    key={message.id}
                    className={`rounded-xl border p-4 shadow-lg transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#26d9bb] bg-[#26d9bb]/10'
                        : 'border-white/5 bg-[#131b26] hover:bg-white/5'
                    }`}
                    onClick={() => handleSelectMessage(message.id)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="text-white font-semibold text-sm">
                            {message.name}
                          </h4>
                          {message.isDefault && (
                            <span className="px-2 py-0.5 bg-[#26d9bb]/20 border border-[#26d9bb]/30 text-[#26d9bb] text-[10px] font-bold rounded uppercase tracking-wide">
                              Default
                            </span>
                          )}
                          {isSelected && (
                            <span className="text-[#26d9bb]">
                              <span
                                className="material-symbols-outlined text-sm"
                                style={{ fontVariationSettings: '"FILL" 1' }}
                              >
                                check_circle
                              </span>
                            </span>
                          )}
                        </div>
                        <p className="text-[#94a3b8] text-xs mb-3 leading-relaxed">
                          {message.description}
                        </p>
                        <div className="bg-[#1e2936] rounded-lg p-3 border border-white/5">
                          <p className="text-white text-xs leading-relaxed">
                            "{message.message}"
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePlayPreview(message.id);
                        }}
                        className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#1e2936] border border-white/5 text-[#26d9bb] hover:bg-[#26d9bb]/10 transition-colors shrink-0"
                      >
                        <span className="material-symbols-outlined text-lg">
                          {isPlaying === message.id ? 'pause' : 'play_arrow'}
                        </span>
                      </button>
                    </div>
                  </div>
                );
              })}
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
        Custom Diversion Messages
      </h1>
      <p className="text-lg lg:text-xl text-slate-400 leading-relaxed">
        Select a diversion message that will be automatically played to callers when scam risk exceeds 70%. The message will terminate the call immediately after playback.
      </p>
      <div className="space-y-4 text-base lg:text-lg text-slate-300">
        <div className="flex items-start gap-3">
          <span className="material-symbols-outlined text-[#26d9bb] text-xl mt-0.5">
            security
          </span>
          <div>
            <strong className="text-[#26d9bb]">Security First:</strong> Messages are designed to be professional and non-accusatory while clearly communicating the call cannot continue.
          </div>
        </div>
        <div className="flex items-start gap-3">
          <span className="material-symbols-outlined text-[#26d9bb] text-xl mt-0.5">
            graphic_eq
          </span>
          <div>
            <strong className="text-[#26d9bb]">Preview:</strong> Click the play button to hear how each message sounds with your selected voice.
          </div>
        </div>
        <div className="flex items-start gap-3">
          <span className="material-symbols-outlined text-[#26d9bb] text-xl mt-0.5">
            auto_awesome
          </span>
          <div>
            <strong className="text-[#26d9bb]">Automatic:</strong> The selected message will automatically play when scam risk exceeds the threshold.
          </div>
        </div>
      </div>
    </>
  );

  return (
    <SplitLayoutWithIPhone
      leftContent={leftContent}
      iphoneContent={<DiversionMessagesContent />}
      leftBasis="60%"
    />
  );
}

