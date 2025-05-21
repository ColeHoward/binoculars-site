import Fuse, { FuseResult } from "fuse.js";
import type { Transcript, TranscriptSegment } from "@/types"; // Ensure App's Transcript types are used

// ───────────────────────  CONSTANTS ───────────────────────
const TIER1_THRESHOLD = 0.05; // Most relevant
const TIER2_THRESHOLD = 0.2;
const TIER3_THRESHOLD = 0.3;  // Least relevant, but still a match
const RENDER_DOWN: boolean = true; // Direction for timestamp sorting

// ───────────────────────── TYPES FOR FUSE SEARCH ──────────────────────────

// Segment type for playlist fuse, includes video context
export type PlaylistSearchSegment = TranscriptSegment & {
  sourceVideoId: string;       // e.g., "video1"
  sourceVideoTitle: string;
  actualYouTubeId: string;   // YouTube's video ID
  videoOrder?: number;       // Optional, preserves original playlist order
};

// The direct output from our Fuse search functions
export type FuseSearchOutput = {
  text: string;
  start: number;
  duration: number;
  score: number; // Fuse.js score (lower is better)
  matchIndices?: [number, number][]; // Highlight indices

  // For playlist results
  sourceVideoId?: string;
  sourceVideoTitle?: string;
  actualYouTubeId?: string;
  videoOrder?: number;
};

// ───────────────────────── HELPER FUNCTIONS ──────────────────────────

function decodeHtmlEntities(s: string): string {
  if (!s) return "";
  // A basic version for worker context, or consider a more robust solution if needed
  return s
    .replaceAll("&quot;", "\"")
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&#39;", "'");
}

function mergeIndices(indices: [number, number][]): [number, number][] {
  if (!indices || indices.length < 2) return indices || [];
  const sortedIndices = [...indices].sort((a, b) => a[0] - b[0]);
  const merged: [number, number][] = [];
  let [start, end] = sortedIndices[0];
  for (let i = 1; i < sortedIndices.length; i++) {
    const [nextStart, nextEnd] = sortedIndices[i];
    if (nextStart <= end + 1) {
      end = Math.max(end, nextEnd);
    } else {
      merged.push([start, end]);
      [start, end] = [nextStart, nextEnd];
    }
  }
  merged.push([start, end]);
  return merged;
}

function findExactMatches(text: string, query: string): [number, number][] {
  if (!text || !query || query.length < 2) return [];
  const lcText = text.toLowerCase();
  const lcQuery = query.toLowerCase();
  const out: [number, number][] = [];
  for (let idx = lcText.indexOf(lcQuery);
       idx !== -1;
       idx = lcText.indexOf(lcQuery, idx + 1)) {
    out.push([idx, idx + query.length - 1]);
  }
  return out;
}

const getTier = (score: number): number => {
  if (score < TIER1_THRESHOLD) return RENDER_DOWN ? 0 : 2;
  if (score < TIER2_THRESHOLD) return 1;
  return RENDER_DOWN ? 2 : 0;
};

function compareTimestamps(a: number, b: number): number {
  return RENDER_DOWN ? a - b : b - a;
}

// ----------------------------
// FUSE SETUP & INITIALIZATION
// ----------------------------

let fuseInstance: Fuse<TranscriptSegment> | null = null;
let playlistFuseInstance: Fuse<PlaylistSearchSegment> | null = null;

function initFuse(segments: TranscriptSegment[] | undefined | null) {
  if (!segments) {
    fuseInstance = null;
    console.log("Worker: Fuse instance cleared.");
    return;
  }
  const processedSegments = segments.map(seg => ({
    ...seg,
    text: decodeHtmlEntities(seg.text),
  }));
  fuseInstance = new Fuse(processedSegments, {
    keys: ['text'],
    includeMatches: true,
    includeScore: true,
    shouldSort: false,
    minMatchCharLength: 2,
    threshold: TIER3_THRESHOLD,
    distance: 100,
    useExtendedSearch: false,
    ignoreLocation: true,
    isCaseSensitive: false,
    ignoreDiacritics: true,
    findAllMatches: true,
    ignoreFieldNorm: true,
  });
  console.log("Worker: Single video Fuse initialized with", processedSegments.length, "segments.");
}

function initPlaylistFuse(transcripts: Transcript[] | undefined | null) {
  if (!transcripts) {
    playlistFuseInstance = null;
    console.log("Worker: Playlist Fuse instance cleared.");
    return;
  }
  const allSegments: PlaylistSearchSegment[] = transcripts.flatMap(
    (transcript, idx) =>
      transcript.content.map(seg => ({
        ...seg,
        text: decodeHtmlEntities(seg.text),
        sourceVideoId: transcript.id,
        sourceVideoTitle: transcript.title,
        actualYouTubeId: transcript.videoId,
        videoOrder: idx
      }))
  );

  playlistFuseInstance = new Fuse(allSegments, {
    keys: ['text'],
    includeMatches: true,
    includeScore:   true,
    shouldSort:     false,
    minMatchCharLength: 2,
    threshold: TIER1_THRESHOLD, // Playlist might benefit from a stricter initial threshold
    distance: 150,
    useExtendedSearch: false,
    ignoreLocation: true,
    isCaseSensitive: false,
    ignoreDiacritics: true,
    findAllMatches:  true,
    ignoreFieldNorm: true,
  });
  console.log("Worker: Playlist Fuse initialized with", allSegments.length, "total segments.");
}

// ----------------------------
// KEYWORD SEARCH LOGIC
// ----------------------------

function processFuseResults(
  fuseResults: FuseResult<TranscriptSegment | PlaylistSearchSegment>[],
  query: string
): FuseSearchOutput[] {
  return fuseResults.map(r => {
    const { start, duration, text } = r.item;
    const score = r.score ?? 1;
    
    const rawIndicesFromFuse: [number, number][] = [];
    if (r.matches && r.matches[0] && r.matches[0].indices) {
        r.matches[0].indices.forEach(indexPair => {
            rawIndicesFromFuse.push([indexPair[0], indexPair[1]]);
        });
    }

    let finalMatchIndices = findExactMatches(text, query);
    if (finalMatchIndices.length === 0 || score > TIER1_THRESHOLD) {
      finalMatchIndices = mergeIndices(rawIndicesFromFuse);
    }
    if (finalMatchIndices.length === 0 && rawIndicesFromFuse.length > 0) {
        finalMatchIndices = rawIndicesFromFuse;
    }

    const baseResult: FuseSearchOutput = {
      text,
      start,
      duration,
      score,
      matchIndices: finalMatchIndices,
    };

    if ('sourceVideoId' in r.item) {
      return {
        ...baseResult,
        sourceVideoId: r.item.sourceVideoId,
        sourceVideoTitle: r.item.sourceVideoTitle,
        actualYouTubeId: r.item.actualYouTubeId,
        videoOrder: r.item.videoOrder,
      };
    }
    return baseResult;
  });
}

function sortResults(results: FuseSearchOutput[]): FuseSearchOutput[] {
  results.sort((a, b) => {
    const tierA = getTier(a.score);
    const tierB = getTier(b.score);
    if (tierA !== tierB) return tierA - tierB;
    if (a.videoOrder !== undefined && b.videoOrder !== undefined) {
      if (a.videoOrder !== b.videoOrder) {
        return (a.videoOrder ?? 0) - (b.videoOrder ?? 0);
      }
    }
    return compareTimestamps(a.start, b.start);
  });
  return results;
}

function searchSingleTranscript(query: string): FuseSearchOutput[] {
  if (!fuseInstance || !query.trim()) {
    return [];
  }
  const fuseResults = fuseInstance.search(query);
  const processed = processFuseResults(fuseResults, query);
  return sortResults(processed);
}

function searchPlaylist(query: string): FuseSearchOutput[] {
  if (!playlistFuseInstance || !query.trim()) {
    return [];
  }
  const fuseResults = playlistFuseInstance.search(query, { limit: 500 });
  const processed = processFuseResults(fuseResults, query);
  return sortResults(processed);
}

// Worker message handler
self.onmessage = (event: MessageEvent) => {
  // payload from main thread includes { query, requestId } or { segments, requestId } etc.
  const { type, payload } = event.data; 

  switch (type) {
    case 'init':
      initFuse(payload.segments);
      // Echo back the requestId that came with the init message
      self.postMessage({ type: 'initialized', mode: 'single', requestId: payload.requestId });
      break;
    case 'initPlaylist':
      initPlaylistFuse(payload.transcripts);
      // Echo back the requestId that came with the initPlaylist message
      self.postMessage({ type: 'initialized', mode: 'playlist', requestId: payload.requestId });
      break;
    case 'searchSingle':
      {
        const results = searchSingleTranscript(payload.query);
        // Include the original requestId in the response
        self.postMessage({ type: 'searchSingleResults', payload: results, requestId: payload.requestId });
      }
      break;
    case 'searchPlaylist':
      {
        const results = searchPlaylist(payload.query);
        // Include the original requestId in the response
        self.postMessage({ type: 'searchPlaylistResults', payload: results, requestId: payload.requestId });
      }
      break;
    default:
      console.warn('Worker received unknown message type:', type);
      // Optionally, if a requestId was passed with an unknown type, send an error back
      if (payload && payload.requestId) {
        self.postMessage({ type: 'error', message: `Unknown message type: ${type}`, requestId: payload.requestId });
      }
  }
};

// Inform the main thread that the worker is loaded and ready for initialization
// This message does not need a requestId as it's a generic ready signal.
self.postMessage({ type: 'workerReady' });

// Export empty object to satisfy TypeScript module requirement if this file is treated as a module.
export {}; 