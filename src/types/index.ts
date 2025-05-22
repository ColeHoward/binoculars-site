export type Transcript = {
  id: string;
  title: string;
  videoId: string;
  channelName: string;
  subscribers: string;
  thumbnail?: string;
  icon?: string;
  duration: string;
  datePosted: string;
  content: TranscriptSegment[];
};

export type TranscriptSegment = {
  text: string;
  start: number; // Start time in seconds
  duration: number; // Duration in seconds
};

export type TranscriptSearchResult = {
  segment: TranscriptSegment;
  matchIndices?: [number, number][];
  refIndex: number;
  sourceVideoId: string;
  sourceVideoTitle: string;
  actualVideoId: string;
  score?: number;
}; 