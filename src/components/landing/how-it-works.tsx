"use client"

export function HowItWorks() {
  return (
    <section className="py-16 md:py-24 bg-zinc-50 dark:bg-zinc-900">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">How It Works</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-zinc-200 dark:bg-zinc-700 rounded-full flex items-center justify-center mb-6 relative">
              <span className="text-2xl font-bold">1</span>
            </div>
            <h3 className="text-xl font-semibold mb-3">Install Extension</h3>
            <p className="text-zinc-600 dark:text-zinc-300">
              Add Binoculars to Chrome with a single click. No account or setup required.
            </p>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-zinc-200 dark:bg-zinc-700 rounded-full flex items-center justify-center mb-6 relative">
              <span className="text-2xl font-bold">2</span>
            </div>
            <h3 className="text-xl font-semibold mb-3">Browse YouTube</h3>
            <p className="text-zinc-600 dark:text-zinc-300">
              Watch any YouTube video or playlist as you normally would.
            </p>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-zinc-200 dark:bg-zinc-700 rounded-full flex items-center justify-center mb-6">
              <span className="text-2xl font-bold">3</span>
            </div>
            <h3 className="text-xl font-semibold mb-3">Search & Jump</h3>
            <p className="text-zinc-600 dark:text-zinc-300">
              Use Binoculars to search the transcript and instantly jump to any moment.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
} 