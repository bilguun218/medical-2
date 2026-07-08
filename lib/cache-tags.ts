export const PUBLIC_REVALIDATE_SECONDS = 300;

export const cacheTags = {
  cms: "cms",
  cmsKey: (key: string) => `cms:${key}`,
  seo: "seo",
  seoRoute: (route: string) => `seo:${route}`,
  products: "products",
  product: (id: string) => `product:${id}`,
  productCategories: "product-categories",
  news: "news",
  article: (id: string) => `article:${id}`,
  media: "media"
} as const;
