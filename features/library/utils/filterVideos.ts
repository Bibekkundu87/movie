import { Video } from "@/types/video";

export function filterVideos(videos: Video[], query: string): Video[] {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) {
    return videos;
  }

  return videos.filter((video) => {
    const titleMatch = video.title.toLowerCase().includes(normalizedQuery);
    const descMatch = video.description
      ? video.description.toLowerCase().includes(normalizedQuery)
      : false;
    return titleMatch || descMatch;
  });
}
