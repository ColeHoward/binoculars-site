"use client"

import Image from "next/image";
import Link from "next/link";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Button } from "@/components/ui/button";

export function Navbar() {
  return (
    <nav className="py-4 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm sticky top-0 z-10">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <Image 
                src="/logo.svg" 
                alt="Binoculars Logo" 
                width={30} 
                height={30} 
                className="mr-2"
              />
              <span className="text-xl font-bold text-zinc-900 dark:text-white">
                Binoculars
              </span>
            </Link>
          </div>
          
          <div className="flex items-center space-x-6">
            <Link href="#features" className="text-zinc-600 dark:text-zinc-400 hover:text-[#FF0000] dark:hover:text-[#FF0000] hidden sm:block">
              Features
            </Link>
            <Link href="#how-it-works" className="text-zinc-600 dark:text-zinc-400 hover:text-[#FF0000] dark:hover:text-[#FF0000] hidden sm:block">
              How It Works
            </Link>
            <Link href="#contact" className="text-zinc-600 dark:text-zinc-400 hover:text-[#FF0000] dark:hover:text-[#FF0000] hidden sm:block">
              Contact
            </Link>
            <a 
              href="https://chromewebstore.google.com/detail/binoculars-pinpoint-momen/pphplhefnhbifdkhkipnaphgggglphfh"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:bg-[#CC0000] text-white inline-block py-2 px-4 rounded text-sm cursor-pointer"
              style={{ backgroundColor: '#ff0033' }}
            >
              Add to Chrome
            </a>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
} 