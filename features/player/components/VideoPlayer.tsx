"use client";

import React, { useRef, useState, useEffect, useCallback, useMemo } from "react";
import { Play, Pause, RotateCcw, RotateCw } from "lucide-react";
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
  const { isFullscreen, toggleFullscreen } = useFullscreen(containerRef, videoRef);

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

  // Handle single and double click/tap on video surface
  // Handle single and double click/tap on video surface with INSTANT 0ms response
  const handleVideoSurfaceTap = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clickX = clientX - rect.left;
    const relativeX = clickX / rect.width;
    const now = Date.now();
    const timeSinceLastClick = now - lastClickRef.current.time;

    // Double-tap detected (within 300ms on the edges)
    if (timeSinceLastClick < 300 && timeSinceLastClick > 30) {
      lastClickRef.current = { time: 0, x: 0 };

      if (relativeX < 0.35) {
        // Left edge: Rewind 10 seconds
        activeControls.seekBy(-PLAYER_CONFIG.SEEK_STEP_SECONDS);
        triggerDoubleTap("left");
        showControlsTemporarily();
        return;
      } else if (relativeX > 0.65) {
        // Right edge: Fast Forward 10 seconds
        activeControls.seekBy(PLAYER_CONFIG.FAST_FORWARD_SECONDS);
        triggerDoubleTap("right");
        showControlsTemporarily();
        return;
      } else {
        // Center: Toggle fullscreen
        toggleFullscreen();
        return;
      }
    }

    // Single tap: Execute IMMEDIATELY (0ms latency, zero delay)
    lastClickRef.current = { time: now, x: relativeX };

    if (!state.hasStarted) {
      triggerCenterPulse("play");
      activeControls.play();
      showControlsTemporarily();
      return;
    }

    if (!state.isPlaying) {
      // If paused, tap immediately plays the video!
      activeControls.play();
      triggerCenterPulse("play");
      showControlsTemporarily();
    } else if (!isHoveredOrActive) {
      // If playing and controls are hidden, tap immediately reveals controls!
      showControlsTemporarily();
    } else {
      // If playing and controls are visible, tapping empty surface hides controls!
      setIsHoveredOrActive(false);
    }
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
    <div className={`relative w-full touch-manipulation ${state.isTheaterMode && !isFullscreen ? "max-w-none" : ""}`}>
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
        className={`relative w-full aspect-video bg-black rounded-xl overflow-hidden border border-[#22222E] shadow-2xl focus:outline-none select-none transition-all duration-300 touch-manipulation ${
          isFullscreen ? "h-screen w-screen rounded-none border-none aspect-auto" : ""
        } ${state.isTheaterMode && !isFullscreen ? "aspect-[21/9] sm:aspect-video rounded-none border-x-0" : ""}`}
      >
        {/* Native HTML5 Video Element with preload auto for instantaneous playback */}
        <video
          ref={videoRef}
          src={streamUrl}
          poster={poster || "/images/placeholder-poster.svg"}
          preload="auto"
          playsInline
          autoPlay={autoPlay}
          className="w-full h-full object-contain"
        />

        {/* Video Touch Layer for Instant Tap and Double-Tap Gestures (0ms latency) */}
        <div
          onClick={(e) => handleVideoSurfaceTap(e.clientX)}
          className="absolute inset-0 z-10 cursor-pointer touch-manipulation"
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

        {/* Buffering Spinner - only shown after start when genuinely waiting for stream chunks */}
        {state.hasStarted && (state.isLoading || state.isBuffering) && (
          <PlayerLoader isBuffering={state.isBuffering} />
        )}

        {/* YouTube Ambient Darkening Scrim when controls are visible */}
        <div
          className={`absolute inset-0 bg-black/40 backdrop-blur-[0.5px] pointer-events-none transition-opacity duration-200 z-15 ${
            areControlsVisible ? "opacity-100" : "opacity-0"
          }`}
        />

        {/* YouTube Top Bar Header Overlay */}
        <div
          className={`absolute top-0 inset-x-0 z-20 px-4 pt-3.5 pb-8 bg-gradient-to-b from-black/80 via-black/35 to-transparent pointer-events-none transition-opacity duration-200 select-none ${
            areControlsVisible ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xs sm:text-sm font-semibold text-white/95 truncate drop-shadow-md pr-4">
              {title}
            </h2>
          </div>
        </div>

        {/* Center Quick Playback Controls Overlay (YouTube Style Triad) */}
        {state.hasStarted && !state.error && (
          <div
            className={`absolute inset-0 z-20 flex items-center justify-center gap-6 sm:gap-12 pointer-events-none transition-opacity duration-200 ${
              areControlsVisible ? "opacity-100" : "opacity-0"
            }`}
          >
            {/* Quick Seek -10s */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                activeControls.seekBy(-PLAYER_CONFIG.SEEK_STEP_SECONDS);
                triggerDoubleTap("left");
                showControlsTemporarily();
              }}
              aria-label="Rewind 10 seconds"
              className="pointer-events-auto touch-manipulation w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-black/65 hover:bg-black/85 active:scale-85 text-white flex flex-col items-center justify-center backdrop-blur-md border border-white/20 transition-all shadow-2xl group/seek"
            >
              <RotateCcw className="w-5 h-5 sm:w-6 sm:h-6 group-hover/seek:-rotate-12 transition-transform" />
              <span className="text-[9px] font-bold mt-0.5 tracking-tighter">10</span>
            </button>

            {/* Main Center Play / Pause Button (YouTube Signature Style) */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                const willPlay = !state.isPlaying;
                activeControls.togglePlay();
                triggerCenterPulse(willPlay ? "play" : "pause");
                showControlsTemporarily();
              }}
              aria-label={state.isPlaying ? "Pause video" : "Play video"}
              className="pointer-events-auto touch-manipulation w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-black/75 hover:bg-black/90 active:scale-90 text-white flex items-center justify-center backdrop-blur-md border border-white/25 shadow-2xl ring-4 ring-white/10 transition-transform duration-150"
            >
              {state.isPlaying ? (
                <Pause className="w-8 h-8 sm:w-10 sm:h-10 fill-current" />
              ) : (
                <Play className="w-8 h-8 sm:w-10 sm:h-10 fill-current ml-1" />
              )}
            </button>

            {/* Quick Seek +10s */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                activeControls.seekBy(PLAYER_CONFIG.FAST_FORWARD_SECONDS);
                triggerDoubleTap("right");
                showControlsTemporarily();
              }}
              aria-label="Fast forward 10 seconds"
              className="pointer-events-auto touch-manipulation w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-black/65 hover:bg-black/85 active:scale-85 text-white flex flex-col items-center justify-center backdrop-blur-md border border-white/20 transition-all shadow-2xl group/seek"
            >
              <RotateCw className="w-5 h-5 sm:w-6 sm:h-6 group-hover/seek:rotate-12 transition-transform" />
              <span className="text-[9px] font-bold mt-0.5 tracking-tighter">10</span>
            </button>
          </div>
        )}

        {/* Big Play Button on initial load or paused */}
        {!state.hasStarted && !state.isPlaying && !state.error && (
          <PlayerOverlay
            error={null}
            onRetry={activeControls.retry}
            showBigPlay={true}
            onPlayClick={() => {
              triggerCenterPulse("play");
              activeControls.play();
              showControlsTemporarily();
            }}
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
