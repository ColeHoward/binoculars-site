import { Transcript } from "@/types";
import { TranscriptSearchClient } from "./transcript-search-client";

interface TranscriptSearchProps {
  transcripts: Transcript[];
  className?: string;
}

export function TranscriptSearch({ transcripts, className }: TranscriptSearchProps) {
  return (
    <div className={className}>
      <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden sm:h-[700px]">
        <TranscriptSearchClient transcripts={transcripts} />
      </div>
    </div>
  );
} 