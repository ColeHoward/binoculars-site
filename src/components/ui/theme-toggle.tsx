"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import './ThemeToggleStyle.css'
import { useCustomTheme } from "@/context/ThemeContext"; // Import the custom hook

export function ThemeToggle() {
  const { theme, toggleTheme, isMounted } = useCustomTheme(); // Use our custom theme context
  const [rotation, setRotation] = useState(0);
  const [initialRotationSet, setInitialRotationSet] = useState(false);


  // Effect to set the initial rotation based on the theme.
  // This runs when `mounted` becomes true or when `theme` changes,
  // but only sets the rotation if it hasn't been set initially yet.
  useEffect(() => {
    // if (mounted && theme !== undefined && !initialRotationSet) { // Check isMounted from context
    if (isMounted && theme !== undefined && !initialRotationSet) {
      setRotation(theme === 'light' ? 180 : 0);
      setInitialRotationSet(true); // Mark that initial rotation is set.
    }
  }, [isMounted, theme, initialRotationSet]);

  const handleToggle = () => {
    toggleTheme();
    setRotation(prevRotation => prevRotation + 180);
  };

  // Avoid hydration mismatch by not rendering until mounted on the client.
  if (!isMounted) {
    return null;
  }

  return (
    <button
      id="theme-toggle" 
      onClick={handleToggle}
      className={`theme-toggle focus:outline-none ${
        theme === "dark" 
          ? "bg-transparent hover:!bg-zinc-800/40" 
          : "bg-transparent hover:!bg-zinc-200/40"
      }`}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      style={{
        border: 'none',
        cursor: 'pointer',
        width: '35px',
        height: '35px',
        borderRadius: '50%',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'background-color 0.5s !important',
      }}
    >
      <div className="sun-moon-wrapper !transition-all !duration-500" style={{
        position: 'absolute',
        top: '4px',
        left: '0',
        width: '35px',
        height: '70px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '4px 0',
        transformOrigin: '50% 50%',
        transform: `rotate(${rotation}deg)`
      }}>
        <div className="sun !transition-all !duration-500"  style={{
          width: '20px',
          height: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backfaceVisibility: 'hidden',
          color: 'white !important'
        }}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="toggle-svg"
               stroke={theme === 'dark' ? '#fff' : '#000'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="5"></circle>
            <line x1="12" y1="1" x2="12" y2="3"></line>
            <line x1="12" y1="21" x2="12" y2="23"></line>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
            <line x1="1" y1="12" x2="3" y2="12"></line>
            <line x1="21" y1="12" x2="23" y2="12"></line>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
          </svg>
        </div>
        <div className="moon" style={{
          width: '20px', 
          height: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backfaceVisibility: 'hidden',
          transform: 'rotate(180deg)',
          color: '#ffffff !important',
        }}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="toggle-svg"
               stroke={theme === 'dark' ? '#fff' : '#000'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
          </svg>
        </div>
      </div>
    </button>
  );
} 