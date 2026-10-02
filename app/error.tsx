"use client";

import React, { useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { AlertCircle, RefreshCw } from "lucide-react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("StreamBox Application Error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#101014] text-white flex flex-col items-center justify-center p-6 text-center">
      <div className="w-14 h-14 rounded-full bg-red-950/60 border border-red-800/80 flex items-center justify-center text-red-400 mb-4">
        <AlertCircle className="w-7 h-7" />
      </div>

      <h2 className="text-xl font-bold tracking-tight text-white mb-2">
        Something went wrong
      </h2>

      <p className="text-sm text-[#8E8EA0] max-w-md mb-6 leading-relaxed">
        {error?.message || "An unexpected error occurred while loading the video stream or library."}
      </p>

      <div className="flex items-center gap-3">
        <Button variant="primary" onClick={() => reset()}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </Button>
        <Button variant="secondary" onClick={() => window.location.href = "/"}>
          Return to Library
        </Button>
      </div>
    </div>
  );
}
