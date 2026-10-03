"use client";

import React, { useState } from "react";
import { Plus, Trash2, Edit3, RotateCcw, X, UploadCloud, Check } from "lucide-react";
import { Video } from "@/types/video";
import { videoService } from "@/services/videoService";
import { Button } from "@/components/ui/Button";

interface DriveSimulatorDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  videos: Video[];
  onTriggerSync: () => Promise<unknown>;
}

export function DriveSimulatorDrawer({
  isOpen,
  onClose,
  videos,
  onTriggerSync,
}: DriveSimulatorDrawerProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [lastAction, setLastAction] = useState<string | null>(null);

  if (!isOpen) return null;

  const notifyAction = (text: string) => {
    setLastAction(text);
    setTimeout(() => setLastAction(null), 4000);
  };

  const handleAddVideo = () => {
    const newVideo = videoService.mock.addVideo();
    notifyAction(`Uploaded "${newVideo.title}" to Google Drive simulation!`);
  };

  const handleDeleteVideo = (id: string, title: string) => {
    videoService.mock.removeVideo(id);
    notifyAction(`Deleted "${title}" from Google Drive folder simulation.`);
  };

  const startRename = (v: Video) => {
    setEditingId(v.id);
    setNewTitle(v.title);
  };

  const handleSaveRename = (id: string) => {
    if (!newTitle.trim()) return;
    const updated = videoService.mock.renameVideo(id, newTitle.trim());
    if (updated) {
      notifyAction(`Renamed video to "${updated.title}" in Drive simulation.`);
    }
    setEditingId(null);
  };

  const handleReset = () => {
    videoService.mock.reset();
    notifyAction("Reset mock library back to initial 3 videos (Test A preset).");
  };

  return (
    <>
      {/* Backdrop for mobile and desktop */}
      <div
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in"
      />

      <div className="fixed inset-x-0 bottom-0 z-50 bg-[#14141C] border-t border-[#2A2A3A] shadow-2xl p-4 sm:p-6 transition-all duration-300 max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom">
        <div className="max-w-7xl mx-auto">
          {/* Drawer Header */}
          <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-[#222230] mb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#EF3B4F]/20 text-[#EF3B4F] flex items-center justify-center shrink-0">
                <UploadCloud className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
                  Google Drive Simulator Control
                </h3>
                <p className="text-[11px] sm:text-xs text-[#8E8EA0] line-clamp-1 sm:line-clamp-none">
                  Simulate Drive events (Upload, Delete, Rename). Changes sync via SWR (30s polling).
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close simulator" className="h-8 w-8">
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Action Flash Message */}
          {lastAction && (
            <div className="flex items-center gap-2 p-3 mb-4 rounded-lg bg-emerald-950/60 border border-emerald-800/60 text-xs text-emerald-200">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{lastAction}</span>
            </div>
          )}

          {/* Quick Test Actions: Responsive Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 mb-5">
            <Button
              variant="primary"
              size="sm"
              onClick={handleAddVideo}
              className="w-full text-xs h-9 justify-center"
            >
              <Plus className="w-4 h-4 mr-1.5 shrink-0" />
              <span>Simulate Upload (Add Video)</span>
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={handleReset}
              className="w-full text-xs h-9 justify-center"
            >
              <RotateCcw className="w-4 h-4 mr-1.5 shrink-0" />
              <span>Reset to 3 Initial Videos</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onTriggerSync()}
              className="w-full text-xs h-9 justify-center"
            >
              <Check className="w-4 h-4 mr-1.5 shrink-0" />
              <span>Force Instant SWR Sync</span>
            </Button>
          </div>

          {/* Current Folder File List in Drive */}
          <div className="rounded-lg border border-[#222230] overflow-hidden bg-[#0F0F14]">
            <div className="px-3 sm:px-4 py-2 bg-[#181822] border-b border-[#222230] flex items-center justify-between text-xs font-semibold text-[#8E8EA0]">
              <span>Drive Folder Files ({videos.length})</span>
              <span className="hidden sm:inline">Simulate Actions</span>
            </div>

            {videos.length === 0 ? (
              <div className="p-6 text-center text-xs text-[#717182]">
                Folder is empty. Tap &quot;Simulate Upload&quot; above to add a video!
              </div>
            ) : (
              <div className="divide-y divide-[#1D1D28]">
                {videos.map((v) => (
                  <div
                    key={v.id}
                    className="px-3 sm:px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 text-xs"
                  >
                    <div className="min-w-0 flex-1 w-full">
                      {editingId === v.id ? (
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                          <input
                            type="text"
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            className="bg-[#242432] text-white px-3 py-1.5 rounded-lg text-xs border border-[#3E3E50] focus:outline-none focus:border-[#EF3B4F] flex-1"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleSaveRename(v.id);
                              if (e.key === "Escape") setEditingId(null);
                            }}
                          />
                          <div className="flex items-center gap-2 shrink-0">
                            <Button
                              size="sm"
                              variant="primary"
                              onClick={() => handleSaveRename(v.id)}
                              className="h-8 text-xs px-3 flex-1 sm:flex-initial"
                            >
                              Save
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setEditingId(null)}
                              className="h-8 text-xs px-3 flex-1 sm:flex-initial"
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="font-medium text-white truncate text-xs sm:text-sm">{v.title}</div>
                          <div className="text-[10px] sm:text-[11px] text-[#717182] font-mono truncate">
                            ID: {v.id}
                          </div>
                        </div>
                      )}
                    </div>

                    {editingId !== v.id && (
                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => startRename(v)}
                          title="Simulate file rename (Test D)"
                          className="h-8 px-2.5 text-xs text-[#B0B0C0] hover:text-white"
                        >
                          <Edit3 className="w-3.5 h-3.5 mr-1" />
                          Rename
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteVideo(v.id, v.title)}
                          title="Simulate file deletion from Drive (Test C)"
                          className="h-8 px-2.5 text-xs text-red-400 hover:text-red-300 hover:bg-red-950/40"
                        >
                          <Trash2 className="w-3.5 h-3.5 mr-1" />
                          Delete
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
