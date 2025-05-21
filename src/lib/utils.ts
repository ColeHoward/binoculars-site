// ... existing clsx, twMerge imports ...
// import Fuse, { FuseResult } from "fuse.js";
// import type { FuseResultMatch } from 'fuse.js'; // Keep for now, might remove if not directly used by components
import { Transcript, TranscriptSegment, TranscriptSearchResult } from "@/types"; // Ensure App's Transcript types are used
import type { ClassValue } from "clsx";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";

// Import types from the worker to be used by the main thread
import type { FuseSearchOutput, PlaylistSearchSegment } from './search.worker';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format seconds to MM:SS format
export function formatTimestamp(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const formattedMins = mins.toString().padStart(2, "0");
  const formattedSecs = secs.toString().padStart(2, "0");
  return hrs > 0
    ? `${hrs}:${formattedMins}:${formattedSecs}`
    : `${formattedMins}:${formattedSecs}`;
}

// Generate a YouTube video URL with timestamp
export function generateYouTubeUrl(videoId: string, timestamp: number): string {
  return `https://www.youtube.com/watch?v=${videoId}&t=${Math.floor(timestamp)}s`;
}

/* ───────────────────────  CONSTANTS ─────────────────────── */
// These constants are now primarily used in the worker, but might be useful here for type checking or defaults.
export const TIER1_THRESHOLD = 0.05; 
export const TIER2_THRESHOLD = 0.2;
export const TIER3_THRESHOLD = 0.3;  
export const RENDER_DOWN: boolean = true;


/* ───────────────────────── HELPER FUNCTIONS (some may be duplicated in worker if not easily shared) ────────────────────────── */

// decodeHtmlEntities might still be useful on the main thread for other purposes
export function decodeHtmlEntities(s: string): string {
  if (!s) return "";
  return s
    .replaceAll("&quot;", "\"")
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&#39;", "'");
}

// These helpers are likely specific to search result processing, now in the worker.
// However, if they are used elsewhere, they can remain or be refactored.
// For now, assuming they are worker-specific.
// export function mergeIndices(indices: [number, number][]): [number, number][] { ... }
// export function findExactMatches(text: string, query: string): [number, number][] { ... }
// const getTier = (score: number): number => { ... };
// export function compareTimestamps(a: number, b: number): number { ... };

// ----------------------------
// WEB WORKER INTEGRATION
// ----------------------------

let searchWorker: Worker | null = null;
let workerInitializationPromise: Promise<void> | null = null;
let currentRequestId = 0;
const activeRequests = new Map<string, (value: any) => void>();


function getSearchWorker(): Worker {
  if (!searchWorker) {
    // Ensure this path is correct for your build setup (e.g., Next.js, Vite)
    searchWorker = new Worker(new URL('./search.worker.ts', import.meta.url), { type: 'module' });
    
    workerInitializationPromise = new Promise((resolve, reject) => {
      searchWorker!.onmessage = (event: MessageEvent) => {
        // Destructure including the requestId directly from event.data
        const { type, payload, requestId, error, mode } = event.data; // mode might be on event.data directly for 'initialized'
        // console.log("[Main Thread] Received from worker:", event.data); // Helpful for debugging

        if (type === 'workerReady') {
          console.log("Search worker is ready.");
          resolve(); // Resolves workerInitializationPromise
          return;
        }
        
        // All other messages should have a requestId
        if (!requestId) {
          console.warn("[Main Thread] Worker message received without requestId:", event.data);
          return;
        }

        if (type === 'initialized') {
          console.log(`Search worker initialized for ${mode} mode (request: ${requestId}).`);
          if (activeRequests.has(requestId)) {
            activeRequests.get(requestId)!(payload); // payload for init might be minimal (e.g., {success: true} or undefined)
            activeRequests.delete(requestId);
          } else {
              console.warn(`[Main Thread] Received 'initialized' for unknown request: ${requestId}`);
          }
          return;
        }

        if (error) { // If worker sends an error object with a type: 'error'
          console.error(`Search worker reported an error for request ${requestId}:`, payload); // payload would be the error details
          if (activeRequests.has(requestId)) {
            // Here, ideally, you'd reject the promise.
            // For now, resolving with an error-like structure or just cleaning up.
            // const resolverOrRejector = activeRequests.get(requestId)!;
            // resolverOrRejector({ error: true, data: payload }); // Or reject(payload) if you store reject fns
            activeRequests.delete(requestId);
          }
          return;
        }
        
        // Handle actual results (e.g., searchSingleResults, searchPlaylistResults)
        if (activeRequests.has(requestId)) {
          activeRequests.get(requestId)!(payload); // Resolve the promise with the main payload (e.g., search results array)
          activeRequests.delete(requestId);
        } else {
          // This can happen if a result comes back for a query that's no longer relevant (e.g., user typed fast)
          console.warn(`[Main Thread] Received worker message for unknown or outdated request: ${requestId}`, payload);
        }
      };

      searchWorker!.onerror = (err) => {
        console.error("Search worker encountered a critical error:", err);
        activeRequests.forEach((resolver, reqId) => {
          console.warn(`[Main Thread] Failing active request ${reqId} due to worker critical error.`);
          // resolver({ error: "Worker critical error", details: err }); // If resolving with error
          // Or, if you stored reject functions: rejecter(err);
        });
        activeRequests.clear();
        searchWorker = null;
        workerInitializationPromise = null; // Allow re-initialization attempt
        reject(err); // Reject the main workerInitializationPromise
      };
    });
  }
  return searchWorker;
}

async function ensureWorkerInitialized(): Promise<void> {
  getSearchWorker(); // Ensures worker is created and workerInitializationPromise is set
  if (!workerInitializationPromise) {
    // This case should ideally not be hit if getSearchWorker() is called first
    return Promise.reject(new Error("Worker initialization promise not found."));
  }
  return workerInitializationPromise;
}

// Function to post a message and return a promise that resolves with the worker's response
function postMessageToWorker<T>(type: string, payload: any, uniqueQuery?: string): Promise<T> {
  return new Promise(async (resolve, reject) => {
    try {
      await ensureWorkerInitialized(); // Make sure worker is ready before posting
      const worker = getSearchWorker();
      
      // Create a unique request ID for tracking responses
      // If a uniqueQuery is provided (like the actual search term), use it to make the ID more robust
      // against multiple identical 'type' requests.
      const requestId = uniqueQuery ? `${type}-${uniqueQuery}-${++currentRequestId}` : `${type}-${++currentRequestId}`;
      activeRequests.set(requestId, resolve as (value: any) => void);

      worker.postMessage({ type, payload: { ...payload, requestId } });
    } catch (error) {
      console.error(`Failed to post message ${type} to worker:`, error);
      reject(error);
    }
  });
}


export async function initWorkerFuse(segments: TranscriptSegment[] | undefined | null): Promise<void> {
  if (!segments || segments.length === 0) {
    console.log("Main: No segments to initialize worker with.");
    // Optionally, tell the worker to clear its instance if it was previously initialized
    // This depends on whether an empty init should clear or be a no-op
    // await postMessageToWorker<void>('init', { segments: null });
    return Promise.resolve();
  }
  console.log("Main: Requesting worker to initialize Fuse with", segments.length, "segments.");
  return postMessageToWorker<void>('init', { segments }, 'single');
}

export async function initWorkerPlaylistFuse(transcripts: Transcript[] | undefined | null): Promise<void> {
  if (!transcripts || transcripts.length === 0) {
    console.log("Main: No transcripts to initialize playlist worker with.");
    return Promise.resolve();
  }
  console.log("Main: Requesting worker to initialize Playlist Fuse with", transcripts.length, "transcripts.");
  return postMessageToWorker<void>('initPlaylist', { transcripts }, 'playlist');
}


export async function searchWithWorker(query: string): Promise<FuseSearchOutput[]> {
  if (!query.trim()) {
    return [];
  }
  console.log('Main: Sending search query to worker: "' + query + '"\n');
  return postMessageToWorker<FuseSearchOutput[]>('searchSingle', { query }, query);
}

export async function searchPlaylistWithWorker(query: string): Promise<FuseSearchOutput[]> {
  if (!query.trim()) {
    return [];
  }
  console.log('Main: Sending playlist search query to worker: "' + query + '"\n');
  // Ensure a unique request ID by appending the query itself and a counter
  return postMessageToWorker<FuseSearchOutput[]>('searchPlaylist', { query }, query);
}

// The old searchTranscript functions are now fully replaced by the worker versions.
// Remove or comment out:
// export function initFuse(segments: TranscriptSegment[] | undefined | null) { ... }
// export function initPlaylistFuse(transcripts: Transcript[] | undefined | null) { ... }
// function processFuseResults(...) { ... }
// function sortResults(...) { ... }
// export function searchSingleTranscript(query: string): FuseSearchOutput[] { ... }
// export function searchPlaylist(query: string): FuseSearchOutput[] { ... }

// Type re-exports for components if they were relying on utils.ts for these
export type { FuseSearchOutput, PlaylistSearchSegment };