"use client";

import React, { useState, useEffect } from "react";
import { CheckCircle2, RefreshCw, HardDrive, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface LibraryStatusProps {
  isValidating: boolean;
  lastSyncedAt: Date;
  totalVideos: number;
  onRefresh: () => Promise<unknown>;
  error?: string | null;
  isMockMode?: boolean;
}

export function LibraryStatus({
  isValidating,
  lastSyncedAt,
  totalVideos,
  onRefresh,
  error,
  isMockMode = false,
}: LibraryStatusProps) {
  const [timeAgo, setTimeAgo] = useState<string>("Just now");

  useEffect(() => {
    const updateTimeAgo = () => {
      const now = Date.now();
      const diffSeconds = Math.max(0, Math.floor((now - lastSyncedAt.getTime()) / 1000));

      if (diffSeconds < 10) {
        setTimeAgo("Just now");
      } else if (diffSeconds < 60) {
        setTimeAgo(`${diffSeconds}s ago`);
      } else {
        const mins = Math.floor(diffSeconds / 60);
        setTimeAgo(`${mins}m ago`);
      }
    };

    updateTimeAgo();
    const interval = setInterval(updateTimeAgo, 5000);
    return () => clearInterval(interval);
  }, [lastSyncedAt]);

  return (
    <div
      id="status"
      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:px-5 rounded-xl bg-[#14141A] border border-[#20202B] text-xs text-[#8E8EA0] mb-8"
    >
      {/* Left: Sync state indicator */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          {error ? (
            <span className="flex items-center gap-1.5 text-amber-400 font-medium">
              <AlertTriangle className="w-3.5 h-3.5" />
              Sync Interrupted
            </span>
          ) : isValidating ? (
            <span className="flex items-center gap-1.5 text-[#EF3B4F] font-medium">
              <span className="w-2 h-2 rounded-full bg-[#EF3B4F] animate-ping" />
              Scanning Google Drive...
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Drive Synced
            </span>
          )}
        </div>

        <span aria-hidden="true" className="text-[#353545]">·</span>

        <span className="flex items-center gap-1">
          <HardDrive className="w-3.5 h-3.5 text-[#636375]" />
          <span className="text-white font-medium font-mono tabular-nums">{totalVideos}</span>
          <span>{totalVideos === 1 ? "video indexed" : "videos indexed"}</span>
        </span>

        <span aria-hidden="true" className="text-[#353545]">·</span>

        <span>Synced {timeAgo}</span>
      </div>

      {/* Right: Refresh trigger and mock note */}
      <div className="flex items-center gap-3">
        {isMockMode && (
          <span className="text-[#EF3B4F] font-mono text-[11px] bg-[#EF3B4F]/10 px-2 py-0.5 rounded border border-[#EF3B4F]/20">
            Mock Simulation Mode (30s poll)
          </span>
        )}

        <Button
          variant="ghost"
          size="sm"
          onClick={() => onRefresh()}
          disabled={isValidating}
          className="text-xs h-7 px-2.5 text-[#9E9EB0] hover:text-white"
        >
          <RefreshCw className={`w-3 h-3 mr-1 ${isValidating ? "animate-spin text-[#EF3B4F]" : ""}`} />
          Force Sync
        </Button>
      </div>
    </div>
  );
}
