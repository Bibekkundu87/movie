"use client";

import { useState, useMemo, useCallback } from "react";
import { Video } from "@/types/video";
import { filterVideos } from "../utils/filterVideos";

export function useVideoSearch(videos: Video[]) {
  const [searchQuery, setSearchQuery] = useState<string>("");

  const filteredVideos = useMemo(() => {
    return filterVideos(videos, searchQuery);
  }, [videos, searchQuery]);

  const clearSearch = useCallback(() => {
    setSearchQuery("");
  }, []);

  return {
    searchQuery,
    setSearchQuery,
    clearSearch,
    filteredVideos,
    isSearching: searchQuery.trim().length > 0,
    resultCount: filteredVideos.length,
  };
}
