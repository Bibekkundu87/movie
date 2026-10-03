"use client";

import { useState, useEffect, useCallback, RefObject } from "react";

export function useFullscreen(
  containerRef: RefObject<HTMLElement | null>,
  videoRef?: RefObject<HTMLVideoElement | null>
) {
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentElementFullscreen =
        document.fullscreenElement === containerRef.current ||
        (document as unknown as { webkitFullscreenElement?: Element }).webkitFullscreenElement === containerRef.current;
      setIsFullscreen(!!isCurrentElementFullscreen);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);

    // iOS Safari video element fullscreen events
    const video = videoRef?.current;
    const handleVideoBeginFullscreen = () => setIsFullscreen(true);
    const handleVideoEndFullscreen = () => setIsFullscreen(false);

    if (video) {
      video.addEventListener("webkitbeginfullscreen", handleVideoBeginFullscreen);
      video.addEventListener("webkitendfullscreen", handleVideoEndFullscreen);
    }

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
      if (video) {
        video.removeEventListener("webkitbeginfullscreen", handleVideoBeginFullscreen);
        video.removeEventListener("webkitendfullscreen", handleVideoEndFullscreen);
      }
    };
  }, [containerRef, videoRef]);

  const toggleFullscreen = useCallback(async () => {
    const container = containerRef.current;
    const video = videoRef?.current;

    try {
      if (!document.fullscreenElement && !(video as unknown as { webkitDisplayingFullscreen?: boolean })?.webkitDisplayingFullscreen) {
        if (container?.requestFullscreen) {
          await container.requestFullscreen();
        } else if ((container as unknown as { webkitRequestFullscreen?: () => Promise<void> })?.webkitRequestFullscreen) {
          await (container as unknown as { webkitRequestFullscreen: () => Promise<void> }).webkitRequestFullscreen();
        } else if ((video as unknown as { webkitEnterFullscreen?: () => void })?.webkitEnterFullscreen) {
          // iOS Safari fallback
          (video as unknown as { webkitEnterFullscreen: () => void }).webkitEnterFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as unknown as { webkitExitFullscreen?: () => Promise<void> })?.webkitExitFullscreen) {
          await (document as unknown as { webkitExitFullscreen: () => Promise<void> }).webkitExitFullscreen();
        } else if ((video as unknown as { webkitExitFullscreen?: () => void })?.webkitExitFullscreen) {
          (video as unknown as { webkitExitFullscreen: () => void }).webkitExitFullscreen();
        }
      }
    } catch (err) {
      console.warn("Fullscreen toggle failed or not permitted:", err);
    }
  }, [containerRef, videoRef]);

  return { isFullscreen, toggleFullscreen };
}
