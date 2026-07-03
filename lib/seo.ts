import type { Metadata } from "next";
import type { Locale } from "@/lib/i18n";
import { absoluteUrl } from "@/lib/utils";
import { company } from "@/content/novytas";

type SeoInput = {
  locale: Locale;
  path: string;
  title?: string;
  description?: string;
};

export function createMetadata({ locale, path, title, description }: SeoInput): Metadata {
  const pageTitle = title ? `${title} | ${company.brand}` : `${company.name[locale]} | ${company.tagline[locale]}`;
  const pageDescription = description ?? company.summary[locale];
  const url = absoluteUrl(path);

  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
    title: pageTitle,
    description: pageDescription,
    alternates: {
      canonical: url,
      languages: {
        mn: absoluteUrl(path.replace(/^\/en/, "/mn")),
        en: absoluteUrl(path.replace(/^\/mn/, "/en"))
      }
    },
    openGraph: {
      title: pageTitle,
      description: pageDescription,
      url,
      siteName: company.brand,
      locale: locale === "mn" ? "mn_MN" : "en_US",
      type: "website",
      images: [
        {
          url: absoluteUrl("/brand/novytas-logo.png"),
          width: 1200,
          height: 1200,
          alt: company.name[locale]
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description: pageDescription,
      images: [absoluteUrl("/brand/novytas-logo.png")]
    }
  };
}

export function organizationJsonLd(locale: Locale) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: company.name[locale],
    legalName: company.name[locale],
    foundingDate: String(company.establishedYear),
    logo: absoluteUrl("/brand/novytas-logo.png"),
    description: company.summary[locale],
    address: {
      "@type": "PostalAddress",
      addressLocality: locale === "mn" ? "Улаанбаатар хот" : "Ulaanbaatar",
      addressCountry: "MN"
    }
  };
}
