"use client";

import React from "react";
import { RotateCcw, RotateCw } from "lucide-react";

export type DoubleTapDirection = "left" | "right" | null;

interface DoubleTapRippleProps {
  direction: DoubleTapDirection;
  visible: boolean;
}

export function DoubleTapRipple({ direction, visible }: DoubleTapRippleProps) {
  if (!visible || !direction) return null;

  const isLeft = direction === "left";

  return (
    <div
      className={`absolute inset-y-0 z-30 pointer-events-none flex items-center justify-center overflow-hidden w-[40%] transition-opacity duration-300 ${
        isLeft ? "left-0" : "right-0"
      }`}
    >
      {/* Curved ripple background imitating YouTube app & web double-tap */}
      <div
        className={`absolute inset-0 bg-white/15 backdrop-blur-xs flex items-center justify-center animate-pulse ${
          isLeft
            ? "rounded-r-full origin-left"
            : "rounded-l-full origin-right"
        }`}
      >
        <div className="flex flex-col items-center justify-center gap-1 text-white">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-black/60 shadow-lg">
            {isLeft ? (
              <RotateCcw className="w-6 h-6 text-white animate-spin-reverse" />
            ) : (
              <RotateCw className="w-6 h-6 text-white animate-spin-once" />
            )}
          </div>
          <div className="text-xs font-bold tracking-wider font-sans bg-black/70 px-2.5 py-1 rounded-full text-white shadow-md">
            {isLeft ? "10 seconds" : "10 seconds"}
          </div>
        </div>
      </div>
    </div>
  );
}
