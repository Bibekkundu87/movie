"use client";

import React, { useState } from "react";
import {
  ChevronRight,
  ChevronLeft,
  Check,
  Sparkles,
  Repeat,
  Tv,
  BarChart2,
  Keyboard,
  Sliders,
  Gauge,
} from "lucide-react";
import { PlayerState, PlayerControls } from "@/types/player";
import { PLAYER_CONFIG } from "@/constants/player";

interface SettingsMenuProps {
  isOpen: boolean;
  onClose: () => void;
  state: PlayerState;
  controls: PlayerControls;
  onOpenShortcuts: () => void;
}

type MenuView = "main" | "quality" | "speed";

export function SettingsMenu({
  isOpen,
  onClose,
  state,
  controls,
  onOpenShortcuts,
}: SettingsMenuProps) {
  const [currentView, setCurrentView] = useState<MenuView>("main");

  if (!isOpen) return null;

  const handleQualitySelect = (quality: string) => {
    controls.setQuality(quality);
    setCurrentView("main");
  };

  const handleSpeedSelect = (speed: number) => {
    controls.setPlaybackRate(speed);
    setCurrentView("main");
  };

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="absolute bottom-16 right-4 z-40 w-64 rounded-xl bg-[#121218]/95 backdrop-blur-lg border border-white/15 shadow-2xl p-1.5 text-xs text-white select-none animate-in fade-in zoom-in-95 duration-150"
    >
      {/* View: Main Settings Menu */}
      {currentView === "main" && (
        <div className="space-y-0.5">
          {/* Quality Panel Option */}
          <button
            type="button"
            onClick={() => setCurrentView("quality")}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/10 transition-colors text-left"
          >
            <div className="flex items-center gap-2.5">
              <Sliders className="w-4 h-4 text-[#EF3B4F]" />
              <span className="font-medium">Quality</span>
            </div>
            <div className="flex items-center gap-1 text-[#9E9EB0]">
              <span className="text-[11px] truncate max-w-[90px]">{state.quality}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </button>

          {/* Playback Speed Option */}
          <button
            type="button"
            onClick={() => setCurrentView("speed")}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/10 transition-colors text-left"
          >
            <div className="flex items-center gap-2.5">
              <Gauge className="w-4 h-4 text-[#8E8EA0]" />
              <span className="font-medium">Playback speed</span>
            </div>
            <div className="flex items-center gap-1 text-[#9E9EB0]">
              <span className="text-[11px]">
                {state.playbackRate === 1 ? "Normal" : `${state.playbackRate}x`}
              </span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </button>

          <div className="h-px bg-white/10 my-1" />

          {/* Ambient Mode Toggle */}
          <button
            type="button"
            onClick={controls.toggleAmbientMode}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/10 transition-colors text-left"
          >
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Ambient mode</span>
            </div>
            <div
              className={`w-8 h-4 rounded-full transition-colors relative ${
                state.isAmbientMode ? "bg-[#EF3B4F]" : "bg-white/20"
              }`}
            >
              <div
                className={`w-3.5 h-3.5 rounded-full bg-white transition-transform absolute top-0.25 ${
                  state.isAmbientMode ? "translate-x-4" : "translate-x-0.5"
                }`}
              />
            </div>
          </button>

          {/* Loop Video Toggle */}
          <button
            type="button"
            onClick={controls.toggleLoop}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/10 transition-colors text-left"
          >
            <div className="flex items-center gap-2.5">
              <Repeat className="w-4 h-4 text-[#8E8EA0]" />
              <span>Loop video</span>
            </div>
            <div
              className={`w-8 h-4 rounded-full transition-colors relative ${
                state.isLooping ? "bg-[#EF3B4F]" : "bg-white/20"
              }`}
            >
              <div
                className={`w-3.5 h-3.5 rounded-full bg-white transition-transform absolute top-0.25 ${
                  state.isLooping ? "translate-x-4" : "translate-x-0.5"
                }`}
              />
            </div>
          </button>

          {/* Picture in Picture */}
          <button
            type="button"
            onClick={() => {
              controls.togglePip();
              onClose();
            }}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/10 transition-colors text-left"
          >
            <div className="flex items-center gap-2.5">
              <Tv className="w-4 h-4 text-[#8E8EA0]" />
              <span>Picture-in-picture</span>
            </div>
          </button>

          <div className="h-px bg-white/10 my-1" />

          {/* Stats for nerds */}
          <button
            type="button"
            onClick={controls.toggleStats}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/10 transition-colors text-left"
          >
            <div className="flex items-center gap-2.5">
              <BarChart2 className="w-4 h-4 text-[#8E8EA0]" />
              <span>Stats for nerds</span>
            </div>
            <div
              className={`w-8 h-4 rounded-full transition-colors relative ${
                state.isStatsOpen ? "bg-[#EF3B4F]" : "bg-white/20"
              }`}
            >
              <div
                className={`w-3.5 h-3.5 rounded-full bg-white transition-transform absolute top-0.25 ${
                  state.isStatsOpen ? "translate-x-4" : "translate-x-0.5"
                }`}
              />
            </div>
          </button>

          {/* Keyboard Shortcuts */}
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenShortcuts();
            }}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/10 transition-colors text-left"
          >
            <div className="flex items-center gap-2.5">
              <Keyboard className="w-4 h-4 text-[#8E8EA0]" />
              <span>Keyboard shortcuts</span>
            </div>
          </button>
        </div>
      )}

      {/* View: Quality Selection */}
      {currentView === "quality" && (
        <div className="space-y-0.5">
          <div className="flex items-center gap-2 px-2 py-1.5 border-b border-white/10 mb-1">
            <button
              type="button"
              onClick={() => setCurrentView("main")}
              className="p-1 rounded hover:bg-white/10 text-white/80 hover:text-white"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-semibold text-white">Quality</span>
          </div>

          <div className="max-h-56 overflow-y-auto space-y-0.5">
            {PLAYER_CONFIG.AVAILABLE_QUALITIES.map((q) => {
              const isSelected = state.quality === q;
              return (
                <button
                  key={q}
                  type="button"
                  onClick={() => handleQualitySelect(q)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors ${
                    isSelected
                      ? "bg-[#EF3B4F]/20 text-[#EF3B4F] font-semibold"
                      : "hover:bg-white/10 text-white/90"
                  }`}
                >
                  <span>{q}</span>
                  {isSelected && <Check className="w-4 h-4 text-[#EF3B4F]" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* View: Playback Speed Selection */}
      {currentView === "speed" && (
        <div className="space-y-0.5">
          <div className="flex items-center gap-2 px-2 py-1.5 border-b border-white/10 mb-1">
            <button
              type="button"
              onClick={() => setCurrentView("main")}
              className="p-1 rounded hover:bg-white/10 text-white/80 hover:text-white"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-semibold text-white">Playback speed</span>
          </div>

          <div className="max-h-56 overflow-y-auto space-y-0.5">
            {PLAYER_CONFIG.AVAILABLE_PLAYBACK_RATES.map((rate) => {
              const isSelected = state.playbackRate === rate;
              return (
                <button
                  key={rate}
                  type="button"
                  onClick={() => handleSpeedSelect(rate)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors ${
                    isSelected
                      ? "bg-[#EF3B4F]/20 text-[#EF3B4F] font-semibold"
                      : "hover:bg-white/10 text-white/90"
                  }`}
                >
                  <span>{rate === 1 ? "Normal" : `${rate}x`}</span>
                  {isSelected && <Check className="w-4 h-4 text-[#EF3B4F]" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
