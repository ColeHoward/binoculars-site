"use client"

import { useEffect, useRef, useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { TranscriptSearchResult } from "@/types";
import { SearchResult } from "./search-result";
import { PlaylistGroup } from "./playlist-group";


interface SearchResultsProps {
  results: TranscriptSearchResult[];
  videoId: string;
  query: string;
  isPlaylistSearch?: boolean;
  onPlayVideoSegment: (videoId: string, timestamp: number) => void;
}

export function SearchResults({ 
  results, 
  videoId, 
  query,
  isPlaylistSearch = false,
  onPlayVideoSegment
}: SearchResultsProps) {
  // State for keyboard navigation
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  // Track collapsed state for groups
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  // Refs for scrolling
  const containerRef = useRef<HTMLDivElement>(null);
  const resultRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Helper function to toggle group collapse
  const toggleGroupCollapse = (groupVideoId: string) => {
    setCollapsedGroups(prev => ({
      ...prev,
      [groupVideoId]: !prev[groupVideoId]
    }));
  };

  // Check if a group is collapsed
  const isGroupCollapsed = (groupVideoId: string) => {
    return collapsedGroups[groupVideoId] || false;
  };

  // Group results by sourceVideoId for playlist search
  const groupedResults = useMemo(() => {
    if (!isPlaylistSearch) return { [videoId]: results }; // For single video, key by main videoId

    const groups: Record<string, TranscriptSearchResult[]> = {};
    
    results.forEach(result => {
      // Use the sourceVideoId from the enriched search result
      const resultVideoId = result.sourceVideoId;
      
      if (!groups[resultVideoId]) {
        groups[resultVideoId] = [];
      }
      groups[resultVideoId].push(result);
    });
    
    return groups;
  }, [results, videoId, isPlaylistSearch]);

  // Effect to scroll to top when results change
  useEffect(() => {
    if (containerRef.current && results.length) {
      containerRef.current.scrollTop = 0;
    }
  }, [results]);

  // Effect to scroll selected item into view
  useEffect(() => {
    if (selectedIndex === -1) return;
    
    const el = resultRefs.current[selectedIndex];
    if (!el || !containerRef.current) return;
  
    const cRect = containerRef.current.getBoundingClientRect();
    const eRect = el.getBoundingClientRect();
    
    const topOk = eRect.top >= cRect.top;
    const bottomOk = eRect.bottom <= cRect.bottom - 2;
  
    if (!(topOk && bottomOk)) {
      el.scrollIntoView({
        block: "nearest",
        behavior: "smooth",
      });
    }
  }, [selectedIndex]);

  // Keyboard navigation handler
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (results.length === 0) return;
      
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < results.length - 1 ? prev + 1 : prev
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : prev);
      } else if (e.key === 'Enter' && selectedIndex !== -1 && results[selectedIndex]) {
        e.preventDefault();
        const resultData = results[selectedIndex];
        // Use actualVideoId for playback, which is now correctly on each result
        onPlayVideoSegment(resultData.actualVideoId, resultData.segment.start);
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [results, selectedIndex, onPlayVideoSegment]); // Removed videoId and isPlaylistSearch as actualVideoId is on resultData

  // Handle wheel events to contain scrolling
  const handleWheel = (e: React.WheelEvent) => {
    const element = containerRef.current;
    if (!element) {
      return;
    }

    const { scrollTop, scrollHeight, clientHeight } = element;
    const deltaY = e.deltaY;

    // Check if the element is actually scrollable and if the scroll is within bounds
    const canScrollUp = deltaY < 0 && scrollTop > 0;
    // Can scroll down if not yet at the bottom
    const canScrollDown = deltaY > 0 && (scrollTop + clientHeight) < scrollHeight;

    if (canScrollUp || canScrollDown) {
      // If the element can scroll in the intended direction, update its scrollTop.
      // The browser will handle clamping if deltaY is very large and overshoots.
      element.scrollTop += deltaY;
    }
    
    // Always call preventDefault to stop the page from scrolling.
    // This is important whether the element itself scrolled or was at a boundary.
    e.preventDefault();
  };

  // Empty results
  if (results.length === 0 && query.trim() !== "") {
    return (
      <div className="py-2 text-center">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">No results found</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      className={cn(
        "h-full max-h-[250px] flex flex-col px-1 overflow-y-auto font-sans outline-none custom-scrollbar",
      )}
      style={{
        scrollMarginTop: "28px",
        fontFamily: "'Inter', 'Roboto', 'Arial', sans-serif"
      }}
      onWheel={handleWheel}
    >
      {/* Results list - grouped or flat depending on mode */}
      <div className="py-1">
        {Object.entries(groupedResults).map(([groupVideoId, groupResults], groupIndex) => (
          isPlaylistSearch ? (
            <PlaylistGroup
              key={groupVideoId}
              videoId={groupVideoId}
              rows={groupResults}
              groupIndex={groupIndex}
              isGroupCollapsed={isGroupCollapsed}
              toggleGroupCollapse={() => toggleGroupCollapse(groupVideoId)}
              results={results}
              setSelectedIndex={setSelectedIndex}
              selectedIndex={selectedIndex}
              onPlayVideoSegment={onPlayVideoSegment}
            />
          ) : (
            groupResults.map((result, index) => {
              const { segment } = result;
              
              // Calculate a score
              const score = 75; // Default to a medium-high score
              
              const globalIndex = results.indexOf(result); // For selectedIndex management
              
              return (
                <div 
                  key={`${segment.start}-${index}`}
                  ref={(el) => { resultRefs.current[globalIndex] = el; }}
                  className="relative mb-1"
                >
                  <SearchResult
                    text={segment.text}
                    timestamp={segment.start}
                    index={globalIndex}
                    selectedIndex={selectedIndex}
                    onClick={() => {
                      setSelectedIndex(globalIndex);
                      onPlayVideoSegment(videoId, segment.start); // Use main videoId
                    }}
                    score={score}
                    isPlaylistSearch={false}
                    matches={result.matchIndices ? [...result.matchIndices.map(m => [m[0], m[1]] as [number, number])] : []}
                  />
                </div>
              );
            })
          )
        ))}
      </div>
    </div>
  );
} 