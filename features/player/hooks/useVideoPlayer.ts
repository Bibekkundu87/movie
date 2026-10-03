"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { PlayerState, PlayerControls } from "@/types/player";
import { PLAYER_CONFIG } from "@/constants/player";

export function useVideoPlayer(initialDuration?: number) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [state, setState] = useState<PlayerState>({
    isPlaying: false,
    currentTime: 0,
    duration: initialDuration || 0,
    bufferedTime: 0,
    volume: PLAYER_CONFIG.DEFAULT_VOLUME,
    isMuted: false,
    isLoading: true,
    isBuffering: false,
    isFullscreen: false,
    playbackRate: PLAYER_CONFIG.DEFAULT_PLAYBACK_RATE,
    hasStarted: false,
    error: null,
    quality: PLAYER_CONFIG.DEFAULT_QUALITY,
    isLooping: false,
    isTheaterMode: false,
    isAmbientMode: true,
    isStatsOpen: false,
  });

  // Calculate buffered end time from video.buffered TimeRanges
  const updateBufferedTime = useCallback((video: HTMLVideoElement) => {
    if (!video.buffered || video.buffered.length === 0) return;
    const current = video.currentTime;
    let end = 0;
    for (let i = 0; i < video.buffered.length; i++) {
      if (video.buffered.start(i) <= current && current <= video.buffered.end(i)) {
        end = video.buffered.end(i);
        break;
      }
      if (video.buffered.end(i) > end) {
        end = video.buffered.end(i);
      }
    }
    setState((prev) => ({ ...prev, bufferedTime: end }));
  }, []);

  // Event handlers
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onLoadedMetadata = () => {
      setState((prev) => ({
        ...prev,
        duration: isNaN(video.duration) ? initialDuration || 0 : video.duration,
        isLoading: false,
        error: null,
      }));
    };

    const onTimeUpdate = () => {
      setState((prev) => ({
        ...prev,
        currentTime: video.currentTime,
        isBuffering: false,
      }));
      updateBufferedTime(video);
    };

    const onProgress = () => {
      updateBufferedTime(video);
    };

    const onWaiting = () => {
      setState((prev) => ({ ...prev, isBuffering: true }));
    };

    const onPlaying = () => {
      setState((prev) => ({
        ...prev,
        isPlaying: true,
        isLoading: false,
        isBuffering: false,
        hasStarted: true,
        error: null,
      }));
    };

    const onSeeking = () => {
      setState((prev) => ({ ...prev, isBuffering: true }));
    };

    const onSeeked = () => {
      setState((prev) => ({ ...prev, isBuffering: false }));
    };

    const onPause = () => {
      setState((prev) => ({ ...prev, isPlaying: false }));
    };

    const onEnded = () => {
      setState((prev) => ({ ...prev, isPlaying: false }));
    };

    const onError = () => {
      const mediaError = video.error;
      let message = "Playback error occurred. Unable to stream media.";
      if (mediaError) {
        switch (mediaError.code) {
          case MediaError.MEDIA_ERR_ABORTED:
            message = "Playback aborted by user.";
            break;
          case MediaError.MEDIA_ERR_NETWORK:
            message = "Network connection failed while streaming video.";
            break;
          case MediaError.MEDIA_ERR_DECODE:
            message = "Video decoding error or corrupted media data.";
            break;
          case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
            message = "Video source format not supported by browser or unavailable.";
            break;
        }
      }
      setState((prev) => ({
        ...prev,
        isPlaying: false,
        isLoading: false,
        isBuffering: false,
        error: message,
      }));
    };

    const onVolumeChange = () => {
      setState((prev) => ({
        ...prev,
        volume: video.volume,
        isMuted: video.muted,
      }));
    };

    video.addEventListener("loadedmetadata", onLoadedMetadata);
    video.addEventListener("timeupdate", onTimeUpdate);
    video.addEventListener("progress", onProgress);
    video.addEventListener("waiting", onWaiting);
    video.addEventListener("playing", onPlaying);
    video.addEventListener("seeking", onSeeking);
    video.addEventListener("seeked", onSeeked);
    video.addEventListener("pause", onPause);
    video.addEventListener("ended", onEnded);
    video.addEventListener("error", onError);
    video.addEventListener("volumechange", onVolumeChange);

    return () => {
      video.removeEventListener("loadedmetadata", onLoadedMetadata);
      video.removeEventListener("timeupdate", onTimeUpdate);
      video.removeEventListener("progress", onProgress);
      video.removeEventListener("waiting", onWaiting);
      video.removeEventListener("playing", onPlaying);
      video.removeEventListener("seeking", onSeeking);
      video.removeEventListener("seeked", onSeeked);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("ended", onEnded);
      video.removeEventListener("error", onError);
      video.removeEventListener("volumechange", onVolumeChange);
    };
  }, [initialDuration, updateBufferedTime]);

  const play = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;
    setState((prev) => ({ ...prev, hasStarted: true }));
    try {
      await video.play();
    } catch (err) {
      console.warn("Autoplay / play request rejected:", err);
    }
  }, []);

  const pause = useCallback(() => {
    videoRef.current?.pause();
  }, []);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      play();
    } else {
      pause();
    }
  }, [play, pause]);

  const seek = useCallback((seconds: number) => {
    const video = videoRef.current;
    if (!video) return;
    const clamped = Math.max(0, Math.min(seconds, video.duration || seconds));
    video.currentTime = clamped;
    setState((prev) => ({ ...prev, currentTime: clamped }));
  }, []);

  const seekBy = useCallback((deltaSeconds: number) => {
    const video = videoRef.current;
    if (!video) return;
    seek(video.currentTime + deltaSeconds);
  }, [seek]);

  const setVolume = useCallback((val: number) => {
    const video = videoRef.current;
    if (!video) return;
    const clamped = Math.max(0, Math.min(1, val));
    video.volume = clamped;
    if (clamped > 0 && video.muted) {
      video.muted = false;
    }
    setState((prev) => ({ ...prev, volume: clamped, isMuted: video.muted }));
  }, []);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setState((prev) => ({ ...prev, isMuted: video.muted }));
  }, []);

  const setPlaybackRate = useCallback((rate: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.playbackRate = rate;
    setState((prev) => ({ ...prev, playbackRate: rate }));
  }, []);

  const setQuality = useCallback((quality: string) => {
    setState((prev) => ({ ...prev, quality }));
  }, []);

  const toggleLoop = useCallback(() => {
    const video = videoRef.current;
    setState((prev) => {
      const nextLoop = !prev.isLooping;
      if (video) {
        video.loop = nextLoop;
      }
      return { ...prev, isLooping: nextLoop };
    });
  }, []);

  const toggleTheaterMode = useCallback(() => {
    setState((prev) => ({ ...prev, isTheaterMode: !prev.isTheaterMode }));
  }, []);

  const toggleAmbientMode = useCallback(() => {
    setState((prev) => ({ ...prev, isAmbientMode: !prev.isAmbientMode }));
  }, []);

  const togglePip = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else if (document.pictureInPictureEnabled && video.requestPictureInPicture) {
        await video.requestPictureInPicture();
      }
    } catch (err) {
      console.warn("Picture-in-picture failed:", err);
    }
  }, []);

  const toggleStats = useCallback(() => {
    setState((prev) => ({ ...prev, isStatsOpen: !prev.isStatsOpen }));
  }, []);

  const retry = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    video.load();
    video.play().catch(() => {
      // User interaction may be required
    });
  }, []);

  return {
    videoRef,
    state,
    controls: {
      play,
      pause,
      togglePlay,
      seek,
      seekBy,
      setVolume,
      toggleMute,
      toggleFullscreen: async () => {}, // Bound via container ref in player component
      setPlaybackRate,
      setQuality,
      toggleLoop,
      toggleTheaterMode,
      toggleAmbientMode,
      togglePip,
      toggleStats,
      retry,
    } as PlayerControls,
  };
}
