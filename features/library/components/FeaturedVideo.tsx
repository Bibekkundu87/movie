"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Play, Info } from "lucide-react";
import { Video } from "@/types/video";
import { ROUTES } from "@/constants/routes";
import { Button } from "@/components/ui/Button";
import { formatDuration, formatBytes, formatDate } from "@/lib/utils";

interface FeaturedVideoProps {
  video: Video;
}

export function FeaturedVideo({ video }: FeaturedVideoProps) {
  const [imgSrc, setImgSrc] = useState(
    video.thumbnail || "/images/placeholder-poster.svg"
  );

  const durationStr = formatDuration(video.duration);
  const sizeStr = formatBytes(video.size);
  const dateStr = formatDate(video.createdAt);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden mb-10 border border-[#232330] bg-[#14141B]">
      {/* Aspect Ratio Container for Backdrop */}
      <div className="relative w-full h-[360px] sm:h-[440px] lg:h-[500px]">
        {/* Background Image */}
        <Image
          src={imgSrc}
          alt={video.title}
          fill
          priority
          referrerPolicy="no-referrer"
          onError={() => setImgSrc("/images/placeholder-poster.svg")}
          className="object-cover object-center"
        />

        {/* Cinematic Scrims (Left and Bottom Gradients) */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#101014] via-[#101014]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#101014] via-[#101014]/80 to-transparent" />

        {/* Content Box */}
        <div className="absolute inset-0 p-4 sm:p-10 lg:p-14 flex flex-col justify-end max-w-2xl">
          {/* Unboxed Metadata (Zero-pill discipline) */}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs sm:text-sm text-[#EF3B4F] font-medium tracking-wide mb-2">
            <span className="text-white font-semibold">Featured from Drive</span>
            <span aria-hidden="true" className="text-[#555566]">·</span>
            {durationStr && <span>{durationStr}</span>}
            {durationStr && sizeStr && <span aria-hidden="true" className="text-[#555566]">·</span>}
            {sizeStr && <span>{sizeStr}</span>}
            {dateStr && <span aria-hidden="true" className="text-[#555566]">·</span>}
            {dateStr && <span className="text-[#8E8EA0]">{dateStr}</span>}
          </div>

          {/* Title */}
          <h1 className="text-xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight mb-2 sm:mb-3 text-balance line-clamp-2 sm:line-clamp-none">
            {video.title}
          </h1>

          {/* Description */}
          {video.description && (
            <p className="text-xs sm:text-base text-[#B0B0C0] line-clamp-2 sm:line-clamp-3 mb-4 sm:mb-6 leading-relaxed">
              {video.description}
            </p>
          )}

          {/* Action CTAs */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <Link href={ROUTES.WATCH(video.id)}>
              <Button size="lg" className="h-10 sm:h-11 px-4 sm:px-6 shadow-lg shadow-[#EF3B4F]/20 text-xs sm:text-sm">
                <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current mr-2" />
                Play Now
              </Button>
            </Link>

            <Link href={ROUTES.WATCH(video.id)}>
              <Button variant="secondary" size="lg" className="h-10 sm:h-11 px-4 sm:px-6 text-xs sm:text-sm">
                <Info className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Details
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
