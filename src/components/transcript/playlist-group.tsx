"use client";

import { useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { TranscriptSearchResult } from "@/types";
import { Play, ChevronDown } from "lucide-react";
import { SearchResult } from "./search-result";

interface PlaylistGroupProps {
  videoId: string;
  rows: TranscriptSearchResult[];
  groupIndex: number;
  isGroupCollapsed: (videoId: string) => boolean;
  toggleGroupCollapse: (videoId: string) => void;
  results: TranscriptSearchResult[];
  setSelectedIndex: (index: number) => void;
  selectedIndex: number;
  onPlayVideoSegment: (actualVideoId: string, timestamp: number) => void;
  registerResultRef: (index: number, element: HTMLDivElement | null) => void;
}

export function jumpWithinPlaylist(videoId: string, seconds: number) {
  // In our demo, we'll just open a YouTube URL in a new tab
  const url = `https://www.youtube.com/watch?v=${videoId}&t=${Math.floor(seconds)}s`;
  window.open(url, '_blank');
}

export function PlaylistGroup({
  videoId,
  rows,
  groupIndex,
  isGroupCollapsed,
  toggleGroupCollapse,
  results,
  setSelectedIndex,
  selectedIndex,
  onPlayVideoSegment,
  registerResultRef
}: PlaylistGroupProps) {
  const [boxShadow, setBoxShadow] = useState("0 1px 2px rgba(0,0,0,0.03)");
  const [borderLeftColor, setBorderLeftColor] = useState("transparent");
  
  // Helper for checking dark mode
  const isDark = () => document.documentElement.classList.contains("dark");
  
  // Determine the actual YouTube video ID and title for this group from the first row.
  // All rows in this group should share the same sourceVideoTitle and actualVideoId.
  const sourceVideoTitle = rows[0]?.sourceVideoTitle || `Video ${videoId}`;
  const actualVideoIdForGroup = rows[0]?.actualVideoId || videoId; // Fallback, though actualVideoId should be present

  return (
    <div className={cn("", { "mt-3": groupIndex > 0 })}>
      {/* Sticky header for playlist mode */}
      <div
        className={cn(
          "sticky top-0 z-10 px-2 py-5 text-xs font-semibold tracking-wide select-none mb-1 flex items-center overflow-hidden cursor-pointer backdrop-blur-md bg-white/10 text-white h-[20px]",
          "sticky top-0 z-10 px-2 py-5 text-xs font-semibold tracking-wide select-none mb-1 flex items-center overflow-hidden cursor-pointer backdrop-blur-md bg-white/10 text-white h-[20px]",
          isDark() 
            ? "bg-white/10 text-white"
            : "bg-[#f2f2f2] text-black"
        )}
        style={{
          boxShadow,
          borderRadius: "4px",
          height: "20px !important",
          fontFamily: "'Inter', 'Roboto', 'Arial', sans-serif",
          borderLeftColor
        }}
        onMouseEnter={() => {
          setBoxShadow(isDark() 
            ? "0 1px 3px rgba(99, 102, 241, 0.12)" 
            : "0 1px 3px rgba(93, 78, 53, 0.06)");
          setBorderLeftColor(isDark()
            ? "rgba(139, 92, 246, 0.5)"
            : "rgba(93, 78, 53, 0.4)");
        }}
        onMouseLeave={() => {
          setBoxShadow("0 1px 2px rgba(0,0,0,0.03)");
          setBorderLeftColor(isDark()
            ? "rgba(139, 92, 246, 0.3)"
            : "rgba(93, 78, 53, 0.2)");
        }}
        onClick={() => toggleGroupCollapse(videoId)}
      >
        {/* Small indicator for number of results */}
        <div 
          className={cn(
            "mr-1 text-[14px] flex items-center justify-center rounded-lg",
            isDark() ? "text-white" : "text-black"
          )}
          style={{
            minWidth: "14px",
            height: "14px",
            padding: "0 3px"
          }}
        >
          {rows.length}
        </div>
        
        {/* Video title (clickable to navigate) */}
        <div 
          className="overflow-hidden text-ellipsis whitespace-nowrap flex-1 hover:underline hover:underline-offset-2"
          title={`Go to video: ${sourceVideoTitle}`}
        >
          {sourceVideoTitle}
        </div>
        
        {/* Navigation controls */}
        <div className="flex items-center">
          {/* Play button */}
          <div 
            onClick={(e) => {
              e.stopPropagation(); // Prevent toggling the group
              jumpWithinPlaylist(actualVideoIdForGroup, 0); // Start from beginning (0 seconds)
            }}
            className={cn(
              "flex items-center justify-center h-8 w-8 ml-1 rounded-sm",
              isDark() 
                ? "text-white hover:bg-white/20" 
                : "text-black hover:bg-black/10"
            )}
            title="Play this video from the start"
          >
            <Play className="h-3 w-3" />
          </div>
      
          {/* Collapsible toggle chevron */}
          <div 
            className={cn(
              "ml-1 flex items-center justify-center h-8 w-8 cursor-pointer rounded-sm",
              isDark() 
                ? "text-white hover:bg-white/20" 
                : "text-black hover:bg-black/10",
            )}
            onClick={(e) => {
              e.stopPropagation(); // We're already handling the click in the parent
              toggleGroupCollapse(videoId);
            }}
          >
            <ChevronDown 
              className="h-4 w-4 transition-transform duration-200 ease-in-out"
              style={{
                transform: isGroupCollapsed(videoId) ? "rotate(180deg)" : "rotate(0deg)",
              }}
            />
          </div>
        </div>
      </div>

      {/* Search results */}
      <div 
        className="pl-0.5 pr-0.5 overflow-hidden rounded-md duration-200"
        style={{
          maxHeight: isGroupCollapsed(videoId) ? "0" : "none",
          opacity: isGroupCollapsed(videoId) ? "0" : "1",
          transition: "max-height 0.25s ease-in-out, opacity 0.2s ease-in-out",
          marginBottom: isGroupCollapsed(videoId) ? "0" : "0.25rem",
          scrollMarginTop: "28px"
        }}
      >
        {rows.map((result, localIdx) => {
          // Find index in the overall results array
          const globalIdx = results.findIndex(r => 
            r.segment.start === result.segment.start && 
            r.refIndex === result.refIndex
          );
          
          // Score calculation (similar to what we did in search-results.tsx)
          const score = 75; // Default to a medium-high score for the demo
          
          return (
            <div
              key={`${result.sourceVideoId}-${result.segment.start}-${localIdx}`}
              ref={(el) => { registerResultRef(globalIdx, el); }}
              className="relative mb-0.5"
            >
              <SearchResult
                text={result.segment.text}
                timestamp={result.segment.start}
                index={globalIdx}
                selectedIndex={selectedIndex}
                matches={result.matchIndices || []}
                score={score}
                isPlaylistSearch={true}
                videoTitle={sourceVideoTitle}
                videoId={result.actualVideoId}
                onClick={() => {
                  setSelectedIndex(globalIdx);
                  onPlayVideoSegment(result.actualVideoId, result.segment.start);
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
} 