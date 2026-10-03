"use client";

import React, { useState } from "react";
import Link from "next/link";
import { RefreshCw, Play, SlidersHorizontal, Menu, X, Library, Clock, Sparkles } from "lucide-react";
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleMobileNavClick = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#1E1E28] bg-[#101014]/90 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Wordmark */}
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

        {/* Zone 2: Desktop clean navigation links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#8E8EA0]">
          <Link
            href="/"
            className="text-white hover:text-[#EF3B4F] transition-colors"
          >
            Library
          </Link>
          <a
            href="/#recent"
            className="hover:text-white transition-colors"
          >
            Recent Videos
          </a>
        </nav>

        {/* Zone 3: Actions (Desktop & Mobile) */}
        <div className="flex items-center gap-2">
          {/* Drive Simulator (visible on desktop or tablet) */}
          {onToggleSimulator && (
            <Button
              variant={isSimulatorOpen ? "primary" : "secondary"}
              size="sm"
              onClick={onToggleSimulator}
              title="Toggle Google Drive test simulator"
              className="text-xs hidden sm:inline-flex"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 mr-1" />
              <span>Drive Simulator</span>
            </Button>
          )}

          {/* Sync Button */}
          {onSync && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSync()}
              isLoading={isSyncing}
              title="Synchronize Google Drive library now"
              className="text-xs h-9 px-3"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 mr-1 sm:mr-1.5 ${isSyncing ? "animate-spin text-[#EF3B4F]" : ""}`}
              />
              <span className="hidden sm:inline">Sync Library</span>
              <span className="sm:hidden">Sync</span>
            </Button>
          )}

          {/* Mobile Hamburger Menu Button */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            aria-label={isMobileMenuOpen ? "Close menu" : "Open navigation menu"}
            className="md:hidden p-2 rounded-lg text-[#8E8EA0] hover:text-white hover:bg-white/10 active:scale-95 transition-all focus-visible:outline-none"
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5 text-white" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer / Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-[#1E1E28] bg-[#121218]/98 backdrop-blur-xl px-4 py-5 shadow-2xl animate-in slide-in-from-top-2 duration-200">
          <div className="space-y-4">
            {/* Navigation Links */}
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-[#6E6E82] uppercase tracking-wider px-2 block mb-1">
                Navigation
              </span>
              <Link
                href="/"
                onClick={handleMobileNavClick}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white hover:bg-white/10 active:bg-white/15 transition-colors"
              >
                <Library className="w-4 h-4 text-[#EF3B4F]" />
                <span>Library Overview</span>
              </Link>
              <a
                href="/#recent"
                onClick={handleMobileNavClick}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#B0B0C0] hover:text-white hover:bg-white/10 active:bg-white/15 transition-colors"
              >
                <Clock className="w-4 h-4 text-[#8E8EA0]" />
                <span>Recent Videos</span>
              </a>
            </div>

            {/* Quick Actions */}
            <div className="pt-3 border-t border-[#20202E] space-y-2">
              <span className="text-[11px] font-semibold text-[#6E6E82] uppercase tracking-wider px-2 block mb-1">
                Google Drive Tools
              </span>

              {onToggleSimulator && (
                <button
                  type="button"
                  onClick={() => {
                    onToggleSimulator();
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isSimulatorOpen
                      ? "bg-[#EF3B4F]/20 text-[#EF3B4F] border border-[#EF3B4F]/30"
                      : "bg-[#181822] text-white hover:bg-[#20202E]"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <SlidersHorizontal className="w-4 h-4" />
                    <span>Drive Simulator Drawer</span>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/10">
                    {isSimulatorOpen ? "Open" : "Test"}
                  </span>
                </button>
              )}

              {onSync && (
                <button
                  type="button"
                  onClick={() => {
                    onSync();
                    setIsMobileMenuOpen(false);
                  }}
                  disabled={isSyncing}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium bg-[#181822] text-white hover:bg-[#20202E] transition-colors disabled:opacity-50"
                >
                  <div className="flex items-center gap-2.5">
                    <RefreshCw className={`w-4 h-4 ${isSyncing ? "animate-spin text-[#EF3B4F]" : ""}`} />
                    <span>Force Library Sync</span>
                  </div>
                  <span className="text-[11px] text-[#8E8EA0]">SWR 30s</span>
                </button>
              )}
            </div>

            {/* App Info Badge */}
            <div className="pt-2">
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#161622] text-[11px] text-[#8E8EA0]">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Streaming via HTTP Range RFC 7233</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

