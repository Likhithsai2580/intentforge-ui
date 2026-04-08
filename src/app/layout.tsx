import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import ErrorBoundary from "@/components/ErrorBoundary";
import Script from "next/script";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0f1a" },
  ],
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: {
    default: "IntentForge // Oxiverse",
    template: "%s | IntentForge",
  },
  description: "Intent-first discovery across the web. Search the web, news, images, and videos with AI-powered semantic understanding.",
  keywords: ["search engine", "semantic search", "AI search", "web search", "news search", "image search", "video search"],
  authors: [{ name: "Likhith Sai Seemala" }],
  creator: "Likhith Sai Seemala",
  publisher: "Oxiverse",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://oxiverse.com",
    siteName: "Oxiverse Search",
    title: "Oxiverse Search",
    description: "Intent-first discovery across the web",
  },
  twitter: {
    card: "summary_large_image",
    title: "Oxiverse Search",
    description: "Intent-first discovery across the web",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
      suppressHydrationWarning
    >
      <head>
        <link rel="icon" href="/assets/intentforge.JPG" type="image/jpeg" />
        <Script
          id="theme-initializer"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              try {
                let theme = localStorage.getItem('oxiverse_theme');
                let dark = theme ? theme === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
                if (dark) document.documentElement.classList.add('dark');
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <ErrorBoundary>{children}</ErrorBoundary>
      </body>
    </html>
  );
}
