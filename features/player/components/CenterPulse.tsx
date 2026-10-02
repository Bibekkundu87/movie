"use client";

import React from "react";
import { Play, Pause } from "lucide-react";

interface CenterPulseProps {
  action: "play" | "pause" | null;
  visible: boolean;
}

export function CenterPulse({ action, visible }: CenterPulseProps) {
  if (!visible || !action) return null;

  return (
    <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center">
      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-black/65 backdrop-blur-sm border border-white/20 text-white flex items-center justify-center shadow-2xl animate-ping-once transition-all duration-300">
        {action === "play" ? (
          <Play className="w-8 h-8 sm:w-10 sm:h-10 fill-current ml-1 text-white" />
        ) : (
          <Pause className="w-8 h-8 sm:w-10 sm:h-10 fill-current text-white" />
        )}
      </div>
    </div>
  );
}
