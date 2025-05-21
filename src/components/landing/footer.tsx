"use client"

import Image from "next/image";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export function Footer() {
  return (
    <footer className="py-12 bg-zinc-100 dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-6 md:mb-0">
            <div className="flex items-center">
              <Image 
                src="/logo.svg" 
                alt="Binoculars Logo" 
                width={24} 
                height={24} 
                className="mr-2"
              />
              <span className="text-xl font-bold text-[#FF0000]">Binoculars</span>
            </div>
            <span className="text-sm text-zinc-500 dark:text-zinc-400 ml-4">© {new Date().getFullYear()} All rights reserved</span>
          </div>
          <div className="flex space-x-6 items-center">
            <a href="https://colehoward.github.io/chrome-extension-privacy-policy/" target="_blank" rel="noopener noreferrer" className="text-zinc-600 dark:text-zinc-400 hover:text-[#FF0000] dark:hover:text-[#FF0000]">Privacy</a>
            <a href="mailto:binoculars.help@gmail.com" className="text-zinc-600 dark:text-zinc-400 hover:text-[#FF0000] dark:hover:text-[#FF0000]">Contact</a>
          </div>
        </div>
      </div>
    </footer>
  );
} 