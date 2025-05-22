"use client";

import { useState, useRef } from "react";
import { useTheme } from "next-themes";
import ConfettiCannon, { ConfettiCannonRef } from "../ConfettiCannon";


export function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { theme } = useTheme();
  const confettiRef = useRef<ConfettiCannonRef>(null);
  const submitButtonRef = useRef<HTMLButtonElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    const formData = new FormData(e.currentTarget);
    
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        body: formData,
      });
      
      const data = await response.json();
      
      if (response.ok) {
        if (confettiRef.current && submitButtonRef.current) {
          const buttonRect = submitButtonRef.current.getBoundingClientRect();
          const x = buttonRect.left + buttonRect.width / 2;
          const y = buttonRect.top + buttonRect.height / 2;
          confettiRef.current.fire(x, y);
        } 
        
        if (formRef.current) {
          formRef.current.reset();
        }
        setSubmitted(true);
      } else {
        throw new Error(data.error || `Something went wrong (status: ${response.status})`);
      }
    } catch (error) {
      console.error("[ContactForm] Catch block error in handleSubmit:", error);
      setError(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ConfettiCannon ref={confettiRef} />
      <section className="py-16 bg-white dark:bg-zinc-800 border-t border-zinc-200 dark:border-zinc-800" id="contact">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="flex flex-col items-center gap-4 text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              We&apos;d love to hear from you
            </h2>
            <p className="text-lg text-zinc-600 dark:text-zinc-300 max-w-2xl">
              Question about Binoculars? Feature request? Bug report? We&apos;re all ears.
            </p>
          </div>

          <div className="max-w-3xl mx-auto rounded-xl bg-zinc-50 dark:bg-zinc-700 overflow-hidden border border-zinc-200 dark:border-zinc-800"
          >
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
                <h3 className="text-2xl font-bold mb-2 text-zinc-900 dark:text-zinc-50">Message Sent!</h3>
                <p className="text-zinc-600 dark:text-zinc-300 mb-6">
                  Thanks for reaching out. We&apos;ll get back to you soon.
                </p>
                <button
                  className="px-6 py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-zinc-900 dark:text-zinc-100 rounded-lg transition text-sm font-medium"
                  onClick={() => setSubmitted(false)}
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form ref={formRef} onSubmit={handleSubmit} className="grid grid-cols-1 gap-2 p-8">
                <div>
                  <h2 className="text-2xl font-bold mb-6 text-zinc-900 dark:text-white">Hit us up!</h2>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:flex-nowrap gap-5">
                  <div className="space-y-2 sm:w-1/2">
                    <label htmlFor="name" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      placeholder="John Doe"
                      className="w-full px-3 py-2 text-sm border border-zinc-300 dark:border-zinc-700 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white
                       focus:outline-none focus:ring-2 focus:ring-[#ff0033] dark:focus:ring-opacity-50"
                       style={{backgroundColor: theme === "dark" ? "#52525b" : ""}}
                    />
                  </div>
                  
                  <div className="space-y-2 sm:w-1/2">
                    <label htmlFor="email" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      placeholder="you@example.com"
                      className="w-full px-3 py-2 text-sm border border-zinc-300 dark:border-zinc-700 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white
                       focus:outline-none focus:ring-2 focus:ring-[#ff0033] dark:focus:ring-opacity-50"
                       style={{backgroundColor: theme === "dark" ? "#52525b" : ""}}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="message" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={3}
                    required
                    placeholder="Your message here..."
                    className="w-full px-3 py-2 text-sm border border-zinc-300 dark:border-zinc-700 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white
                     focus:outline-none focus:ring-2 focus:ring-[#ff0033] dark:focus:ring-opacity-50"
                     style={{backgroundColor: theme === "dark" ? "#52525b" : ""}}
                  />
                </div>
                
                {error && (
                  <div className="text-red-500 text-sm p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    {error}
                  </div>
                )}
                
                
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    ref={submitButtonRef}
                    className="px-5 py-2 text-sm font-medium text-white rounded-lg transition-colors"
                    style={{ 
                      backgroundColor: loading ? '#999999' : '#ff0033',
                      opacity: loading ? 0.7 : 1
                    }}
                  >
                    {loading ? "Sending..." : "Send Message"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>
    </>
  );
} 
