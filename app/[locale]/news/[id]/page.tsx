import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { MotionReveal } from "@/components/site/motion-reveal";
import { RichText } from "@/components/site/rich-text";
import { dictionary, getLocale } from "@/lib/i18n";
import { getPublishedArticle } from "@/lib/public-data";
import { createMetadata } from "@/lib/seo";
import { formatDate } from "@/lib/utils";

export const revalidate = 300;

type PageProps = { params: Promise<{ locale: string; id: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: rawLocale, id } = await params;
  const locale = getLocale(rawLocale);
  const article = await getPublishedArticle(id);
  const title = article ? (locale === "mn" ? article.seoTitleMn || article.titleMn : article.seoTitleEn || article.titleEn || article.titleMn) : dictionary[locale].news.title;
  const description = article
    ? locale === "mn"
      ? article.seoDescriptionMn || article.excerptMn || undefined
      : article.seoDescriptionEn || article.excerptEn || article.excerptMn || undefined
    : undefined;
  return createMetadata({ locale, path: `/${locale}/news/${id}`, title, description, ogImage: article?.coverImage?.url });
}

export default async function NewsDetailPage({ params }: PageProps) {
  const { locale: rawLocale, id } = await params;
  const locale = getLocale(rawLocale);
  const article = await getPublishedArticle(id);

  if (!article || article.status !== "PUBLISHED") {
    notFound();
  }

  const title = locale === "mn" ? article.titleMn : article.titleEn || article.titleMn;
  const body = locale === "mn" ? article.bodyMn : article.bodyEn || article.bodyMn;

  return (
    <main className="page-reveal premium-container premium-section">
      <article className="mx-auto max-w-4xl">
        <MotionReveal className="mb-8">
          <div className="mb-6 flex flex-wrap gap-3">
          {article.category ? <Badge>{locale === "mn" ? article.category.titleMn : article.category.titleEn}</Badge> : null}
          {article.publishedAt ? <Badge>{formatDate(article.publishedAt, locale)}</Badge> : null}
          </div>
          <h1 className="text-balance text-4xl font-bold leading-[1.12] text-primary md:text-5xl">{title}</h1>
        </MotionReveal>
        {article.coverImage ? (
          <div className="relative mt-10 aspect-[16/9] w-full overflow-hidden rounded-[1.5rem] bg-white shadow-premium">
            <Image
              src={article.coverImage.url}
              alt={locale === "mn" ? article.coverImage.altMn ?? title : article.coverImage.altEn ?? title}
              fill
              sizes="(min-width: 1024px) 896px, 100vw"
              className="object-cover"
              quality={70}
            />
          </div>
        ) : null}
        <RichText html={body} className="mt-10" />
      </article>
    </main>
  );
}
