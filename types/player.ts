export interface PlayerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  bufferedTime: number;
  volume: number;
  isMuted: boolean;
  isLoading: boolean;
  isBuffering: boolean;
  isFullscreen: boolean;
  playbackRate: number;
  hasStarted: boolean;
  error: string | null;
  quality: string;
  isLooping: boolean;
  isTheaterMode: boolean;
  isAmbientMode: boolean;
  isStatsOpen: boolean;
}

export interface PlayerControls {
  play: () => Promise<void>;
  pause: () => void;
  togglePlay: () => void;
  seek: (seconds: number) => void;
  seekBy: (deltaSeconds: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  toggleFullscreen: () => Promise<void>;
  setPlaybackRate: (rate: number) => void;
  setQuality: (quality: string) => void;
  toggleLoop: () => void;
  toggleTheaterMode: () => void;
  toggleAmbientMode: () => void;
  togglePip: () => Promise<void>;
  toggleStats: () => void;
  retry: () => void;
}
