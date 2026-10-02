export interface Video {
  id: string;
  title: string;
  description?: string;
  thumbnail: string;
  streamUrl: string;
  duration?: number;
  size?: number;
  mimeType?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface VideoListResponse {
  videos: Video[];
  total?: number;
  syncedAt?: string;
  folderId?: string;
  isMock?: boolean;
}

export interface VideoDetailResponse {
  video: Video;
  isMock?: boolean;
}
