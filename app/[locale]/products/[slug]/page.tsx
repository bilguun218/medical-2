import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Download, FileText, ImageIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ContactForm } from "@/components/forms/contact-form";
import { SectionHeading } from "@/components/site/section-heading";
import { db } from "@/lib/db";
import { dictionary, getLocale } from "@/lib/i18n";
import { createMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ locale: string; slug: string }> };

async function getProduct(slug: string) {
  try {
    return await db.product.findUnique({
      where: { slug },
      include: { category: true, media: { include: { media: true }, orderBy: { sortOrder: "asc" } } }
    });
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: rawLocale, slug } = await params;
  const locale = getLocale(rawLocale);
  const product = await getProduct(slug);
  const title = product ? (locale === "mn" ? product.seoTitleMn || product.titleMn : product.seoTitleEn || product.titleEn || product.titleMn) : dictionary[locale].products.title;
  const description = product
    ? locale === "mn"
      ? product.seoDescriptionMn || product.summaryMn || undefined
      : product.seoDescriptionEn || product.summaryEn || product.summaryMn || undefined
    : undefined;
  return createMetadata({ locale, path: `/${locale}/products/${slug}`, title, description });
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { locale: rawLocale, slug } = await params;
  const locale = getLocale(rawLocale);
  const dict = dictionary[locale];
  const product = await getProduct(slug);

  if (!product || product.status !== "PUBLISHED") {
    notFound();
  }

  const title = locale === "mn" ? product.titleMn : product.titleEn || product.titleMn;
  const summary = locale === "mn" ? product.summaryMn : product.summaryEn || product.summaryMn;
  const description = locale === "mn" ? product.descriptionMn : product.descriptionEn || product.descriptionMn;
  const images = product.media.filter((item) => item.media.type === "IMAGE");
  const files = product.media.filter((item) => item.media.type === "PDF" || item.role !== "GALLERY");

  return (
    <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-24 lg:px-8">
      <div className="grid gap-12 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="grid gap-4">
          <div className="flex aspect-[4/3] items-center justify-center rounded-xl border bg-muted">
            {images[0] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={images[0].media.url} alt={title} className="h-full w-full rounded-xl object-cover" />
            ) : (
              <ImageIcon className="h-12 w-12 text-muted-foreground" />
            )}
          </div>
        </div>

        <div>
          <Badge className="mb-4 w-fit">{locale === "mn" ? product.category.titleMn : product.category.titleEn}</Badge>
          <h1 className="text-balance text-4xl font-semibold text-primary dark:text-white md:text-5xl">{title}</h1>
          {summary ? <p className="mt-5 text-lg leading-8 text-muted-foreground">{summary}</p> : null}
          {description ? <div className="mt-8 whitespace-pre-line text-base leading-8 text-muted-foreground">{description}</div> : null}
        </div>
      </div>

      <div className="mt-14 grid gap-8 lg:grid-cols-[1fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>{dict.products.technicalSpecs}</CardTitle>
            <CardDescription>
              {product.specifications ? JSON.stringify(product.specifications, null, 2) : dict.products.emptyBody}
            </CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{dict.products.attachments}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            {files.length > 0 ? (
              files.map((file) => (
                <a key={file.id} className="flex items-center gap-3 rounded-lg border p-3 text-sm font-medium hover:bg-muted" href={file.media.url}>
                  <Download className="h-4 w-4 text-teal" />
                  {file.media.filename}
                </a>
              ))
            ) : (
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileText className="h-4 w-4" />
                {dict.products.emptyBody}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <section className="mt-14 rounded-xl border bg-card p-6 md:p-8">
        <SectionHeading title={dict.products.inquiryTitle} description={title} />
        <div className="mt-8 max-w-2xl">
          <ContactForm locale={locale} productId={product.id} />
        </div>
      </section>
    </main>
  );
}
