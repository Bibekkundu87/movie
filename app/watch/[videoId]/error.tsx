"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, RefreshCw, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function WatchError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Watch Page Error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#101014] text-white flex flex-col items-center justify-center p-6 text-center">
      <div className="w-14 h-14 rounded-full bg-red-950/60 border border-red-800/80 flex items-center justify-center text-red-400 mb-4">
        <AlertTriangle className="w-7 h-7" />
      </div>

      <h2 className="text-xl font-bold tracking-tight text-white mb-2">
        Playback Stream Unavailable
      </h2>

      <p className="text-sm text-[#8E8EA0] max-w-md mb-6 leading-relaxed">
        {error?.message || "Unable to initiate playback stream from the server. The Google Drive file may be restricted or unavailable."}
      </p>

      <div className="flex items-center gap-3">
        <Button variant="primary" onClick={() => reset()}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Retry Playback
        </Button>
        <Link href="/">
          <Button variant="secondary">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Library
          </Button>
        </Link>
      </div>
    </div>
  );
}
