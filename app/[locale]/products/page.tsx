import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, FileText, ImageIcon, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SectionHeading } from "@/components/site/section-heading";
import { productCategories, tText } from "@/content/novytas";
import { db } from "@/lib/db";
import { dictionary, getLocale } from "@/lib/i18n";
import { createMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ category?: string; q?: string }>;
};

async function getProducts(category?: string, q?: string) {
  try {
    return await db.product.findMany({
      where: {
        status: "PUBLISHED",
        ...(category ? { category: { slug: category } } : {}),
        ...(q
          ? {
              OR: [
                { titleMn: { contains: q, mode: "insensitive" } },
                { titleEn: { contains: q, mode: "insensitive" } },
                { summaryMn: { contains: q, mode: "insensitive" } },
                { summaryEn: { contains: q, mode: "insensitive" } }
              ]
            }
          : {})
      },
      include: { category: true, media: { include: { media: true }, orderBy: { sortOrder: "asc" } } },
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
    path: `/${locale}/products`,
    title: dictionary[locale].products.title,
    description: dictionary[locale].products.subtitle
  });
}

export default async function ProductsPage({ params, searchParams }: PageProps) {
  const { locale: rawLocale } = await params;
  const { category, q } = await searchParams;
  const locale = getLocale(rawLocale);
  const dict = dictionary[locale];
  const products = await getProducts(category, q);

  return (
    <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-24 lg:px-8">
      <SectionHeading title={dict.products.title} description={dict.products.subtitle} />

      <form className="mt-8 grid gap-3 rounded-xl border bg-card p-4 md:grid-cols-[1fr_auto]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
          <Input name="q" defaultValue={q ?? ""} className="pl-10" placeholder={dict.actions.search} />
        </div>
        <Button type="submit" variant="medical">{dict.actions.filter}</Button>
      </form>

      <div className="mt-8 flex flex-wrap gap-2">
        <Button variant={!category ? "default" : "outline"} size="sm" asChild>
          <Link href={`/${locale}/products`}>{dict.products.categories}</Link>
        </Button>
        {productCategories.map((item) => (
          <Button key={item.slug} variant={category === item.slug ? "default" : "outline"} size="sm" asChild>
            <Link href={`/${locale}/products?category=${item.slug}`}>{tText(item.title, locale)}</Link>
          </Button>
        ))}
      </div>

      {products.length > 0 ? (
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => {
            const title = locale === "mn" ? product.titleMn : product.titleEn || product.titleMn;
            const summary = locale === "mn" ? product.summaryMn : product.summaryEn || product.summaryMn;
            const image = product.media.find((item) => item.media.type === "IMAGE")?.media;
            return (
              <Card key={product.id} className="overflow-hidden">
                <div className="flex aspect-[4/3] items-center justify-center bg-muted">
                  {image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={image.url} alt={locale === "mn" ? image.altMn ?? title : image.altEn ?? title} className="h-full w-full object-cover" />
                  ) : (
                    <ImageIcon className="h-10 w-10 text-muted-foreground" />
                  )}
                </div>
                <CardHeader>
                  <Badge className="w-fit">{locale === "mn" ? product.category.titleMn : product.category.titleEn}</Badge>
                  <CardTitle>{title}</CardTitle>
                  {summary ? <CardDescription>{summary}</CardDescription> : null}
                  <Link className="inline-flex items-center gap-2 text-sm font-semibold text-medical" href={`/${locale}/products/${product.slug}`}>
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
            <FileText className="h-8 w-8 text-teal" />
            <CardTitle>{dict.products.emptyTitle}</CardTitle>
            <CardDescription>{dict.products.emptyBody}</CardDescription>
          </CardHeader>
        </Card>
      )}
    </main>
  );
}
