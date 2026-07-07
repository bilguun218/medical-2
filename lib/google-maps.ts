const embedApiKey =
  process.env.GOOGLE_MAPS_EMBED_API_KEY ||
  process.env.GOOGLE_MAPS_API_KEY ||
  process.env.NEXT_PUBLIC_GOOGLE_MAPS_EMBED_API_KEY ||
  process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
  "";

function isGoogleMapsEmbedUrl(value: string) {
  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase();
    return url.protocol === "https:" && (host === "www.google.com" || host === "maps.google.com") && url.pathname.startsWith("/maps/embed");
  } catch {
    return false;
  }
}

function isUrl(value: string) {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

export function resolveGoogleMapSource(mapInput: string, fallbackLocation = "") {
  const value = mapInput.trim() || fallbackLocation.trim();

  if (!value) {
    return { embedUrl: "", searchUrl: "", label: "" };
  }

  if (isGoogleMapsEmbedUrl(value)) {
    return { embedUrl: value, searchUrl: value, label: fallbackLocation.trim() || value };
  }

  if (isUrl(value)) {
    return { embedUrl: "", searchUrl: value, label: fallbackLocation.trim() || value };
  }

  const encodedLocation = encodeURIComponent(value);
  const searchUrl = `https://www.google.com/maps/search/?api=1&query=${encodedLocation}`;
  const embedUrl = embedApiKey
    ? `https://www.google.com/maps/embed/v1/place?key=${encodeURIComponent(embedApiKey)}&q=${encodedLocation}`
    : `https://www.google.com/maps?q=${encodedLocation}&output=embed`;

  return { embedUrl, searchUrl, label: value };
}
