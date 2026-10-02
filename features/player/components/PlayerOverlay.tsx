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
      <div className="absolute inset-0 z-30 flex flex-col items-center justify-center p-6 bg-[#101014]/95 text-center">
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
        onClick={onPlayClick}
        className="absolute inset-0 z-10 flex items-center justify-center bg-black/30 cursor-pointer group"
      >
        <div className="w-20 h-20 rounded-full bg-[#EF3B4F] text-white flex items-center justify-center shadow-2xl transform group-hover:scale-110 transition-transform duration-200">
          <Play className="w-9 h-9 fill-current ml-1" />
        </div>
      </div>
    );
  }

  return null;
}
