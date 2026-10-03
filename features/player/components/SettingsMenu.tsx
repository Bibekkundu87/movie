"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
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
  X,
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
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setMounted(true);
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Reset back to main view when reopening
  useEffect(() => {
    if (isOpen) {
      setCurrentView("main");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleQualitySelect = (quality: string) => {
    controls.setQuality(quality);
    setCurrentView("main");
    if (isMobile) {
      onClose();
    }
  };

  const handleSpeedSelect = (speed: number) => {
    controls.setPlaybackRate(speed);
    setCurrentView("main");
    if (isMobile) {
      onClose();
    }
  };

  // Content for Main Menu
  const renderMainView = (mobile: boolean) => (
    <div className={mobile ? "space-y-1.5" : "space-y-0.5"}>
      {/* Quality Panel Option */}
      <button
        type="button"
        onClick={() => setCurrentView("quality")}
        className={`w-full flex items-center justify-between rounded-xl transition-colors text-left ${
          mobile
            ? "px-4 py-3.5 hover:bg-white/10 active:bg-white/15 text-sm"
            : "px-3 py-2 hover:bg-white/10 text-xs"
        }`}
      >
        <div className="flex items-center gap-3">
          <Sliders className={`${mobile ? "w-5 h-5" : "w-4 h-4"} text-[#EF3B4F] shrink-0`} />
          <span className="font-medium text-white">Quality</span>
        </div>
        <div className="flex items-center gap-1.5 text-[#9E9EB0]">
          <span className={`${mobile ? "text-xs" : "text-[11px]"} font-medium`}>{state.quality}</span>
          <ChevronRight className={mobile ? "w-4 h-4" : "w-3.5 h-3.5"} />
        </div>
      </button>

      {/* Playback Speed Option */}
      <button
        type="button"
        onClick={() => setCurrentView("speed")}
        className={`w-full flex items-center justify-between rounded-xl transition-colors text-left ${
          mobile
            ? "px-4 py-3.5 hover:bg-white/10 active:bg-white/15 text-sm"
            : "px-3 py-2 hover:bg-white/10 text-xs"
        }`}
      >
        <div className="flex items-center gap-3">
          <Gauge className={`${mobile ? "w-5 h-5" : "w-4 h-4"} text-[#8E8EA0] shrink-0`} />
          <span className="font-medium text-white">Playback speed</span>
        </div>
        <div className="flex items-center gap-1.5 text-[#9E9EB0]">
          <span className={`${mobile ? "text-xs" : "text-[11px]"} font-medium`}>
            {state.playbackRate === 1 ? "Normal" : `${state.playbackRate}x`}
          </span>
          <ChevronRight className={mobile ? "w-4 h-4" : "w-3.5 h-3.5"} />
        </div>
      </button>

      <div className={`h-px bg-white/10 ${mobile ? "my-2" : "my-1"}`} />

      {/* Ambient Mode Toggle */}
      <button
        type="button"
        onClick={controls.toggleAmbientMode}
        className={`w-full flex items-center justify-between rounded-xl transition-colors text-left ${
          mobile
            ? "px-4 py-3.5 hover:bg-white/10 active:bg-white/15 text-sm"
            : "px-3 py-2 hover:bg-white/10 text-xs"
        }`}
      >
        <div className="flex items-center gap-3">
          <Sparkles className={`${mobile ? "w-5 h-5" : "w-4 h-4"} text-amber-400 shrink-0`} />
          <span className="text-white">Ambient glow</span>
        </div>
        <div
          className={`w-10 h-5 sm:w-8 sm:h-4 rounded-full transition-colors relative ${
            state.isAmbientMode ? "bg-[#EF3B4F]" : "bg-white/20"
          }`}
        >
          <div
            className={`w-4 h-4 sm:w-3.5 sm:h-3.5 rounded-full bg-white transition-transform absolute top-0.5 sm:top-0.25 ${
              state.isAmbientMode ? "translate-x-5 sm:translate-x-4" : "translate-x-0.5"
            }`}
          />
        </div>
      </button>

      {/* Loop Video Toggle */}
      <button
        type="button"
        onClick={controls.toggleLoop}
        className={`w-full flex items-center justify-between rounded-xl transition-colors text-left ${
          mobile
            ? "px-4 py-3.5 hover:bg-white/10 active:bg-white/15 text-sm"
            : "px-3 py-2 hover:bg-white/10 text-xs"
        }`}
      >
        <div className="flex items-center gap-3">
          <Repeat className={`${mobile ? "w-5 h-5" : "w-4 h-4"} text-[#8E8EA0] shrink-0`} />
          <span className="text-white">Loop video</span>
        </div>
        <div
          className={`w-10 h-5 sm:w-8 sm:h-4 rounded-full transition-colors relative ${
            state.isLooping ? "bg-[#EF3B4F]" : "bg-white/20"
          }`}
        >
          <div
            className={`w-4 h-4 sm:w-3.5 sm:h-3.5 rounded-full bg-white transition-transform absolute top-0.5 sm:top-0.25 ${
              state.isLooping ? "translate-x-5 sm:translate-x-4" : "translate-x-0.5"
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
        className={`w-full flex items-center justify-between rounded-xl transition-colors text-left ${
          mobile
            ? "px-4 py-3.5 hover:bg-white/10 active:bg-white/15 text-sm"
            : "px-3 py-2 hover:bg-white/10 text-xs"
        }`}
      >
        <div className="flex items-center gap-3">
          <Tv className={`${mobile ? "w-5 h-5" : "w-4 h-4"} text-[#8E8EA0] shrink-0`} />
          <span className="text-white">Picture-in-picture</span>
        </div>
      </button>

      <div className={`h-px bg-white/10 ${mobile ? "my-2" : "my-1"}`} />

      {/* Stats for nerds */}
      <button
        type="button"
        onClick={() => {
          controls.toggleStats();
          if (mobile) onClose();
        }}
        className={`w-full flex items-center justify-between rounded-xl transition-colors text-left ${
          mobile
            ? "px-4 py-3.5 hover:bg-white/10 active:bg-white/15 text-sm"
            : "px-3 py-2 hover:bg-white/10 text-xs"
        }`}
      >
        <div className="flex items-center gap-3">
          <BarChart2 className={`${mobile ? "w-5 h-5" : "w-4 h-4"} text-[#8E8EA0] shrink-0`} />
          <span className="text-white">Stats for nerds</span>
        </div>
        <div
          className={`w-10 h-5 sm:w-8 sm:h-4 rounded-full transition-colors relative ${
            state.isStatsOpen ? "bg-[#EF3B4F]" : "bg-white/20"
          }`}
        >
          <div
            className={`w-4 h-4 sm:w-3.5 sm:h-3.5 rounded-full bg-white transition-transform absolute top-0.5 sm:top-0.25 ${
              state.isStatsOpen ? "translate-x-5 sm:translate-x-4" : "translate-x-0.5"
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
        className={`w-full flex items-center justify-between rounded-xl transition-colors text-left ${
          mobile
            ? "px-4 py-3.5 hover:bg-white/10 active:bg-white/15 text-sm"
            : "px-3 py-2 hover:bg-white/10 text-xs"
        }`}
      >
        <div className="flex items-center gap-3">
          <Keyboard className={`${mobile ? "w-5 h-5" : "w-4 h-4"} text-[#8E8EA0] shrink-0`} />
          <span className="text-white">Keyboard shortcuts</span>
        </div>
      </button>
    </div>
  );

  // Content for Quality Subview
  const renderQualityView = (mobile: boolean) => (
    <div>
      <div className={`flex items-center gap-2 border-b border-white/10 pb-2 mb-2 ${mobile ? "px-2" : "px-1"}`}>
        <button
          type="button"
          onClick={() => setCurrentView("main")}
          className="p-1.5 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-colors"
          aria-label="Back to main settings"
        >
          <ChevronLeft className={mobile ? "w-5 h-5" : "w-4 h-4"} />
        </button>
        <span className={`${mobile ? "text-base" : "text-xs"} font-semibold text-white`}>
          Select Quality
        </span>
      </div>

      <div className={`space-y-1 ${mobile ? "max-h-[60vh] overflow-y-auto" : "max-h-56 overflow-y-auto"}`}>
        {PLAYER_CONFIG.AVAILABLE_QUALITIES.map((q) => {
          const isSelected = state.quality === q;
          return (
            <button
              key={q}
              type="button"
              onClick={() => handleQualitySelect(q)}
              className={`w-full flex items-center justify-between rounded-xl text-left transition-colors ${
                mobile ? "px-4 py-3.5 text-sm" : "px-3 py-2 text-xs"
              } ${
                isSelected
                  ? "bg-[#EF3B4F]/20 text-[#EF3B4F] font-semibold"
                  : "hover:bg-white/10 text-white/90"
              }`}
            >
              <span>{q}</span>
              {isSelected && <Check className={mobile ? "w-5 h-5 text-[#EF3B4F]" : "w-4 h-4 text-[#EF3B4F]"} />}
            </button>
          );
        })}
      </div>
    </div>
  );

  // Content for Speed Subview
  const renderSpeedView = (mobile: boolean) => (
    <div>
      <div className={`flex items-center gap-2 border-b border-white/10 pb-2 mb-2 ${mobile ? "px-2" : "px-1"}`}>
        <button
          type="button"
          onClick={() => setCurrentView("main")}
          className="p-1.5 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-colors"
          aria-label="Back to main settings"
        >
          <ChevronLeft className={mobile ? "w-5 h-5" : "w-4 h-4"} />
        </button>
        <span className={`${mobile ? "text-base" : "text-xs"} font-semibold text-white`}>
          Playback Speed
        </span>
      </div>

      <div className={`space-y-1 ${mobile ? "max-h-[60vh] overflow-y-auto" : "max-h-56 overflow-y-auto"}`}>
        {PLAYER_CONFIG.AVAILABLE_PLAYBACK_RATES.map((rate) => {
          const isSelected = state.playbackRate === rate;
          return (
            <button
              key={rate}
              type="button"
              onClick={() => handleSpeedSelect(rate)}
              className={`w-full flex items-center justify-between rounded-xl text-left transition-colors ${
                mobile ? "px-4 py-3.5 text-sm" : "px-3 py-2 text-xs"
              } ${
                isSelected
                  ? "bg-[#EF3B4F]/20 text-[#EF3B4F] font-semibold"
                  : "hover:bg-white/10 text-white/90"
              }`}
            >
              <span>{rate === 1 ? "Normal (1x)" : `${rate}x`}</span>
              {isSelected && <Check className={mobile ? "w-5 h-5 text-[#EF3B4F]" : "w-4 h-4 text-[#EF3B4F]"} />}
            </button>
          );
        })}
      </div>
    </div>
  );

  // On Mobile: Render as a Mobile Bottom Sheet attached to body
  if (isMobile && mounted) {
    return createPortal(
      <div className="fixed inset-0 z-50 flex flex-col justify-end" onClick={onClose}>
        {/* Backdrop overlay */}
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs transition-opacity animate-in fade-in duration-200" />

        {/* Bottom Sheet Drawer */}
        <div
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-h-[85vh] bg-[#14141C] border-t border-[#2A2A3E] rounded-t-3xl p-5 pb-8 overflow-y-auto shadow-2xl animate-in slide-in-from-bottom duration-250 select-none"
        >
          {/* Grab handle indicator */}
          <div className="w-12 h-1 bg-white/25 rounded-full mx-auto mb-4" />

          {/* Header */}
          <div className="flex items-center justify-between pb-3 mb-2 border-b border-white/10">
            <h3 className="text-base font-bold text-white tracking-tight">
              {currentView === "main" ? "Player Settings" : currentView === "quality" ? "Quality Settings" : "Playback Speed"}
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full bg-white/10 text-white/80 hover:text-white"
              aria-label="Close settings"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Views */}
          {currentView === "main" && renderMainView(true)}
          {currentView === "quality" && renderQualityView(true)}
          {currentView === "speed" && renderSpeedView(true)}
        </div>
      </div>,
      document.body
    );
  }

  // On Desktop: Render as floating popover within player
  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="absolute bottom-12 right-0 z-40 w-64 rounded-xl bg-[#121218]/95 backdrop-blur-lg border border-white/15 shadow-2xl p-2 text-xs text-white select-none animate-in fade-in zoom-in-95 duration-150 max-h-[80%] overflow-y-auto"
    >
      {currentView === "main" && renderMainView(false)}
      {currentView === "quality" && renderQualityView(false)}
      {currentView === "speed" && renderSpeedView(false)}
    </div>
  );
}

