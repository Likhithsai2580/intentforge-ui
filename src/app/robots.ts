import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/?q=", "/settings", "/pro"],
      },
    ],
    host: "https://search.oxiverse.com",
    sitemap: "https://search.oxiverse.com/sitemap.xml",
  };
}
