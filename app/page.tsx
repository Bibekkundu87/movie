"use client";

import React, { useState } from "react";
import { Header } from "@/components/layout/Header";
import { PageContainer } from "@/components/layout/PageContainer";
import { FeaturedVideo } from "@/features/library/components/FeaturedVideo";
import { SearchBar } from "@/features/library/components/SearchBar";
import { VideoGrid } from "@/features/library/components/VideoGrid";
import { VideoGridSkeleton } from "@/features/library/components/VideoCardSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { DriveSimulatorDrawer } from "@/features/library/components/DriveSimulatorDrawer";
import { useVideos } from "@/features/library/hooks/useVideos";
import { useVideoSearch } from "@/features/library/hooks/useVideoSearch";
import { Film } from "lucide-react";

export default function HomePage() {
  const {
    videos,
    isLoading,
    isValidating,
    error,
    refresh,
    isMockMode,
  } = useVideos();

  const {
    searchQuery,
    setSearchQuery,
    clearSearch,
    filteredVideos,
    isSearching,
    resultCount,
  } = useVideoSearch(videos);

  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);

  // Dynamic featured video: the newest/first video from the library
  const featuredVideo = videos.length > 0 ? videos[0] : null;

  return (
    <div className="min-h-screen bg-[#101014] text-white">
      {/* Sticky Header */}
      <Header
        onSync={refresh}
        isSyncing={isValidating}
        onToggleSimulator={() => setIsSimulatorOpen((prev) => !prev)}
        isSimulatorOpen={isSimulatorOpen}
      />

      <PageContainer className="pt-3 sm:pt-6 px-3 sm:px-6 lg:px-8">
        {/* Initial Loading Skeleton */}
        {isLoading && videos.length === 0 ? (
          <div className="space-y-8">
            <div className="w-full h-80 rounded-2xl bg-[#161620] animate-pulse" />
            <VideoGridSkeleton count={10} />
          </div>
        ) : error && videos.length === 0 ? (
          /* Error State when no cached videos exist */
          <EmptyState
            type="error"
            title="Google Drive Connection Error"
            description={error}
            onAction={refresh}
          />
        ) : videos.length === 0 ? (
          /* Empty Google Drive Folder State */
          <div className="py-12">
            <EmptyState
              type="empty-folder"
              actionLabel={isMockMode ? "Simulate Uploading First Video" : "Sync Drive Now"}
              onAction={
                isMockMode
                  ? () => setIsSimulatorOpen(true)
                  : () => refresh()
              }
            />
          </div>
        ) : (
          <>
            {/* Featured Video (Hidden if actively filtering via search) */}
            {!isSearching && featuredVideo && (
              <FeaturedVideo video={featuredVideo} />
            )}

            {/* Gallery Header and Search Controls */}
            <div
              id="recent"
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pt-4 border-t border-[#1C1C24]"
            >
              <div>
                <div className="flex items-center gap-2">
                  <Film className="w-4 h-4 text-[#EF3B4F]" />
                  <h2 className="text-xl font-bold tracking-tight text-white">
                    {isSearching ? "Search Results" : "Google Drive Video Library"}
                  </h2>
                </div>
                <p className="text-xs text-[#8E8EA0] mt-1">
                  Discover and stream videos from your Google Drive library.
                </p>
              </div>

              {/* Instant Search Bar */}
              <SearchBar
                query={searchQuery}
                onQueryChange={setSearchQuery}
                onClear={clearSearch}
                resultCount={resultCount}
              />
            </div>

            {/* Search No Results State */}
            {isSearching && filteredVideos.length === 0 ? (
              <EmptyState
                type="no-results"
                onAction={clearSearch}
                actionLabel="Reset Search Filter"
              />
            ) : (
              /* Responsive Video Grid */
              <VideoGrid videos={filteredVideos} />
            )}
          </>
        )}
      </PageContainer>

      {/* Drive Simulator Drawer (Interactive Testing for Tests A-E) */}
      <DriveSimulatorDrawer
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
        videos={videos}
        onTriggerSync={refresh}
      />
    </div>
  );
}
