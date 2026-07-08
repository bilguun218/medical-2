function decodeHtmlEntities(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'");
}

function extractIframeSrc(value: string) {
  const decoded = decodeHtmlEntities(value.trim());
  const match = decoded.match(/<iframe[\s\S]*?\ssrc=(["'])(.*?)\1/i);
  return match?.[2]?.trim() ?? decoded;
}

function isGoogleHost(hostname: string) {
  const host = hostname.toLowerCase();
  return host === "maps.google.com" || host === "maps.app.goo.gl" || host === "goo.gl" || /^(.+\.)?google\.[a-z.]+$/.test(host);
}

function isGoogleMapsEmbedUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && isGoogleHost(url.hostname) && url.pathname.startsWith("/maps/embed");
  } catch {
    return false;
  }
}

function isGoogleMapsUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol.startsWith("http") && isGoogleHost(url.hostname);
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

function keylessEmbedUrl(location: string) {
  return `https://maps.google.com/maps?q=${encodeURIComponent(location)}&z=16&output=embed`;
}

function locationFromEmbedUrl(value: string) {
  try {
    const url = new URL(value);
    const query = url.searchParams.get("q") || url.searchParams.get("query");

    if (query) {
      return query;
    }

    const placeMatch = url.pathname.match(/\/maps\/place\/([^/]+)/);
    if (placeMatch?.[1]) {
      return decodeURIComponent(placeMatch[1].replace(/\+/g, " "));
    }

    const coordinatesMatch = value.match(/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/);
    if (coordinatesMatch) {
      return `${coordinatesMatch[1]},${coordinatesMatch[2]}`;
    }

    return "";
  } catch {
    return "";
  }
}

export function resolveGoogleMapSource(mapInput: string, fallbackLocation = "") {
  const fallback = fallbackLocation.trim();
  const value = extractIframeSrc(mapInput) || fallback;

  if (!value) {
    return { embedUrl: "", searchUrl: "", label: "" };
  }

  if (isGoogleMapsEmbedUrl(value)) {
    const location = locationFromEmbedUrl(value);

    if (location) {
      return { embedUrl: keylessEmbedUrl(location), searchUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`, label: fallback || location };
    }

    return { embedUrl: value, searchUrl: value, label: fallback || value };
  }

  if (isGoogleMapsUrl(value)) {
    const location = locationFromEmbedUrl(value);

    if (location) {
      return { embedUrl: keylessEmbedUrl(location), searchUrl: value, label: fallback || location };
    }

    if (fallback) {
      return { embedUrl: keylessEmbedUrl(fallback), searchUrl: value, label: fallback };
    }

    return { embedUrl: "", searchUrl: value, label: value };
  }

  if (isUrl(value)) {
    return { embedUrl: fallback ? keylessEmbedUrl(fallback) : "", searchUrl: value, label: fallback || value };
  }

  const encodedLocation = encodeURIComponent(value);
  const searchUrl = `https://www.google.com/maps/search/?api=1&query=${encodedLocation}`;
  const embedUrl = keylessEmbedUrl(value);

  return { embedUrl, searchUrl, label: value };
}
