export const PLAYER_CONFIG = {
  DEFAULT_VOLUME: 0.9,
  SEEK_STEP_SECONDS: 10,
  FAST_FORWARD_SECONDS: 10,
  AUTO_HIDE_CONTROLS_MS: 3000,
  AVAILABLE_PLAYBACK_RATES: [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2] as const,
  DEFAULT_PLAYBACK_RATE: 1,
  AVAILABLE_QUALITIES: ['Auto (1080p)', '1080p (HD)', '720p (HD)', '480p', '360p'] as const,
  DEFAULT_QUALITY: 'Auto (1080p)',
} as const;

export const LOCAL_STORAGE_KEYS = {
  VOLUME: 'streambox_volume',
  MUTED: 'streambox_muted',
  QUALITY: 'streambox_quality',
  AMBIENT: 'streambox_ambient',
} as const;
