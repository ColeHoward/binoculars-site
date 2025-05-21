"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useTheme as useNextTheme } from 'next-themes';

type Theme = 'light' | 'dark';

interface CustomThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  isMounted: boolean; // To handle hydration mismatch
}

const CustomThemeContext = createContext<CustomThemeContextType | undefined>(undefined);

export const CustomThemeProvider = ({ children }: { children: ReactNode }) => {
  const { theme: nextTheme, setTheme: setNextTheme } = useNextTheme();
  const [currentTheme, setCurrentTheme] = useState<Theme>('light'); // Default to light
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && nextTheme) {
      setCurrentTheme(nextTheme as Theme);
    }
  }, [isMounted, nextTheme]);

  const toggleTheme = () => {
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    setCurrentTheme(newTheme);
    setNextTheme(newTheme); // Still update next-themes for Tailwind and other integrations
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