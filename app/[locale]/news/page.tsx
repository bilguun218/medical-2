import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Newspaper, Search } from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MotionReveal } from "@/components/site/motion-reveal";
import { SectionHeading } from "@/components/site/section-heading";
import { getSeoRecord } from "@/lib/cms";
import { dictionary, getLocale } from "@/lib/i18n";
import { getPublishedArticles } from "@/lib/public-data";
import { createMetadata } from "@/lib/seo";
import { formatDate } from "@/lib/utils";

export const revalidate = 300;

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string; category?: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = getLocale(rawLocale);
  const seo = await getSeoRecord("/news");
  return createMetadata({
    locale,
    path: `/${locale}/news`,
    title: dictionary[locale].news.title,
    description: dictionary[locale].news.subtitle,
    seo
  });
}

export default async function NewsPage({ params, searchParams }: PageProps) {
  const { locale: rawLocale } = await params;
  const { q, category } = await searchParams;
  const locale = getLocale(rawLocale);
  const dict = dictionary[locale];
  const articles = await getPublishedArticles(q, category);

  return (
    <main className="page-reveal premium-container premium-section">
      <MotionReveal>
        <SectionHeading title={dict.news.title} description={dict.news.subtitle} />
      </MotionReveal>
      <form className="mt-10 grid gap-3 rounded-2xl border border-slate-200/70 bg-white p-4 shadow-subtle md:grid-cols-[1fr_auto]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
          <Input name="q" defaultValue={q ?? ""} className="pl-10" placeholder={dict.actions.search} />
        </div>
        <Button type="submit" variant="medical">{dict.actions.search}</Button>
      </form>

      {articles.length > 0 ? (
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => {
            const title = locale === "mn" ? article.titleMn : article.titleEn || article.titleMn;
            const excerpt = locale === "mn" ? article.excerptMn : article.excerptEn || article.excerptMn;
            return (
              <Card key={article.id} className="premium-card-hover group overflow-hidden">
                {article.coverImage ? (
                  <div className="relative aspect-[16/9] w-full overflow-hidden bg-white">
                    <Image
                      src={article.coverImage.url}
                      alt={locale === "mn" ? article.coverImage.altMn ?? title : article.coverImage.altEn ?? title}
                      fill
                      sizes="(min-width: 1024px) 30vw, (min-width: 768px) 45vw, 100vw"
                      className="premium-image object-cover"
                      quality={70}
                    />
                  </div>
                ) : null}
                <CardHeader>
                  <p className="text-xs font-medium text-muted-foreground">
                    {article.publishedAt ? formatDate(article.publishedAt, locale) : ""}
                  </p>
                  <CardTitle>{title}</CardTitle>
                  {excerpt ? <CardDescription>{excerpt}</CardDescription> : null}
                  <Link className="inline-flex items-center gap-2 text-sm font-semibold text-medical" href={`/${locale}/news/${article.id}`}>
                    {dict.actions.learnMore}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="mt-10">
          <CardHeader>
            <Newspaper className="h-8 w-8 text-teal" />
            <CardTitle>{dict.news.emptyTitle}</CardTitle>
            <CardDescription>{dict.news.emptyBody}</CardDescription>
          </CardHeader>
        </Card>
      )}
    </main>
  );
}
