import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google"; // Reverted to original Geist import
import { Roboto } from "next/font/google"; // Import Roboto
import "./globals.css";
import { ThemeProvider as NextThemesProvider } from "@/components/theme-provider"; // Alias for clarity
import { CustomThemeProvider } from "@/context/ThemeContext"; // Import our CustomThemeProvider

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Configure Roboto
const roboto = Roboto({
  weight: ["400", "500", "700"], // Specify weights you need
  subsets: ["latin"],
  display: "swap", // Good for performance
  variable: "--font-roboto", // This will create a CSS variable
});

export const metadata: Metadata = {
  title: "Binoculars | Search YouTube Video Transcripts",
  description: "Navigate YouTube videos effortlessly with Binoculars. Search transcripts, jump to specific moments, and find content across entire playlists.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Add roboto.variable and original geist variables to html className
    <html lang="en" className={`${roboto.variable} ${geistSans.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <body
        className={`antialiased`} // Font variables are on <html>, Tailwind can pick them up
      >
        <NextThemesProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <CustomThemeProvider> {/* Wrap children with CustomThemeProvider */}
            {children}
          </CustomThemeProvider>
        </NextThemesProvider>
      </body>
    </html>
  );
}
