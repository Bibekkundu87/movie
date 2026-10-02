import React from "react";
import { FolderOpen, SearchX, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "./Button";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  type: "empty-folder" | "no-results" | "error";
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  type,
  title,
  description,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  const configs = {
    "empty-folder": {
      icon: FolderOpen,
      defaultTitle: "No Videos in Google Drive Folder",
      defaultDescription:
        "Your configured Google Drive folder is currently empty. Drop MP4, WebM, or MKV video files directly into your Drive folder, and StreamBox will automatically discover and display them here upon the next sync cycle.",
      defaultAction: "Check Drive Folder",
    },
    "no-results": {
      icon: SearchX,
      defaultTitle: "No Matching Videos Found",
      defaultDescription:
        "We could not find any videos matching your search criteria. Try checking for typos or searching by a different title or keyword.",
      defaultAction: "Clear Search Filter",
    },
    "error": {
      icon: AlertCircle,
      defaultTitle: "Library Synchronization Error",
      defaultDescription:
        "Unable to fetch the current video library from the Google Drive API. Please verify your network connection and server configuration.",
      defaultAction: "Retry Synchronization",
    },
  };

  const current = configs[type];
  const Icon = current.icon;

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center p-8 sm:p-12 rounded-xl bg-[#14141A] border border-[#23232E] max-w-xl mx-auto my-8",
        className
      )}
    >
      <div className="w-14 h-14 rounded-full bg-[#1C1C26] border border-[#2D2D3C] flex items-center justify-center mb-4 text-[#EF3B4F]">
        <Icon className="w-7 h-7" strokeWidth={1.75} />
      </div>

      <h3 className="text-lg font-semibold text-white mb-2 tracking-tight">
        {title || current.defaultTitle}
      </h3>

      <p className="text-sm text-[#8E8EA0] leading-relaxed mb-6 max-w-md">
        {description || current.defaultDescription}
      </p>

      {onAction && (
        <Button
          variant={type === "error" ? "primary" : "secondary"}
          size="md"
          onClick={onAction}
        >
          {type === "error" && <RefreshCw className="w-4 h-4 mr-1.5" />}
          {actionLabel || current.defaultAction}
        </Button>
      )}
    </div>
  );
}
