"use client"

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { TranscriptSearch } from "@/components/transcript/transcript-search";
import transcripts from "@/data/transcripts";

export function Hero() {
  return (
    <header className="container-fluid mx-auto px-6 py-12 md:py-16 lg:py-24">
      <div className="flex flex-col items-center gap-8 text-center mb-20">
        <div className="inline-block rounded-full bg-zinc-200 dark:bg-zinc-800 px-4 py-1.5 text-sm font-medium text-zinc-800 dark:text-zinc-200">
          Chrome Extension
        </div>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight max-w-5xl"
        style={{lineHeight: "51px"}}>
          Navigate YouTube with{" "}
          <span className="inline-flex items-center" style={{ color: '#ff0033' }}>
            <Image 
              src="/logo.svg" 
              alt="Binoculars Logo" 
              width={48} 
              height={48} 
              className="mr-3 inline" 
            />
            Binoculars
          </span>
        </h1>
        <p className="text-xl md:text-2xl text-zinc-700 dark:text-zinc-300 max-w-3xl">
          Search YouTube videos + playlists to jump directly to specific moments. Never waste time scrubbing through content again.
        </p>
        <div className="flex flex-col sm:flex-row gap-5">
          <a 
            href="https://chromewebstore.google.com/detail/binoculars-pinpoint-momen/pphplhefnhbifdkhkipnaphgggglphfh"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center cursor-pointer"
          >
            <Button variant="default" size="lg" className="hover:bg-[#CC0000] text-white font-medium py-6 px-8 rounded-lg text-lg cursor-pointer"
            style={{ backgroundColor: '#ff0033' }}
            >
              Add to Chrome
            </Button>
          </a>
          <Button 
            variant="outline" 
            className="border-zinc-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 py-6 px-8 rounded-lg text-lg"
            size="lg"
            onClick={() => {
              window.location.href = "#features";
            }}
          >
            Learn More
          </Button>
        </div>
      </div>

      <div className="w-full max-w-[1400px] mx-auto">
        <div className="w-full">
          <TranscriptSearch 
            transcripts={transcripts} 
            className="w-full shadow-2xl"
          />
        </div>
      </div>
    </header>
  );
} 