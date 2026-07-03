import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BadgeCheck, Building2, Globe2, HeartPulse, ShieldCheck, Stethoscope } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MotionReveal } from "@/components/site/motion-reveal";
import { SectionHeading } from "@/components/site/section-heading";
import {
  advantages,
  company,
  productCategories,
  sourceCountries,
  tText
} from "@/content/novytas";
import { dictionary, getLocale } from "@/lib/i18n";
import { createMetadata } from "@/lib/seo";

type PageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = getLocale(rawLocale);
  return createMetadata({ locale, path: `/${locale}` });
}

export default async function HomePage({ params }: PageProps) {
  const { locale: rawLocale } = await params;
  const locale = getLocale(rawLocale);
  const dict = dictionary[locale];

  return (
    <main>
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 md:py-28 lg:grid-cols-[1.04fr_0.96fr] lg:px-8">
          <MotionReveal className="flex flex-col justify-center">
            <Badge className="mb-6 w-fit border-teal/35 bg-teal/10 text-teal">{dict.home.eyebrow}</Badge>
            <h1 className="max-w-4xl text-balance text-5xl font-semibold tracking-normal text-primary dark:text-white md:text-7xl">
              {dict.home.title}
            </h1>
            <p className="mt-6 max-w-2xl text-pretty text-lg leading-8 text-muted-foreground">{dict.home.subtitle}</p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Button size="lg" asChild>
                <Link href={`/${locale}/products`}>
                  {dict.actions.viewProducts}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href={`/${locale}/about`}>{dict.actions.learnMore}</Link>
              </Button>
            </div>
          </MotionReveal>

          <MotionReveal className="relative min-h-[420px]">
            <div className="absolute inset-0 rounded-[2rem] border bg-white shadow-soft dark:bg-card" />
            <div className="absolute inset-6 rounded-[1.5rem] bg-muted/60" />
            <div className="relative flex h-full min-h-[420px] items-center justify-center p-8">
              <Image
                src="/brand/novytas-logo.png"
                alt={company.name[locale]}
                width={620}
                height={620}
                priority
                className="h-auto w-full max-w-[430px] object-contain"
              />
            </div>
          </MotionReveal>
        </div>
      </section>

      <section className="border-y bg-background py-20">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
          <SectionHeading title={dict.home.introTitle} description={company.missionLead[locale]} />
          <div className="grid gap-4 md:grid-cols-2">
            {[
              { icon: Building2, value: String(company.establishedYear), label: locale === "mn" ? "байгуулагдсан" : "established" },
              { icon: ShieldCheck, value: locale === "mn" ? "ЭМЯ" : "MOH", label: locale === "mn" ? "тусгай зөвшөөрөл" : "special license" },
              { icon: Globe2, value: String(sourceCountries.length), label: locale === "mn" ? "эх сурвалж улсын жишээ" : "source country examples" },
              { icon: HeartPulse, value: locale === "mn" ? "Хүүхэд" : "Children", label: locale === "mn" ? "эрүүл мэндийн фокус" : "health focus" }
            ].map((stat) => (
              <Card key={stat.label} className="border-muted bg-muted/35">
                <CardHeader>
                  <stat.icon className="h-5 w-5 text-teal" />
                  <CardTitle className="text-3xl text-primary dark:text-white">{stat.value}</CardTitle>
                  <CardDescription>{stat.label}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading title={dict.home.operationsTitle} description={company.summary[locale]} />
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {productCategories.map((category) => (
              <Card key={category.slug} className="group overflow-hidden transition hover:-translate-y-1 hover:shadow-soft">
                <CardHeader>
                  <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary dark:bg-teal/10 dark:text-teal">
                    <Stethoscope className="h-5 w-5" />
                  </div>
                  <CardTitle>{tText(category.title, locale)}</CardTitle>
                  <CardDescription>{tText(category.description, locale)}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Link className="inline-flex items-center gap-2 text-sm font-semibold text-medical" href={`/${locale}/products?category=${category.slug}`}>
                    {dict.actions.viewProducts}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-muted/55 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading title={dict.home.whyTitle} description={company.vision[locale]} />
          <div className="mt-10 grid gap-4 lg:grid-cols-5">
            {advantages.map((item) => (
              <Card key={item.title.mn} className="bg-background/78">
                <CardHeader>
                  <BadgeCheck className="h-5 w-5 text-teal" />
                  <CardTitle className="text-base">{tText(item.title, locale)}</CardTitle>
                  <CardDescription>{tText(item.body, locale)}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[1fr_0.8fr] lg:px-8">
          <Card className="border-primary/10 bg-primary p-8 text-white dark:bg-card">
            <SectionHeading
              title={dict.home.contactTitle}
              description={company.partnership[locale]}
              className="[&_h2]:text-white [&_p]:text-white/72"
            />
            <Button className="mt-8" variant="teal" asChild>
              <Link href={`/${locale}/contact`}>
                {dict.actions.sendInquiry}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>{dict.home.latestNews}</CardTitle>
              <CardDescription>{dict.home.noNews}</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>
    </main>
  );
}
