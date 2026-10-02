"use client";

import React from "react";
import Link from "next/link";
import { RefreshCw, Play, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface HeaderProps {
  onSync?: () => Promise<unknown>;
  isSyncing?: boolean;
  onToggleSimulator?: () => void;
  isSimulatorOpen?: boolean;
}

export function Header({
  onSync,
  isSyncing = false,
  onToggleSimulator,
  isSimulatorOpen = false,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#1E1E28] bg-[#101014]/90 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Single text element wordmark (Display face, anti-slop) */}
        <Link
          href="/"
          className="flex items-center gap-2 group text-xl font-bold tracking-tight text-white focus-visible:outline-none"
        >
          <span className="w-8 h-8 rounded-lg bg-[#EF3B4F] flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform duration-200">
            <Play className="w-4 h-4 fill-current ml-0.5" />
          </span>
          <span className="tracking-tighter">
            Stream<span className="text-[#EF3B4F]">Box</span>
          </span>
        </Link>

        {/* Zone 2: Clean navigation links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#8E8EA0]">
          <Link
            href="/"
            className="text-white hover:text-[#EF3B4F] transition-colors"
          >
            Library
          </Link>
          <a
            href="#recent"
            className="hover:text-white transition-colors"
          >
            Recent Videos
          </a>
        </nav>

        {/* Zone 3: 1-2 primary actions */}
        <div className="flex items-center gap-2.5">
          {onToggleSimulator && (
            <Button
              variant={isSimulatorOpen ? "primary" : "secondary"}
              size="sm"
              onClick={onToggleSimulator}
              title="Toggle Google Drive test simulator"
              className="text-xs"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 mr-1" />
              <span className="hidden sm:inline">Drive Simulator</span>
              <span className="sm:hidden">Simulate</span>
            </Button>
          )}

          {onSync && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSync()}
              isLoading={isSyncing}
              title="Synchronize Google Drive library now"
              className="text-xs"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 mr-1 ${isSyncing ? "animate-spin text-[#EF3B4F]" : ""}`}
              />
              <span className="hidden sm:inline">Sync Library</span>
              <span className="sm:hidden">Sync</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
