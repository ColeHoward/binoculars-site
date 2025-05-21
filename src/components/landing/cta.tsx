"use client"

export function CTA() {
  return (
    <section className="py-16 md:py-24 bg-white dark:bg-zinc-800">
      <div className="container mx-auto px-4 max-w-4xl text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to enhance your YouTube experience?</h2>
        <p className="text-xl text-zinc-600 dark:text-zinc-300 mb-10 max-w-3xl mx-auto">
          Join dozens of users who save time and find exactly what they're looking for on YouTube with Binoculars.
        </p>
        <a 
          href="https://chromewebstore.google.com/detail/binoculars-pinpoint-momen/pphplhefnhbifdkhkipnaphgggglphfh"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:bg-[#CC0000] text-white font-medium py-6 px-10 rounded-lg text-lg inline-block cursor-pointer"
          style={{ backgroundColor: "#ff0033" }}
        >
          Add to Chrome — It's Free
        </a>
      </div>
    </section>
  );
} 