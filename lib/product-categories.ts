import { unstable_cache } from "next/cache";
import { cacheTags, PUBLIC_REVALIDATE_SECONDS } from "@/lib/cache-tags";
import { productCategories } from "@/content/novytas";
import { db } from "@/lib/db";

type LocalizedText = {
  mn: string;
  en: string;
};

export type ProductCategoryOption = {
  id?: string;
  sortOrder: number;
  title: LocalizedText;
  description: LocalizedText;
};

export async function getProductCategoryOptions(): Promise<ProductCategoryOption[]> {
  try {
    const categories = await unstable_cache(
      () =>
        db.productCategory.findMany({
          select: {
            id: true,
            sortOrder: true,
            titleMn: true,
            titleEn: true,
            descriptionMn: true,
            descriptionEn: true
          },
          orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }]
        }),
      ["product-category-options"],
      {
        revalidate: PUBLIC_REVALIDATE_SECONDS,
        tags: [cacheTags.productCategories]
      }
    )();

    if (categories.length > 0) {
      return categories.map((category) => ({
        id: category.id,
        sortOrder: category.sortOrder,
        title: {
          mn: category.titleMn,
          en: category.titleEn
        },
        description: {
          mn: category.descriptionMn ?? "",
          en: category.descriptionEn ?? ""
        }
      }));
    }
  } catch {
    // Static category copy keeps public pages renderable if the database is unavailable.
  }

  return productCategories.map((category) => ({
    sortOrder: category.sortOrder,
    title: category.title,
    description: category.description
  }));
}
