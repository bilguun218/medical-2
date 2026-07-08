import { unstable_cache } from "next/cache";
import { cacheTags, PUBLIC_REVALIDATE_SECONDS } from "@/lib/cache-tags";
import { db } from "@/lib/db";

function normalizedSearch(value?: string) {
  const query = value?.trim();
  return query ? query : undefined;
}

const productCardSelect = {
  id: true,
  titleMn: true,
  titleEn: true,
  summaryMn: true,
  summaryEn: true,
  category: {
    select: {
      titleMn: true,
      titleEn: true
    }
  },
  media: {
    where: { role: "GALLERY" as const },
    take: 1,
    orderBy: { sortOrder: "asc" as const },
    select: {
      media: {
        select: {
          url: true,
          type: true,
          altMn: true,
          altEn: true
        }
      }
    }
  }
};

export async function getPublishedProducts(categoryId?: string, q?: string) {
  const query = normalizedSearch(q);

  try {
    return await unstable_cache(
      () =>
        db.product.findMany({
          where: {
            status: "PUBLISHED",
            ...(categoryId ? { categoryId } : {}),
            ...(query
              ? {
                  OR: [
                    { titleMn: { contains: query, mode: "insensitive" } },
                    { titleEn: { contains: query, mode: "insensitive" } },
                    { summaryMn: { contains: query, mode: "insensitive" } },
                    { summaryEn: { contains: query, mode: "insensitive" } }
                  ]
                }
              : {})
          },
          select: productCardSelect,
          orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }]
        }),
      ["published-products", categoryId ?? "", query ?? ""],
      {
        revalidate: PUBLIC_REVALIDATE_SECONDS,
        tags: [cacheTags.products, cacheTags.productCategories]
      }
    )();
  } catch {
    return [];
  }
}

export async function getFeaturedProducts() {
  try {
    return await unstable_cache(
      () =>
        db.product.findMany({
          where: { status: "PUBLISHED" },
          select: productCardSelect,
          orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
          take: 3
        }),
      ["featured-products"],
      {
        revalidate: PUBLIC_REVALIDATE_SECONDS,
        tags: [cacheTags.products, cacheTags.productCategories, cacheTags.media]
      }
    )();
  } catch {
    return [];
  }
}

export async function getPublishedProduct(id: string) {
  try {
    return await unstable_cache(
      () =>
        db.product.findUnique({
          where: { id },
          select: {
            id: true,
            status: true,
            titleMn: true,
            titleEn: true,
            summaryMn: true,
            summaryEn: true,
            descriptionMn: true,
            descriptionEn: true,
            specifications: true,
            seoTitleMn: true,
            seoTitleEn: true,
            seoDescriptionMn: true,
            seoDescriptionEn: true,
            category: {
              select: {
                titleMn: true,
                titleEn: true
              }
            },
            media: {
              orderBy: { sortOrder: "asc" },
              select: {
                id: true,
                role: true,
                media: {
                  select: {
                    url: true,
                    filename: true,
                    type: true,
                    altMn: true,
                    altEn: true
                  }
                }
              }
            }
          }
        }),
      ["published-product", id],
      {
        revalidate: PUBLIC_REVALIDATE_SECONDS,
        tags: [cacheTags.products, cacheTags.product(id), cacheTags.productCategories, cacheTags.media]
      }
    )();
  } catch {
    return null;
  }
}

export async function getLatestArticles() {
  try {
    return await unstable_cache(
      () =>
        db.article.findMany({
          where: { status: "PUBLISHED" },
          select: {
            id: true,
            titleMn: true,
            titleEn: true,
            excerptMn: true,
            excerptEn: true,
            publishedAt: true,
            category: {
              select: {
                titleMn: true,
                titleEn: true
              }
            }
          },
          orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
          take: 3
        }),
      ["latest-articles"],
      {
        revalidate: PUBLIC_REVALIDATE_SECONDS,
        tags: [cacheTags.news]
      }
    )();
  } catch {
    return [];
  }
}

export async function getPublishedArticles(q?: string, categoryId?: string) {
  const query = normalizedSearch(q);

  try {
    return await unstable_cache(
      () =>
        db.article.findMany({
          where: {
            status: "PUBLISHED",
            ...(categoryId ? { categoryId } : {}),
            ...(query
              ? {
                  OR: [
                    { titleMn: { contains: query, mode: "insensitive" } },
                    { titleEn: { contains: query, mode: "insensitive" } },
                    { excerptMn: { contains: query, mode: "insensitive" } },
                    { excerptEn: { contains: query, mode: "insensitive" } }
                  ]
                }
              : {})
          },
          select: {
            id: true,
            titleMn: true,
            titleEn: true,
            excerptMn: true,
            excerptEn: true,
            publishedAt: true,
            coverImage: {
              select: {
                url: true,
                altMn: true,
                altEn: true
              }
            }
          },
          orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }]
        }),
      ["published-articles", categoryId ?? "", query ?? ""],
      {
        revalidate: PUBLIC_REVALIDATE_SECONDS,
        tags: [cacheTags.news, cacheTags.media]
      }
    )();
  } catch {
    return [];
  }
}

export async function getPublishedArticle(id: string) {
  try {
    return await unstable_cache(
      () =>
        db.article.findUnique({
          where: { id },
          select: {
            id: true,
            status: true,
            titleMn: true,
            titleEn: true,
            excerptMn: true,
            excerptEn: true,
            bodyMn: true,
            bodyEn: true,
            seoTitleMn: true,
            seoTitleEn: true,
            seoDescriptionMn: true,
            seoDescriptionEn: true,
            publishedAt: true,
            category: {
              select: {
                titleMn: true,
                titleEn: true
              }
            },
            coverImage: {
              select: {
                url: true,
                altMn: true,
                altEn: true
              }
            }
          }
        }),
      ["published-article", id],
      {
        revalidate: PUBLIC_REVALIDATE_SECONDS,
        tags: [cacheTags.news, cacheTags.article(id), cacheTags.media]
      }
    )();
  } catch {
    return null;
  }
}

export async function getLatestMediaImageUrl() {
  try {
    const media = await unstable_cache(
      () =>
        db.media.findFirst({
          where: { type: "IMAGE" },
          select: { url: true },
          orderBy: { createdAt: "desc" }
        }),
      ["latest-media-image"],
      {
        revalidate: PUBLIC_REVALIDATE_SECONDS,
        tags: [cacheTags.media]
      }
    )();

    return media?.url ?? "";
  } catch {
    return "";
  }
}
