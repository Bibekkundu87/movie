"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Play } from "lucide-react";
import { Video } from "@/types/video";
import { ROUTES } from "@/constants/routes";
import { formatDuration, formatBytes, formatDate } from "@/lib/utils";

interface VideoCardProps {
  video: Video;
  priority?: boolean;
}

export function VideoCard({ video, priority = false }: VideoCardProps) {
  const [imgSrc, setImgSrc] = useState<string>(
    video.thumbnail || "/images/placeholder-poster.svg"
  );
  const [hasError, setHasError] = useState(false);

  const durationStr = formatDuration(video.duration);
  const sizeStr = formatBytes(video.size);
  const dateStr = formatDate(video.createdAt);

  return (
    <Link
      href={ROUTES.WATCH(video.id)}
      className="group flex flex-col focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EF3B4F] focus-visible:ring-offset-2 focus-visible:ring-offset-[#101014] rounded-lg transition-transform duration-200"
    >
      {/* 16:9 Thumbnail Container */}
      <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-[#16161E] border border-[#23232E] group-hover:border-[#38384A] transition-colors duration-200">
        <Image
          src={hasError ? "/images/placeholder-poster.svg" : imgSrc}
          alt={video.title}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          priority={priority}
          loading={priority ? undefined : "lazy"}
          referrerPolicy="no-referrer"
          onError={() => {
            setHasError(true);
            setImgSrc("/images/placeholder-poster.svg");
          }}
          className="object-cover group-hover:scale-105 transition-transform duration-300 ease-out"
        />

        {/* Hover play gradient scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
          <div className="w-11 h-11 rounded-full bg-[#EF3B4F] text-white flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform duration-200">
            <Play className="w-5 h-5 fill-current ml-0.5" />
          </div>
        </div>

        {/* Subtle duration badge placed quietly in bottom corner */}
        {durationStr && (
          <div className="absolute bottom-1.5 right-1.5 bg-black/80 backdrop-blur-xs text-white text-[11px] font-mono tabular-nums px-1.5 py-0.5 rounded">
            {durationStr}
          </div>
        )}
      </div>

      {/* Video Information (No pill sandwiches, unboxed metadata) */}
      <div className="mt-2.5 px-0.5">
        <h4 className="text-sm font-semibold text-white tracking-tight leading-snug line-clamp-2 group-hover:text-[#EF3B4F] transition-colors">
          {video.title}
        </h4>

        {/* Unboxed Metadata with Typographic Separators */}
        <div className="flex items-center gap-1.5 mt-1 text-[12px] text-[#8E8EA0] leading-none">
          {dateStr && <span>{dateStr}</span>}
          {dateStr && sizeStr && <span aria-hidden="true" className="text-[#4E4E60]">·</span>}
          {sizeStr && <span className="font-mono tabular-nums">{sizeStr}</span>}
        </div>
      </div>
    </Link>
  );
}
