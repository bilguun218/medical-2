import { BadgeCheck, Building2, CalendarDays, FileCheck2, Hash, MapPin } from "lucide-react";
import type { Locale } from "@/lib/i18n";
import { RichText } from "@/components/site/rich-text";

type HistoryItem = {
  label: string;
  value: string;
};

function decodeEntities(value: string) {
  return value
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'");
}

function cleanCell(value: string) {
  return decodeEntities(
    value
      .replace(/<br\s*\/?>/gi, " ")
      .replace(/<[^>]*>/g, "")
      .replace(/\s+/g, " ")
      .trim()
  );
}

function extractTableRows(html: string): HistoryItem[] {
  const rows = [...html.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)];

  return rows
    .map((row) => {
      const cells = [...row[1].matchAll(/<t[hd][^>]*>([\s\S]*?)<\/t[hd]>/gi)].map((cell) => cleanCell(cell[1]));

      if (cells.length < 2 || !cells[0] || !cells[1]) {
        return null;
      }

      return { label: cells[0], value: cells.slice(1).join(" ") };
    })
    .filter((item): item is HistoryItem => Boolean(item));
}

function includesAny(value: string, words: string[]) {
  const normalized = value.toLowerCase();
  return words.some((word) => normalized.includes(word.toLowerCase()));
}

function getHistoryIcon(label: string) {
  if (includesAny(label, ["хаяг", "address"])) return MapPin;
  if (includesAny(label, ["регистр", "registration"])) return Hash;
  if (includesAny(label, ["зөвшөөрөл", "license"])) return FileCheck2;
  if (includesAny(label, ["чиглэл", "scope"])) return BadgeCheck;
  return Building2;
}

export function CompanyHistory({ html, locale }: { html: string; locale: Locale }) {
  const items = extractTableRows(html);

  if (items.length === 0) {
    return <RichText html={html} />;
  }

  const nameItem = items.find((item) => includesAny(item.label, ["нэр", "name"]));
  const establishedItem = items.find((item) => includesAny(item.label, ["байгуулагдсан", "established"]));
  const year = establishedItem?.value.match(/\d{4}/)?.[0] ?? establishedItem?.value ?? "2019";
  const detailItems = items.filter((item) => item !== nameItem && item !== establishedItem);
  const eyebrow = locale === "mn" ? "Компанийн түүх" : "Company history";
  const intro =
    locale === "mn"
      ? "Байгуулагдсан цагаасаа эхлэн эрүүл мэндийн бүтээгдэхүүн, тоног төхөөрөмжийн найдвартай нийлүүлэлтэд төвлөрөн ажиллаж байна."
      : "Since its establishment, NOVYTAS has focused on reliable supply of healthcare products and medical equipment.";

  return (
    <article className="relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white p-5 shadow-subtle dark:border-white/10 dark:bg-white/10 sm:p-6">
      <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-teal/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 left-8 h-44 w-44 rounded-full bg-medical/10 blur-3xl" />

      <div className="relative">
        <div className="flex min-w-0 gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-white shadow-subtle">
            <Building2 className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <p className="text-safe text-xs font-semibold uppercase tracking-[0.08em] text-teal">{eyebrow}</p>
            <h3 className="text-safe mt-2 text-xl font-semibold leading-tight text-primary">{nameItem?.value ?? "NOVYTAS LLC"}</h3>
          </div>
        </div>

        <div className="mt-7 grid gap-5 lg:grid-cols-[0.86fr_1.14fr]">
          <div className="rounded-2xl bg-primary p-5 text-white shadow-premium">
            <CalendarDays className="h-6 w-6 text-teal" />
            <div className="mt-5">
              <p className="text-safe text-xs font-semibold uppercase tracking-[0.08em] text-white/70">{establishedItem?.label ?? (locale === "mn" ? "Байгуулагдсан" : "Established")}</p>
              <p className="mt-2 text-safe text-4xl font-bold leading-none">{year}</p>
            </div>
            <p className="mt-5 text-safe text-sm leading-6 text-white/70">{intro}</p>
          </div>

          <div className="relative pl-5">
            <div className="absolute bottom-3 left-[0.32rem] top-3 w-px bg-gradient-to-b from-medical/30 via-teal/45 to-transparent" />
            <div className="grid gap-4">
              {detailItems.map((item) => {
                const Icon = getHistoryIcon(item.label);

                return (
                  <div key={item.label} className="relative">
                    <span className="absolute -left-[1.1rem] top-2 h-3 w-3 rounded-full border-2 border-white bg-teal shadow-sm dark:border-slate-950" />
                    <div className="rounded-2xl border border-slate-200/70 bg-white/75 p-4 shadow-sm dark:border-white/10 dark:bg-white/5">
                      <div className="flex items-start gap-3">
                        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal/10 text-teal">
                          <Icon className="h-4 w-4" />
                        </span>
                        <div className="min-w-0">
                          <p className="text-safe text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">{item.label}</p>
                          <p className="text-safe mt-2 text-sm font-medium leading-6 text-primary">{item.value}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
