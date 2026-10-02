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
    <div className="fixed inset-x-0 bottom-0 z-50 bg-[#14141C] border-t border-[#2A2A3A] shadow-2xl p-4 sm:p-6 transition-all duration-300 max-h-[85vh] overflow-y-auto">
      <div className="max-w-7xl mx-auto">
        {/* Drawer Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#222230] mb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#EF3B4F]/20 text-[#EF3B4F] flex items-center justify-center">
              <UploadCloud className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Google Drive Simulation Control Panel
              </h3>
              <p className="text-xs text-[#8E8EA0]">
                Simulate Drive folder events (Upload, Delete, Rename). Changes sync automatically via SWR (30s polling or manual sync).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close simulator">
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

        {/* Quick Test Actions */}
        <div className="flex flex-wrap items-center gap-2.5 mb-5">
          <Button
            variant="primary"
            size="sm"
            onClick={handleAddVideo}
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Simulate Upload (Test B: Add Video)
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleReset}
          >
            <RotateCcw className="w-4 h-4 mr-1.5" />
            Reset to 3 Initial Videos (Test A)
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onTriggerSync()}
          >
            Force Instant SWR Sync
          </Button>
        </div>

        {/* Current Folder File List in Drive */}
        <div className="rounded-lg border border-[#222230] overflow-hidden bg-[#0F0F14]">
          <div className="px-4 py-2.5 bg-[#181822] border-b border-[#222230] flex items-center justify-between text-xs font-semibold text-[#8E8EA0]">
            <span>Files in Drive Folder ({videos.length})</span>
            <span>Simulate Drive Actions</span>
          </div>

          {videos.length === 0 ? (
            <div className="p-6 text-center text-xs text-[#717182]">
              Folder is empty. Click &quot;Simulate Upload&quot; above to drop a file in the folder!
            </div>
          ) : (
            <div className="divide-y divide-[#1D1D28]">
              {videos.map((v) => (
                <div
                  key={v.id}
                  className="px-4 py-2.5 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="min-w-0 flex-1">
                    {editingId === v.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={newTitle}
                          onChange={(e) => setNewTitle(e.target.value)}
                          className="bg-[#242432] text-white px-2.5 py-1 rounded text-xs border border-[#3E3E50] focus:outline-none focus:border-[#EF3B4F] flex-1"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleSaveRename(v.id);
                            if (e.key === "Escape") setEditingId(null);
                          }}
                        />
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => handleSaveRename(v.id)}
                          className="h-7 text-xs px-2.5"
                        >
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditingId(null)}
                          className="h-7 text-xs px-2"
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <div>
                        <div className="font-medium text-white truncate">{v.title}</div>
                        <div className="text-[11px] text-[#717182] font-mono truncate">
                          ID: {v.id}
                        </div>
                      </div>
                    )}
                  </div>

                  {editingId !== v.id && (
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => startRename(v)}
                        title="Simulate file rename (Test D)"
                        className="h-7 px-2 text-xs"
                      >
                        <Edit3 className="w-3.5 h-3.5 mr-1" />
                        Rename
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteVideo(v.id, v.title)}
                        title="Simulate file deletion from Drive (Test C)"
                        className="h-7 px-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-950/40"
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
  );
}
