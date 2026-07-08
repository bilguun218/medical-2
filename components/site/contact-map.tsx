import { ExternalLink, MapPinned } from "lucide-react";
import { Button } from "@/components/ui/button";
import { resolveGoogleMapSource } from "@/lib/google-maps";
import type { Locale } from "@/lib/i18n";

export function ContactMap({
  locale,
  mapInput,
  fallbackLocation,
  showLabel = true
}: {
  locale: Locale;
  mapInput: string;
  fallbackLocation: string;
  showLabel?: boolean;
}) {
  const map = resolveGoogleMapSource(mapInput, fallbackLocation);

  if (!map.label) {
    return null;
  }

  const title = locale === "mn" ? "Байршил" : "Location";
  const openLabel = locale === "mn" ? "Google Maps дээр нээх" : "Open in Google Maps";
  const unavailable = locale === "mn" ? "Газрын зургийг Google Maps дээр нээнэ үү." : "Open the location in Google Maps.";
  const label = map.label.startsWith("http") ? (locale === "mn" ? "Google Maps байршил" : "Google Maps location") : map.label;

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-subtle dark:border-white/10 dark:bg-white/10">
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal/10 text-teal">
            <MapPinned className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <h3 className="text-safe text-lg font-semibold leading-tight text-primary">{title}</h3>
            {showLabel ? <p className="text-safe mt-1 text-sm leading-6 text-slate-500">{label}</p> : null}
          </div>
        </div>
        {map.searchUrl ? (
          <Button variant="outline" size="sm" asChild>
            <a href={map.searchUrl} target="_blank" rel="noreferrer">
              {openLabel}
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        ) : null}
      </div>

      {map.embedUrl ? (
        <iframe
          title={title}
          src={map.embedUrl}
          className="h-80 w-full border-t border-slate-200/70 dark:border-white/10"
          loading="lazy"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
        />
      ) : (
        <div className="border-t border-slate-200/70 bg-slate-50 p-6 dark:border-white/10 dark:bg-white/5">
          <p className="text-safe text-sm leading-6 text-slate-500">{unavailable}</p>
        </div>
      )}
    </section>
  );
}
