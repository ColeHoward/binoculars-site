"use client"

import React, { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { Transcript, TranscriptSearchResult, TranscriptSegment } from "@/types";
import { 
  initWorkerFuse, 
  initWorkerPlaylistFuse, 
  searchWithWorker,
  searchPlaylistWithWorker,
  FuseSearchOutput // This type is re-exported by utils.ts
} from "@/lib/utils";
import { SearchBox } from "./search-box";
import { SearchResults } from "./search-results";
import { PlaylistSidebar } from "./playlist-sidebar";
import { VisibilityToggle } from "./VisibilityToggle";
import Image from "next/image";


// Add YT types to window for YouTube Iframe API
declare global {
  interface Window {
    onYouTubeIframeAPIReady?: () => void;
    YT?: any;
  }
}

interface TranscriptSearchProps {
  transcripts: Transcript[];
  className?: string;
}

const PLAYER_CONTAINER_ID = 'youtube-player-main-container';

// ... (rest of imports and global interface)

export function TranscriptSearch({ transcripts, className }: TranscriptSearchProps) {
  const [selectedTranscriptId, setSelectedTranscriptId] = useState(transcripts[0]?.id || "");
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<TranscriptSearchResult[]>([]);
  const [searchMode, setSearchMode] = useState<"single" | "playlist">("single");
  const [isSearchUIVisible, setIsSearchUIVisible] = useState(true);

  const playerRef = useRef<any>(null);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [isYouTubeApiReady, setIsYouTubeApiReady] = useState(false);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const pendingSeekRef = useRef<{ videoId: string, timestamp: number } | null>(null);

  const selectedTranscript = useMemo(() => {
    return transcripts.find(t => t.id === selectedTranscriptId) || null;
  }, [transcripts, selectedTranscriptId]);

  // Initialize Fuse for single transcript search via worker
  useEffect(() => {
    console.log("Effect: initWorkerFuse for single video");
    if (selectedTranscript && selectedTranscript.content) {
      initWorkerFuse(selectedTranscript.content)
        .then(() => console.log("Worker Fuse initialized for single video."))
        .catch(err => console.error("Error initializing worker Fuse:", err));
    } else {
      initWorkerFuse(null) // Tell worker to clear its instance if applicable
        .then(() => console.log("Worker Fuse cleared for single video."))
        .catch(err => console.error("Error clearing worker Fuse:", err));
    }
  }, [selectedTranscript]);

  // Initialize Fuse for playlist search via worker
  useEffect(() => {
    console.log("Effect: initWorkerPlaylistFuse");
    if (transcripts && transcripts.length > 0) {
      initWorkerPlaylistFuse(transcripts)
        .then(() => console.log("Worker Playlist Fuse initialized."))
        .catch(err => console.error("Error initializing worker Playlist Fuse:", err));
    } else {
      initWorkerPlaylistFuse(null)
        .then(() => console.log("Worker Playlist Fuse cleared."))
        .catch(err => console.error("Error clearing worker Playlist Fuse:", err));
    }
  }, [transcripts]);
  
  // ... (YouTube API and player useEffects can remain the same) ...
  // Placeholder for existing YouTube API and player useEffects
  useEffect(() => {
    const loadYouTubeAPI = () => {
      if (window.YT && window.YT.Player) {
        setIsYouTubeApiReady(true);
        return;
      }
      if (!document.getElementById('youtube-iframe-api')) {
        const tag = document.createElement('script');
        tag.id = 'youtube-iframe-api';
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
      }
      window.onYouTubeIframeAPIReady = () => {
        setIsYouTubeApiReady(true);
      };
    };
    loadYouTubeAPI();
  }, []);

  useEffect(() => {
    let playerInstanceForCleanup: any = null; // To capture the instance for cleanup

    if (isYouTubeApiReady && selectedTranscript && document.getElementById(PLAYER_CONTAINER_ID)) {
      if (playerRef.current && typeof playerRef.current.destroy === 'function') {
        console.log("Destroying previous player instance before creating new one.");
        playerRef.current.destroy();
        playerRef.current = null;
        setIsPlayerReady(false); // Player is no longer ready
      }

      console.log(`Creating player for videoId: ${selectedTranscript.videoId}`);
      playerInstanceForCleanup = new window.YT.Player(PLAYER_CONTAINER_ID, {
        height: '100%',
        width: '100%',
        videoId: selectedTranscript.videoId,
        playerVars: {
          playsinline: 1,
          modestbranding: 1,
          fs: 1,
          rel: 0,
        },
        events: {
          'onReady': (event: any) => {
            playerRef.current = event.target; // Assign to ref now that it's ready
            setIsPlayerReady(true);
            const loadedVideoId = playerRef.current.getVideoData().video_id;
            console.log(`Player ready for ${loadedVideoId}. Pending seek:`, pendingSeekRef.current);

            if (pendingSeekRef.current && pendingSeekRef.current.videoId === loadedVideoId) {
              console.log(`Executing pending seek for ${loadedVideoId} to ${pendingSeekRef.current.timestamp}s.`);
              playerRef.current.seekTo(pendingSeekRef.current.timestamp, true);
              playerRef.current.playVideo(); // Ensure playback starts
              pendingSeekRef.current = null; // Clear the consumed pending seek
            } else if (pendingSeekRef.current && pendingSeekRef.current.videoId !== loadedVideoId) {
              console.warn(`Pending seek was for ${pendingSeekRef.current.videoId} but player loaded ${loadedVideoId}. Clearing stale pending seek.`);
              pendingSeekRef.current = null; // Clear stale pending seek
            }
          },
          'onStateChange': (event: any) => {
            // console.log("Player state changed:", event.data, "for video:", playerRef.current?.getVideoData?.()?.video_id);
            // Add any other state handling if needed
          },
          'onError': (event: any) => {
            console.error("YouTube Player Error:", event.data, "for video:", selectedTranscript?.videoId);
            setIsPlayerReady(false); // Player encountered an error
          }
        }
      });
    } else {
      // No selected transcript or API not ready, clean up existing player if any
      if (playerRef.current && typeof playerRef.current.destroy === 'function') {
        console.log("No selected transcript or API not ready, destroying player.");
        playerRef.current.destroy();
        playerRef.current = null;
        setIsPlayerReady(false);
      }
    }

    return () => {
      // Use the instance captured in the effect's closure for cleanup
      if (playerInstanceForCleanup && typeof playerInstanceForCleanup.destroy === 'function') {
        console.log("Destroying player instance from useEffect cleanup for video:", playerInstanceForCleanup.getVideoData?.()?.video_id);
        // playerInstanceForCleanup.destroy(); // Destroying here can be tricky if a new instance is already being created.
                                           // The destruction at the beginning of the effect is generally safer.
      }
    };
  }, [isYouTubeApiReady, selectedTranscript]); // Removed 'transcripts' as selectedTranscript is the direct driver for player re-creation.

  const mapFuseOutputToTranscriptSearchResult = useCallback((
    fuseOutput: FuseSearchOutput[]
  ): TranscriptSearchResult[] => {
    return fuseOutput.map((item, index) => {
      const segment: TranscriptSegment = {
        text: item.text,
        start: item.start,
        duration: item.duration,
      };
      return {
        segment: segment,
        matchIndices: item.matchIndices,
        refIndex: index, 
        sourceVideoId: item.sourceVideoId || selectedTranscript?.id || "",
        sourceVideoTitle: item.sourceVideoTitle || selectedTranscript?.title || "",
        actualVideoId: item.actualYouTubeId || selectedTranscript?.videoId || "",
        score: item.score,
      };
    });
  }, [selectedTranscript]);

  // Effect to perform search when query or searchMode changes
  useEffect(() => {
    const performSearch = async () => {
      if (!query.trim()) {
        setResults([]);
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      let rawResults: FuseSearchOutput[] = [];

      try {
        if (searchMode === "playlist") {
          console.log("Performing playlist search with worker for:", query);
          rawResults = await searchPlaylistWithWorker(query);
        } else {
          if (selectedTranscript) {
            console.log("Performing single video search with worker for:", query, "on video:", selectedTranscript.id);
            rawResults = await searchWithWorker(query);
          } else {
            rawResults = [];
          }
        }
        const mappedResults = mapFuseOutputToTranscriptSearchResult(rawResults);
        setResults(mappedResults);
        console.log("Search completed via worker, results:", mappedResults.length);
      } catch (error) {
        console.error("Error during worker search:", error);
        setResults([]); // Clear results on error
      } finally {
        setIsLoading(false);
      }
    };

    performSearch();
  }, [query, searchMode, selectedTranscript, mapFuseOutputToTranscriptSearchResult]); 
  // Removed transcripts from dependency array as worker init is separate

  const handleSearchInputChange = useCallback((newQuery: string) => {
    setQuery(newQuery);
  }, []); // Removed setDebouncedQuery

  const handleTranscriptSelect = useCallback((transcriptId: string) => {
    setSelectedTranscriptId(transcriptId);
    setResults([]); 
    setQuery(""); 
    setIsLoading(false); 
  }, []); // Dependencies are stable setters

  const toggleSearchMode = useCallback(() => {
    const wasSearchInputFocused = document.activeElement === searchInputRef.current;
    const selectionStart = searchInputRef.current?.selectionStart;
    const selectionEnd = searchInputRef.current?.selectionEnd;
    
    setSearchMode(prevMode => {
      const newMode = prevMode === "single" ? "playlist" : "single";
      console.log("Toggling search mode to:", newMode);
      // Worker re-initialization for the new mode (single vs playlist) will be handled 
      // by the respective useEffect hooks if selectedTranscript or transcripts data changes.
      // Or, if the data is already loaded, the worker just uses the correct instance.
      return newMode;
    });
    setQuery(""); 
    setResults([]);
    
    setTimeout(() => {
      if (wasSearchInputFocused && searchInputRef.current) {
        searchInputRef.current.focus();
        if (selectionStart !== undefined && selectionEnd !== undefined) {
          try {
            searchInputRef.current.setSelectionRange(selectionStart, selectionEnd);
          } catch (e) { /* Ignore */ }
        }
      }
    }, 0);
  }, []); // Dependencies are stable setters

  const handlePlayVideoSegment = useCallback((actualVideoIdToPlay: string, timestamp: number) => {
    const targetTranscript = transcripts.find(t => t.videoId === actualVideoIdToPlay);
    if (!targetTranscript) {
      console.error("Target transcript for seek not found:", actualVideoIdToPlay);
      return;
    }

    // Always set the pending seek operation.
    // It will be consumed by onReady or by direct action if player is already ready for this video.
    pendingSeekRef.current = { videoId: actualVideoIdToPlay, timestamp };
    console.log(`Pending seek set: ${actualVideoIdToPlay} at ${timestamp}s`);

    if (selectedTranscript?.videoId === actualVideoIdToPlay && playerRef.current && isPlayerReady && typeof playerRef.current.seekTo === 'function') {
      // Player is ready, and it's the correct video. Execute immediately.
      console.log(`Immediate seek/play for ${actualVideoIdToPlay} at ${timestamp}s.`);
      playerRef.current.seekTo(pendingSeekRef.current.timestamp, true);
      playerRef.current.playVideo();
      pendingSeekRef.current = null; // Consumed
    } else if (selectedTranscript?.id !== targetTranscript.id) {
      // Different video selected, or no video was selected prior.
      // Change transcript, which will trigger player (re)load. onReady will use pendingSeekRef.
      console.log(`Switching to transcript ${targetTranscript.id} (video ${actualVideoIdToPlay}). Player onReady will handle pending seek.`);
      setSelectedTranscriptId(targetTranscript.id);
    } else {
      // Same transcript selected (or selectedTranscript was null and is now being set to targetTranscript implicitly by a later step),
      // but player wasn't ready OR it's the initial load for this transcript.
      // onReady for the existing/newly-loading player for this selectedTranscript will pick up pendingSeekRef.
      // No need to call setSelectedTranscriptId if it's already correct and doesn't change.
      console.log(`Player not ready or selected transcript ID unchanged. Player onReady will handle pending seek for ${actualVideoIdToPlay}.`);
      // If the player *is* actually ready now, but this branch was taken due to selectedTranscript?.id !== targetTranscript.id being false
      // (meaning it's the same transcript.id), and the earlier direct play didn't happen (e.g. playerRef.current was null momentarily)
      // this ensures that if the player becomes ready for the *current* selectedTranscript, it still checks pendingSeekRef.
      // This scenario is mostly covered by the `onReady` handler itself.
    }
  }, [isPlayerReady, transcripts, selectedTranscript, setSelectedTranscriptId]);

  const toggleSearchUIVisibility = useCallback(() => {
    setIsSearchUIVisible(prev => !prev);
  }, []);

  return (
    <div className={className}>
      <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden h-[700px]">
        <div className="w-full h-14 bg-zinc-100 dark:bg-zinc-800 flex items-center px-5 border-b border-zinc-200 dark:border-zinc-700 flex-shrink-0">
          <div className="w-3.5 h-3.5 rounded-full bg-red-500 mr-2.5"></div>
          <div className="w-3.5 h-3.5 rounded-full bg-yellow-500 mr-2.5"></div>
          <div className="w-3.5 h-3.5 rounded-full bg-green-500 mr-2.5"></div>
          <div className="flex-1 mx-2 h-9 bg-white dark:bg-zinc-700 rounded-full flex items-center px-5 text-sm text-zinc-600 dark:text-zinc-300 truncate">
            {selectedTranscript?.title ? `youtube.com/watch?v=${selectedTranscript.videoId}` : 'youtube.com'}
          </div>
        </div>
        <div className="flex flex-col md:flex-row h-[calc(100%-3.5rem)]">
          <div className="w-full md:w-2/3 p-5 h-full">
            <div className="aspect-video bg-black rounded-lg overflow-hidden">
              {selectedTranscript ? (
                <div id={PLAYER_CONTAINER_ID} className="w-full h-full"></div>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-zinc-800 text-zinc-400">
                  Select a video to play.
                </div>
              )}
            </div>
            <div className="mt-5">
              <h2 className="text-xl font-semibold line-clamp-2">
                {selectedTranscript?.title || "Select a video"}
              </h2>
              <div className="flex items-center justify-between">
              <div className="flex items-center mt-2">
                {selectedTranscript && selectedTranscript.icon ? (
                  <Image 
                    src={selectedTranscript.icon} 
                    alt={selectedTranscript.channelName || "Channel Icon"} 
                    width={40} 
                    height={40} 
                    className="rounded-full mr-3"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-700 mr-3"></div>
                )}
                <div>
                  <div className="text-base font-medium">{selectedTranscript?.channelName || "Channel name"}</div>
                  <div className="text-sm text-zinc-500 dark:text-zinc-400">{selectedTranscript?.subscribers || "1.2M subscribers"}</div>
                </div>
                <button className="ml-4 bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-full text-sm font-medium">
                  Subscribe
                </button>
                
              </div>
              <VisibilityToggle 
                  isVisible={isSearchUIVisible} 
                  onToggle={toggleSearchUIVisibility} 
                />
                </div>
            </div>
          </div>
          <div className="w-full md:w-1/3 border-t md:border-t-0 md:border-l border-zinc-200 dark:border-zinc-700 p-5 flex flex-col overflow-hidden h-full">
            <div className="flex-shrink-0">
              <h3 className="text-lg font-medium mb-4">Search in this video</h3>
              {isSearchUIVisible && (
                <div className="space-y-4">
                  <SearchBox 
                    onSearch={handleSearchInputChange} 
                    placeholder={searchMode === "playlist" ? "Search across playlist videos..." : "Search for words in this video..."}
                    className="w-full"
                    searchMode={searchMode}
                    onSearchModeToggle={toggleSearchMode}
                    ref={searchInputRef}
                  />
                </div>
              )}
            </div>
            {isSearchUIVisible && (query.trim() || results.length > 0 || isLoading) && (
              <div className="rounded-lg overflow-hidden mb-5 max-h-[450px] flex-shrink-0">
                <SearchResults 
                  results={results} 
                  videoId={selectedTranscript?.videoId || ""}
                  isLoading={isLoading}
                  query={query}
                  isPlaylistSearch={searchMode === "playlist"}
                  onPlayVideoSegment={handlePlayVideoSegment}
                />
              </div>
            )}
            <div className="flex-grow overflow-y-hidden min-h-0">
              <PlaylistSidebar
                transcripts={transcripts}
                selectedTranscriptId={selectedTranscriptId}
                onSelect={handleTranscriptSelect} 
                className="w-full" 
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 