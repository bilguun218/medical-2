"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, Check, Contact, ExternalLink, Facebook, FileText, Home, ImageIcon, Instagram, LayoutTemplate, Linkedin, Loader2, Monitor, Plus, Save, Smartphone, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MediaUpload } from "@/components/admin/media-upload";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
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
type FieldKind =
  | "localized-input"
  | "localized-textarea"
  | "localized-richtext"
  | "text"
  | "textarea"
  | "url"
  | "image"
  | "list"
  | "localized-list"
  | "section-list"
  | "history-table"
  | "nav-list"
  | "quick-link-list"
  | "social-link-list"
  | "color";
type LocalizedValue = { mn: string; en: string };
type SectionValue = { title: LocalizedValue; body: LocalizedValue };
type HistoryRow = { label: string; value: string };
type NavValue = { key: string; label: LocalizedValue; href: string; order: number; visible: boolean };
type LinkValue = { label: LocalizedValue; href: string; order: number; visible: boolean };
type SocialValue = { label: string; href: string; order: number; visible: boolean };

const defaultFooterSocialLinks: SocialValue[] = [
  { label: "Facebook", href: "", order: 0, visible: true },
  { label: "Instagram", href: "", order: 1, visible: true },
  { label: "LinkedIn", href: "", order: 2, visible: true }
];

function getSocialIcon(label: string) {
  const normalized = label.toLowerCase();

  if (normalized.includes("facebook")) return Facebook;
  if (normalized.includes("instagram")) return Instagram;
  if (normalized.includes("linkedin")) return Linkedin;
  return ExternalLink;
}

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
  { id: "home.style.backgroundColor", page: "home", key: "home", path: ["style", "backgroundColor"], label: "Нүүрийн үндсэн цайвар фон", kind: "color" },
  { id: "home.style.surfaceColor", page: "home", key: "home", path: ["style", "surfaceColor"], label: "Нүүрийн fallback фон", kind: "color" },
  { id: "home.style.accentColor", page: "home", key: "home", path: ["style", "accentColor"], label: "Нүүрийн онцлох/товчны өнгө", kind: "color" },
  { id: "home.heroTitle", page: "home", key: "home", path: ["heroTitle"], label: "Баннерын гарчиг", kind: "localized-input" },
  { id: "home.heroSubtitle", page: "home", key: "home", path: ["heroSubtitle"], label: "Баннерын дэд гарчиг", kind: "localized-input" },
  { id: "home.heroDescription", page: "home", key: "home", path: ["heroDescription"], label: "Баннерын тайлбар", kind: "localized-textarea" },
  { id: "home.heroImage", page: "home", key: "home", path: ["heroImage"], label: "Баннерын зураг", kind: "image" },
  { id: "home.introTitle", page: "home", key: "home", path: ["introTitle"], label: "Танилцуулгын гарчиг", kind: "localized-input" },
  { id: "home.introDescription", page: "home", key: "home", path: ["introDescription"], label: "Танилцуулгын тайлбар", kind: "localized-textarea" },
  { id: "home.primaryButtonText", page: "home", key: "home", path: ["primaryButtonText"], label: "Үндсэн товчны текст", kind: "localized-input" },
  { id: "home.primaryButtonLink", page: "home", key: "home", path: ["primaryButtonLink"], label: "Үндсэн товчны холбоос", kind: "url" },
  { id: "home.secondaryButtonText", page: "home", key: "home", path: ["secondaryButtonText"], label: "Хоёрдогч товчны текст", kind: "localized-input" },
  { id: "home.secondaryButtonLink", page: "home", key: "home", path: ["secondaryButtonLink"], label: "Хоёрдогч товчны холбоос", kind: "url" },
  { id: "home.operationsTitle", page: "home", key: "home", path: ["operationsTitle"], label: "Үйл ажиллагааны гарчиг", kind: "localized-input" },
  { id: "home.operationsDescription", page: "home", key: "home", path: ["operationsDescription"], label: "Үйл ажиллагааны тайлбар", kind: "localized-textarea" },
  { id: "home.whyTitle", page: "home", key: "home", path: ["whyTitle"], label: "Яагаад сонгох гарчиг", kind: "localized-input" },
  { id: "home.whyDescription", page: "home", key: "home", path: ["whyDescription"], label: "Яагаад сонгох тайлбар", kind: "localized-textarea" },
  { id: "home.contactTitle", page: "home", key: "home", path: ["contactTitle"], label: "Холбоо барих хэсгийн гарчиг", kind: "localized-input" },
  { id: "home.contactDescription", page: "home", key: "home", path: ["contactDescription"], label: "Холбоо барих хэсгийн тайлбар", kind: "localized-textarea" },
  { id: "home.contactButtonText", page: "home", key: "home", path: ["contactButtonText"], label: "Холбоо барих товчны текст", kind: "localized-input" },
  { id: "home.contactButtonLink", page: "home", key: "home", path: ["contactButtonLink"], label: "Холбоо барих товчны холбоос", kind: "url" },

  { id: "about.style.backgroundColor", page: "about", key: "about", path: ["style", "backgroundColor"], label: "About background", kind: "color" },
  { id: "about.style.surfaceColor", page: "about", key: "about", path: ["style", "surfaceColor"], label: "About section background", kind: "color" },
  { id: "about.style.accentColor", page: "about", key: "about", path: ["style", "accentColor"], label: "About accent өнгө", kind: "color" },
  { id: "about.pageTitle", page: "about", key: "about", path: ["pageTitle"], label: "Хуудасны гарчиг", kind: "localized-input" },
  { id: "about.pageSubtitle", page: "about", key: "about", path: ["pageSubtitle"], label: "Хуудасны дэд гарчиг", kind: "localized-textarea" },
  { id: "about.companyIntroduction", page: "about", key: "about", path: ["companyIntroduction"], label: "Танилцуулгын badge", kind: "localized-input" },
  { id: "about.companyDescription", page: "about", key: "about", path: ["companyDescription"], label: "Компанийн тайлбар", kind: "localized-textarea" },
  { id: "about.missionLead", page: "about", key: "about", path: ["missionLead"], label: "Mission lead", kind: "localized-textarea" },
  { id: "about.mission", page: "about", key: "about", path: ["mission"], label: "Эрхэм зорилго", kind: "localized-textarea" },
  { id: "about.vision", page: "about", key: "about", path: ["vision"], label: "Алсын хараа", kind: "localized-textarea" },
  { id: "about.values", page: "about", key: "about", path: ["values"], label: "Үнэт зүйлс", kind: "localized-list" },
  { id: "about.companyHistory", page: "about", key: "about", path: ["companyHistory"], label: "Компанийн түүх, мэдээлэл", kind: "history-table" },
  { id: "about.ceoMessage", page: "about", key: "about", path: ["ceoMessage"], label: "CEO мэндчилгээ", kind: "localized-richtext" },
  { id: "about.heroImage", page: "about", key: "about", path: ["heroImage"], label: "Зураг 1", kind: "image" },
  { id: "about.secondaryImage", page: "about", key: "about", path: ["secondaryImage"], label: "Зураг 2", kind: "image" },
  { id: "about.advantages", page: "about", key: "about", path: ["advantages"], label: "Давуу талууд", kind: "section-list" },
  { id: "about.compliancePrinciple", page: "about", key: "about", path: ["compliancePrinciple"], label: "Хууль, эрх зүйн тайлбар", kind: "localized-textarea" },
  { id: "about.compliance", page: "about", key: "about", path: ["compliance"], label: "Хууль, эрх зүйн нийцэл", kind: "section-list" },

  { id: "contact.style.backgroundColor", page: "contact", key: "contact", path: ["style", "backgroundColor"], label: "Contact background", kind: "color" },
  { id: "contact.style.surfaceColor", page: "contact", key: "contact", path: ["style", "surfaceColor"], label: "Contact card background", kind: "color" },
  { id: "contact.style.accentColor", page: "contact", key: "contact", path: ["style", "accentColor"], label: "Contact accent өнгө", kind: "color" },
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

  { id: "header.style.backgroundColor", page: "chrome", key: "header", path: ["style", "backgroundColor"], label: "Header background", kind: "color" },
  { id: "header.style.foregroundColor", page: "chrome", key: "header", path: ["style", "foregroundColor"], label: "Header text color", kind: "color" },
  { id: "header.style.accentColor", page: "chrome", key: "header", path: ["style", "accentColor"], label: "Header button color", kind: "color" },
  { id: "header.companyName", page: "chrome", key: "header", path: ["companyName"], label: "Header компанийн нэр", kind: "localized-input" },
  { id: "header.logo", page: "chrome", key: "header", path: ["logo"], label: "Header logo", kind: "image" },
  { id: "header.darkLogo", page: "chrome", key: "header", path: ["darkLogo"], label: "Dark logo", kind: "image" },
  { id: "header.contactButtonLabel", page: "chrome", key: "header", path: ["contactButtonLabel"], label: "Header contact button", kind: "localized-input" },
  { id: "header.navItems", page: "chrome", key: "header", path: ["navItems"], label: "Header цэс", kind: "nav-list" },
  { id: "footer.style.backgroundColor", page: "chrome", key: "footer", path: ["style", "backgroundColor"], label: "Footer background", kind: "color" },
  { id: "footer.style.foregroundColor", page: "chrome", key: "footer", path: ["style", "foregroundColor"], label: "Footer text color", kind: "color" },
  { id: "footer.style.accentColor", page: "chrome", key: "footer", path: ["style", "accentColor"], label: "Footer accent өнгө", kind: "color" },
  { id: "footer.copyright", page: "chrome", key: "footer", path: ["copyright"], label: "Footer copyright", kind: "localized-input" },
  { id: "footer.description", page: "chrome", key: "footer", path: ["description"], label: "Footer description", kind: "localized-textarea" },
  { id: "footer.contactHeading", page: "chrome", key: "footer", path: ["contactHeading"], label: "Footer contact heading", kind: "localized-input" },
  { id: "footer.quickLinksHeading", page: "chrome", key: "footer", path: ["quickLinksHeading"], label: "Footer links heading", kind: "localized-input" },
  { id: "footer.quickLinks", page: "chrome", key: "footer", path: ["quickLinks"], label: "Footer quick links", kind: "quick-link-list" },
  { id: "footer.socialLinks", page: "chrome", key: "footer", path: ["socialLinks"], label: "Footer сошиал холбоосууд", kind: "social-link-list" }
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

function stripHtml(value: string) {
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function decodeHtmlEntities(value: string) {
  return value
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'");
}

function cleanHistoryCell(value: string) {
  return decodeHtmlEntities(
    value
      .replace(/<br\s*\/?>/gi, " ")
      .replace(/<[^>]*>/g, "")
      .replace(/\s+/g, " ")
      .trim()
  );
}

function historyRowsFromHtml(html: string): HistoryRow[] {
  const rows = [...html.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)];

  return rows
    .map((row) => {
      const cells = [...row[1].matchAll(/<t[hd][^>]*>([\s\S]*?)<\/t[hd]>/gi)].map((cell) => cleanHistoryCell(cell[1]));

      if (cells.length < 2) {
        return null;
      }

      return { label: cells[0] ?? "", value: cells.slice(1).join(" ") };
    })
    .filter((item): item is HistoryRow => Boolean(item));
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function historyRowsToHtml(rows: HistoryRow[]) {
  const validRows = rows.filter((row) => row.label.trim() || row.value.trim());

  if (validRows.length === 0) {
    return "";
  }

  return `<table><tbody>${validRows.map((row) => `<tr><th>${escapeHtml(row.label.trim())}</th><td>${escapeHtml(row.value.trim())}</td></tr>`).join("")}</tbody></table>`;
}

function contentStyle(style: { backgroundColor?: string; foregroundColor?: string; surfaceColor?: string; accentColor?: string }) {
  return {
    backgroundColor: style.backgroundColor || undefined,
    color: style.foregroundColor || undefined
  };
}

function themeBackgroundColor(value?: string) {
  const color = String(value || "").trim().toLowerCase();

  if (!/^#[0-9a-f]{6}$/i.test(color) || color === "#ffffff") {
    return "";
  }

  return color;
}

function homeContentStyle(style: { backgroundColor?: string; foregroundColor?: string; surfaceColor?: string; accentColor?: string }) {
  const base = themeBackgroundColor(style.backgroundColor) || themeBackgroundColor(style.surfaceColor) || "#f3f9ff";

  return {
    backgroundColor: base,
    backgroundImage: "radial-gradient(circle at top left, rgba(31, 122, 224, 0.11), transparent 34rem), radial-gradient(circle at top right, rgba(20, 184, 166, 0.08), transparent 28rem), linear-gradient(180deg, transparent 0%, #f8fbff 44rem, #f2f8ff 100%)",
    color: style.foregroundColor || undefined
  };
}

function surfaceStyle(style: { surfaceColor?: string }) {
  return {
    backgroundColor: style.surfaceColor || undefined
  };
}

function accentStyle(style: { accentColor?: string }) {
  return {
    backgroundColor: style.accentColor || undefined
  };
}

function colorInputValue(value: unknown) {
  const color = String(value || "");
  return /^#[0-9a-f]{6}$/i.test(color) ? color : "#ffffff";
}

function groupForField(field: EditorField) {
  const id = field.id;

  if (id.includes(".style.")) return "Өнгө, style";

  if (field.page === "home") {
    if (id.includes("hero")) return "Баннер";
    if (id.includes("primaryButton") || id.includes("secondaryButton")) return "Баннер товч";
    if (id.includes("intro")) return "Танилцуулга";
    if (id.includes("operations")) return "Үйл ажиллагаа";
    if (id.includes("why")) return "Яагаад сонгох";
    if (id.includes("contact")) return "Холбоо барих хэсэг";
  }

  if (field.page === "about") {
    if (id.includes("page") || id.includes("companyIntroduction") || id.includes("companyDescription")) return "Hero танилцуулга";
    if (id.includes("Image")) return "Зураг";
    if (id.includes("mission") || id.includes("vision")) return "Mission / Vision";
    if (id.includes("values")) return "Үнэт зүйлс";
    if (id.includes("History") || id.includes("ceo")) return "Түүх, мэндчилгээ";
    if (id.includes("advantages")) return "Давуу тал";
    if (id.includes("compliance")) return "Хууль, эрх зүй";
  }

  if (field.page === "contact") {
    if (id.includes("page") || id.includes("formTitle")) return "Хуудас, form";
    if (id.includes("company") || id.includes("address") || id.includes("phone") || id.includes("email") || id.includes("website") || id.includes("contactPerson") || id.includes("businessHours")) return "Холбоо барих detail";
    if (id.includes("googleMaps")) return "Google Map";
    if (id.includes("facebook") || id.includes("instagram") || id.includes("linkedin")) return "Social";
  }

  if (field.page === "chrome") {
    if (id.startsWith("header.")) return "Header";
    if (id.startsWith("footer.")) return "Footer";
  }

  return "Бусад";
}

function moveItem<T>(items: T[], index: number, direction: -1 | 1) {
  const nextIndex = index + direction;

  if (nextIndex < 0 || nextIndex >= items.length) {
    return items;
  }

  const copy = [...items];
  [copy[index], copy[nextIndex]] = [copy[nextIndex], copy[index]];
  return copy;
}

function normalizeFooterSocialLinks(items: SocialValue[]) {
  const next = [...items];

  for (const defaultItem of defaultFooterSocialLinks) {
    const exists = next.some((item) => item.label.toLowerCase() === defaultItem.label.toLowerCase());

    if (!exists) {
      next.push({ ...defaultItem, order: next.length });
    }
  }

  return next.sort((a, b) => a.order - b.order).map((item, order) => ({ ...item, order }));
}

export function VisualContentEditor({ initialValue }: { initialValue: VisualContent }) {
  const router = useRouter();
  const [content, setContent] = useState<VisualContent>(() => ({
    ...initialValue,
    footer: {
      ...initialValue.footer,
      socialLinks: normalizeFooterSocialLinks(initialValue.footer.socialLinks)
    }
  }));
  const [activePage, setActivePage] = useState<PageKey>("home");
  const [activeFieldId, setActiveFieldId] = useState(fields[0].id);
  const [locale, setLocale] = useState<Locale>("mn");
  const [viewport, setViewport] = useState<"desktop" | "mobile">("desktop");
  const [dirtyKeys, setDirtyKeys] = useState<Set<VisualKey>>(new Set());
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const visibleFields = useMemo(() => fields.filter((field) => field.page === activePage), [activePage]);
  const groupedVisibleFields = useMemo(() => {
    const groups = new Map<string, EditorField[]>();

    for (const field of visibleFields) {
      const group = groupForField(field);
      groups.set(group, [...(groups.get(group) ?? []), field]);
    }

    return Array.from(groups.entries()).map(([label, items]) => ({ label, items }));
  }, [visibleFields]);
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

  function selectField(fieldId: string) {
    const field = fields.find((item) => item.id === fieldId);

    if (!field) {
      return;
    }

    setActivePage(field.page);
    setActiveFieldId(field.id);
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
    className,
    style
  }: {
    fieldId: string;
    children: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
  }) {
    const selected = activeFieldId === fieldId;

    return (
      <button
        type="button"
        onClick={() => selectField(fieldId)}
        className={cn(
          "block w-full min-w-0 rounded-lg border border-transparent p-2 text-left transition hover:border-medical/35 hover:bg-medical/[0.04]",
          selected && "border-medical bg-medical/[0.07] shadow-[0_0_0_3px_rgba(23,105,209,0.10)]",
          className
        )}
        style={style}
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
  const isMobilePreview = viewport === "mobile";
  const canvasWidth = isMobilePreview ? "w-full max-w-[360px] sm:max-w-[390px]" : "w-full max-w-5xl";
  const canvasPadding = isMobilePreview ? "p-3" : "p-5";
  const canvasGap = isMobilePreview ? "gap-5" : "gap-8";
  const heroTitleClass = isMobilePreview ? "text-2xl" : "text-4xl";
  const sectionTitleClass = isMobilePreview ? "text-xl" : "text-2xl";
  const aboutHistoryRows = historyRowsFromHtml(textValue(about.companyHistory, locale));
  const activeCanvasStyle =
    activePage === "home"
      ? homeContentStyle(home.style)
      : activePage === "about"
        ? contentStyle(about.style)
        : activePage === "contact"
          ? contentStyle(contactContent.style)
          : contentStyle(footer.style);

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_400px]">
      <div className="grid min-w-0 gap-4">
        <Card>
          <CardHeader className="gap-3 p-4 sm:p-6 md:flex md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Visual page editor</CardTitle>
              <p className="mt-1 text-sm text-slate-500">Canvas дээр дарж эсвэл доорх талбараас сонгоод detail бүрийг засна.</p>
            </div>
            <div className="grid grid-cols-4 gap-2 sm:flex sm:flex-wrap">
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
          <CardContent className="grid gap-4 p-4 pt-0 sm:p-6 sm:pt-0">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {pages.map((page) => (
                <Button
                  key={page.key}
                  type="button"
                  variant={activePage === page.key ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActivePage(page.key)}
                  className="shrink-0"
                >
                  <page.icon className="h-4 w-4" />
                  {page.label}
                </Button>
              ))}
            </div>
            <div className="rounded-xl border bg-slate-50 p-3">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-800">Нарийн талбарууд</p>
                  <p className="text-xs text-slate-500">{visibleFields.length} талбар засах боломжтой</p>
                </div>
                <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-slate-500">{activeField.label}</span>
              </div>
              <div className="grid max-h-64 gap-3 overflow-y-auto pr-1 sm:grid-cols-2 lg:max-h-none lg:grid-cols-3 xl:grid-cols-2 2xl:grid-cols-3">
                {groupedVisibleFields.map((group) => (
                  <div key={group.label} className="min-w-0 rounded-lg border bg-white p-2">
                    <p className="mb-2 truncate text-xs font-semibold uppercase text-slate-400">{group.label}</p>
                    <div className="grid gap-1.5">
                      {group.items.map((field) => (
                        <button
                          key={field.id}
                          type="button"
                          onClick={() => setActiveFieldId(field.id)}
                          className={cn(
                            "min-w-0 rounded-md border px-2.5 py-2 text-left text-xs transition hover:border-medical/40 hover:bg-medical/[0.04]",
                            activeFieldId === field.id ? "border-medical bg-medical/[0.08] text-primary" : "border-slate-100 text-slate-600"
                          )}
                        >
                          <span className="block truncate font-semibold">{field.label}</span>
                          <span className="mt-0.5 block truncate text-[11px] text-slate-400">{field.id.replace(`${field.key}.`, "")}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="overflow-x-auto rounded-xl border bg-slate-100 p-2 sm:rounded-2xl sm:p-4">
          <div className={cn("mx-auto min-h-[560px] overflow-hidden rounded-xl bg-white shadow-premium transition-all sm:rounded-2xl sm:min-h-[680px]", canvasWidth)} style={activeCanvasStyle}>
            <div className={cn("border-b", isMobilePreview ? "px-3 py-3" : "px-5 py-4")} style={contentStyle(header.style)}>
              <div className="flex items-center justify-between gap-4">
                <EditableBlock fieldId="header.companyName" className="max-w-[220px] p-1">
                  <p className="text-base font-semibold text-primary">{textValue(header.companyName, locale)}</p>
                </EditableBlock>
                <EditableBlock fieldId="header.contactButtonLabel" className="w-fit p-1">
                  <span className="inline-flex rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-white" style={accentStyle(header.style)}>{textValue(header.contactButtonLabel, locale)}</span>
                </EditableBlock>
              </div>
            </div>

            {activePage === "home" ? (
              <div className={cn("grid", canvasGap, canvasPadding)}>
                <div className="grid gap-2 rounded-xl border bg-white/70 p-3 sm:grid-cols-3">
                  <EditableBlock fieldId="home.style.backgroundColor">
                    <p className="text-xs font-semibold text-slate-500">Үндсэн цайвар фон</p>
                    <p className="mt-1 truncate text-sm font-semibold text-primary">{home.style.backgroundColor || "Default"}</p>
                  </EditableBlock>
                  <EditableBlock fieldId="home.style.surfaceColor">
                    <p className="text-xs font-semibold text-slate-500">Fallback фон</p>
                    <p className="mt-1 truncate text-sm font-semibold text-primary">{home.style.surfaceColor || "Default"}</p>
                  </EditableBlock>
                  <EditableBlock fieldId="home.style.accentColor">
                    <p className="text-xs font-semibold text-slate-500">Онцлох/товчны өнгө</p>
                    <p className="mt-1 truncate text-sm font-semibold text-primary">{home.style.accentColor || "Default"}</p>
                  </EditableBlock>
                </div>

                <div className={cn("grid rounded-2xl", isMobilePreview ? "gap-4 p-3" : "gap-5 p-4 md:grid-cols-[1fr_280px] md:items-center")}>
                  <div className="min-w-0">
                    <EditableBlock fieldId="home.heroTitle">
                      <h2 className={cn("text-safe font-bold leading-tight text-primary", heroTitleClass)}>{textValue(home.heroTitle, locale)}</h2>
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
                      <EditableBlock fieldId="home.primaryButtonLink">
                        <span className="block truncate text-xs font-semibold text-slate-500">{home.primaryButtonLink || "/"}</span>
                      </EditableBlock>
                      <EditableBlock fieldId="home.secondaryButtonText">
                        <span className="inline-flex rounded-xl border px-4 py-2 text-sm font-semibold text-primary">{textValue(home.secondaryButtonText, locale)}</span>
                      </EditableBlock>
                      <EditableBlock fieldId="home.secondaryButtonLink">
                        <span className="block truncate text-xs font-semibold text-slate-500">{home.secondaryButtonLink || "/"}</span>
                      </EditableBlock>
                    </div>
                  </div>
                  <div className="grid gap-3">
                    <EditableBlock fieldId="home.heroImage">
                      <PreviewImage src={home.heroImage} />
                    </EditableBlock>
                  </div>
                </div>

                <div className="grid gap-3 rounded-xl border bg-white/70 p-3">
                  <EditableBlock fieldId="home.introTitle">
                    <h3 className={cn("text-safe font-semibold text-primary", sectionTitleClass)}>{textValue(home.introTitle, locale)}</h3>
                  </EditableBlock>
                  <EditableBlock fieldId="home.introDescription">
                    <p className="text-safe text-sm leading-7 text-slate-500">{textValue(home.introDescription, locale)}</p>
                  </EditableBlock>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="grid gap-2 rounded-xl border bg-white/70 p-3">
                    <EditableBlock fieldId="home.operationsTitle">
                      <h3 className={cn("text-safe font-semibold text-primary", sectionTitleClass)}>{textValue(home.operationsTitle, locale)}</h3>
                    </EditableBlock>
                    <EditableBlock fieldId="home.operationsDescription">
                      <p className="text-safe text-sm leading-6 text-slate-500">{textValue(home.operationsDescription, locale)}</p>
                    </EditableBlock>
                  </div>
                  <div className="grid gap-2 rounded-xl border bg-white/70 p-3">
                    <EditableBlock fieldId="home.whyTitle">
                      <h3 className={cn("text-safe font-semibold text-primary", sectionTitleClass)}>{textValue(home.whyTitle, locale)}</h3>
                    </EditableBlock>
                    <EditableBlock fieldId="home.whyDescription">
                      <p className="text-safe text-sm leading-6 text-slate-500">{textValue(home.whyDescription, locale)}</p>
                    </EditableBlock>
                  </div>
                </div>

                <div className="grid gap-2 rounded-xl bg-primary p-3 text-white" style={accentStyle(home.style)}>
                  <EditableBlock fieldId="home.contactTitle" className="text-white">
                    <h3 className={cn("text-safe font-semibold", sectionTitleClass)}>{textValue(home.contactTitle, locale)}</h3>
                  </EditableBlock>
                  <EditableBlock fieldId="home.contactDescription" className="text-white">
                    <p className="text-safe text-sm leading-6 text-white/75">{textValue(home.contactDescription, locale)}</p>
                  </EditableBlock>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <EditableBlock fieldId="home.contactButtonText" className="text-white">
                      <span className="inline-flex rounded-xl bg-white px-4 py-2 text-sm font-semibold text-primary">{textValue(home.contactButtonText, locale)}</span>
                    </EditableBlock>
                    <EditableBlock fieldId="home.contactButtonLink" className="text-white">
                      <span className="block truncate text-xs font-semibold text-white/70">{home.contactButtonLink || "/"}</span>
                    </EditableBlock>
                  </div>
                </div>
              </div>
            ) : null}

            {activePage === "about" ? (
              <div className={cn("grid", canvasGap, canvasPadding)}>
                <div className="grid gap-2 rounded-xl border bg-white/70 p-3 sm:grid-cols-3">
                  <EditableBlock fieldId="about.style.backgroundColor">
                    <p className="text-xs font-semibold text-slate-500">Page background</p>
                    <p className="mt-1 truncate text-sm font-semibold text-primary">{about.style.backgroundColor || "Default"}</p>
                  </EditableBlock>
                  <EditableBlock fieldId="about.style.surfaceColor">
                    <p className="text-xs font-semibold text-slate-500">Section background</p>
                    <p className="mt-1 truncate text-sm font-semibold text-primary">{about.style.surfaceColor || "Default"}</p>
                  </EditableBlock>
                  <EditableBlock fieldId="about.style.accentColor">
                    <p className="text-xs font-semibold text-slate-500">Accent</p>
                    <p className="mt-1 truncate text-sm font-semibold text-primary">{about.style.accentColor || "Default"}</p>
                  </EditableBlock>
                </div>
                <EditableBlock fieldId="about.companyIntroduction" className="w-fit">
                  <span className="text-xs font-semibold uppercase text-teal">{textValue(about.companyIntroduction, locale)}</span>
                </EditableBlock>
                <EditableBlock fieldId="about.pageTitle">
                  <h2 className={cn("text-safe font-bold leading-tight text-primary", heroTitleClass)}>{textValue(about.pageTitle, locale)}</h2>
                </EditableBlock>
                <EditableBlock fieldId="about.pageSubtitle">
                  <p className="text-safe text-base leading-7 text-slate-500">{textValue(about.pageSubtitle, locale)}</p>
                </EditableBlock>
                <EditableBlock fieldId="about.companyDescription">
                  <p className="text-safe text-sm leading-7 text-slate-600">{textValue(about.companyDescription, locale)}</p>
                </EditableBlock>
                <div className="grid gap-4 md:grid-cols-2">
                  <EditableBlock fieldId="about.heroImage">
                    <PreviewImage src={about.heroImage} />
                  </EditableBlock>
                  <EditableBlock fieldId="about.secondaryImage">
                    <PreviewImage src={about.secondaryImage} />
                  </EditableBlock>
                </div>
                <div className="grid gap-4 rounded-2xl p-3 md:grid-cols-3" style={surfaceStyle(about.style)}>
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
                <EditableBlock fieldId="about.values">
                  <h3 className="font-semibold text-primary">Үнэт зүйлс</h3>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {about.values.map((value, index) => (
                      <span key={`${value.mn}-${index}`} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                        {textValue(value, locale)}
                      </span>
                    ))}
                  </div>
                </EditableBlock>
                <EditableBlock fieldId="about.companyHistory">
                  <h3 className="font-semibold text-primary">Компанийн түүх</h3>
                  {aboutHistoryRows.length > 0 ? (
                    <div className="mt-3 grid gap-2">
                      {aboutHistoryRows.slice(0, 5).map((item, index) => (
                        <div key={`${item.label}-${index}`} className="rounded-lg border bg-white/75 p-2">
                          <p className="text-xs font-semibold uppercase text-slate-400">{item.label}</p>
                          <p className="text-safe mt-1 text-sm leading-5 text-slate-600">{item.value}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-safe mt-2 line-clamp-4 text-sm leading-6 text-slate-500">{stripHtml(textValue(about.companyHistory, locale)) || "Хоосон"}</p>
                  )}
                </EditableBlock>
                <EditableBlock fieldId="about.ceoMessage">
                  <h3 className="font-semibold text-primary">CEO мэндчилгээ</h3>
                  <p className="text-safe mt-2 line-clamp-3 text-sm leading-6 text-slate-500">{stripHtml(textValue(about.ceoMessage, locale)) || "Хоосон"}</p>
                </EditableBlock>
                <EditableBlock fieldId="about.advantages">
                  <h3 className="font-semibold text-primary">Давуу талууд</h3>
                  <div className="mt-3 grid gap-2 md:grid-cols-2">
                    {about.advantages.slice(0, 4).map((item) => (
                      <p key={item.title.mn} className="rounded-lg bg-slate-50 p-2 text-sm font-medium text-slate-600">{textValue(item.title, locale)}</p>
                    ))}
                  </div>
                </EditableBlock>
                <EditableBlock fieldId="about.compliance">
                  <h3 className="font-semibold text-primary">Хууль, эрх зүй</h3>
                  <div className="mt-3 grid gap-2 md:grid-cols-2">
                    {about.compliance.slice(0, 4).map((item) => (
                      <p key={item.title.mn} className="rounded-lg bg-slate-50 p-2 text-sm font-medium text-slate-600">{textValue(item.title, locale)}</p>
                    ))}
                  </div>
                </EditableBlock>
                <EditableBlock fieldId="about.compliancePrinciple">
                  <p className="text-safe text-sm leading-6 text-slate-500">{textValue(about.compliancePrinciple, locale)}</p>
                </EditableBlock>
              </div>
            ) : null}

            {activePage === "contact" ? (
              <div className={cn("grid", canvasGap, canvasPadding)}>
                <div className="grid gap-2 rounded-xl border bg-white/70 p-3 sm:grid-cols-3">
                  <EditableBlock fieldId="contact.style.backgroundColor">
                    <p className="text-xs font-semibold text-slate-500">Page background</p>
                    <p className="mt-1 truncate text-sm font-semibold text-primary">{contactContent.style.backgroundColor || "Default"}</p>
                  </EditableBlock>
                  <EditableBlock fieldId="contact.style.surfaceColor">
                    <p className="text-xs font-semibold text-slate-500">Card background</p>
                    <p className="mt-1 truncate text-sm font-semibold text-primary">{contactContent.style.surfaceColor || "Default"}</p>
                  </EditableBlock>
                  <EditableBlock fieldId="contact.style.accentColor">
                    <p className="text-xs font-semibold text-slate-500">Accent</p>
                    <p className="mt-1 truncate text-sm font-semibold text-primary">{contactContent.style.accentColor || "Default"}</p>
                  </EditableBlock>
                </div>
                <EditableBlock fieldId="contact.pageTitle">
                  <h2 className={cn("text-safe font-bold leading-tight text-primary", heroTitleClass)}>{textValue(contactContent.pageTitle, locale)}</h2>
                </EditableBlock>
                <EditableBlock fieldId="contact.pageSubtitle">
                  <p className="text-safe text-base leading-7 text-slate-500">{textValue(contactContent.pageSubtitle, locale)}</p>
                </EditableBlock>
                <div className="grid gap-4 md:grid-cols-[0.95fr_1.05fr]">
                  <EditableBlock fieldId="contact.googleMapsEmbedUrl" style={surfaceStyle(contactContent.style)}>
                    <div className="flex h-56 items-center justify-center rounded-2xl border bg-slate-50 text-sm font-semibold text-slate-500">
                      Google Map
                    </div>
                  </EditableBlock>
                  <EditableBlock fieldId="contact.formTitle" style={surfaceStyle(contactContent.style)}>
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
              <div className={cn("grid", canvasGap, canvasPadding)}>
                <div className="grid gap-2 rounded-xl border bg-white/70 p-3 sm:grid-cols-3">
                  <EditableBlock fieldId="header.style.backgroundColor">
                    <p className="text-xs font-semibold text-slate-500">Header background</p>
                    <p className="mt-1 truncate text-sm font-semibold text-primary">{header.style.backgroundColor || "Default"}</p>
                  </EditableBlock>
                  <EditableBlock fieldId="header.style.foregroundColor">
                    <p className="text-xs font-semibold text-slate-500">Header text</p>
                    <p className="mt-1 truncate text-sm font-semibold text-primary">{header.style.foregroundColor || "Default"}</p>
                  </EditableBlock>
                  <EditableBlock fieldId="header.style.accentColor">
                    <p className="text-xs font-semibold text-slate-500">Header button</p>
                    <p className="mt-1 truncate text-sm font-semibold text-primary">{header.style.accentColor || "Default"}</p>
                  </EditableBlock>
                </div>
                <div className="grid gap-2 rounded-xl border bg-white/70 p-3 sm:grid-cols-2">
                  <EditableBlock fieldId="header.companyName">
                    <p className="font-semibold text-primary">{textValue(header.companyName, locale)}</p>
                  </EditableBlock>
                  <EditableBlock fieldId="header.contactButtonLabel">
                    <span className="inline-flex rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-white" style={accentStyle(header.style)}>{textValue(header.contactButtonLabel, locale)}</span>
                  </EditableBlock>
                </div>
                <EditableBlock fieldId="header.navItems">
                  <h3 className="font-semibold text-primary">Header цэс</h3>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {header.navItems.filter((item) => item.visible).sort((a, b) => a.order - b.order).map((item) => (
                      <span key={item.key} className="rounded-lg border px-3 py-1 text-xs font-semibold text-slate-600">
                        {textValue(item.label, locale)}
                      </span>
                    ))}
                  </div>
                </EditableBlock>
                <div className="grid gap-4 md:grid-cols-2">
                  <EditableBlock fieldId="header.logo">
                    <PreviewImage src={header.logo} />
                  </EditableBlock>
                  <EditableBlock fieldId="header.darkLogo">
                    <PreviewImage src={header.darkLogo} />
                  </EditableBlock>
                </div>
                <div className="grid gap-2 rounded-xl border bg-white/70 p-3 sm:grid-cols-3">
                  <EditableBlock fieldId="footer.style.backgroundColor">
                    <p className="text-xs font-semibold text-slate-500">Footer background</p>
                    <p className="mt-1 truncate text-sm font-semibold text-primary">{footer.style.backgroundColor || "Default"}</p>
                  </EditableBlock>
                  <EditableBlock fieldId="footer.style.foregroundColor">
                    <p className="text-xs font-semibold text-slate-500">Footer text</p>
                    <p className="mt-1 truncate text-sm font-semibold text-primary">{footer.style.foregroundColor || "Default"}</p>
                  </EditableBlock>
                  <EditableBlock fieldId="footer.style.accentColor">
                    <p className="text-xs font-semibold text-slate-500">Footer accent</p>
                    <p className="mt-1 truncate text-sm font-semibold text-primary">{footer.style.accentColor || "Default"}</p>
                  </EditableBlock>
                </div>
                <div className="rounded-2xl bg-primary p-5 text-white" style={contentStyle(footer.style)}>
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
                  <EditableBlock fieldId="footer.quickLinks" className="mt-4 text-white">
                    <div className="flex flex-wrap gap-2">
                      {footer.quickLinks.filter((item) => item.visible).sort((a, b) => a.order - b.order).map((item, index) => (
                        <span key={`${item.href}-${index}`} className="rounded-lg bg-white/10 px-3 py-1 text-xs font-semibold">
                          {textValue(item.label, locale)}
                        </span>
                      ))}
                    </div>
                  </EditableBlock>
                  <EditableBlock fieldId="footer.socialLinks" className="mt-4 text-white">
                    <div className="flex flex-wrap gap-2">
                      {footer.socialLinks.filter((item) => item.visible).map((item, index) => {
                        const Icon = getSocialIcon(item.label);

                        return (
                          <span key={`${item.label}-${index}`} title={item.label || "Social"} className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/10 text-white">
                            <Icon className="h-4 w-4" />
                          </span>
                        );
                      })}
                    </div>
                  </EditableBlock>
                  <EditableBlock fieldId="footer.copyright" className="mt-4 text-white">
                    <p className="text-xs text-white/65">{textValue(footer.copyright, locale)}</p>
                  </EditableBlock>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="xl:sticky xl:top-6 xl:max-h-[calc(100dvh-3rem)] xl:self-start">
        <Card className="overflow-hidden xl:flex xl:max-h-[calc(100dvh-3rem)] xl:flex-col">
          <CardHeader className="shrink-0">
            <CardTitle className="flex items-center gap-2">
              <Check className="h-5 w-5 text-teal" />
              {activeField.label}
            </CardTitle>
            <p className="text-xs font-semibold uppercase text-slate-400">{activeField.key}</p>
          </CardHeader>
          <CardContent className="grid gap-4 overflow-y-auto overscroll-contain xl:min-h-0 xl:flex-1">
            {activeField.kind.startsWith("localized") && isLocalizedValue(activeValue) ? (
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label>MN</Label>
                  {activeField.kind === "localized-richtext" ? (
                    <RichTextEditor value={activeValue.mn} minHeight="min-h-40" onChange={(mn) => updateField(activeField, { ...activeValue, mn })} />
                  ) : activeField.kind === "localized-textarea" ? (
                    <Textarea rows={7} value={activeValue.mn} onChange={(event) => updateField(activeField, { ...activeValue, mn: event.target.value })} />
                  ) : (
                    <Input value={activeValue.mn} onChange={(event) => updateField(activeField, { ...activeValue, mn: event.target.value })} />
                  )}
                </div>
                <div className="grid gap-2">
                  <Label>EN</Label>
                  {activeField.kind === "localized-richtext" ? (
                    <RichTextEditor value={activeValue.en} minHeight="min-h-40" onChange={(en) => updateField(activeField, { ...activeValue, en })} />
                  ) : activeField.kind === "localized-textarea" ? (
                    <Textarea rows={7} value={activeValue.en} onChange={(event) => updateField(activeField, { ...activeValue, en: event.target.value })} />
                  ) : (
                    <Input value={activeValue.en} onChange={(event) => updateField(activeField, { ...activeValue, en: event.target.value })} />
                  )}
                </div>
              </div>
            ) : null}

            {activeField.kind === "history-table" && isLocalizedValue(activeValue) ? (
              <div className="grid gap-5">
                {(["mn", "en"] as Locale[]).map((language) => {
                  const rows = historyRowsFromHtml(activeValue[language]);

                  return (
                    <div key={language} className="grid gap-3">
                      <div className="flex items-center justify-between gap-3">
                        <Label>{language.toUpperCase()} мөрүүд</Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => updateField(activeField, { ...activeValue, [language]: historyRowsToHtml([...rows, { label: "", value: "" }]) })}
                        >
                          <Plus className="h-4 w-4" />
                          Нэмэх
                        </Button>
                      </div>
                      {rows.length === 0 ? (
                        <p className="rounded-lg border border-dashed p-3 text-sm text-slate-500">Мөр алга байна. Нэмэх товчоор эхлүүлнэ.</p>
                      ) : null}
                      {rows.map((item, index, items) => (
                        <div key={`${language}-${index}`} className="grid gap-2 rounded-lg border p-3">
                          <div className="flex items-center justify-between gap-2">
                            <Label className="text-xs text-slate-500">#{index + 1}</Label>
                            <div className="flex gap-1">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                disabled={index === 0}
                                onClick={() => updateField(activeField, { ...activeValue, [language]: historyRowsToHtml(moveItem(items, index, -1)) })}
                              >
                                <ArrowUp className="h-4 w-4" />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                disabled={index === items.length - 1}
                                onClick={() => updateField(activeField, { ...activeValue, [language]: historyRowsToHtml(moveItem(items, index, 1)) })}
                              >
                                <ArrowDown className="h-4 w-4" />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => updateField(activeField, { ...activeValue, [language]: historyRowsToHtml(items.filter((_, current) => current !== index)) })}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <Label className="text-xs text-slate-500">Гарчиг / label</Label>
                          <Input
                            value={item.label}
                            onChange={(event) => updateField(activeField, {
                              ...activeValue,
                              [language]: historyRowsToHtml(items.map((value, current) => current === index ? { ...value, label: event.target.value } : value))
                            })}
                            placeholder={language === "mn" ? "Байгуулагдсан он" : "Established"}
                          />
                          <Label className="text-xs text-slate-500">Утга</Label>
                          <Textarea
                            rows={3}
                            value={item.value}
                            onChange={(event) => updateField(activeField, {
                              ...activeValue,
                              [language]: historyRowsToHtml(items.map((value, current) => current === index ? { ...value, value: event.target.value } : value))
                            })}
                            placeholder={language === "mn" ? "2019 он" : "2019"}
                          />
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            ) : null}

            {activeField.kind === "color" ? (
              <div className="grid gap-3">
                <Label>Өнгө</Label>
                <div className="grid gap-2 sm:grid-cols-[56px_1fr]">
                  <Input
                    type="color"
                    value={colorInputValue(activeValue)}
                    onChange={(event) => updateField(activeField, event.target.value)}
                    className="h-11 p-1"
                  />
                  <Input value={String(activeValue ?? "")} onChange={(event) => updateField(activeField, event.target.value)} placeholder="#ffffff эсвэл хоосон" />
                </div>
                <Button type="button" variant="outline" size="sm" onClick={() => updateField(activeField, "")}>
                  <X className="h-4 w-4" />
                  Default болгох
                </Button>
              </div>
            ) : null}

            {activeField.kind === "list" ? (
              <div className="grid gap-3">
                <div className="flex items-center justify-between">
                  <Label>Жагсаалт</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => updateField(activeField, [...((Array.isArray(activeValue) ? activeValue : []) as string[]), ""])}
                  >
                    <Plus className="h-4 w-4" />
                    Нэмэх
                  </Button>
                </div>
                {((Array.isArray(activeValue) ? activeValue : []) as string[]).map((item, index, items) => (
                  <div key={index} className="grid gap-2 rounded-lg border p-3">
                    <div className="flex items-center justify-between gap-2">
                      <Label className="text-xs text-slate-500">#{index + 1}</Label>
                      <div className="flex gap-1">
                        <Button type="button" variant="ghost" size="icon" disabled={index === 0} onClick={() => updateField(activeField, moveItem(items, index, -1))}>
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                        <Button type="button" variant="ghost" size="icon" disabled={index === items.length - 1} onClick={() => updateField(activeField, moveItem(items, index, 1))}>
                          <ArrowDown className="h-4 w-4" />
                        </Button>
                        <Button type="button" variant="ghost" size="icon" onClick={() => updateField(activeField, items.filter((_, current) => current !== index))}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <Input value={item} onChange={(event) => updateField(activeField, items.map((value, current) => current === index ? event.target.value : value))} placeholder="Утга" />
                  </div>
                ))}
              </div>
            ) : null}

            {activeField.kind === "localized-list" ? (
              <div className="grid gap-3">
                <div className="flex items-center justify-between">
                  <Label>Жагсаалт</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => updateField(activeField, [...((Array.isArray(activeValue) ? activeValue : []) as LocalizedValue[]), { mn: "", en: "" }])}
                  >
                    <Plus className="h-4 w-4" />
                    Нэмэх
                  </Button>
                </div>
                {((Array.isArray(activeValue) ? activeValue : []) as LocalizedValue[]).map((item, index, items) => (
                  <div key={index} className="grid gap-2 rounded-lg border p-3">
                    <div className="flex items-center justify-between gap-2">
                      <Label className="text-xs text-slate-500">#{index + 1}</Label>
                      <div className="flex gap-1">
                        <Button type="button" variant="ghost" size="icon" disabled={index === 0} onClick={() => updateField(activeField, moveItem(items, index, -1))}>
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                        <Button type="button" variant="ghost" size="icon" disabled={index === items.length - 1} onClick={() => updateField(activeField, moveItem(items, index, 1))}>
                          <ArrowDown className="h-4 w-4" />
                        </Button>
                        <Button type="button" variant="ghost" size="icon" onClick={() => updateField(activeField, items.filter((_, current) => current !== index))}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <Label className="text-xs text-slate-500">MN</Label>
                    <Input value={item.mn} onChange={(event) => updateField(activeField, items.map((value, current) => current === index ? { ...value, mn: event.target.value } : value))} placeholder="MN" />
                    <Label className="text-xs text-slate-500">EN</Label>
                    <Input value={item.en} onChange={(event) => updateField(activeField, items.map((value, current) => current === index ? { ...value, en: event.target.value } : value))} placeholder="EN" />
                  </div>
                ))}
              </div>
            ) : null}

            {activeField.kind === "section-list" ? (
              <div className="grid gap-3">
                <div className="flex items-center justify-between">
                  <Label>Хэсгүүд</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => updateField(activeField, [...((Array.isArray(activeValue) ? activeValue : []) as SectionValue[]), { title: { mn: "", en: "" }, body: { mn: "", en: "" } }])}
                  >
                    <Plus className="h-4 w-4" />
                    Нэмэх
                  </Button>
                </div>
                {((Array.isArray(activeValue) ? activeValue : []) as SectionValue[]).map((item, index, items) => (
                  <div key={index} className="grid gap-2 rounded-lg border p-3">
                    <div className="flex items-center justify-between gap-2">
                      <Label className="text-xs text-slate-500">#{index + 1}</Label>
                      <div className="flex gap-1">
                        <Button type="button" variant="ghost" size="icon" disabled={index === 0} onClick={() => updateField(activeField, moveItem(items, index, -1))}>
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                        <Button type="button" variant="ghost" size="icon" disabled={index === items.length - 1} onClick={() => updateField(activeField, moveItem(items, index, 1))}>
                          <ArrowDown className="h-4 w-4" />
                        </Button>
                        <Button type="button" variant="ghost" size="icon" onClick={() => updateField(activeField, items.filter((_, current) => current !== index))}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <Label className="text-xs text-slate-500">MN гарчиг</Label>
                    <Input value={item.title.mn} onChange={(event) => updateField(activeField, items.map((value, current) => current === index ? { ...value, title: { ...value.title, mn: event.target.value } } : value))} placeholder="MN" />
                    <Label className="text-xs text-slate-500">EN гарчиг</Label>
                    <Input value={item.title.en} onChange={(event) => updateField(activeField, items.map((value, current) => current === index ? { ...value, title: { ...value.title, en: event.target.value } } : value))} placeholder="EN" />
                    <Label className="text-xs text-slate-500">MN тайлбар</Label>
                    <Textarea rows={3} value={item.body.mn} onChange={(event) => updateField(activeField, items.map((value, current) => current === index ? { ...value, body: { ...value.body, mn: event.target.value } } : value))} placeholder="MN" />
                    <Label className="text-xs text-slate-500">EN тайлбар</Label>
                    <Textarea rows={3} value={item.body.en} onChange={(event) => updateField(activeField, items.map((value, current) => current === index ? { ...value, body: { ...value.body, en: event.target.value } } : value))} placeholder="EN" />
                  </div>
                ))}
              </div>
            ) : null}

            {activeField.kind === "nav-list" ? (
              <div className="grid gap-3">
                <div className="flex items-center justify-between">
                  <Label>Header цэс</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => updateField(activeField, [...((Array.isArray(activeValue) ? activeValue : []) as NavValue[]), { key: `custom-${Date.now()}`, label: { mn: "", en: "" }, href: "/", order: (Array.isArray(activeValue) ? activeValue.length : 0), visible: true }])}
                  >
                    <Plus className="h-4 w-4" />
                    Нэмэх
                  </Button>
                </div>
                {((Array.isArray(activeValue) ? activeValue : []) as NavValue[]).map((item, index, items) => (
                  <div key={item.key} className="grid gap-2 rounded-lg border p-3">
                    <div className="flex items-center justify-between gap-2">
                      <Label className="text-xs text-slate-500">#{index + 1}</Label>
                      <div className="flex gap-1">
                        <Button type="button" variant="ghost" size="icon" disabled={index === 0} onClick={() => updateField(activeField, moveItem(items, index, -1).map((value, order) => ({ ...value, order })))}>
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                        <Button type="button" variant="ghost" size="icon" disabled={index === items.length - 1} onClick={() => updateField(activeField, moveItem(items, index, 1).map((value, order) => ({ ...value, order })))}>
                          <ArrowDown className="h-4 w-4" />
                        </Button>
                        <Button type="button" variant="ghost" size="icon" onClick={() => updateField(activeField, items.filter((_, current) => current !== index))}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <Label className="text-xs text-slate-500">MN нэр</Label>
                    <Input value={item.label.mn} onChange={(event) => updateField(activeField, items.map((value, current) => current === index ? { ...value, label: { ...value.label, mn: event.target.value } } : value))} placeholder="MN нэр" />
                    <Label className="text-xs text-slate-500">EN нэр</Label>
                    <Input value={item.label.en} onChange={(event) => updateField(activeField, items.map((value, current) => current === index ? { ...value, label: { ...value.label, en: event.target.value } } : value))} placeholder="EN нэр" />
                    <Label className="text-xs text-slate-500">Холбоос</Label>
                    <Input value={item.href} onChange={(event) => updateField(activeField, items.map((value, current) => current === index ? { ...value, href: event.target.value } : value))} placeholder="/about" />
                    <Label className="text-xs text-slate-500">Дараалал</Label>
                    <Input type="number" value={item.order} onChange={(event) => updateField(activeField, items.map((value, current) => current === index ? { ...value, order: Number(event.target.value) } : value))} />
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-600">
                      <input type="checkbox" checked={item.visible} onChange={(event) => updateField(activeField, items.map((value, current) => current === index ? { ...value, visible: event.target.checked } : value))} />
                      Харагдах
                    </label>
                  </div>
                ))}
              </div>
            ) : null}

            {activeField.kind === "quick-link-list" ? (
              <div className="grid gap-3">
                <div className="flex items-center justify-between">
                  <Label>Footer холбоос</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => updateField(activeField, [...((Array.isArray(activeValue) ? activeValue : []) as LinkValue[]), { label: { mn: "", en: "" }, href: "/", order: (Array.isArray(activeValue) ? activeValue.length : 0), visible: true }])}
                  >
                    <Plus className="h-4 w-4" />
                    Нэмэх
                  </Button>
                </div>
                {((Array.isArray(activeValue) ? activeValue : []) as LinkValue[]).map((item, index, items) => (
                  <div key={index} className="grid gap-2 rounded-lg border p-3">
                    <div className="flex items-center justify-between gap-2">
                      <Label className="text-xs text-slate-500">#{index + 1}</Label>
                      <div className="flex gap-1">
                        <Button type="button" variant="ghost" size="icon" disabled={index === 0} onClick={() => updateField(activeField, moveItem(items, index, -1).map((value, order) => ({ ...value, order })))}>
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                        <Button type="button" variant="ghost" size="icon" disabled={index === items.length - 1} onClick={() => updateField(activeField, moveItem(items, index, 1).map((value, order) => ({ ...value, order })))}>
                          <ArrowDown className="h-4 w-4" />
                        </Button>
                        <Button type="button" variant="ghost" size="icon" onClick={() => updateField(activeField, items.filter((_, current) => current !== index))}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <Label className="text-xs text-slate-500">MN нэр</Label>
                    <Input value={item.label.mn} onChange={(event) => updateField(activeField, items.map((value, current) => current === index ? { ...value, label: { ...value.label, mn: event.target.value } } : value))} placeholder="MN нэр" />
                    <Label className="text-xs text-slate-500">EN нэр</Label>
                    <Input value={item.label.en} onChange={(event) => updateField(activeField, items.map((value, current) => current === index ? { ...value, label: { ...value.label, en: event.target.value } } : value))} placeholder="EN нэр" />
                    <Label className="text-xs text-slate-500">Холбоос</Label>
                    <Input value={item.href} onChange={(event) => updateField(activeField, items.map((value, current) => current === index ? { ...value, href: event.target.value } : value))} placeholder="/products" />
                    <Label className="text-xs text-slate-500">Дараалал</Label>
                    <Input type="number" value={item.order} onChange={(event) => updateField(activeField, items.map((value, current) => current === index ? { ...value, order: Number(event.target.value) } : value))} />
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-600">
                      <input type="checkbox" checked={item.visible} onChange={(event) => updateField(activeField, items.map((value, current) => current === index ? { ...value, visible: event.target.checked } : value))} />
                      Харагдах
                    </label>
                  </div>
                ))}
              </div>
            ) : null}

            {activeField.kind === "social-link-list" ? (
              <div className="grid gap-3">
                <div className="flex items-center justify-between">
                  <Label>Сошиал холбоос</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => updateField(activeField, [...((Array.isArray(activeValue) ? activeValue : []) as SocialValue[]), { label: "", href: "", order: (Array.isArray(activeValue) ? activeValue.length : 0), visible: true }])}
                  >
                    <Plus className="h-4 w-4" />
                    Нэмэх
                  </Button>
                </div>
                {((Array.isArray(activeValue) ? activeValue : []) as SocialValue[]).map((item, index, items) => (
                  <div key={index} className="grid gap-2 rounded-lg border p-3">
                    <div className="flex items-center justify-between gap-2">
                      <Label className="text-xs text-slate-500">#{index + 1}</Label>
                      <div className="flex gap-1">
                        <Button type="button" variant="ghost" size="icon" disabled={index === 0} onClick={() => updateField(activeField, moveItem(items, index, -1).map((value, order) => ({ ...value, order })))}>
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                        <Button type="button" variant="ghost" size="icon" disabled={index === items.length - 1} onClick={() => updateField(activeField, moveItem(items, index, 1).map((value, order) => ({ ...value, order })))}>
                          <ArrowDown className="h-4 w-4" />
                        </Button>
                        <Button type="button" variant="ghost" size="icon" onClick={() => updateField(activeField, items.filter((_, current) => current !== index))}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <Label className="text-xs text-slate-500">Нэр</Label>
                    <Input value={item.label} onChange={(event) => updateField(activeField, items.map((value, current) => current === index ? { ...value, label: event.target.value } : value))} placeholder="Facebook" />
                    <Label className="text-xs text-slate-500">Холбоос</Label>
                    <Input value={item.href} onChange={(event) => updateField(activeField, items.map((value, current) => current === index ? { ...value, href: event.target.value } : value))} placeholder="https://" />
                    <Label className="text-xs text-slate-500">Дараалал</Label>
                    <Input type="number" value={item.order} onChange={(event) => updateField(activeField, items.map((value, current) => current === index ? { ...value, order: Number(event.target.value) } : value))} />
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-600">
                      <input type="checkbox" checked={item.visible} onChange={(event) => updateField(activeField, items.map((value, current) => current === index ? { ...value, visible: event.target.checked } : value))} />
                      Харагдах
                    </label>
                  </div>
                ))}
              </div>
            ) : null}

            {activeField.kind === "image" ? (
              <div className="grid gap-3">
                <Label>Зураг</Label>
                <MediaUpload value={String(activeValue ?? "")} onChange={(url) => updateField(activeField, url)} />
                <Input value={String(activeValue ?? "")} onChange={(event) => updateField(activeField, event.target.value)} placeholder="/uploads/image.jpg эсвэл https://..." />
                <Button type="button" variant="outline" size="sm" onClick={() => updateField(activeField, "")}>
                  <Trash2 className="h-4 w-4" />
                  Зураг цэвэрлэх
                </Button>
              </div>
            ) : null}

            {["text", "url"].includes(activeField.kind) ? (
              <div className="grid gap-2">
                <Label>Утга</Label>
                <Input value={String(activeValue ?? "")} onChange={(event) => updateField(activeField, event.target.value)} />
              </div>
            ) : null}

            {activeField.kind === "textarea" ? (
              <div className="grid gap-2">
                <Label>Утга</Label>
                <Textarea rows={7} value={String(activeValue ?? "")} onChange={(event) => updateField(activeField, event.target.value)} />
              </div>
            ) : null}

            <div className="sticky bottom-0 -mx-6 -mb-6 grid gap-3 border-t bg-white/96 px-6 py-4 backdrop-blur">
              {message ? <p className="text-sm text-slate-500">{message}</p> : null}
              <Button type="button" onClick={() => void saveAll()} disabled={saving || dirtyKeys.size === 0}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Хадгалах
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
