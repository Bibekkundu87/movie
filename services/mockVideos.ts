import { Video } from "@/types/video";

export const INITIAL_MOCK_VIDEOS: Video[] = [
  {
    id: "drive-video-001",
    title: "Cinematic Odyssey: Cosmos 4K",
    description: "An awe-inspiring voyage through the outer rings of Saturn and distant nebula clusters, captured with high-fidelity telescopic arrays and deep space telemetry.",
    thumbnail: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1280&auto=format&fit=crop",
    streamUrl: "https://media.w3.org/2010/05/bunny/trailer.mp4",
    duration: 596,
    size: 11053871,
    mimeType: "video/mp4",
    createdAt: "2026-09-28T14:20:00.000Z",
    updatedAt: "2026-09-28T14:20:00.000Z",
  },
  {
    id: "drive-video-002",
    title: "Metropolis: Neon Drift",
    description: "Midnight hyper-lapse of modern urban transit corridors, subterranean rail networks, and glowing architectural silhouettes under heavy evening rainfall.",
    thumbnail: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1280&auto=format&fit=crop",
    streamUrl: "https://vjs.zencdn.net/v/oceans.mp4",
    duration: 653,
    size: 23014356,
    mimeType: "video/mp4",
    createdAt: "2026-09-29T09:15:00.000Z",
    updatedAt: "2026-09-29T09:15:00.000Z",
  },
  {
    id: "drive-video-003",
    title: "Abyssal Horizons: Deep Pacific",
    description: "Exploration of the Mariana Trench hydrothermal vents and deep-sea bioluminescent species operating at extreme atmospheric pressures.",
    thumbnail: "https://images.unsplash.com/photo-1682687220063-4742bd7fd538?q=80&w=1280&auto=format&fit=crop",
    streamUrl: "https://media.w3.org/2010/05/sintel/trailer.mp4",
    duration: 90,
    size: 4372373,
    mimeType: "video/mp4",
    createdAt: "2026-09-30T11:00:00.000Z",
    updatedAt: "2026-09-30T11:00:00.000Z",
  },
];

// Presets for the Drive simulation mechanism (e.g. Test B: add a 4th video)
export const SIMULATED_UPLOAD_CANDIDATES: Partial<Video>[] = [
  {
    title: "Tears of Steel: Cybernetic Protocol",
    description: "VFX showcase set in an alternate future Amsterdam, featuring live-action cinematography blended with cutting-edge open-source robotics CGI.",
    thumbnail: "https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=1280&auto=format&fit=crop",
    streamUrl: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
    duration: 734,
    size: 1128375,
    mimeType: "video/mp4",
  },
  {
    title: "Alpine Ridge: Arctic Sunrise",
    description: "Glacial alpine peaks emerging through freezing sea fog, filmed on medium-format aerial sensors during the winter solstice.",
    thumbnail: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1280&auto=format&fit=crop",
    streamUrl: "https://vjs.zencdn.net/v/oceans.mp4",
    duration: 120,
    size: 23014356,
    mimeType: "video/mp4",
  },
];

/**
 * Shared in-memory mock store that simulates a Google Drive folder state.
 * Both client-side SWR and server-side route handlers can inspect or mutate this state in mock mode.
 */
class MockVideoStore {
  private videos: Video[] = [...INITIAL_MOCK_VIDEOS];
  private listeners: Set<() => void> = new Set();
  private candidateIndex = 0;

  public getVideos(): Video[] {
    // Return a clone sorted newest first
    return [...this.videos].sort((a, b) => {
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      if (timeB !== timeA) return timeB - timeA;
      return a.id.localeCompare(b.id);
    });
  }

  public getVideoById(id: string): Video | undefined {
    return this.videos.find((v) => v.id === id);
  }

  public addVideo(custom?: Partial<Video>): Video {
    const candidate = custom || SIMULATED_UPLOAD_CANDIDATES[this.candidateIndex % SIMULATED_UPLOAD_CANDIDATES.length];
    this.candidateIndex++;

    const newVideo: Video = {
      id: `drive-video-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      title: candidate.title || `Uploaded Video ${this.videos.length + 1}`,
      description: candidate.description || "Newly uploaded video discovered in Google Drive folder.",
      thumbnail: candidate.thumbnail || "/images/placeholder-poster.svg",
      streamUrl: candidate.streamUrl || "https://media.w3.org/2010/05/bunny/trailer.mp4",
      duration: candidate.duration ?? 180,
      size: candidate.size ?? 45000000,
      mimeType: candidate.mimeType || "video/mp4",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.videos = [newVideo, ...this.videos];
    this.notify();
    return newVideo;
  }

  public removeVideo(id: string): boolean {
    const prevCount = this.videos.length;
    this.videos = this.videos.filter((v) => v.id !== id);
    const removed = this.videos.length < prevCount;
    if (removed) {
      this.notify();
    }
    return removed;
  }

  public renameVideo(id: string, newTitle: string): Video | undefined {
    const video = this.videos.find((v) => v.id === id);
    if (!video) return undefined;
    video.title = newTitle;
    video.updatedAt = new Date().toISOString();
    this.notify();
    return video;
  }

  public reset(): void {
    this.videos = [...INITIAL_MOCK_VIDEOS];
    this.candidateIndex = 0;
    this.notify();
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    this.listeners.forEach((fn) => {
      try {
        fn();
      } catch (err) {
        console.error("MockVideoStore listener error:", err);
      }
    });
  }
}

// Global singleton to persist across module evaluations in browser / HMR
const globalForMock = globalThis as unknown as { __mockVideoStore?: MockVideoStore };
export const mockVideoStore = globalForMock.__mockVideoStore || new MockVideoStore();
if (process.env.NODE_ENV !== "production") {
  globalForMock.__mockVideoStore = mockVideoStore;
}
