import type { MetadataRoute } from "next";
import { SITE_URL } from "../lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = SITE_URL.replace(/\/$/, "");
  const hoje = new Date("2026-11-14");
  return [
    {
      url: `${base}/`,
      lastModified: hoje,
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${base}/sites-para-empresas-jau`,
      lastModified: hoje,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${base}/laboratorio`,
      lastModified: hoje,
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];
}
