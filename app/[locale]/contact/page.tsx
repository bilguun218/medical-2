import type { Metadata } from "next";
import { Clock, Mail, MapPinned, Phone } from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ContactForm } from "@/components/forms/contact-form";
import { SectionHeading } from "@/components/site/section-heading";
import { company } from "@/content/novytas";
import { dictionary, getLocale } from "@/lib/i18n";
import { createMetadata } from "@/lib/seo";

type PageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = getLocale(rawLocale);
  return createMetadata({
    locale,
    path: `/${locale}/contact`,
    title: dictionary[locale].contact.title,
    description: company.contactLine[locale]
  });
}

export default async function ContactPage({ params }: PageProps) {
  const { locale: rawLocale } = await params;
  const locale = getLocale(rawLocale);
  const dict = dictionary[locale];

  return (
    <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-24 lg:px-8">
      <SectionHeading title={dict.contact.title} description={dict.contact.subtitle} />

      <div className="mt-10 grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="grid gap-4">
          <Card>
            <CardHeader>
              <CardTitle>{dict.contact.infoTitle}</CardTitle>
              <CardDescription>{company.contactLine[locale]}</CardDescription>
            </CardHeader>
          </Card>
          {[
            { icon: Phone, text: dict.contact.phoneUnavailable },
            { icon: Mail, text: dict.contact.emailUnavailable },
            { icon: Clock, text: dict.contact.hoursUnavailable },
            { icon: MapPinned, text: dict.contact.mapUnavailable }
          ].map((item) => (
            <Card key={item.text} className="bg-muted/45">
              <CardHeader className="flex flex-row items-start gap-4">
                <item.icon className="mt-1 h-5 w-5 text-teal" />
                <CardDescription>{item.text}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{dict.contact.formTitle}</CardTitle>
            <CardDescription>{dict.contact.subtitle}</CardDescription>
          </CardHeader>
          <div className="px-6 pb-6">
            <ContactForm locale={locale} />
          </div>
        </Card>
      </div>
    </main>
  );
}
