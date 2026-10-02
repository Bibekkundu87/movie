import React from "react";
import { VideoGridSkeleton } from "@/features/library/components/VideoCardSkeleton";

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#101014] text-white">
      {/* Header skeleton */}
      <div className="h-16 border-b border-[#1E1E28] bg-[#101014] flex items-center px-6">
        <div className="w-28 h-6 bg-[#20202A] rounded animate-pulse" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* Status skeleton */}
        <div className="h-12 rounded-xl bg-[#161620] border border-[#20202A] animate-pulse" />
        {/* Hero skeleton */}
        <div className="w-full h-80 sm:h-96 rounded-2xl bg-[#161620] animate-pulse" />
        {/* Grid skeleton */}
        <VideoGridSkeleton count={10} />
      </div>
    </div>
  );
}
