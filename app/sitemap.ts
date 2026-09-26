import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

// The portfolio is a single page, so the sitemap has one entry.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: siteUrl,
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
