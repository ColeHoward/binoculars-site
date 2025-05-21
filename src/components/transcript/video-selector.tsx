"use client"

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Transcript } from "@/types";
import { cn } from "@/lib/utils";

interface VideoSelectorProps {
  transcripts: Transcript[];
  selectedTranscriptId: string;
  onSelect: (transcriptId: string) => void;
  className?: string;
}

export function VideoSelector({
  transcripts,
  selectedTranscriptId,
  onSelect,
  className,
}: VideoSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedTranscript = transcripts.find(t => t.id === selectedTranscriptId);

  return (
    <div className={cn("relative", className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full p-3 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-left"
      >
        <span className="block truncate text-sm">
          {selectedTranscript ? selectedTranscript.title : "Select a video"}
        </span>
        <ChevronDown
          className={cn("h-4 w-4 text-zinc-500 transition-transform", {
            "transform rotate-180": isOpen,
          })}
        />
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-lg">
          <ul className="max-h-60 overflow-auto py-1 text-sm">
            {transcripts.map((transcript) => (
              <li
                key={transcript.id}
                onClick={() => {
                  onSelect(transcript.id);
                  setIsOpen(false);
                }}
                className={cn(
                  "cursor-pointer select-none py-2 px-3 hover:bg-zinc-100 dark:hover:bg-zinc-800",
                  {
                    "bg-zinc-100 dark:bg-zinc-800": selectedTranscriptId === transcript.id,
                  }
                )}
              >
                {transcript.title}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
} 