import type { MetadataRoute } from "next";
import { locales } from "@/lib/i18n";
import { absoluteUrl } from "@/lib/utils";

const publicRoutes = ["", "/about", "/products", "/news", "/contact"];

export default function sitemap(): MetadataRoute.Sitemap {
  return locales.flatMap((locale) =>
    publicRoutes.map((route) => ({
      url: absoluteUrl(`/${locale}${route}`),
      lastModified: new Date(),
      changeFrequency: route === "" ? "weekly" : "monthly",
      priority: route === "" ? 1 : 0.7
    }))
  );
}
