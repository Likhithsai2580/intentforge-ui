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

const BASE_URL = "https://search.oxiverse.com";

export const viewport: Viewport = {
  themeColor: "#0a0c0f",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "IntentForge Search — Intent-First Discovery by Oxiverse",
    template: "%s | IntentForge by Oxiverse",
  },
  description:
    "IntentForge is an AI-powered, intent-first search engine by Oxiverse. Search the web, news, images, and videos with deep semantic understanding — not just keywords.",
  keywords: [
    "IntentForge",
    "Oxiverse",
    "intent-first search",
    "AI search engine",
    "semantic search",
    "web search",
    "news search",
    "image search",
    "video search",
    "AI-powered search",
    "decentralized search",
  ],
  authors: [{ name: "Likhith Sai Seemala", url: "https://oxiverse.com" }],
  creator: "Likhith Sai Seemala",
  publisher: "Oxiverse",
  category: "Search Engine",
  applicationName: "IntentForge",
  generator: "Next.js",
  referrer: "origin-when-cross-origin",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: BASE_URL,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: BASE_URL,
    siteName: "IntentForge by Oxiverse",
    title: "IntentForge Search — Intent-First Discovery by Oxiverse",
    description:
      "AI-powered intent-first search engine. Search the web, news, images, and videos with semantic understanding.",
    images: [
      {
        url: "/assets/oxiverse.png",
        width: 1200,
        height: 630,
        alt: "IntentForge by Oxiverse — Intent-First Search Engine",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@oxiverse",
    creator: "@oxiverse",
    title: "IntentForge Search — Intent-First Discovery by Oxiverse",
    description:
      "AI-powered intent-first search engine. Search the web, news, images, and videos with semantic understanding.",
    images: ["/assets/oxiverse.png"],
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  }
};

// JSON-LD structured data for the search engine
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${BASE_URL}/#website`,
      url: BASE_URL,
      name: "IntentForge by Oxiverse",
      description: "AI-powered intent-first search engine by Oxiverse",
      publisher: { "@id": `${BASE_URL}/#organization` },
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${BASE_URL}/?q={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
      inLanguage: "en-US",
    },
    {
      "@type": "Organization",
      "@id": `${BASE_URL}/#organization`,
      name: "Oxiverse",
      url: "https://oxiverse.com",
      logo: {
        "@type": "ImageObject",
        url: `${BASE_URL}/assets/oxiverse.png`,
        width: 512,
        height: 512,
      },
      sameAs: ["https://github.com/oxiverse-labs"],
    },
    {
      "@type": "SoftwareApplication",
      name: "IntentForge",
      applicationCategory: "SearchApplication",
      operatingSystem: "Web",
      url: BASE_URL,
      description: "Intent-first AI search engine powered by Oxiverse",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      author: { "@id": `${BASE_URL}/#organization` },
    },
  ],
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
        <link rel="apple-touch-icon" href="/assets/oxiverse.png" />
        <meta name="theme-color" content="#0a0c0f" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Script
          id="theme-initializer"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(){try{
  var m=document.cookie.match(/(?:^|; )if_prefs=([^;]*)/);
  if(m){var p=JSON.parse(decodeURIComponent(m[1]));
    var t=p.theme;
    var dark=(t==='dark')||(t==='system'&&window.matchMedia('(prefers-color-scheme:dark)').matches);
    if(dark){document.documentElement.classList.add('if-dark-html');}
  }
}catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <ErrorBoundary>{children}</ErrorBoundary>
      </body>
    </html>
  );
}
