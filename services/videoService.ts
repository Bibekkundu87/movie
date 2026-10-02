import { Video, VideoListResponse } from "@/types/video";
import { apiClient } from "./apiClient";
import { mockVideoStore } from "./mockVideos";
import { ROUTES } from "@/constants/routes";

export function isMockMode(): boolean {
  // If explicitly set, respect the env variable
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA !== undefined) {
    return process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";
  }
  // Default to true in development for immediate interactive testing if no backend is configured yet
  return true;
}

export const videoService = {
  async getVideos(): Promise<VideoListResponse> {
    if (isMockMode()) {
      const videos = mockVideoStore.getVideos();
      return {
        videos,
        total: videos.length,
        syncedAt: new Date().toISOString(),
        folderId: "mock-google-drive-folder-stream-box",
        isMock: true,
      };
    }

    return apiClient<VideoListResponse>(ROUTES.API_VIDEOS);
  },

  async getVideoById(id: string): Promise<Video> {
    if (isMockMode()) {
      const video = mockVideoStore.getVideoById(id);
      if (!video) {
        throw new Error(`Video with ID "${id}" was not found in the Google Drive library.`);
      }
      return video;
    }

    const res = await apiClient<Video | { video: Video }>(ROUTES.API_VIDEO(id));
    if ("video" in res) {
      return res.video;
    }
    return res;
  },

  // Simulated Google Drive sync mutation actions for local development & testing
  mock: {
    addVideo(partial?: Partial<Video>): Video {
      return mockVideoStore.addVideo(partial);
    },
    removeVideo(id: string): boolean {
      return mockVideoStore.removeVideo(id);
    },
    renameVideo(id: string, newTitle: string): Video | undefined {
      return mockVideoStore.renameVideo(id, newTitle);
    },
    reset(): void {
      mockVideoStore.reset();
    },
    subscribe(fn: () => void): () => void {
      return mockVideoStore.subscribe(fn);
    },
  },
};
