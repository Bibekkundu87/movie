import React from "react";

export function PlayerLoader({ isBuffering = false }: { isBuffering?: boolean }) {
  return (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/40 backdrop-blur-[2px] pointer-events-none">
      <div className="relative w-14 h-14">
        {/* Outer Ring */}
        <div className="absolute inset-0 rounded-full border-4 border-[#2A2A38]" />
        {/* Spinning Red Accent */}
        <div className="absolute inset-0 rounded-full border-4 border-[#EF3B4F] border-t-transparent animate-spin" />
      </div>
      {isBuffering && (
        <p className="mt-3 text-xs font-medium text-white/90 tracking-wide uppercase">
          Buffering stream...
        </p>
      )}
    </div>
  );
}
