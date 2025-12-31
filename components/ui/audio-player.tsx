'use client';

import React, { useState, useRef, useEffect } from 'react';

interface AudioPlayerProps {
  src: string;
  className?: string;
}

export function AudioPlayer({ src, className = '' }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(0.75); // Default to 0.75x speed
  const [volume, setVolume] = useState(1);
  const [isVolumeOpen, setIsVolumeOpen] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    // Set initial playback rate
    audio.playbackRate = playbackRate;
    audio.volume = volume;

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [playbackRate, volume]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newTime = parseFloat(e.target.value);
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const speedOptions = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];

  return (
    <div className={`bg-white/10 rounded-lg p-3 ${className}`}>
      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        onError={(e) => {
          console.error('[AudioPlayer] Playback error:', e);
        }}
        onLoadedMetadata={() => {
          if (audioRef.current) {
            setDuration(audioRef.current.duration);
          }
        }}
      />

      <div className="flex items-center gap-3">
        {/* Play/Pause Button */}
        <button
          onClick={togglePlay}
          className="flex-shrink-0 w-10 h-10 rounded-full bg-black/20 hover:bg-black/30 flex items-center justify-center transition-colors"
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? (
            <span className="material-symbols-outlined text-white text-xl">
              pause
            </span>
          ) : (
            <span className="material-symbols-outlined text-white text-xl ml-0.5">
              play_arrow
            </span>
          )}
        </button>

        {/* Time Display */}
        <div className="text-xs text-white/90 font-medium min-w-[60px]">
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>

        {/* Progress Bar */}
        <div className="flex-1 relative">
          <input
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1.5 bg-white/20 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#26d9bb] [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-[0_0_4px_rgba(38,217,187,0.5)] [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[#26d9bb] [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:shadow-[0_0_4px_rgba(38,217,187,0.5)] [&::-moz-range-thumb]:border-none"
            style={{
              background: `linear-gradient(to right, #26d9bb 0%, #26d9bb ${duration ? (currentTime / duration) * 100 : 0}%, rgba(255,255,255,0.2) ${duration ? (currentTime / duration) * 100 : 0}%, rgba(255,255,255,0.2) 100%)`,
            }}
          />
        </div>

        {/* Speed Control */}
        <div className="relative group">
          <button
            onClick={() => {
              const currentIndex = speedOptions.indexOf(playbackRate);
              const nextIndex = (currentIndex + 1) % speedOptions.length;
              setPlaybackRate(speedOptions[nextIndex]);
            }}
            className="text-xs text-white/90 font-medium min-w-[40px] px-2 py-1 rounded hover:bg-white/10 transition-colors"
            title="Change playback speed"
          >
            {playbackRate}x
          </button>
        </div>

        {/* Volume Control */}
        <div
          className="relative"
          onMouseEnter={() => setIsVolumeOpen(true)}
          onMouseLeave={() => setIsVolumeOpen(false)}
        >
          <button
            className="flex-shrink-0 w-8 h-8 flex items-center justify-center text-white/90 hover:text-white transition-colors"
            aria-label="Volume"
          >
            <span className="material-symbols-outlined text-lg">
              {volume === 0
                ? 'volume_off'
                : volume < 0.5
                ? 'volume_down'
                : 'volume_up'}
            </span>
          </button>

          {isVolumeOpen && (
            <div className="absolute bottom-full right-0 mb-2 bg-slate-800/95 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-slate-700/50">
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={handleVolumeChange}
                className="w-24 h-1.5 bg-white/20 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#26d9bb] [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-[0_0_4px_rgba(38,217,187,0.5)] [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[#26d9bb] [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:shadow-[0_0_4px_rgba(38,217,187,0.5)] [&::-moz-range-thumb]:border-none"
                style={{
                  background: `linear-gradient(to right, #26d9bb 0%, #26d9bb ${volume * 100}%, rgba(255,255,255,0.2) ${volume * 100}%, rgba(255,255,255,0.2) 100%)`,
                }}
              />
            </div>
          )}
        </div>
      </div>

    </div>
  );
}

