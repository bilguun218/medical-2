"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Contact, FileText, Home, ImageIcon, LayoutTemplate, Loader2, Monitor, Save, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { AboutContent, ContactContent, FooterContent, HeaderContent, HomeContent } from "@/lib/cms";
import type { Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type VisualContent = {
  home: HomeContent;
  about: AboutContent;
  contact: ContactContent;
  header: HeaderContent;
  footer: FooterContent;
};

type VisualKey = keyof VisualContent;
type PageKey = "home" | "about" | "contact" | "chrome";
type FieldKind = "localized-input" | "localized-textarea" | "text" | "textarea" | "url" | "image" | "list";
type LocalizedValue = { mn: string; en: string };

type EditorField = {
  id: string;
  page: PageKey;
  key: VisualKey;
  path: string[];
  label: string;
  kind: FieldKind;
};

const pages: Array<{ key: PageKey; label: string; icon: typeof Home }> = [
  { key: "home", label: "Нүүр", icon: Home },
  { key: "about", label: "Бидний тухай", icon: FileText },
  { key: "contact", label: "Холбоо барих", icon: Contact },
  { key: "chrome", label: "Header / Footer", icon: LayoutTemplate }
];

const fields: EditorField[] = [
  { id: "home.heroTitle", page: "home", key: "home", path: ["heroTitle"], label: "Баннерын гарчиг", kind: "localized-input" },
  { id: "home.heroSubtitle", page: "home", key: "home", path: ["heroSubtitle"], label: "Баннерын дэд гарчиг", kind: "localized-input" },
  { id: "home.heroDescription", page: "home", key: "home", path: ["heroDescription"], label: "Баннерын тайлбар", kind: "localized-textarea" },
  { id: "home.heroImage", page: "home", key: "home", path: ["heroImage"], label: "Баннерын зураг", kind: "image" },
  { id: "home.heroBackgroundImage", page: "home", key: "home", path: ["heroBackgroundImage"], label: "Баннерын арын зураг", kind: "image" },
  { id: "home.primaryButtonText", page: "home", key: "home", path: ["primaryButtonText"], label: "Үндсэн товчны текст", kind: "localized-input" },
  { id: "home.primaryButtonLink", page: "home", key: "home", path: ["primaryButtonLink"], label: "Үндсэн товчны холбоос", kind: "url" },
  { id: "home.secondaryButtonText", page: "home", key: "home", path: ["secondaryButtonText"], label: "Хоёрдогч товчны текст", kind: "localized-input" },
  { id: "home.secondaryButtonLink", page: "home", key: "home", path: ["secondaryButtonLink"], label: "Хоёрдогч товчны холбоос", kind: "url" },
  { id: "home.operationsTitle", page: "home", key: "home", path: ["operationsTitle"], label: "Үйл ажиллагааны гарчиг", kind: "localized-input" },
  { id: "home.operationsDescription", page: "home", key: "home", path: ["operationsDescription"], label: "Үйл ажиллагааны тайлбар", kind: "localized-textarea" },
  { id: "home.whyTitle", page: "home", key: "home", path: ["whyTitle"], label: "Яагаад сонгох гарчиг", kind: "localized-input" },
  { id: "home.whyDescription", page: "home", key: "home", path: ["whyDescription"], label: "Яагаад сонгох тайлбар", kind: "localized-textarea" },
  { id: "home.contactTitle", page: "home", key: "home", path: ["contactTitle"], label: "CTA гарчиг", kind: "localized-input" },
  { id: "home.contactDescription", page: "home", key: "home", path: ["contactDescription"], label: "CTA тайлбар", kind: "localized-textarea" },
  { id: "home.contactButtonText", page: "home", key: "home", path: ["contactButtonText"], label: "CTA товчны текст", kind: "localized-input" },
  { id: "home.contactButtonLink", page: "home", key: "home", path: ["contactButtonLink"], label: "CTA товчны холбоос", kind: "url" },

  { id: "about.pageTitle", page: "about", key: "about", path: ["pageTitle"], label: "Хуудасны гарчиг", kind: "localized-input" },
  { id: "about.pageSubtitle", page: "about", key: "about", path: ["pageSubtitle"], label: "Хуудасны дэд гарчиг", kind: "localized-textarea" },
  { id: "about.companyIntroduction", page: "about", key: "about", path: ["companyIntroduction"], label: "Танилцуулгын badge", kind: "localized-input" },
  { id: "about.companyDescription", page: "about", key: "about", path: ["companyDescription"], label: "Компанийн тайлбар", kind: "localized-textarea" },
  { id: "about.missionLead", page: "about", key: "about", path: ["missionLead"], label: "Mission lead", kind: "localized-textarea" },
  { id: "about.mission", page: "about", key: "about", path: ["mission"], label: "Эрхэм зорилго", kind: "localized-textarea" },
  { id: "about.vision", page: "about", key: "about", path: ["vision"], label: "Алсын хараа", kind: "localized-textarea" },
  { id: "about.companyHistory", page: "about", key: "about", path: ["companyHistory"], label: "Компанийн түүх", kind: "localized-textarea" },
  { id: "about.ceoMessage", page: "about", key: "about", path: ["ceoMessage"], label: "CEO мэндчилгээ", kind: "localized-textarea" },
  { id: "about.heroImage", page: "about", key: "about", path: ["heroImage"], label: "Зураг 1", kind: "image" },
  { id: "about.secondaryImage", page: "about", key: "about", path: ["secondaryImage"], label: "Зураг 2", kind: "image" },

  { id: "contact.pageTitle", page: "contact", key: "contact", path: ["pageTitle"], label: "Хуудасны гарчиг", kind: "localized-input" },
  { id: "contact.pageSubtitle", page: "contact", key: "contact", path: ["pageSubtitle"], label: "Хуудасны дэд гарчиг", kind: "localized-textarea" },
  { id: "contact.infoTitle", page: "contact", key: "contact", path: ["infoTitle"], label: "Мэдээллийн гарчиг", kind: "localized-input" },
  { id: "contact.formTitle", page: "contact", key: "contact", path: ["formTitle"], label: "Маягтын гарчиг", kind: "localized-input" },
  { id: "contact.companyName", page: "contact", key: "contact", path: ["companyName"], label: "Компанийн нэр", kind: "localized-input" },
  { id: "contact.address", page: "contact", key: "contact", path: ["address"], label: "Хаяг", kind: "localized-textarea" },
  { id: "contact.phoneNumbers", page: "contact", key: "contact", path: ["phoneNumbers"], label: "Утаснууд", kind: "list" },
  { id: "contact.email", page: "contact", key: "contact", path: ["email"], label: "Имэйл", kind: "text" },
  { id: "contact.website", page: "contact", key: "contact", path: ["website"], label: "Вэб сайт", kind: "url" },
  { id: "contact.contactPerson", page: "contact", key: "contact", path: ["contactPerson"], label: "Холбоо барих хүн", kind: "localized-input" },
  { id: "contact.businessHours", page: "contact", key: "contact", path: ["businessHours"], label: "Ажлын цаг", kind: "localized-textarea" },
  { id: "contact.googleMapsEmbedUrl", page: "contact", key: "contact", path: ["googleMapsEmbedUrl"], label: "Google Maps байршил", kind: "url" },
  { id: "contact.facebook", page: "contact", key: "contact", path: ["facebook"], label: "Facebook", kind: "url" },
  { id: "contact.instagram", page: "contact", key: "contact", path: ["instagram"], label: "Instagram", kind: "url" },
  { id: "contact.linkedin", page: "contact", key: "contact", path: ["linkedin"], label: "LinkedIn", kind: "url" },

  { id: "header.companyName", page: "chrome", key: "header", path: ["companyName"], label: "Header компанийн нэр", kind: "localized-input" },
  { id: "header.logo", page: "chrome", key: "header", path: ["logo"], label: "Header logo", kind: "image" },
  { id: "header.darkLogo", page: "chrome", key: "header", path: ["darkLogo"], label: "Dark logo", kind: "image" },
  { id: "header.contactButtonLabel", page: "chrome", key: "header", path: ["contactButtonLabel"], label: "Header contact button", kind: "localized-input" },
  { id: "footer.copyright", page: "chrome", key: "footer", path: ["copyright"], label: "Footer copyright", kind: "localized-input" },
  { id: "footer.description", page: "chrome", key: "footer", path: ["description"], label: "Footer description", kind: "localized-textarea" },
  { id: "footer.contactHeading", page: "chrome", key: "footer", path: ["contactHeading"], label: "Footer contact heading", kind: "localized-input" },
  { id: "footer.quickLinksHeading", page: "chrome", key: "footer", path: ["quickLinksHeading"], label: "Footer links heading", kind: "localized-input" }
];

function isLocalizedValue(value: unknown): value is LocalizedValue {
  return typeof value === "object" && value !== null && "mn" in value && "en" in value;
}

function getAtPath(source: unknown, path: string[]) {
  return path.reduce<unknown>((value, key) => {
    if (typeof value !== "object" || value === null) return undefined;
    return (value as Record<string, unknown>)[key];
  }, source);
}

function setAtPath<T>(source: T, path: string[], nextValue: unknown): T {
  const [head, ...rest] = path;

  if (!head) {
    return nextValue as T;
  }

  const record = (typeof source === "object" && source !== null ? source : {}) as Record<string, unknown>;

  return {
    ...record,
    [head]: rest.length > 0 ? setAtPath(record[head], rest, nextValue) : nextValue
  } as T;
}

function textValue(value: unknown, locale: Locale) {
  if (isLocalizedValue(value)) return value[locale];
  if (Array.isArray(value)) return value.filter(Boolean).join(", ");
  return String(value ?? "");
}

export function VisualContentEditor({ initialValue }: { initialValue: VisualContent }) {
  const router = useRouter();
  const [content, setContent] = useState(initialValue);
  const [activePage, setActivePage] = useState<PageKey>("home");
  const [activeFieldId, setActiveFieldId] = useState(fields[0].id);
  const [locale, setLocale] = useState<Locale>("mn");
  const [viewport, setViewport] = useState<"desktop" | "mobile">("desktop");
  const [dirtyKeys, setDirtyKeys] = useState<Set<VisualKey>>(new Set());
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const visibleFields = useMemo(() => fields.filter((field) => field.page === activePage), [activePage]);
  const activeField = fields.find((field) => field.id === activeFieldId) ?? visibleFields[0] ?? fields[0];
  const activeValue = getAtPath(content[activeField.key], activeField.path);

  useEffect(() => {
    if (!visibleFields.some((field) => field.id === activeFieldId)) {
      setActiveFieldId(visibleFields[0]?.id ?? fields[0].id);
    }
  }, [activeFieldId, visibleFields]);

  function updateField(field: EditorField, nextValue: unknown) {
    setContent((current) => ({
      ...current,
      [field.key]: setAtPath(current[field.key], field.path, nextValue)
    }));
    setDirtyKeys((current) => new Set(current).add(field.key));
    setMessage(null);
  }

  async function saveAll() {
    setSaving(true);
    setMessage(null);

    for (const key of dirtyKeys) {
      const response = await fetch(`/api/admin/content/${key}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(content[key])
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        setSaving(false);
        setMessage(payload?.error ? String(payload.error) : "Хадгалах үед алдаа гарлаа.");
        return;
      }
    }

    setDirtyKeys(new Set());
    setSaving(false);
    setMessage("Хадгаллаа.");
    router.refresh();
  }

  function EditableBlock({
    fieldId,
    children,
    className
  }: {
    fieldId: string;
    children: React.ReactNode;
    className?: string;
  }) {
    const selected = activeFieldId === fieldId;

    return (
      <button
        type="button"
        onClick={() => setActiveFieldId(fieldId)}
        className={cn(
          "block w-full min-w-0 rounded-lg border border-transparent p-2 text-left transition hover:border-medical/35 hover:bg-medical/[0.04]",
          selected && "border-medical bg-medical/[0.07] shadow-[0_0_0_3px_rgba(23,105,209,0.10)]",
          className
        )}
      >
        {children}
      </button>
    );
  }

  function PreviewImage({ src }: { src: string }) {
    if (!src) {
      return (
        <div className="flex aspect-[4/3] items-center justify-center rounded-xl border border-dashed bg-slate-50 text-slate-400">
          <ImageIcon className="h-8 w-8" />
        </div>
      );
    }

    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt="" className="aspect-[4/3] w-full rounded-xl border object-contain bg-white p-4" />;
  }

  const home = content.home;
  const about = content.about;
  const contactContent = content.contact;
  const header = content.header;
  const footer = content.footer;
  const canvasWidth = viewport === "mobile" ? "max-w-[390px]" : "max-w-5xl";

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
      <div className="grid gap-4">
        <Card>
          <CardHeader className="gap-4 md:flex md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Visual page editor</CardTitle>
              <p className="mt-1 text-sm text-slate-500">Page сонгоод canvas дээрх хэсгийг дарж засна.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant={locale === "mn" ? "default" : "outline"} size="sm" onClick={() => setLocale("mn")}>
                MN
              </Button>
              <Button type="button" variant={locale === "en" ? "default" : "outline"} size="sm" onClick={() => setLocale("en")}>
                EN
              </Button>
              <Button type="button" variant={viewport === "desktop" ? "default" : "outline"} size="sm" onClick={() => setViewport("desktop")}>
                <Monitor className="h-4 w-4" />
              </Button>
              <Button type="button" variant={viewport === "mobile" ? "default" : "outline"} size="sm" onClick={() => setViewport("mobile")}>
                <Smartphone className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {pages.map((page) => (
                <Button
                  key={page.key}
                  type="button"
                  variant={activePage === page.key ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActivePage(page.key)}
                >
                  <page.icon className="h-4 w-4" />
                  {page.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="overflow-auto rounded-2xl border bg-slate-100 p-4">
          <div className={cn("mx-auto min-h-[680px] overflow-hidden rounded-2xl bg-white shadow-premium transition-all", canvasWidth)}>
            <div className="border-b px-5 py-4">
              <div className="flex items-center justify-between gap-4">
                <EditableBlock fieldId="header.companyName" className="max-w-[220px] p-1">
                  <p className="text-base font-semibold text-primary">{textValue(header.companyName, locale)}</p>
                </EditableBlock>
                <EditableBlock fieldId="header.contactButtonLabel" className="w-fit p-1">
                  <span className="inline-flex rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-white">{textValue(header.contactButtonLabel, locale)}</span>
                </EditableBlock>
              </div>
            </div>

            {activePage === "home" ? (
              <div className="grid gap-8 p-5">
                <div className="grid gap-5 md:grid-cols-[1fr_280px] md:items-center">
                  <div>
                    <EditableBlock fieldId="home.heroTitle">
                      <h2 className="text-safe text-4xl font-bold leading-tight text-primary">{textValue(home.heroTitle, locale)}</h2>
                    </EditableBlock>
                    <EditableBlock fieldId="home.heroSubtitle">
                      <p className="text-safe text-lg font-semibold leading-7 text-slate-700">{textValue(home.heroSubtitle, locale)}</p>
                    </EditableBlock>
                    <EditableBlock fieldId="home.heroDescription">
                      <p className="text-safe whitespace-pre-line text-sm leading-7 text-slate-500">{textValue(home.heroDescription, locale)}</p>
                    </EditableBlock>
                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      <EditableBlock fieldId="home.primaryButtonText">
                        <span className="inline-flex rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white">{textValue(home.primaryButtonText, locale)}</span>
                      </EditableBlock>
                      <EditableBlock fieldId="home.secondaryButtonText">
                        <span className="inline-flex rounded-xl border px-4 py-2 text-sm font-semibold text-primary">{textValue(home.secondaryButtonText, locale)}</span>
                      </EditableBlock>
                    </div>
                  </div>
                  <EditableBlock fieldId="home.heroImage">
                    <PreviewImage src={home.heroImage} />
                  </EditableBlock>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <EditableBlock fieldId="home.operationsTitle">
                    <h3 className="text-safe text-2xl font-semibold text-primary">{textValue(home.operationsTitle, locale)}</h3>
                    <p className="text-safe mt-2 text-sm leading-6 text-slate-500">{textValue(home.operationsDescription, locale)}</p>
                  </EditableBlock>
                  <EditableBlock fieldId="home.whyTitle">
                    <h3 className="text-safe text-2xl font-semibold text-primary">{textValue(home.whyTitle, locale)}</h3>
                    <p className="text-safe mt-2 text-sm leading-6 text-slate-500">{textValue(home.whyDescription, locale)}</p>
                  </EditableBlock>
                </div>
                <EditableBlock fieldId="home.contactTitle" className="bg-primary text-white">
                  <h3 className="text-safe text-2xl font-semibold">{textValue(home.contactTitle, locale)}</h3>
                  <p className="text-safe mt-2 text-sm leading-6 text-white/75">{textValue(home.contactDescription, locale)}</p>
                </EditableBlock>
              </div>
            ) : null}

            {activePage === "about" ? (
              <div className="grid gap-7 p-5">
                <EditableBlock fieldId="about.companyIntroduction" className="w-fit">
                  <span className="text-xs font-semibold uppercase text-teal">{textValue(about.companyIntroduction, locale)}</span>
                </EditableBlock>
                <EditableBlock fieldId="about.pageTitle">
                  <h2 className="text-safe text-4xl font-bold leading-tight text-primary">{textValue(about.pageTitle, locale)}</h2>
                  <p className="text-safe mt-3 text-base leading-7 text-slate-500">{textValue(about.pageSubtitle, locale)}</p>
                </EditableBlock>
                <EditableBlock fieldId="about.companyDescription">
                  <p className="text-safe text-sm leading-7 text-slate-600">{textValue(about.companyDescription, locale)}</p>
                </EditableBlock>
                <div className="grid gap-4 md:grid-cols-3">
                  <EditableBlock fieldId="about.missionLead">
                    <h3 className="font-semibold text-primary">Lead</h3>
                    <p className="text-safe mt-2 text-sm leading-6 text-slate-500">{textValue(about.missionLead, locale)}</p>
                  </EditableBlock>
                  <EditableBlock fieldId="about.mission">
                    <h3 className="font-semibold text-primary">Mission</h3>
                    <p className="text-safe mt-2 text-sm leading-6 text-slate-500">{textValue(about.mission, locale)}</p>
                  </EditableBlock>
                  <EditableBlock fieldId="about.vision">
                    <h3 className="font-semibold text-primary">Vision</h3>
                    <p className="text-safe mt-2 text-sm leading-6 text-slate-500">{textValue(about.vision, locale)}</p>
                  </EditableBlock>
                </div>
                <EditableBlock fieldId="about.companyHistory">
                  <h3 className="font-semibold text-primary">Компанийн түүх</h3>
                  <p className="text-safe mt-2 line-clamp-4 text-sm leading-6 text-slate-500">{textValue(about.companyHistory, locale).replace(/<[^>]*>/g, " ")}</p>
                </EditableBlock>
              </div>
            ) : null}

            {activePage === "contact" ? (
              <div className="grid gap-7 p-5">
                <EditableBlock fieldId="contact.pageTitle">
                  <h2 className="text-safe text-4xl font-bold leading-tight text-primary">{textValue(contactContent.pageTitle, locale)}</h2>
                  <p className="text-safe mt-3 text-base leading-7 text-slate-500">{textValue(contactContent.pageSubtitle, locale)}</p>
                </EditableBlock>
                <div className="grid gap-4 md:grid-cols-[0.9fr_1.1fr]">
                  <div className="grid gap-3">
                    <EditableBlock fieldId="contact.infoTitle">
                      <h3 className="font-semibold text-primary">{textValue(contactContent.infoTitle, locale)}</h3>
                    </EditableBlock>
                    <EditableBlock fieldId="contact.phoneNumbers">
                      <p className="text-safe text-sm text-slate-600">{textValue(contactContent.phoneNumbers, locale)}</p>
                    </EditableBlock>
                    <EditableBlock fieldId="contact.email">
                      <p className="text-safe text-sm text-slate-600">{contactContent.email}</p>
                    </EditableBlock>
                    <EditableBlock fieldId="contact.address">
                      <p className="text-safe text-sm leading-6 text-slate-600">{textValue(contactContent.address, locale)}</p>
                    </EditableBlock>
                    <EditableBlock fieldId="contact.googleMapsEmbedUrl">
                      <div className="flex h-36 items-center justify-center rounded-xl border bg-slate-50 text-sm font-semibold text-slate-500">Google Map</div>
                    </EditableBlock>
                  </div>
                  <EditableBlock fieldId="contact.formTitle">
                    <h3 className="font-semibold text-primary">{textValue(contactContent.formTitle, locale)}</h3>
                    <div className="mt-4 grid gap-3">
                      <div className="h-10 rounded-lg bg-slate-100" />
                      <div className="h-10 rounded-lg bg-slate-100" />
                      <div className="h-24 rounded-lg bg-slate-100" />
                    </div>
                  </EditableBlock>
                </div>
              </div>
            ) : null}

            {activePage === "chrome" ? (
              <div className="grid gap-7 p-5">
                <div className="grid gap-4 md:grid-cols-2">
                  <EditableBlock fieldId="header.logo">
                    <PreviewImage src={header.logo} />
                  </EditableBlock>
                  <EditableBlock fieldId="header.darkLogo">
                    <PreviewImage src={header.darkLogo} />
                  </EditableBlock>
                </div>
                <div className="rounded-2xl bg-primary p-5 text-white">
                  <EditableBlock fieldId="footer.description">
                    <h3 className="text-lg font-semibold">{textValue(header.companyName, locale)}</h3>
                    <p className="text-safe mt-2 text-sm leading-6 text-white/75">{textValue(footer.description, locale)}</p>
                  </EditableBlock>
                  <div className="mt-5 grid gap-3 md:grid-cols-2">
                    <EditableBlock fieldId="footer.contactHeading" className="text-white">
                      <p className="font-semibold">{textValue(footer.contactHeading, locale)}</p>
                    </EditableBlock>
                    <EditableBlock fieldId="footer.quickLinksHeading" className="text-white">
                      <p className="font-semibold">{textValue(footer.quickLinksHeading, locale)}</p>
                    </EditableBlock>
                  </div>
                  <EditableBlock fieldId="footer.copyright" className="mt-4 text-white">
                    <p className="text-xs text-white/65">{textValue(footer.copyright, locale)}</p>
                  </EditableBlock>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="xl:sticky xl:top-6 xl:self-start">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Check className="h-5 w-5 text-teal" />
              {activeField.label}
            </CardTitle>
            <p className="text-xs font-semibold uppercase text-slate-400">{activeField.key}</p>
          </CardHeader>
          <CardContent className="grid gap-4">
            {activeField.kind.startsWith("localized") && isLocalizedValue(activeValue) ? (
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label>MN</Label>
                  {activeField.kind === "localized-textarea" ? (
                    <Textarea rows={7} value={activeValue.mn} onChange={(event) => updateField(activeField, { ...activeValue, mn: event.target.value })} />
                  ) : (
                    <Input value={activeValue.mn} onChange={(event) => updateField(activeField, { ...activeValue, mn: event.target.value })} />
                  )}
                </div>
                <div className="grid gap-2">
                  <Label>EN</Label>
                  {activeField.kind === "localized-textarea" ? (
                    <Textarea rows={7} value={activeValue.en} onChange={(event) => updateField(activeField, { ...activeValue, en: event.target.value })} />
                  ) : (
                    <Input value={activeValue.en} onChange={(event) => updateField(activeField, { ...activeValue, en: event.target.value })} />
                  )}
                </div>
              </div>
            ) : null}

            {activeField.kind === "list" ? (
              <div className="grid gap-2">
                <Label>Мөр бүр нэг утга</Label>
                <Textarea
                  rows={7}
                  value={Array.isArray(activeValue) ? activeValue.join("\n") : ""}
                  onChange={(event) => updateField(activeField, event.target.value.split("\n").map((item) => item.trim()).filter(Boolean))}
                />
              </div>
            ) : null}

            {["text", "url", "image"].includes(activeField.kind) ? (
              <div className="grid gap-2">
                <Label>{activeField.kind === "image" ? "Зургийн URL" : "Утга"}</Label>
                <Input value={String(activeValue ?? "")} onChange={(event) => updateField(activeField, event.target.value)} />
              </div>
            ) : null}

            {activeField.kind === "textarea" ? (
              <div className="grid gap-2">
                <Label>Утга</Label>
                <Textarea rows={7} value={String(activeValue ?? "")} onChange={(event) => updateField(activeField, event.target.value)} />
              </div>
            ) : null}

            {message ? <p className="text-sm text-slate-500">{message}</p> : null}
            <Button type="button" onClick={() => void saveAll()} disabled={saving || dirtyKeys.size === 0}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Хадгалах
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
