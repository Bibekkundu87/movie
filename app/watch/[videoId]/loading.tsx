import React from "react";

export default function WatchLoading() {
  return (
    <div className="min-h-screen bg-[#101014] text-white">
      {/* Header skeleton */}
      <div className="h-16 border-b border-[#1E1E28] bg-[#101014]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* Back button skeleton */}
        <div className="w-32 h-4 bg-[#1E1E28] rounded" />

        {/* Player skeleton */}
        <div className="w-full aspect-video bg-[#181822] rounded-xl border border-[#242430] animate-pulse" />

        {/* Title and details skeleton */}
        <div className="space-y-3">
          <div className="w-3/4 h-8 bg-[#20202A] rounded animate-pulse" />
          <div className="w-1/3 h-4 bg-[#1A1A22] rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
}
