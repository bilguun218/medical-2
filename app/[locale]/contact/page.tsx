import type { Metadata } from "next";
import { Facebook, Instagram, Linkedin } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ContactForm } from "@/components/forms/contact-form";
import { ContactMap } from "@/components/site/contact-map";
import { MotionReveal } from "@/components/site/motion-reveal";
import { SectionHeading } from "@/components/site/section-heading";
import { getCmsContent, getSeoRecord, localized } from "@/lib/cms";
import type { ContactContent, FooterContent } from "@/lib/cms";
import { dictionary, getLocale } from "@/lib/i18n";
import { createMetadata } from "@/lib/seo";

type PageProps = { params: Promise<{ locale: string }> };

export const revalidate = 300;

type SocialKey = "facebook" | "instagram" | "linkedin";

const socialDefaults: Array<{ key: SocialKey; label: string; icon: LucideIcon }> = [
  { key: "facebook", label: "Facebook", icon: Facebook },
  { key: "instagram", label: "Instagram", icon: Instagram },
  { key: "linkedin", label: "LinkedIn", icon: Linkedin }
];

function externalHref(value: string) {
  const href = value.trim();

  if (!href) {
    return "";
  }

  return href.startsWith("http://") || href.startsWith("https://") ? href : `https://${href}`;
}

function getFooterSocialHref(label: string, footer: FooterContent) {
  const normalized = label.toLowerCase();
  const match = footer.socialLinks.find((item) => item.visible && item.label.toLowerCase().includes(normalized));
  return match?.href ?? "";
}

function getContactSocialLinks(contact: ContactContent, footer: FooterContent) {
  return socialDefaults.map((item) => ({
    ...item,
    href: externalHref(contact[item.key] || getFooterSocialHref(item.label, footer))
  }));
}

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
  const [content, footer] = await Promise.all([
    getCmsContent("contact"),
    getCmsContent("footer")
  ]);
  const address = localized(content.address, locale);
  const socialLinks = getContactSocialLinks(content, footer);
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
          <div className="mt-5">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">{locale === "mn" ? "Сошиал холбоос" : "Social links"}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {socialLinks.map((link) => {
                const Icon = link.icon;
                const className = "inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200/80 bg-white text-primary shadow-sm transition hover:border-teal/40 hover:text-teal";

                return link.href ? (
                  <a key={link.label} href={link.href} target="_blank" rel="noreferrer" aria-label={link.label} title={link.label} className={className}>
                    <Icon className="h-4 w-4" />
                  </a>
                ) : (
                  <span key={link.label} aria-label={link.label} aria-disabled="true" title={`${link.label} холбоос оруулаагүй`} className={`${className} cursor-default opacity-55 hover:border-slate-200/80 hover:text-primary`}>
                    <Icon className="h-4 w-4" />
                  </span>
                );
              })}
            </div>
          </div>
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
