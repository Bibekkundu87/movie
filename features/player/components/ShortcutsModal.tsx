"use client";

import React from "react";
import { X, Keyboard } from "lucide-react";

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SHORTCUT_GROUPS = [
  {
    title: "Playback",
    shortcuts: [
      { key: "k / Space", desc: "Toggle play / pause" },
      { key: "j", desc: "Rewind 10 seconds" },
      { key: "l", desc: "Fast forward 10 seconds" },
      { key: "← / →", desc: "Seek backward / forward 5s" },
      { key: "0 ... 9", desc: "Seek to 0% ... 90% of duration" },
    ],
  },
  {
    title: "Audio & Quality",
    shortcuts: [
      { key: "m", desc: "Mute / unmute audio" },
      { key: "↑ / ↓", desc: "Increase / decrease volume 10%" },
      { key: "< / >", desc: "Decrease / increase playback speed" },
    ],
  },
  {
    title: "Display & Navigation",
    shortcuts: [
      { key: "f", desc: "Toggle fullscreen mode" },
      { key: "t", desc: "Toggle theater mode" },
      { key: "i", desc: "Toggle miniplayer / picture-in-picture" },
      { key: "Double-click edges", desc: "Rewind (left) / Forward (right) 10s" },
      { key: "Double-click center", desc: "Toggle fullscreen" },
    ],
  },
];

export function ShortcutsModal({ isOpen, onClose }: ShortcutsModalProps) {
  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg rounded-2xl bg-[#14141C] border border-[#262638] shadow-2xl p-4 sm:p-6 text-white max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between pb-4 border-b border-[#242436] mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#EF3B4F]/20 text-[#EF3B4F] flex items-center justify-center">
              <Keyboard className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Keyboard Shortcuts
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-[#8E8EA0] hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-5">
          {SHORTCUT_GROUPS.map((group) => (
            <div key={group.title}>
              <h4 className="text-xs font-bold text-[#8E8EA0] uppercase tracking-wider mb-2.5">
                {group.title}
              </h4>
              <div className="space-y-2 text-xs">
                {group.shortcuts.map((sc) => (
                  <div
                    key={sc.key}
                    className="flex items-center justify-between py-1 border-b border-[#1C1C28]"
                  >
                    <span className="text-[#B0B0C0]">{sc.desc}</span>
                    <kbd className="px-2 py-0.5 rounded bg-[#20202E] border border-[#303042] text-white font-mono text-[11px] shadow-sm">
                      {sc.key}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
