"use client";

import { useEffect, useState, useMemo } from "react";
import useSWR from "swr";
import { Video, VideoListResponse } from "@/types/video";
import { videoService, isMockMode } from "@/services/videoService";

const SWR_KEY = "/api/videos";

export function useVideos() {
  const [mockActive] = useState<boolean>(() => isMockMode());
  const [lastSyncedAt, setLastSyncedAt] = useState<Date>(() => new Date());

  const fetcher = async (): Promise<VideoListResponse> => {
    const data = await videoService.getVideos();
    setLastSyncedAt(new Date());
    return data;
  };

  const {
    data,
    error,
    isLoading,
    isValidating,
    mutate,
  } = useSWR<VideoListResponse>(SWR_KEY, fetcher, {
    // Core Requirement 2: 30-second polling while page is active
    refreshInterval: 30000,
    // Revalidate when tab regains focus
    revalidateOnFocus: true,
    // Revalidate when network connectivity is restored
    revalidateOnReconnect: true,
    // Keep previously loaded videos visible during background refresh
    keepPreviousData: true,
    // Prevent redundant overlapping requests within 3 seconds
    dedupingInterval: 3000,
    // Retain previous state on temporary network errors
    shouldRetryOnError: true,
    errorRetryCount: 3,
  });

  // If in mock mode, subscribe to mock store events so changes trigger revalidation
  useEffect(() => {
    if (mockActive) {
      const unsubscribe = videoService.mock.subscribe(() => {
        mutate();
      });
      return () => unsubscribe();
    }
  }, [mockActive, mutate]);

  const rawVideos = data?.videos;

  // Deterministic sorting: newest createdAt first, fallback to id
  const sortedVideos: Video[] = useMemo(() => {
    if (!rawVideos) return [];
    return [...rawVideos].sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      if (dateB !== dateA) {
        return dateB - dateA;
      }
      return a.id.localeCompare(b.id);
    });
  }, [rawVideos]);

  const refresh = async () => {
    return mutate();
  };

  return {
    videos: sortedVideos,
    rawVideos: rawVideos || [],
    total: data?.total ?? sortedVideos.length,
    folderId: data?.folderId,
    isLoading,
    isValidating,
    error: error ? (error.message || "Failed to synchronize Google Drive library.") : null,
    lastSyncedAt,
    refresh,
    isMockMode: mockActive,
  };
}
