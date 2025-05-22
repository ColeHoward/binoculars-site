"use client"

import React, { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { Transcript, TranscriptSearchResult, TranscriptSegment } from "@/types";
import { 
  initWorkerFuse, 
  initWorkerPlaylistFuse, 
  searchWithWorker,
  searchPlaylistWithWorker,
  FuseSearchOutput
} from "@/lib/utils";
import { SearchBox } from "./search-box";
import { SearchResults } from "./search-results";
import { PlaylistSidebar } from "./playlist-sidebar";
import { VisibilityToggle } from "./VisibilityToggle";
import Image from "next/image";
import { useTheme } from "next-themes";

declare global {
  interface Window {
    onYouTubeIframeAPIReady?: () => void;
    YT?: {
      Player: new (elementId: string, options: object) => YouTubePlayer;
    };
  }
}

interface TranscriptSearchClientProps { // Renamed from TranscriptSearchProps, removed className
  transcripts: Transcript[];
  // className?: string; // Removed
}

const PLAYER_CONTAINER_ID = 'youtube-player-main-container';

interface YouTubePlayer {
  destroy: () => void;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  playVideo: () => void;
  getVideoData: () => { video_id: string };
}

export function TranscriptSearchClient({ transcripts }: TranscriptSearchClientProps) { // Updated props
  const [selectedTranscriptId, setSelectedTranscriptId] = useState(transcripts[0]?.id || "");
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<TranscriptSearchResult[]>([]);
  const [searchMode, setSearchMode] = useState<"single" | "playlist">("single");
  const [isSearchUIVisible, setIsSearchUIVisible] = useState(true);
  const { theme } = useTheme();
  const playerRef = useRef<YouTubePlayer | null>(null);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [isYouTubeApiReady, setIsYouTubeApiReady] = useState(false);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const pendingSeekRef = useRef<{ videoId: string, timestamp: number } | null>(null);

  const selectedTranscript = useMemo(() => {
    return transcripts.find(t => t.id === selectedTranscriptId) || null;
  }, [transcripts, selectedTranscriptId]);

  useEffect(() => {
    if (selectedTranscript && selectedTranscript.content) {
      initWorkerFuse(selectedTranscript.content)
    } else {
      initWorkerFuse(null) 
    }
  }, [selectedTranscript]);

  useEffect(() => {
    if (transcripts && transcripts.length > 0) {
      initWorkerPlaylistFuse(transcripts)
    } else {
      initWorkerPlaylistFuse(null)
    }
  }, [transcripts]);
  
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
    let playerInstanceForCleanup: YouTubePlayer | null = null; 

    if (isYouTubeApiReady && selectedTranscript && document.getElementById(PLAYER_CONTAINER_ID)) {
      if (playerRef.current && typeof playerRef.current.destroy === 'function') {
        playerRef.current.destroy();
        playerRef.current = null;
        setIsPlayerReady(false); 
      }

      if (window.YT) {
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
            'onReady': (event: { target: YouTubePlayer }) => {
              playerRef.current = event.target; 
              setIsPlayerReady(true);
              const loadedVideoId = playerRef.current.getVideoData().video_id;

              if (pendingSeekRef.current && pendingSeekRef.current.videoId === loadedVideoId) {
                playerRef.current.seekTo(pendingSeekRef.current.timestamp, true);
                playerRef.current.playVideo(); 
                pendingSeekRef.current = null; 
              } else if (pendingSeekRef.current && pendingSeekRef.current.videoId !== loadedVideoId) {
                console.warn(`Pending seek was for ${pendingSeekRef.current.videoId} but player loaded ${loadedVideoId}. Clearing stale pending seek.`);
                pendingSeekRef.current = null; 
              }
            },

            'onError': (event: { data: number }) => {
              console.error("YouTube Player Error:", event.data, "for video:", selectedTranscript?.videoId);
              setIsPlayerReady(false); 
            }
          }
        });
      }
    } else {
      if (playerRef.current && typeof playerRef.current.destroy === 'function') {
        playerRef.current.destroy();
        playerRef.current = null;
        setIsPlayerReady(false);
      }
    }

    return () => {
      if (playerInstanceForCleanup && typeof playerInstanceForCleanup.destroy === 'function') {
      }
    };
  }, [isYouTubeApiReady, selectedTranscript]); 

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
          rawResults = await searchPlaylistWithWorker(query);
        } else {
          if (selectedTranscript) {
            rawResults = await searchWithWorker(query);
          } else {
            rawResults = [];
          }
        }
        const mappedResults = mapFuseOutputToTranscriptSearchResult(rawResults);
        setResults(mappedResults);
      } catch (error) {
        console.error("Error during worker search:", error);
        setResults([]); 
      } finally {
        setIsLoading(false);
      }
    };

    performSearch();
  }, [query, searchMode, selectedTranscript, mapFuseOutputToTranscriptSearchResult]); 

  const handleSearchInputChange = useCallback((newQuery: string) => {
    setQuery(newQuery);
  }, []); 

  const handleTranscriptSelect = useCallback((transcriptId: string) => {
    setSelectedTranscriptId(transcriptId);
    setResults([]); 
    setQuery(""); 
    setIsLoading(false); 
  }, []); 

  const toggleSearchMode = useCallback(() => {
    const wasSearchInputFocused = document.activeElement === searchInputRef.current;
    const selectionStart = searchInputRef.current?.selectionStart;
    const selectionEnd = searchInputRef.current?.selectionEnd;
    
    setSearchMode(prevMode => {
      const newMode = prevMode === "single" ? "playlist" : "single";
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
          } catch (_e) { return _e; }
        }
      }
    }, 0);
  }, []); 

  const handlePlayVideoSegment = useCallback((actualVideoIdToPlay: string, timestamp: number) => {
    const targetTranscript = transcripts.find(t => t.videoId === actualVideoIdToPlay);
    if (!targetTranscript) {
      console.error("Target transcript for seek not found:", actualVideoIdToPlay);
      return;
    }

    pendingSeekRef.current = { videoId: actualVideoIdToPlay, timestamp };

    if (selectedTranscript?.videoId === actualVideoIdToPlay && playerRef.current && isPlayerReady && typeof playerRef.current.seekTo === 'function') {
      playerRef.current.seekTo(pendingSeekRef.current.timestamp, true);
      playerRef.current.playVideo();
      pendingSeekRef.current = null; 
    } else if (selectedTranscript?.id !== targetTranscript.id) {
      setSelectedTranscriptId(targetTranscript.id);
    } 
  }, [isPlayerReady, transcripts, selectedTranscript, setSelectedTranscriptId]);

  const toggleSearchUIVisibility = useCallback(() => {
    setIsSearchUIVisible(prev => !prev);
  }, []);

  return (
    <>
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
              <button className="ml-4 hover:bg-red-700 text-white px-5 py-2 rounded-full text-sm font-medium md:px-5 md:py-2"
              style={{
                backgroundColor: theme === "dark" ? "rgb(241, 241, 241)" : "rgb(15, 15, 15)",
                color: theme === "dark" ? "black" : "white",
                fontFamily: "Roboto, sans-serif"
              }}
              >
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
        <div className="w-full md:w-1/3 border-t md:border-t-0 md:border-l border-zinc-200 dark:border-zinc-700 p-5 flex flex-col overflow-y-auto">
          <div className="flex-shrink-0">
            { searchMode === "single" ? (
              <h3 className="text-lg font-medium mb-4">Search selected video</h3>
            ) : (
              <h3 className="text-lg font-medium mb-4">Search across playlist videos</h3>
            )}
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
            <div className="rounded-lg overflow-hidden mb-5 max-h-[200px] sm:max-h-[300px] md:max-h-[450px] flex-shrink-0">
              <div className="h-full overflow-y-auto">
                <SearchResults
                  results={results}
                  videoId={selectedTranscript?.videoId || ""}
                  query={query}
                  isPlaylistSearch={searchMode === "playlist"}
                  onPlayVideoSegment={handlePlayVideoSegment}
                />
              </div>
            </div>
          )}
          <div className="flex-grow overflow-y-auto min-h-0">
            <PlaylistSidebar
              transcripts={transcripts}
              selectedTranscriptId={selectedTranscriptId}
              onSelect={handleTranscriptSelect} 
              className="w-full" 
            />
          </div>
        </div>
      </div>
    </>
  );
} 