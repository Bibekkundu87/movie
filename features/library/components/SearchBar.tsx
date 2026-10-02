"use client";

import React from "react";
import { Search, X } from "lucide-react";

interface SearchBarProps {
  query: string;
  onQueryChange: (val: string) => void;
  onClear: () => void;
  resultCount?: number;
  placeholder?: string;
}

export function SearchBar({
  query,
  onQueryChange,
  onClear,
  resultCount,
  placeholder = "Search videos in Google Drive library...",
}: SearchBarProps) {
  const isFiltering = query.trim().length > 0;

  return (
    <div className="relative w-full max-w-md">
      <div className="relative flex items-center">
        <Search className="absolute left-3.5 w-4 h-4 text-[#717182] pointer-events-none" />

        <input
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-[#16161E] text-white text-sm pl-10 pr-10 py-2.5 rounded-lg border border-[#262633] focus:border-[#EF3B4F] focus:outline-none focus:ring-1 focus:ring-[#EF3B4F] placeholder-[#636375] transition-all"
        />

        {query && (
          <button
            type="button"
            onClick={onClear}
            className="absolute right-3 p-1 rounded-md text-[#8E8EA0] hover:text-white hover:bg-[#232330] transition-colors focus-visible:outline-none"
            aria-label="Clear search query"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {isFiltering && resultCount !== undefined && (
        <p className="text-xs text-[#8E8EA0] mt-1.5 px-1 font-mono tabular-nums">
          Showing {resultCount} {resultCount === 1 ? "result" : "results"}
        </p>
      )}
    </div>
  );
}
