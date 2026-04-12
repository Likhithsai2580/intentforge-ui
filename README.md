# IntentForge by Oxiverse v0.1.2

**IntentForge** is a next-generation AI-powered, intent-first search engine built by the **Oxiverse** ecosystem. It is designed to navigate the web, news, images, and videos with deep semantic understanding—moving beyond simple keyword matching to actually understand the true intent behind user queries.

## 🌟 Features
- **Semantic Search Engine**: Powerful AI synthesis and relevance scoring.
- **Intent-First Design**: Dedicated landing and search pages optimized for clarity.
- **Omni-Search Integration**: Web, News, Image, and Video search.
- **Modern UI Edge**: Light and dark themes leveraging Tailwind CSS v4 and Framer Motion.
- **SEO Optimized**: Advanced JSON-LD structured data, dynamic OpenGraph, sitemaps, and optimized hidden semantic content for crawlers.

## 🚀 Getting Started

First, install dependencies and run the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🔍 SEO & Architecture
The project heavily utilizes Next.js 15 App Router capabilities for Search Engine Optimization:
- **Global Metadata API** in `layout.tsx` for structured schema and definitions.
- **Dynamic Crawler Rules**: The `robots.tsx` automatically blocks spammy infinite-crawl queries (e.g., `/?q=`) while retaining priority on the indexable semantic landing pages.
- **Visually Hidden Content**: Implements `sr-only` microcopy strategies for deep indexing on otherwise sleek, minimalistic query landing pages.

## 📜 License
This project operates under the **Intent Engine Community License (IECL) v1.0**. See documentation for details on non-commercial and commercial usage terms.
