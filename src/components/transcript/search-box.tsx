"use client"

import { useState, useEffect, memo, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface SearchBoxProps {
  className?: string;
  onSearch: (query: string) => void;
  placeholder?: string;
  searchMode?: "single" | "playlist";
  onSearchModeToggle?: () => void;
}

const SearchBoxComponent = forwardRef<HTMLInputElement, SearchBoxProps>(({ 
  className, 
  onSearch, 
  placeholder = "Search transcript...",
  searchMode = "single",
  onSearchModeToggle
}, ref) => {
  const [query, setQuery] = useState("");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleToggleMode = () => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    if (onSearchModeToggle) {
      onSearchModeToggle();
      
      setTimeout(() => {
        if (ref && typeof ref !== 'function' && ref.current) {
          ref.current.focus();
        }
        onSearch(query);
      }, 0);
    }
    
    setTimeout(() => {
      setIsTransitioning(false);
    }, 400);
  };

  return (
    <div className={cn("relative flex items-center font-sans", className)}>
      <input
        ref={ref}
        type="text"
        value={query}
        spellCheck="false"
        onChange={(e) => {
          const newValue = e.target.value;
          setQuery(newValue);
          onSearch(newValue);
        }}
        placeholder={placeholder}
        className="h-[48px] py-[8px] pl-[12px] pr-10 border rounded-l-xl focus:outline-none focus:ring-0 text-[0.875rem] w-full outline-none font-sans border-zinc-200 
        dark:border-[#303030] bg-white dark:bg-[#121212] text-zinc-800 dark:text-white placeholder:text-zinc-500 dark:placeholder:text-[#aaaaaa]"
      />

      {onSearchModeToggle && (
        <div
          className="h-[48px] relative flex items-center justify-center px-3 py-[8.5px] border border-l-0 rounded-r-xl cursor-pointer bg-zinc-100 hover:bg-zinc-200 
          dark:bg-[rgb(255,255,255,.08)] border-zinc-200 dark:border-[#303030]"
          onClick={handleToggleMode}
          title={`Switch to ${searchMode === 'single' ? 'playlist' : 'current video'} search`}
        >
          <button
            className="!bg-transparent text-zinc-800 dark:text-white !transition-all !duration-250"
            aria-label={`Switch to ${searchMode === 'single' ? 'playlist' : 'single video'} search`}
            style={{
              border: 'none',
              cursor: 'pointer',
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              position: 'relative',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: "transparent",
              padding: 0,
            }}
          >
            <div className="flex items-center justify-center !transition-all !duration-250" style={{ width: '100%', height: '100%' }}>
              <svg 
                width="16" 
                height="16" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="1.15" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                className="overflow-visible"
              >
                <path 
                  d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z"
                  style={{
                    transformOrigin: "center",
                    transform: searchMode === 'single' ? "translateY(5px)" : "translateY(0)",
                  }}
                  className="!transition-all !duration-250"
                />
                <path 
                  d="M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12"
                  style={{
                    transformOrigin: "center",
                    opacity: searchMode === 'single' ? 0 : 1,
                    transform: searchMode === 'single' ? "translateY(-3px)" : "translateY(0)",
                    transition: isMounted ? 
                      searchMode === 'playlist' ?
                      "opacity 250ms ease-in-out 50ms, transform 250ms ease-in-out 50ms" :
                      "opacity 250ms ease-in-out 0ms, transform 250ms ease-in-out 0ms" : "none"
                  }}
                  className="!transition-all !duration-250"
                />
                <path 
                  d="M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17"
                  style={{
                    transformOrigin: "center",
                    opacity: searchMode === 'single' ? 0 : 1,
                    transform: searchMode === 'single' ? "translateY(-6px)" : "translateY(0)",
                  }}
                  className="!transition-all !duration-250"
                />
              </svg>
            </div>
          </button>
        </div>
      )}
    </div>
  );
});

SearchBoxComponent.displayName = 'SearchBox';

export const SearchBox = memo(SearchBoxComponent, (prevProps, nextProps) => {
  return prevProps.onSearch === nextProps.onSearch &&
         prevProps.placeholder === nextProps.placeholder && 
         prevProps.searchMode === nextProps.searchMode;
}); 