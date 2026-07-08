import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, FileText, ImageIcon, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SectionHeading } from "@/components/site/section-heading";
import { tText } from "@/content/novytas";
import { getSeoRecord } from "@/lib/cms";
import { dictionary, getLocale } from "@/lib/i18n";
import { getProductCategoryOptions } from "@/lib/product-categories";
import { getPublishedProducts } from "@/lib/public-data";
import { createMetadata } from "@/lib/seo";

export const revalidate = 300;

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ category?: string; q?: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = getLocale(rawLocale);
  const seo = await getSeoRecord("/products");
  return createMetadata({
    locale,
    path: `/${locale}/products`,
    title: dictionary[locale].products.title,
    description: dictionary[locale].products.subtitle,
    seo
  });
}

export default async function ProductsPage({ params, searchParams }: PageProps) {
  const { locale: rawLocale } = await params;
  const { category: categoryId, q } = await searchParams;
  const locale = getLocale(rawLocale);
  const dict = dictionary[locale];
  const [products, categories] = await Promise.all([
    getPublishedProducts(categoryId, q),
    getProductCategoryOptions()
  ]);

  return (
    <main className="page-reveal premium-container premium-section">
      <SectionHeading title={dict.products.title} description={dict.products.subtitle} />

      <form className="mt-10 grid gap-3 rounded-2xl border border-slate-200/70 bg-white p-4 shadow-subtle md:grid-cols-[1fr_auto]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
          <Input name="q" defaultValue={q ?? ""} className="pl-10" placeholder={dict.actions.search} />
        </div>
        <Button type="submit" variant="medical">{dict.actions.filter}</Button>
      </form>

      <div className="mt-8 flex flex-wrap gap-2">
        <Button variant={!categoryId ? "default" : "outline"} size="sm" asChild>
          <Link href={`/${locale}/products`}>{dict.products.categories}</Link>
        </Button>
        {categories.map((item) => (
          <Button key={item.id ?? item.title.mn} variant={item.id && categoryId === item.id ? "default" : "outline"} size="sm" asChild>
            <Link href={item.id ? `/${locale}/products?category=${item.id}` : `/${locale}/products`}>{tText(item.title, locale)}</Link>
          </Button>
        ))}
      </div>

      {products.length > 0 ? (
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => {
            const title = locale === "mn" ? product.titleMn : product.titleEn || product.titleMn;
            const summary = locale === "mn" ? product.summaryMn : product.summaryEn || product.summaryMn;
            const image = product.media.find((item) => item.media.type === "IMAGE")?.media;
            return (
              <Card key={product.id} className="premium-card-hover group overflow-hidden">
                <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-white">
                  {image ? (
                    <Image
                      src={image.url}
                      alt={locale === "mn" ? image.altMn ?? title : image.altEn ?? title}
                      fill
                      sizes="(min-width: 1280px) 389px, (min-width: 1024px) 30vw, (min-width: 768px) 45vw, 100vw"
                      className="premium-image object-cover"
                      quality={70}
                    />
                  ) : (
                    <ImageIcon className="h-10 w-10 text-muted-foreground" />
                  )}
                </div>
                <CardHeader>
                  <Badge className="w-fit">{locale === "mn" ? product.category.titleMn : product.category.titleEn}</Badge>
                  <CardTitle>{title}</CardTitle>
                  {summary ? <CardDescription>{summary}</CardDescription> : null}
                  <Link className="inline-flex items-center gap-2 text-sm font-semibold text-medical" href={`/${locale}/products/${product.id}`}>
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
