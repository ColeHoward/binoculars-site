# Binoculars - Chrome Extension Landing Page

This is the landing page for the Binoculars Chrome extension, which helps users navigate YouTube videos by searching video transcripts and jumping to specific timestamps.

## Features

- **Modern Design**: Built with Next.js, TypeScript, and Tailwind CSS with the Zinc color theme
- **Responsive Layout**: Optimized for all device sizes
- **YouTube Branding**: Uses YouTube red for brand recognition
- **Shadcn UI Components**: Utilizes shadcn/ui components with the "New York" style

## Extension Features Highlighted

- Search video transcripts to find specific content
- Jump directly to timestamps in YouTube videos
- Search across entire playlists of videos

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the landing page.

## Technologies Used

- **Next.js**: React framework for production
- **TypeScript**: For type safety
- **Tailwind CSS**: For styling
- **Shadcn UI**: For UI components
- **Vite**: As the build tool

## Customization

The landing page can be customized by editing the following files:

- `src/app/page.tsx`: Main landing page content
- `src/app/globals.css`: Global styles including YouTube red color variable
- `src/app/layout.tsx`: Layout and metadata

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
