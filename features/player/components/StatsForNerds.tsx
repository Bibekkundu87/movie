"use client";

import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { PlayerState } from "@/types/player";

interface StatsForNerdsProps {
  isOpen: boolean;
  onClose: () => void;
  state: PlayerState;
  title: string;
}

export function StatsForNerds({ isOpen, onClose, state, title }: StatsForNerdsProps) {
  const [viewportDim, setViewportDim] = useState({ w: 1280, h: 720 });

  useEffect(() => {
    if (typeof window !== "undefined") {
      setViewportDim({ w: window.innerWidth, h: window.innerHeight });
      const handleResize = () => {
        setViewportDim({ w: window.innerWidth, h: window.innerHeight });
      };
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);

  if (!isOpen) return null;

  const bufferSeconds = Math.max(0, state.bufferedTime - state.currentTime).toFixed(2);
  const normalizedVol = Math.round(state.volume * 100);

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="absolute top-2 left-2 right-2 sm:right-auto sm:top-4 sm:left-4 z-40 sm:w-80 max-h-[calc(100%-1rem)] overflow-y-auto p-2.5 sm:p-3 rounded-lg bg-black/90 backdrop-blur-md border border-white/20 text-white font-mono text-[10px] sm:text-[11px] shadow-2xl select-none"
    >
      <div className="flex items-center justify-between border-b border-white/10 pb-1.5 mb-2 sticky top-0 bg-black/90 pt-0.5">
        <span className="font-bold text-white/90">Stats for nerds</span>
        <button
          type="button"
          onClick={onClose}
          className="text-white/70 hover:text-white p-1 rounded-md hover:bg-white/10"
          aria-label="Close stats"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-1 text-white/80">
        <div className="flex justify-between">
          <span className="text-white/50">Video:</span>
          <span className="truncate max-w-[170px] text-right">{title}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-white/50">Quality:</span>
          <span className="text-emerald-400 font-bold">{state.quality}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-white/50">Viewport:</span>
          <span>{viewportDim.w} x {viewportDim.h}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-white/50">Current / Opt Res:</span>
          <span>1920x1080@60 / 1920x1080</span>
        </div>

        <div className="flex justify-between">
          <span className="text-white/50">Codecs:</span>
          <span>avc1.64002a (137) / mp4a.40.2</span>
        </div>

        <div className="flex justify-between">
          <span className="text-white/50">Color:</span>
          <span>bt709 / bt709 / bt709</span>
        </div>

        <div className="flex justify-between">
          <span className="text-white/50">Buffer Health:</span>
          <span className={Number(bufferSeconds) < 2 ? "text-amber-400" : "text-emerald-400"}>
            {bufferSeconds} s
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-white/50">Live Latency:</span>
          <span>0.00 s</span>
        </div>

        <div className="flex justify-between">
          <span className="text-white/50">Speed:</span>
          <span>{state.playbackRate}x</span>
        </div>

        <div className="flex justify-between">
          <span className="text-white/50">Volume / Normalized:</span>
          <span>{state.isMuted ? "0% (muted)" : `${normalizedVol}%`}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-white/50">Protocol:</span>
          <span className="text-white/90">HTTP Range (RFC 7233)</span>
        </div>
      </div>
    </div>
  );
}
