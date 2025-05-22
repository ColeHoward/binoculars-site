"use client"

import { Transcript } from "@/types";
import { cn } from "@/lib/utils";
import { CheckCircle, ListVideo } from "lucide-react";
import Image from "next/image";
import { useTheme } from "next-themes";


function timeSince(date: string) {
  const now = new Date();
  const then = new Date(date);
  const diffTime = Math.abs(now.getTime() - then.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const diffWeeks = Math.ceil(diffDays / 7);
  const diffMonths = Math.ceil(diffDays / 30);
  const diffYears = Math.ceil(diffDays / 365);

  if (diffYears > 1) {
    return `${diffYears} years`;
  } else if (diffMonths > 11) {
    return `${diffMonths} months`;
  } else if (diffWeeks > 1) {
    return `${diffWeeks} weeks`;
  } else {
    return `${diffDays} days`;
  }
}

interface PlaylistSidebarProps {
  transcripts: Transcript[];
  selectedTranscriptId: string;
  onSelect: (transcriptId: string) => void;
  className?: string;
}

export function PlaylistSidebar({
  transcripts,
  selectedTranscriptId,
  onSelect,
  className,
}: PlaylistSidebarProps) {
  const { theme } = useTheme();
  
  return (
    <div className={cn("w-full mt-4 h-full flex flex-col overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden h-[335px]", className)}>
      {/* Playlist header */}
      <div className="p-3 border-b border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 flex-shrink-0">
        <h3 className="font-medium text-sm flex items-center">
        <ListVideo strokeWidth={1} className="mr-2" />
          Video Playlist
          <span className="ml-auto text-xs text-zinc-500 dark:text-zinc-400">
            {transcripts.length} videos
          </span>
        </h3>
      </div>
      
      {/* Playlist items */}
      <div className="overflow-y-auto h-full custom-scrollbar">
        {transcripts.map((transcript, index) => (
          <div 
            key={transcript.id}
            onClick={() => onSelect(transcript.id)}
            className={cn(
              "flex p-2 cursor-pointer transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800 !h-[33.33%]",
            )}
            style={{
              backgroundColor: selectedTranscriptId === transcript.id ? theme === 'dark' ? 'rgba(51,40,35,0.95)' : 'rgba(235,226,221,0.95)' : 'transparent',
              height: '33.33%'
            }}
          >
            {/* Thumbnail with video index */}
            <div className="relative flex-shrink-0 h-20 w-36 mr-2 bg-black rounded-md overflow-hidden">
              {transcript.thumbnail ? (
                <Image 
                  src={transcript.thumbnail} 
                  alt={transcript.title} 
                  width={160} 
                  height={90} 
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-zinc-800">
                  <span className="text-white text-xs">Video thumbnail</span>
                </div>
              )}
              
              {/* Duration badge */}
              <div className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1 rounded">
                {transcript.duration}
              </div>
              
              {/* Video number in playlist */}
              <div className="absolute top-1 left-1 text-white text-xs font-medium">
                {index + 1}
              </div>
              
            </div>
            
            {/* Video details - removed date info to reduce clutter */}
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium line-clamp-2 mb-0.5">
                {transcript.title}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center">
                {transcript.channelName}
                <CheckCircle className="h-3 w-3 ml-1 text-zinc-500 dark:text-zinc-400" />
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">{timeSince(transcript.datePosted)} ago</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 