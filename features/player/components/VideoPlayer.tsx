"use client";

import React, { useRef, useState, useEffect, useCallback, useMemo } from "react";
import { useVideoPlayer } from "../hooks/useVideoPlayer";
import { useFullscreen } from "../hooks/useFullscreen";
import { VideoControls } from "./VideoControls";
import { PlayerLoader } from "./PlayerLoader";
import { PlayerOverlay } from "./PlayerOverlay";
import { DoubleTapRipple, DoubleTapDirection } from "./DoubleTapRipple";
import { CenterPulse } from "./CenterPulse";
import { StatsForNerds } from "./StatsForNerds";
import { ShortcutsModal } from "./ShortcutsModal";
import { PLAYER_CONFIG } from "@/constants/player";

interface VideoPlayerProps {
  streamUrl: string;
  title: string;
  poster?: string;
  initialDuration?: number;
  autoPlay?: boolean;
}

export function VideoPlayer({
  streamUrl,
  title,
  poster,
  initialDuration,
  autoPlay = false,
}: VideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { videoRef, state, controls } = useVideoPlayer(initialDuration);
  const { isFullscreen, toggleFullscreen } = useFullscreen(containerRef);

  const [isHoveredOrActive, setIsHoveredOrActive] = useState(true);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [doubleTapDir, setDoubleTapDir] = useState<DoubleTapDirection>(null);
  const [isDoubleTapVisible, setIsDoubleTapVisible] = useState(false);
  const [pulseAction, setPulseAction] = useState<"play" | "pause" | null>(null);
  const [isPulseVisible, setIsPulseVisible] = useState(false);

  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastClickRef = useRef<{ time: number; x: number }>({ time: 0, x: 0 });
  const doubleTapTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pulseTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Merge container fullscreen handler with controls
  const activeControls = useMemo(
    () => ({
      ...controls,
      toggleFullscreen,
    }),
    [controls, toggleFullscreen]
  );

  const showControlsTemporarily = useCallback(() => {
    setIsHoveredOrActive(true);
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }
    if (state.isPlaying) {
      hideTimeoutRef.current = setTimeout(() => {
        setIsHoveredOrActive(false);
      }, PLAYER_CONFIG.AUTO_HIDE_CONTROLS_MS);
    }
  }, [state.isPlaying]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
      if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current);
      if (doubleTapTimeoutRef.current) clearTimeout(doubleTapTimeoutRef.current);
      if (pulseTimeoutRef.current) clearTimeout(pulseTimeoutRef.current);
    };
  }, []);

  const triggerCenterPulse = useCallback((action: "play" | "pause") => {
    setPulseAction(action);
    setIsPulseVisible(true);
    if (pulseTimeoutRef.current) clearTimeout(pulseTimeoutRef.current);
    pulseTimeoutRef.current = setTimeout(() => {
      setIsPulseVisible(false);
    }, 500);
  }, []);

  const triggerDoubleTap = useCallback((dir: DoubleTapDirection) => {
    setDoubleTapDir(dir);
    setIsDoubleTapVisible(true);
    if (doubleTapTimeoutRef.current) clearTimeout(doubleTapTimeoutRef.current);
    doubleTapTimeoutRef.current = setTimeout(() => {
      setIsDoubleTapVisible(false);
    }, 650);
  }, []);

  // Handle single and double click on video surface
  const handleVideoSurfaceClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const relativeX = clickX / rect.width;
    const now = Date.now();
    const timeSinceLastClick = now - lastClickRef.current.time;

    showControlsTemporarily();

    // Double-click detected (within 280ms)
    if (timeSinceLastClick < 280) {
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
        clickTimeoutRef.current = null;
      }
      lastClickRef.current = { time: 0, x: 0 };

      if (relativeX < 0.35) {
        // Left edge: Rewind 10 seconds
        activeControls.seekBy(-PLAYER_CONFIG.SEEK_STEP_SECONDS);
        triggerDoubleTap("left");
      } else if (relativeX > 0.65) {
        // Right edge: Fast Forward 10 seconds
        activeControls.seekBy(PLAYER_CONFIG.FAST_FORWARD_SECONDS);
        triggerDoubleTap("right");
      } else {
        // Center: Toggle fullscreen
        toggleFullscreen();
      }
      return;
    }

    // First click: Schedule single-click play/pause toggle
    lastClickRef.current = { time: now, x: relativeX };
    clickTimeoutRef.current = setTimeout(() => {
      const willPlay = !state.isPlaying;
      activeControls.togglePlay();
      triggerCenterPulse(willPlay ? "play" : "pause");
      clickTimeoutRef.current = null;
    }, 280);
  };

  // Keyboard shortcut listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input or modal is open
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }

      const key = e.key.toLowerCase();

      // Number keys 0-9 seek to percentage (0% to 90%)
      if (e.key >= "0" && e.key <= "9" && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        const percent = parseInt(e.key, 10) / 10;
        activeControls.seek(percent * state.duration);
        showControlsTemporarily();
        return;
      }

      switch (key) {
        case " ":
        case "k":
          e.preventDefault();
          triggerCenterPulse(state.isPlaying ? "pause" : "play");
          activeControls.togglePlay();
          showControlsTemporarily();
          break;
        case "f":
          e.preventDefault();
          toggleFullscreen();
          break;
        case "t":
          e.preventDefault();
          activeControls.toggleTheaterMode();
          break;
        case "i":
          e.preventDefault();
          activeControls.togglePip();
          break;
        case "m":
          e.preventDefault();
          activeControls.toggleMute();
          showControlsTemporarily();
          break;
        case "j":
          e.preventDefault();
          activeControls.seekBy(-PLAYER_CONFIG.SEEK_STEP_SECONDS);
          triggerDoubleTap("left");
          showControlsTemporarily();
          break;
        case "l":
          e.preventDefault();
          activeControls.seekBy(PLAYER_CONFIG.FAST_FORWARD_SECONDS);
          triggerDoubleTap("right");
          showControlsTemporarily();
          break;
        case "arrowleft":
          e.preventDefault();
          activeControls.seekBy(-5);
          showControlsTemporarily();
          break;
        case "arrowright":
          e.preventDefault();
          activeControls.seekBy(5);
          showControlsTemporarily();
          break;
        case "arrowup":
          e.preventDefault();
          activeControls.setVolume(state.volume + 0.1);
          showControlsTemporarily();
          break;
        case "arrowdown":
          e.preventDefault();
          activeControls.setVolume(state.volume - 0.1);
          showControlsTemporarily();
          break;
        case "?":
          e.preventDefault();
          setIsShortcutsOpen((prev) => !prev);
          break;
        case "<":
          e.preventDefault();
          activeControls.setPlaybackRate(Math.max(0.25, state.playbackRate - 0.25));
          showControlsTemporarily();
          break;
        case ">":
          e.preventDefault();
          activeControls.setPlaybackRate(Math.min(2, state.playbackRate + 0.25));
          showControlsTemporarily();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    activeControls,
    state.volume,
    state.duration,
    state.isPlaying,
    state.playbackRate,
    showControlsTemporarily,
    toggleFullscreen,
    triggerCenterPulse,
    triggerDoubleTap,
  ]);

  // Controls are visible when paused, or when actively hovered/interacting
  const areControlsVisible = !state.isPlaying || isHoveredOrActive;

  return (
    <div className={`relative w-full ${state.isTheaterMode && !isFullscreen ? "max-w-none" : ""}`}>
      {/* YouTube Ambient Glow Backlight */}
      {state.isAmbientMode && !isFullscreen && (
        <div
          aria-hidden="true"
          className="absolute -inset-4 sm:-inset-8 -z-10 rounded-3xl bg-gradient-to-tr from-[#EF3B4F]/20 via-[#EF3B4F]/10 to-indigo-600/20 blur-2xl opacity-60 pointer-events-none transition-opacity duration-700"
        />
      )}

      {/* Main Video Container */}
      <div
        ref={containerRef}
        onMouseMove={showControlsTemporarily}
        onMouseLeave={() => state.isPlaying && setIsHoveredOrActive(false)}
        tabIndex={0}
        className={`relative w-full aspect-video bg-black rounded-xl overflow-hidden border border-[#22222E] shadow-2xl focus:outline-none select-none transition-all duration-300 ${
          isFullscreen ? "h-screen w-screen rounded-none border-none aspect-auto" : ""
        } ${state.isTheaterMode && !isFullscreen ? "aspect-[21/9] sm:aspect-video rounded-none border-x-0" : ""}`}
      >
        {/* Native HTML5 Video Element with range streaming support */}
        <video
          ref={videoRef}
          src={streamUrl}
          poster={poster || "/images/placeholder-poster.svg"}
          preload="metadata"
          playsInline
          autoPlay={autoPlay}
          className="w-full h-full object-contain"
        />

        {/* Video Click Layer for Single and Double Click Gestures */}
        <div
          onClick={handleVideoSurfaceClick}
          className="absolute inset-0 z-10 cursor-pointer"
        />

        {/* Edge Double-Tap Ripple Feedback (< 10s or 10s >) */}
        <DoubleTapRipple
          direction={doubleTapDir}
          visible={isDoubleTapVisible}
        />

        {/* Center Play/Pause Pulse Flash Animation */}
        <CenterPulse
          action={pulseAction}
          visible={isPulseVisible}
        />

        {/* Buffering Spinner */}
        {(state.isLoading || state.isBuffering) && (
          <PlayerLoader isBuffering={state.isBuffering} />
        )}

        {/* Big Play Button on initial load or paused */}
        {!state.hasStarted && !state.isPlaying && !state.error && (
          <PlayerOverlay
            error={null}
            onRetry={activeControls.retry}
            showBigPlay={true}
            onPlayClick={activeControls.play}
          />
        )}

        {/* Error Overlay with Retry */}
        {state.error && (
          <PlayerOverlay
            error={state.error}
            onRetry={activeControls.retry}
          />
        )}

        {/* Stats for Nerds HUD */}
        <StatsForNerds
          isOpen={state.isStatsOpen}
          onClose={activeControls.toggleStats}
          state={state}
          title={title}
        />

        {/* Bottom Control Bar */}
        <VideoControls
          state={{ ...state, isFullscreen }}
          controls={activeControls}
          title={title}
          isVisible={areControlsVisible}
          onUserInteraction={showControlsTemporarily}
          onOpenShortcuts={() => setIsShortcutsOpen(true)}
        />
      </div>

      {/* Keyboard Shortcuts Dialog */}
      <ShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />
    </div>
  );
}
