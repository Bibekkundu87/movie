"use client";

import React from "react";
import { AlertCircle, RefreshCw, Play } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface PlayerOverlayProps {
  error: string | null;
  onRetry: () => void;
  showBigPlay?: boolean;
  onPlayClick?: () => void;
}

export function PlayerOverlay({
  error,
  onRetry,
  showBigPlay = false,
  onPlayClick,
}: PlayerOverlayProps) {
  if (error) {
    return (
      <div className="absolute inset-0 z-30 flex flex-col items-center justify-center p-6 bg-[#101014]/95 text-center touch-manipulation">
        <div className="w-14 h-14 rounded-full bg-red-950/60 border border-red-800/80 flex items-center justify-center text-red-400 mb-4">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">Streaming Playback Error</h3>
        <p className="text-sm text-[#9E9EB0] max-w-md mb-6 leading-relaxed">
          {error}
        </p>
        <Button variant="primary" onClick={onRetry}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Retry Stream
        </Button>
      </div>
    );
  }

  if (showBigPlay) {
    return (
      <div
        role="button"
        tabIndex={0}
        onClick={onPlayClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onPlayClick?.();
          }
        }}
        aria-label="Touch to play video"
        className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/30 backdrop-blur-[0.5px] cursor-pointer group touch-manipulation select-none transition-all duration-200"
      >
        <div className="relative flex flex-col items-center gap-3">
          {/* YouTube Iconic Play Center Button */}
          <div className="w-18 h-18 sm:w-22 sm:h-22 rounded-full bg-black/75 backdrop-blur-md border border-white/25 text-white flex items-center justify-center shadow-2xl ring-4 ring-white/10 group-hover:scale-110 group-hover:bg-[#EF3B4F] group-hover:border-[#EF3B4F] group-hover:ring-[#EF3B4F]/30 active:scale-95 transition-all duration-200">
            <Play className="w-9 h-9 sm:w-11 sm:h-11 fill-current ml-1 text-white" />
          </div>
          {/* Touch to play prompt badge */}
          <div className="px-3.5 py-1 rounded-full bg-black/70 backdrop-blur-sm border border-white/15 text-white/90 text-xs font-semibold tracking-wide shadow-lg group-hover:text-white group-hover:border-white/30 transition-all">
            Touch to play
          </div>
        </div>
      </div>
    );
  }

  return null;
}
