import type { Metadata } from "next";
import { CheckCircle2, FileCheck2, HeartPulse, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SectionHeading } from "@/components/site/section-heading";
import { advantages, company, compliance, compliancePrinciple, tText } from "@/content/novytas";
import { dictionary, getLocale } from "@/lib/i18n";
import { createMetadata } from "@/lib/seo";

type PageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = getLocale(rawLocale);
  return createMetadata({
    locale,
    path: `/${locale}/about`,
    title: dictionary[locale].about.title,
    description: company.summary[locale]
  });
}

export default async function AboutPage({ params }: PageProps) {
  const { locale: rawLocale } = await params;
  const locale = getLocale(rawLocale);
  const dict = dictionary[locale];

  return (
    <main>
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-24 lg:px-8">
        <Badge className="mb-6 w-fit bg-teal/10 text-teal">{company.sourceTitle[locale]}</Badge>
        <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr]">
          <div>
            <h1 className="text-balance text-5xl font-semibold tracking-normal text-primary dark:text-white md:text-6xl">
              {dict.about.title}
            </h1>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">{dict.about.subtitle}</p>
          </div>
          <Card className="bg-muted/45">
            <CardHeader>
              <CardTitle>{company.name[locale]}</CardTitle>
              <CardDescription className="text-base leading-8">{company.summary[locale]}</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      <section className="border-y bg-muted/45 py-20">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-3 lg:px-8">
          <Card>
            <CardHeader>
              <HeartPulse className="h-6 w-6 text-teal" />
              <CardTitle>{dict.about.missionVision}</CardTitle>
              <CardDescription>{company.missionLead[locale]}</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CheckCircle2 className="h-6 w-6 text-teal" />
              <CardTitle>{locale === "mn" ? "Эрхэм зорилго" : "Mission"}</CardTitle>
              <CardDescription>{company.mission[locale]}</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <ShieldCheck className="h-6 w-6 text-teal" />
              <CardTitle>{locale === "mn" ? "Алсын хараа" : "Vision"}</CardTitle>
              <CardDescription>{company.vision[locale]}</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[0.75fr_1.25fr] lg:px-8">
          <SectionHeading title={dict.about.values} description={company.partnership[locale]} />
          <div className="grid gap-4 sm:grid-cols-2">
            {company.values.map((value) => (
              <div key={value.mn} className="rounded-xl border bg-card p-6">
                <p className="font-semibold">{value[locale]}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-muted/45 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading title={dict.about.advantages} />
          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {advantages.map((item) => (
              <Card key={item.title.mn}>
                <CardHeader>
                  <CardTitle className="text-base">{tText(item.title, locale)}</CardTitle>
                  <CardDescription>{tText(item.body, locale)}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading title={dict.about.compliance} description={compliancePrinciple[locale]} />
          <div className="mt-10 grid gap-4">
            {compliance.map((item) => (
              <Card key={item.title.mn}>
                <CardHeader className="md:flex md:flex-row md:items-start md:gap-5">
                  <FileCheck2 className="h-6 w-6 shrink-0 text-teal" />
                  <div>
                    <CardTitle className="text-base">{tText(item.title, locale)}</CardTitle>
                    <CardDescription className="mt-2">{tText(item.body, locale)}</CardDescription>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
