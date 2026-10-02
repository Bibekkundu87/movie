"use client";

export const dynamic = "force-dynamic";

import React, { use, useState } from "react";
import Link from "next/link";
import { ArrowLeft, HardDrive, Calendar, Clock, FileVideo, AlertCircle, Share2, Check } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { PageContainer } from "@/components/layout/PageContainer";
import { VideoPlayer } from "@/features/player/components/VideoPlayer";
import { VideoCard } from "@/features/library/components/VideoCard";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { useVideos } from "@/features/library/hooks/useVideos";
import { formatDuration, formatBytes, formatDate } from "@/lib/utils";

export default function WatchPage({
  params,
}: {
  params: Promise<{ videoId: string }>;
}) {
  const { videoId } = use(params);
  const { videos, isLoading, refresh } = useVideos();
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  // Find the requested video from the synchronized library
  const currentVideo = videos.find((v) => v.id === videoId);

  // Other videos in the library for quick binge watching
  const otherVideos = videos.filter((v) => v.id !== videoId);

  if (isLoading && videos.length === 0) {
    return (
      <div className="min-h-screen bg-[#101014] text-white">
        <Header />
        <PageContainer className="pt-8 flex flex-col items-center justify-center min-h-[60vh]">
          <Spinner size="lg" />
          <p className="mt-4 text-sm text-[#8E8EA0]">
            Connecting to Google Drive streaming endpoint...
          </p>
        </PageContainer>
      </div>
    );
  }

  // Handle deleted or unavailable video gracefully
  if (!currentVideo && !isLoading) {
    return (
      <div className="min-h-screen bg-[#101014] text-white">
        <Header />
        <PageContainer className="pt-16 flex flex-col items-center justify-center text-center">
          <div className="w-14 h-14 rounded-full bg-amber-950/60 border border-amber-800/80 flex items-center justify-center text-amber-400 mb-4">
            <AlertCircle className="w-7 h-7" />
          </div>

          <h2 className="text-xl font-bold tracking-tight text-white mb-2">
            Video Unavailable or Removed
          </h2>

          <p className="text-sm text-[#8E8EA0] max-w-md mb-6 leading-relaxed">
            The video with ID &quot;<span className="text-white font-mono">{videoId}</span>&quot; could not be located in your Google Drive library. It may have been deleted, moved, or renamed in Google Drive.
          </p>

          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="primary">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Library
              </Button>
            </Link>
            <Button variant="secondary" onClick={() => refresh()}>
              Refresh Drive Index
            </Button>
          </div>
        </PageContainer>
      </div>
    );
  }

  if (!currentVideo) {
    return null;
  }

  const durationFormatted = formatDuration(currentVideo.duration);
  const sizeFormatted = formatBytes(currentVideo.size);
  const dateFormatted = formatDate(currentVideo.createdAt);

  return (
    <div className="min-h-screen bg-[#101014] text-white">
      <Header />

      <PageContainer className="pt-6">
        {/* Back navigation button */}
        <div className="mb-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-medium text-[#8E8EA0] hover:text-white transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Video Library</span>
          </Link>
        </div>

        {/* Video Player */}
        <div className="w-full mb-6">
          <VideoPlayer
            streamUrl={currentVideo.streamUrl}
            title={currentVideo.title}
            poster={currentVideo.thumbnail}
            initialDuration={currentVideo.duration}
            autoPlay={false}
          />
        </div>

        {/* Video Details Header & Action Bar */}
        <div className="space-y-4 pb-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              {currentVideo.title}
            </h1>

            {/* Actions: Share / Copy link */}
            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleShare}
                className="text-xs"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
                    <span className="text-emerald-300">Link Copied!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5 mr-1.5" />
                    <span>Share</span>
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Unboxed Metadata Strip */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-[#8E8EA0] pt-1 pb-2">
            {dateFormatted && (
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#636375]" />
                <span>{dateFormatted}</span>
              </span>
            )}

            {durationFormatted && (
              <>
                <span aria-hidden="true" className="text-[#353545]">·</span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#636375]" />
                  <span className="font-mono tabular-nums">{durationFormatted}</span>
                </span>
              </>
            )}

            {sizeFormatted && (
              <>
                <span aria-hidden="true" className="text-[#353545]">·</span>
                <span className="flex items-center gap-1.5">
                  <HardDrive className="w-3.5 h-3.5 text-[#636375]" />
                  <span className="font-mono tabular-nums">{sizeFormatted}</span>
                </span>
              </>
            )}

            {currentVideo.mimeType && (
              <>
                <span aria-hidden="true" className="text-[#353545]">·</span>
                <span className="flex items-center gap-1.5">
                  <FileVideo className="w-3.5 h-3.5 text-[#636375]" />
                  <span className="font-mono">{currentVideo.mimeType}</span>
                </span>
              </>
            )}
          </div>

          {/* Description Box */}
          <div className="p-4 rounded-xl bg-[#14141C] border border-[#20202C] text-sm text-[#A0A0B0] leading-relaxed">
            <p>
              {currentVideo.description ||
                "No description provided for this video. Streaming directly from Google Drive."}
            </p>
          </div>
        </div>

        {/* More from Drive Library */}
        {otherVideos.length > 0 && (
          <div className="pt-10 border-t border-[#1E1E28]">
            <h3 className="text-base font-bold text-white mb-4">
              More from Google Drive Library
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {otherVideos.slice(0, 4).map((video) => (
                <VideoCard key={video.id} video={video} />
              ))}
            </div>
          </div>
        )}
      </PageContainer>
    </div>
  );
}
