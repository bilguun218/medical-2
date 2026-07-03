import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { db } from "@/lib/db";
import { dictionary, getLocale } from "@/lib/i18n";
import { createMetadata } from "@/lib/seo";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ locale: string; slug: string }> };

async function getArticle(slug: string) {
  try {
    return await db.article.findUnique({
      where: { slug },
      include: { category: true, coverImage: true, author: true }
    });
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: rawLocale, slug } = await params;
  const locale = getLocale(rawLocale);
  const article = await getArticle(slug);
  const title = article ? (locale === "mn" ? article.seoTitleMn || article.titleMn : article.seoTitleEn || article.titleEn || article.titleMn) : dictionary[locale].news.title;
  const description = article
    ? locale === "mn"
      ? article.seoDescriptionMn || article.excerptMn || undefined
      : article.seoDescriptionEn || article.excerptEn || article.excerptMn || undefined
    : undefined;
  return createMetadata({ locale, path: `/${locale}/news/${slug}`, title, description });
}

export default async function NewsDetailPage({ params }: PageProps) {
  const { locale: rawLocale, slug } = await params;
  const locale = getLocale(rawLocale);
  const article = await getArticle(slug);

  if (!article || article.status !== "PUBLISHED") {
    notFound();
  }

  const title = locale === "mn" ? article.titleMn : article.titleEn || article.titleMn;
  const body = locale === "mn" ? article.bodyMn : article.bodyEn || article.bodyMn;

  return (
    <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6 md:py-24">
      <article>
        <div className="mb-6 flex flex-wrap gap-3">
          {article.category ? <Badge>{locale === "mn" ? article.category.titleMn : article.category.titleEn}</Badge> : null}
          {article.publishedAt ? <Badge>{formatDate(article.publishedAt, locale)}</Badge> : null}
        </div>
        <h1 className="text-balance text-4xl font-semibold text-primary dark:text-white md:text-5xl">{title}</h1>
        {article.coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={article.coverImage.url} alt={title} className="mt-10 aspect-[16/9] w-full rounded-xl object-cover" />
        ) : null}
        <div className="prose prose-slate mt-10 max-w-none whitespace-pre-line leading-8 dark:prose-invert">{body}</div>
      </article>
    </main>
  );
}
