import React from "react";

export function VideoCardSkeleton() {
  return (
    <div className="flex flex-col gap-2.5 animate-pulse">
      {/* 16:9 Thumbnail skeleton */}
      <div className="w-full aspect-video rounded-lg bg-[#1A1A22] border border-[#242430]" />

      {/* Title skeleton */}
      <div className="space-y-1.5 px-0.5">
        <div className="h-4 bg-[#20202A] rounded w-4/5" />
        <div className="h-3 bg-[#181822] rounded w-1/2" />
      </div>
    </div>
  );
}

export function VideoGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <VideoCardSkeleton key={`skeleton-${i}`} />
      ))}
    </div>
  );
}
