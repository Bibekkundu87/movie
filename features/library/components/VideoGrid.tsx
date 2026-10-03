import React from "react";
import { Video } from "@/types/video";
import { VideoCard } from "./VideoCard";

interface VideoGridProps {
  videos: Video[];
  emptyMessage?: string;
}

export function VideoGrid({ videos }: VideoGridProps) {
  if (videos.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-5 md:gap-6">
      {videos.map((video, index) => (
        <VideoCard
          key={video.id}
          video={video}
          priority={index < 4}
        />
      ))}
    </div>
  );
}
