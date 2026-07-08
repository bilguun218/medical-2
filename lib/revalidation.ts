import { revalidatePath, revalidateTag } from "next/cache";
import { cacheTags } from "@/lib/cache-tags";
import type { CmsKey } from "@/lib/cms";

const publicLocales = ["mn", "en"] as const;
const publicListPaths = ["", "/about", "/contact", "/products", "/news"] as const;

function revalidateLocalizedPath(path: string) {
  for (const locale of publicLocales) {
    revalidatePath(`/${locale}${path}`);
  }
}

export function revalidatePublicShell() {
  revalidatePath("/", "layout");
  revalidatePath("/mn", "layout");
  revalidatePath("/en", "layout");
}

export function revalidatePublicLists() {
  for (const path of publicListPaths) {
    revalidateLocalizedPath(path);
  }
}

export function revalidateCmsContent(key: CmsKey) {
  revalidateTag(cacheTags.cms);
  revalidateTag(cacheTags.cmsKey(key));
  revalidatePublicShell();
  revalidatePublicLists();
}

export function revalidateSeoContent(routes: string[]) {
  revalidateTag(cacheTags.seo);

  for (const route of routes) {
    revalidateTag(cacheTags.seoRoute(route));
  }

  revalidatePublicLists();
}

export function revalidateProductContent(productId?: string) {
  revalidateTag(cacheTags.products);
  revalidateTag(cacheTags.productCategories);
  revalidateLocalizedPath("");
  revalidateLocalizedPath("/products");

  if (productId) {
    revalidateTag(cacheTags.product(productId));
    revalidateLocalizedPath(`/products/${productId}`);
  }
}

export function revalidateNewsContent(articleId?: string) {
  revalidateTag(cacheTags.news);
  revalidateLocalizedPath("");
  revalidateLocalizedPath("/news");

  if (articleId) {
    revalidateTag(cacheTags.article(articleId));
    revalidateLocalizedPath(`/news/${articleId}`);
  }
}

export function revalidateMediaContent() {
  revalidateTag(cacheTags.media);
  revalidateProductContent();
  revalidateNewsContent();
  revalidateLocalizedPath("/about");
}
