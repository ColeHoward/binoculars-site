"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useTheme as useNextTheme } from 'next-themes';

type Theme = 'light' | 'dark';

interface CustomThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  isMounted: boolean;
}

const CustomThemeContext = createContext<CustomThemeContextType | undefined>(undefined);

// Reminder: Ensure your main ThemeProvider from 'next-themes' (likely in your layout or app file)
// is configured with attribute="class" and storageKey="theme" for this to work optimally.
// e.g., <ThemeProvider attribute="class" defaultTheme="system" storageKey="theme" enableSystem>

export const CustomThemeProvider = ({ children }: { children: ReactNode }) => {
  // The `useNextTheme` hook handles system preference and local storage if `enableSystem` and `storageKey` are set on its Provider.
  // `resolvedTheme` gives the actual applied theme (light or dark), considering system preference.
  // `theme` can be 'system', 'light', or 'dark'.
  const { theme: nextThemeApplied, setTheme: setNextTheme, resolvedTheme } = useNextTheme();
  const [currentTheme, setCurrentTheme] = useState<Theme>('light'); // Default, will be updated
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    // This effect now correctly sets the initial theme based on resolvedTheme from next-themes,
    // which respects localStorage and system preference.
    if (isMounted && resolvedTheme) {
      setCurrentTheme(resolvedTheme as Theme);
    }
  // We also listen to nextThemeApplied to react to changes triggered by next-themes (e.g., system change)
  }, [isMounted, resolvedTheme, nextThemeApplied]);

  const toggleTheme = () => {
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    // setCurrentTheme(newTheme); // This will be updated by the useEffect above when nextThemeApplied changes
    setNextTheme(newTheme); // This updates next-themes, which then updates localStorage and resolvedTheme
  };

  if (!isMounted) {
    // Return null or a loading indicator on the server or before hydration
    // This helps prevent hydration mismatch by ensuring server and client render the same initially
    return null; 
  }

  return (
    <CustomThemeContext.Provider value={{ theme: currentTheme, toggleTheme, isMounted }}>
      {children}
    </CustomThemeContext.Provider>
  );
};

export const useCustomTheme = () => {
  const context = useContext(CustomThemeContext);
  if (context === undefined) {
    throw new Error('useCustomTheme must be used within a CustomThemeProvider');
  }
  return context;
}; 