import type { Metadata } from "next";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ContactForm } from "@/components/forms/contact-form";
import { ContactMap } from "@/components/site/contact-map";
import { MotionReveal } from "@/components/site/motion-reveal";
import { SectionHeading } from "@/components/site/section-heading";
import { getCmsContent, getSeoRecord, localized } from "@/lib/cms";
import { dictionary, getLocale } from "@/lib/i18n";
import { createMetadata } from "@/lib/seo";

type PageProps = { params: Promise<{ locale: string }> };

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = getLocale(rawLocale);
  const [content, seo] = await Promise.all([
    getCmsContent("contact"),
    getSeoRecord("/contact")
  ]);
  return createMetadata({
    locale,
    path: `/${locale}/contact`,
    title: localized(content.pageTitle, locale),
    description: localized(content.pageSubtitle, locale),
    seo
  });
}

export default async function ContactPage({ params }: PageProps) {
  const { locale: rawLocale } = await params;
  const locale = getLocale(rawLocale);
  const dict = dictionary[locale];
  const content = await getCmsContent("contact");
  const address = localized(content.address, locale);
  const pageStyle = {
    backgroundColor: content.style.backgroundColor || undefined,
    color: content.style.foregroundColor || undefined
  };
  const cardStyle = {
    backgroundColor: content.style.surfaceColor || undefined
  };

  return (
    <main className="page-reveal premium-container premium-section" style={pageStyle}>
      <MotionReveal>
        <SectionHeading title={localized(content.pageTitle, locale)} description={localized(content.pageSubtitle, locale)} />
      </MotionReveal>

      <div className="mt-12 grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="min-w-0">
          <ContactMap locale={locale} mapInput={content.googleMapsEmbedUrl} fallbackLocation={address} showLabel={false} />
        </div>

        <Card className="shadow-premium" style={cardStyle}>
          <CardHeader>
            <CardTitle>{localized(content.formTitle, locale)}</CardTitle>
            <CardDescription>{localized(content.pageSubtitle, locale)}</CardDescription>
          </CardHeader>
          <div className="px-6 pb-6">
            <ContactForm locale={locale} submitLabel={dict.actions.sendInquiry} />
          </div>
        </Card>
      </div>
    </main>
  );
}
