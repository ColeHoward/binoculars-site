"use client";

import { useEffect, useMemo, useRef } from "react";
import { cn } from "@/lib/utils";
import { formatTimestamp } from "@/lib/utils";

// Constants from the original code - kept for score highlighting
const TIER1_THRESHOLD = 0.75;
const TIER2_THRESHOLD = 0.5;

// Constants for matching thresholds similar to the extension
const TIER1_MATCH_THRESHOLD = 0.05;
const TIER2_MATCH_THRESHOLD = 0.2;
const TIER3_MATCH_THRESHOLD = 0.3;

interface SearchResultProps {
  text: string;
  timestamp: number;
  index: number;
  selectedIndex: number;
  matches?: [number, number][];
  onClick: () => void;
  score?: number;
  isPlaylistSearch?: boolean;
  queryLength: number;
  videoTitle?: string;
  videoId?: string;
}

export function SearchResult({
  text,
  timestamp,
  index,
  selectedIndex,
  matches = [],
  onClick,
  score = 50,
  isPlaylistSearch = false,
  queryLength,
  videoTitle,
  videoId,
}: SearchResultProps) {
  const resultRef = useRef<HTMLDivElement>(null);
  const isSelected = index === selectedIndex;
  const isDark = () => document.documentElement.classList.contains("dark");

  // Simulate showNativeThumbnail functionality
  useEffect(() => {
    if (isPlaylistSearch) return;

    if (isSelected) {
      // For a real implementation, you'd implement the YouTube preview functionality here
      // Since we're just building a demo, we'll skip this
    }
  }, [isSelected, isPlaylistSearch, timestamp]);

  // Determine border color based on score
  const borderColor = useMemo(() => {
    if (score >= 100 * (1 - TIER1_THRESHOLD)) return isDark() ? "#01A368" : "#009966";
    if (score >= 100 * (1 - TIER2_THRESHOLD)) return "#FFB900";
    return isDark() ? "#CE2029" : "#e7000b";
  }, [score]);

  // Merge overlapping or adjacent match indices - like the extension's mergeIndices function
  const mergeIndices = (indices: [number, number][]): [number, number][] => {
    if (indices.length < 2) return indices;
    
    // Sort by start position
    const sortedIndices = [...indices].sort((a, b) => a[0] - b[0]);
    
    const merged: [number, number][] = [];
    let [start, end] = sortedIndices[0];
    
    for (let i = 1; i < sortedIndices.length; i++) {
      const [nextStart, nextEnd] = sortedIndices[i];
      
      if (nextStart <= end + 1) {  // Ranges touch or overlap
        end = Math.max(end, nextEnd);  // Extend the current range
      } else {
        merged.push([start, end]);     // Close the previous range
        [start, end] = [nextStart, nextEnd];  // Start a new range
      }
    }
    
    merged.push([start, end]);  // Add the last range
    return merged;
  };

  // Highlight matched text - updated to match the extension's style
  const highlightMatches = (text: string, matches: [number, number][]) => {
    if (!matches || matches.length === 0) return text;

    const mergedMatches = mergeIndices(matches);
    const segments = [];
    let lastEnd = 0;

    mergedMatches.forEach(([start, end], i) => {
      // Add text before match
      if (start > lastEnd) {
        segments.push(<span key={`pre-${i}`}>{text.substring(lastEnd, start)}</span>);
      }
      
      // Add highlighted match with styles matching the extension
      segments.push(
        <span 
          key={`match-${i}`} 
          className={cn(
            "font-bold",
            isDark() ? "text-[#ea6962]" : "text-emerald-600"
          )}
        >
          {text.substring(start, end + 1)}
        </span>
      );
      
      lastEnd = end + 1;
    });

    // Add remaining text
    if (lastEnd < text.length) {
      segments.push(<span key="post">{text.substring(lastEnd)}</span>);
    }

    return segments.length ? <>{segments}</> : text;
  };

  return (
    <div
      ref={resultRef}
      onClick={onClick}
      className={cn(
        "rounded-md cursor-pointer text-sm leading-[1.4] break-words border-l-2 font-sans flex flex-col",
        isPlaylistSearch ? "my-0.5 py-0.5" : "my-1",
        isDark() ? "bg-transparent" : "bg-white",
        isSelected ? "bg-white/10 dark:bg-white/10" : "",
        !isSelected && isDark() ? "hover:bg-zinc-800" : "hover:bg-black/10"
      )}
      style={{
        borderLeftColor: borderColor,
        borderRightColor: 'transparent',
        borderTopColor: 'transparent',
        borderBottomColor: 'transparent',
        fontFamily: "'Inter', 'Roboto', 'Arial', sans-serif"
      }}
    >
      <div 
        className={cn(
          "flex items-center gap-2 px-2",
          isPlaylistSearch ? "py-0.5" : "py-2"
        )}
      >
        {/* Timestamp */}
        <div className="flex flex-col items-center shrink-0 min-w-12 pr-1">
          <span className={cn(
            "text-xs font-mono", 
            isDark() ? "text-zinc-400" : "text-zinc-700"
          )}>
            <div className="flex items-center">
              {formatTimestamp(timestamp)}
            </div>
          </span>
        </div>

        {/* Text content */}
        <span className={cn(
          "flex-1 min-w-0",
          isPlaylistSearch ? "line-clamp-2 text-sm" : "",
          isDark() ? "text-zinc-200" : "text-zinc-800"
        )}>
          {matches?.length ? highlightMatches(text, matches) : text}
        </span>
      </div>
    </div>
  );
} 