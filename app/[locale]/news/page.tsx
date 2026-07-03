import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Newspaper, Search } from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SectionHeading } from "@/components/site/section-heading";
import { db } from "@/lib/db";
import { dictionary, getLocale } from "@/lib/i18n";
import { createMetadata } from "@/lib/seo";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string; category?: string }>;
};

async function getArticles(q?: string, category?: string) {
  try {
    return await db.article.findMany({
      where: {
        status: "PUBLISHED",
        ...(category ? { category: { slug: category } } : {}),
        ...(q
          ? {
              OR: [
                { titleMn: { contains: q, mode: "insensitive" } },
                { titleEn: { contains: q, mode: "insensitive" } },
                { excerptMn: { contains: q, mode: "insensitive" } },
                { excerptEn: { contains: q, mode: "insensitive" } }
              ]
            }
          : {})
      },
      include: { category: true, coverImage: true },
      orderBy: { publishedAt: "desc" }
    });
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = getLocale(rawLocale);
  return createMetadata({
    locale,
    path: `/${locale}/news`,
    title: dictionary[locale].news.title,
    description: dictionary[locale].news.subtitle
  });
}

export default async function NewsPage({ params, searchParams }: PageProps) {
  const { locale: rawLocale } = await params;
  const { q, category } = await searchParams;
  const locale = getLocale(rawLocale);
  const dict = dictionary[locale];
  const articles = await getArticles(q, category);

  return (
    <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-24 lg:px-8">
      <SectionHeading title={dict.news.title} description={dict.news.subtitle} />
      <form className="mt-8 grid gap-3 rounded-xl border bg-card p-4 md:grid-cols-[1fr_auto]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
          <Input name="q" defaultValue={q ?? ""} className="pl-10" placeholder={dict.actions.search} />
        </div>
        <Button type="submit" variant="medical">{dict.actions.search}</Button>
      </form>

      {articles.length > 0 ? (
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => {
            const title = locale === "mn" ? article.titleMn : article.titleEn || article.titleMn;
            const excerpt = locale === "mn" ? article.excerptMn : article.excerptEn || article.excerptMn;
            return (
              <Card key={article.id}>
                <CardHeader>
                  <p className="text-xs font-medium text-muted-foreground">
                    {article.publishedAt ? formatDate(article.publishedAt, locale) : ""}
                  </p>
                  <CardTitle>{title}</CardTitle>
                  {excerpt ? <CardDescription>{excerpt}</CardDescription> : null}
                  <Link className="inline-flex items-center gap-2 text-sm font-semibold text-medical" href={`/${locale}/news/${article.slug}`}>
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
