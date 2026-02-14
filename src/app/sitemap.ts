import type { MetadataRoute } from "next";

const LOCALES = ["ko", "en"] as const;

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://storyshot.pages.dev";

    return LOCALES.map((locale) => ({
        url: `${baseUrl}/${locale}`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 1,
    }));
}

