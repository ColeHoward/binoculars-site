"use client";

import { useState, useRef } from "react";
import ConfettiCannon, { ConfettiCannonRef } from "../ConfettiCannon";
import { useCustomTheme } from "@/context/ThemeContext";

export const Newsletter = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const confettiRef = useRef<ConfettiCannonRef>(null);
  const submitButtonRef = useRef<HTMLButtonElement>(null);
  const { theme } = useCustomTheme();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    
    try {
      // Create FormData
      const form = new FormData();
      form.append("email", email);

      // Get URL parameters from FormData
      const params = new URLSearchParams();
      params.append("email", email);

      // Alternative approach: use URLSearchParams to append to URL
      // This helps bypass some CORS issues during development
      await fetch(`https://script.google.com/macros/s/AKfycby2fCn5KDpy2bJlUgxDWCMnSwRhzn-e4Z0-1af8uK4IDXO3UkVUrvPMBUQReUPNjQDdig/exec?${params.toString()}`, {
        method: "POST",
        mode: "no-cors", // This helps with CORS during local development
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });
      
      // Trigger confetti effect
      if (confettiRef.current && submitButtonRef.current) {
        const buttonRect = submitButtonRef.current.getBoundingClientRect();
        const x = buttonRect.left + buttonRect.width / 2;
        const y = buttonRect.top + buttonRect.height / 2;
        confettiRef.current.fire(x, y);
      }
      
      setEmail("");
      setSubmitted(true);
    } catch (error) {
      console.error("Error submitting form:", error);
      setError("There was an error subscribing. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <ConfettiCannon ref={confettiRef} />
      <section className="py-16 bg-zinc-50 dark:bg-zinc-900">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="flex flex-col items-center gap-4 text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              New Features
            </h2>
          </div>
          
          <div className="max-w-3xl mx-auto rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-700">
            {submitted ? (
              <div className="text-center py-16 px-6">
                <div className="w-16 h-16 mx-auto bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6">
                  <svg 
                    className="w-8 h-8 text-green-500" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth="2" 
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold mb-2 text-zinc-900 dark:text-zinc-50">Thanks for subscribing!</h3>
                <p className="text-zinc-600 dark:text-zinc-300 mb-6">
                  We&apos;ll keep you updated with the latest news and features.
                </p>
                <button
                  className="px-6 py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-zinc-900 dark:text-zinc-100 rounded-lg transition text-sm font-medium"
                  onClick={() => setSubmitted(false)}
                >
                  Subscribe Another Email
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-8">
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-zinc-900 dark:text-white">Sign up for updates</h3>
                  <p className="text-zinc-600 dark:text-zinc-300 mt-2">Get notified when we release new features!</p>
                </div>
                
                {error && (
                  <div className="text-red-500 text-sm p-2 bg-red-50 dark:bg-red-900/20 rounded-lg mb-4">
                    {error}
                  </div>
                )}
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="Your email address"
                    className="flex-grow px-4 py-2 text-sm border border-zinc-300 dark:border-zinc-700 rounded-lg bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none 
                    focus:ring-2 focus:ring-[#ff0033] dark:focus:ring-opacity-50"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isSubmitting}
                    style={{backgroundColor: theme === "dark" ? "#52525b" : ""}}
                  />
                  <button 
                    type="submit" 
                    className="px-6 py-2 text-sm font-medium text-white rounded-lg transition-colors"
                    style={{ 
                      backgroundColor: isSubmitting ? '#999999' : '#ff0033',
                      opacity: isSubmitting ? 0.7 : 1
                    }}
                    disabled={isSubmitting}
                    ref={submitButtonRef}
                  >
                    {isSubmitting ? "Subscribing..." : "Subscribe"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>
    </>
  );
};