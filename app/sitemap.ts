import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://portfolio-prumo.vercel.app/",
      lastModified: new Date("2026-11-14"),
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
