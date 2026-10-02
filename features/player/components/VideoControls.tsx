"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  Volume1,
  Maximize,
  Minimize,
  Settings,
  Tv,
  RectangleHorizontal,
} from "lucide-react";
import { PlayerState, PlayerControls } from "@/types/player";
import { formatPlayerTime } from "../utils/formatTime";
import { PLAYER_CONFIG } from "@/constants/player";
import { SettingsMenu } from "./SettingsMenu";

interface VideoControlsProps {
  state: PlayerState;
  controls: PlayerControls;
  title: string;
  isVisible: boolean;
  onUserInteraction: () => void;
  onOpenShortcuts: () => void;
}

export function VideoControls({
  state,
  controls,
  title,
  isVisible,
  onUserInteraction,
  onOpenShortcuts,
}: VideoControlsProps) {
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [hoverPosition, setHoverPosition] = useState<number>(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const timelineRef = useRef<HTMLDivElement | null>(null);

  const duration = state.duration || 0;
  const current = state.currentTime || 0;
  const progressPercent = duration > 0 ? (current / duration) * 100 : 0;
  const bufferedPercent = duration > 0 ? (state.bufferedTime / duration) * 100 : 0;

  const calculatePosition = useCallback(
    (clientX: number) => {
      if (!timelineRef.current || duration <= 0) return 0;
      const rect = timelineRef.current.getBoundingClientRect();
      const pos = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      return pos;
    },
    [duration]
  );

  const handleTimelineMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (duration <= 0) return;
    const pos = calculatePosition(e.clientX);
    setHoverPosition(pos * 100);
    setHoverTime(pos * duration);
    onUserInteraction();
  };

  const handleTimelineMouseLeave = () => {
    if (!isDragging) {
      setHoverTime(null);
    }
  };

  const handleTimelineMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (duration <= 0) return;
    setIsDragging(true);
    const pos = calculatePosition(e.clientX);
    controls.seek(pos * duration);
    onUserInteraction();
  };

  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!isDragging || duration <= 0) return;
      const pos = calculatePosition(e.clientX);
      setHoverPosition(pos * 100);
      setHoverTime(pos * duration);
      controls.seek(pos * duration);
      onUserInteraction();
    };

    const handleGlobalMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
        setHoverTime(null);
      }
    };

    if (isDragging) {
      window.addEventListener("mousemove", handleGlobalMouseMove);
      window.addEventListener("mouseup", handleGlobalMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleGlobalMouseMove);
      window.removeEventListener("mouseup", handleGlobalMouseUp);
    };
  }, [isDragging, calculatePosition, controls, duration, onUserInteraction]);

  const isHd = state.quality.toLowerCase().includes("hd") || state.quality.includes("1080");

  return (
    <div
      className={`absolute inset-x-0 bottom-0 z-20 px-4 sm:px-6 pb-4 pt-16 bg-gradient-to-t from-black/95 via-black/60 to-transparent transition-opacity duration-300 ${
        isVisible || isSettingsOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      }`}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Title bar in controls for quick context */}
      <div className="mb-2 text-xs font-medium text-white/90 truncate flex items-center justify-between">
        <span className="truncate pr-4">{title}</span>
        {isHd && (
          <span className="shrink-0 px-1.5 py-0.2 rounded text-[10px] font-bold bg-[#EF3B4F] text-white tracking-wider">
            HD
          </span>
        )}
      </div>

      {/* Scrub / Progress Bar */}
      <div
        ref={timelineRef}
        onMouseMove={handleTimelineMouseMove}
        onMouseLeave={handleTimelineMouseLeave}
        onMouseDown={handleTimelineMouseDown}
        className="relative w-full h-4 flex items-center cursor-pointer group mb-2.5 select-none"
      >
        {/* Track Background */}
        <div className="w-full h-1 group-hover:h-2 bg-white/20 rounded-full overflow-hidden transition-all duration-150 relative">
          {/* Buffered Progress */}
          <div
            className="absolute left-0 top-0 bottom-0 bg-white/35 transition-all duration-150"
            style={{ width: `${Math.min(100, Math.max(0, bufferedPercent))}%` }}
          />

          {/* Played Progress */}
          <div
            className="absolute left-0 top-0 bottom-0 bg-[#EF3B4F]"
            style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
          />
        </div>

        {/* Hover ghost scrubber position */}
        {hoverTime !== null && (
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-white/60 pointer-events-none"
            style={{ left: `${hoverPosition}%` }}
          />
        )}

        {/* Playhead Scrubber Handle (YouTube style red knob) */}
        <div
          className={`absolute w-3.5 h-3.5 bg-[#EF3B4F] border-2 border-white rounded-full shadow-lg -translate-x-1/2 transition-transform duration-150 pointer-events-none ${
            isDragging ? "scale-125 opacity-100" : "opacity-0 group-hover:opacity-100"
          }`}
          style={{ left: `${Math.min(100, Math.max(0, progressPercent))}%` }}
        />

        {/* Hover Time Preview Tooltip */}
        {hoverTime !== null && (
          <div
            className="absolute -top-7 -translate-x-1/2 bg-black/90 text-white text-[11px] font-mono px-2 py-0.5 rounded shadow-lg border border-white/10 pointer-events-none tabular-nums"
            style={{ left: `${hoverPosition}%` }}
          >
            {formatPlayerTime(hoverTime)}
          </div>
        )}
      </div>

      {/* Controls Bar */}
      <div className="flex items-center justify-between gap-3 text-white">
        {/* Left Side: Playback and Volume */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Play/Pause */}
          <button
            type="button"
            onClick={controls.togglePlay}
            aria-label={state.isPlaying ? "Pause video (k)" : "Play video (k)"}
            title={state.isPlaying ? "Pause (k)" : "Play (k)"}
            className="p-1.5 hover:text-[#EF3B4F] transition-colors focus-visible:outline-none rounded hover:bg-white/10"
          >
            {state.isPlaying ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 fill-current" />
            )}
          </button>

          {/* Seek -10s */}
          <button
            type="button"
            onClick={() => controls.seekBy(-PLAYER_CONFIG.SEEK_STEP_SECONDS)}
            aria-label="Seek back 10 seconds (j)"
            title="Rewind 10s (j)"
            className="p-1.5 text-white/85 hover:text-white transition-colors focus-visible:outline-none rounded hover:bg-white/10"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Seek +10s */}
          <button
            type="button"
            onClick={() => controls.seekBy(PLAYER_CONFIG.FAST_FORWARD_SECONDS)}
            aria-label="Seek forward 10 seconds (l)"
            title="Fast Forward 10s (l)"
            className="p-1.5 text-white/85 hover:text-white transition-colors focus-visible:outline-none rounded hover:bg-white/10"
          >
            <RotateCw className="w-4 h-4" />
          </button>

          {/* Volume Control with hover slider */}
          <div className="flex items-center group/vol">
            <button
              type="button"
              onClick={controls.toggleMute}
              aria-label={state.isMuted ? "Unmute (m)" : "Mute (m)"}
              title={state.isMuted ? "Unmute (m)" : "Mute (m)"}
              className="p-1.5 text-white/85 hover:text-white transition-colors focus-visible:outline-none rounded hover:bg-white/10"
            >
              {state.isMuted || state.volume === 0 ? (
                <VolumeX className="w-4 h-4 text-red-400" />
              ) : state.volume < 0.5 ? (
                <Volume1 className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>

            <div className="w-0 overflow-hidden group-hover/vol:w-20 sm:group-hover/vol:w-24 group-focus-within/vol:w-24 transition-all duration-200 flex items-center px-1">
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={state.isMuted ? 0 : state.volume}
                onChange={(e) => controls.setVolume(parseFloat(e.target.value))}
                aria-label="Volume slider"
                className="w-full h-1 accent-[#EF3B4F] bg-white/30 rounded cursor-pointer"
              />
            </div>
          </div>

          {/* Timestamp Display */}
          <div className="text-xs font-mono tabular-nums text-white/90 ml-1">
            <span>{formatPlayerTime(state.currentTime)}</span>
            <span className="text-white/40 mx-1">/</span>
            <span>{formatPlayerTime(state.duration)}</span>
          </div>
        </div>

        {/* Right Side: Options, Settings, PiP, Theater, Fullscreen */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Settings Cog with YouTube popup */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsSettingsOpen((prev) => !prev)}
              aria-label="Settings"
              title="Settings"
              className={`p-1.5 transition-colors focus-visible:outline-none rounded hover:bg-white/10 ${
                isSettingsOpen ? "text-[#EF3B4F]" : "text-white/85 hover:text-white"
              }`}
            >
              <Settings className={`w-4 h-4 ${isSettingsOpen ? "rotate-45" : ""} transition-transform`} />
            </button>

            {/* YouTube Settings Popover */}
            <SettingsMenu
              isOpen={isSettingsOpen}
              onClose={() => setIsSettingsOpen(false)}
              state={state}
              controls={controls}
              onOpenShortcuts={onOpenShortcuts}
            />
          </div>

          {/* Picture-in-Picture */}
          <button
            type="button"
            onClick={controls.togglePip}
            aria-label="Miniplayer (i)"
            title="Miniplayer (i)"
            className="p-1.5 text-white/85 hover:text-white transition-colors focus-visible:outline-none rounded hover:bg-white/10 hidden sm:block"
          >
            <Tv className="w-4 h-4" />
          </button>

          {/* Theater Mode */}
          <button
            type="button"
            onClick={controls.toggleTheaterMode}
            aria-label="Theater mode (t)"
            title="Theater mode (t)"
            className={`p-1.5 transition-colors focus-visible:outline-none rounded hover:bg-white/10 hidden sm:block ${
              state.isTheaterMode ? "text-[#EF3B4F]" : "text-white/85 hover:text-white"
            }`}
          >
            <RectangleHorizontal className="w-4 h-4" />
          </button>

          {/* Fullscreen Toggle */}
          <button
            type="button"
            onClick={controls.toggleFullscreen}
            aria-label={state.isFullscreen ? "Exit Fullscreen (f)" : "Enter Fullscreen (f)"}
            title={state.isFullscreen ? "Exit full screen (f)" : "Full screen (f)"}
            className="p-1.5 text-white/85 hover:text-white transition-colors focus-visible:outline-none rounded hover:bg-white/10"
          >
            {state.isFullscreen ? (
              <Minimize className="w-4 h-4" />
            ) : (
              <Maximize className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
