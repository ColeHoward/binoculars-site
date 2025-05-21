"use client"

export function Features() {
  return (
    <section className="py-16 md:py-24 bg-white dark:bg-zinc-800">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">Features that save you time</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="bg-zinc-50 dark:bg-zinc-700 p-8 rounded-xl shadow-sm">
            <div className="w-12 h-12 bg-[#FF0000]/10 rounded-full flex items-center justify-center mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#FF0000]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-3">Transcript Search</h3>
            <p className="text-zinc-600 dark:text-zinc-300">
              Instantly search through the entire transcript of any YouTube video to find exactly what you're looking for.
            </p>
          </div>
          
          <div className="bg-zinc-50 dark:bg-zinc-700 p-8 rounded-xl shadow-sm">
            <div className="w-12 h-12 bg-[#FF0000]/10 rounded-full flex items-center justify-center mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#FF0000]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-3">Jump to Moments</h3>
            <p className="text-zinc-600 dark:text-zinc-300">
              Click on any search result to immediately jump to that exact timestamp in the video.
            </p>
          </div>
          
          <div className="bg-zinc-50 dark:bg-zinc-700 p-8 rounded-xl shadow-sm">
            <div className="w-12 h-12 bg-[#FF0000]/10 rounded-full flex items-center justify-center mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#FF0000]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-3">Playlist Search</h3>
            <p className="text-zinc-600 dark:text-zinc-300">
              Search through all videos in a playlist at once, making it easy to find content across multiple videos.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
} 