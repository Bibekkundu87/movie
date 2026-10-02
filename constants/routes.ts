export const ROUTES = {
  HOME: '/',
  WATCH: (id: string) => `/watch/${encodeURIComponent(id)}`,
  API_VIDEOS: '/api/videos',
  API_VIDEO: (id: string) => `/api/videos/${encodeURIComponent(id)}`,
  API_THUMBNAIL: (id: string) => `/api/videos/${encodeURIComponent(id)}/thumbnail`,
  API_STREAM: (id: string) => `/api/videos/${encodeURIComponent(id)}/stream`,
} as const;
