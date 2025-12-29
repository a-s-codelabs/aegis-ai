'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

type VoicePreference = 'default' | 'female' | 'male';

interface VoiceSelectorProps {
  onVoiceChange?: (voice: VoicePreference) => void;
}

export function VoiceSelector({ onVoiceChange }: VoiceSelectorProps) {
  const [voice, setVoice] = useState<VoicePreference>('default');

  useEffect(() => {
    const saved = localStorage.getItem('voicePreference') as VoicePreference;
    if (saved && ['default', 'female', 'male'].includes(saved)) {
      setVoice(saved);
    }
  }, []);

  const handleVoiceChange = async (newVoice: VoicePreference) => {
    setVoice(newVoice);
    localStorage.setItem('voicePreference', newVoice);

    try {
      await fetch('/api/user/voice-preference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voice: newVoice }),
      });
    } catch (error) {
      console.error('Failed to sync voice preference:', error);
    }

    const event = new CustomEvent('voicePreferenceChanged', { detail: { voice: newVoice } });
    window.dispatchEvent(event);
    
    onVoiceChange?.(newVoice);
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-slate-400">Voice:</span>
      <div className="flex gap-1 bg-slate-800/50 rounded-lg p-1 border border-slate-700/50">
        <Button
          variant={voice === 'default' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => handleVoiceChange('default')}
          className={`text-xs h-7 px-3 ${
            voice === 'default'
              ? 'bg-[#26d9bb] text-black hover:bg-[#26d9bb]/90'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Default Voice
        </Button>
        <Button
          variant={voice === 'female' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => handleVoiceChange('female')}
          className={`text-xs h-7 px-3 ${
            voice === 'female'
              ? 'bg-[#26d9bb] text-black hover:bg-[#26d9bb]/90'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Female - Laura
        </Button>
        <Button
          variant={voice === 'male' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => handleVoiceChange('male')}
          className={`text-xs h-7 px-3 ${
            voice === 'male'
              ? 'bg-[#26d9bb] text-black hover:bg-[#26d9bb]/90'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Male - Roger
        </Button>
      </div>
    </div>
  );
}

export function getVoicePreference(): VoicePreference {
  if (typeof window === 'undefined') return 'default';
  const saved = localStorage.getItem('voicePreference') as VoicePreference;
  return saved && ['default', 'female', 'male'].includes(saved) ? saved : 'default';
}

export type VoiceStyle = 'Direct' | 'Neutral' | 'Empathetic';

export function getVoiceStyle(): VoiceStyle {
  if (typeof window === 'undefined') return 'Neutral';
  const saved = localStorage.getItem('voiceStyle') as VoiceStyle;
  return saved && ['Direct', 'Neutral', 'Empathetic'].includes(saved) ? saved : 'Neutral';
}

export type SensitivityLevel = 'LOW' | 'STANDARD' | 'HIGH';

export function getDiversionSensitivity(): SensitivityLevel {
  if (typeof window === 'undefined') return 'STANDARD';
  const saved = localStorage.getItem('diversionSensitivity') as SensitivityLevel;
  return saved && ['LOW', 'STANDARD', 'HIGH'].includes(saved) ? saved : 'STANDARD';
}

