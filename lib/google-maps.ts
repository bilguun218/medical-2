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

function keylessEmbedUrl(location: string) {
  return `https://maps.google.com/maps?q=${encodeURIComponent(location)}&z=16&output=embed`;
}

function locationFromEmbedUrl(value: string) {
  try {
    const url = new URL(value);
    const query = url.searchParams.get("q");

    if (query) {
      return query;
    }

    return "";
  } catch {
    return "";
  }
}

export function resolveGoogleMapSource(mapInput: string, fallbackLocation = "") {
  const value = mapInput.trim() || fallbackLocation.trim();

  if (!value) {
    return { embedUrl: "", searchUrl: "", label: "" };
  }

  if (isGoogleMapsEmbedUrl(value)) {
    const location = locationFromEmbedUrl(value);

    if (location) {
      return { embedUrl: keylessEmbedUrl(location), searchUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`, label: fallbackLocation.trim() || location };
    }

    return { embedUrl: value, searchUrl: value, label: fallbackLocation.trim() || value };
  }

  if (isUrl(value)) {
    return { embedUrl: "", searchUrl: value, label: fallbackLocation.trim() || value };
  }

  const encodedLocation = encodeURIComponent(value);
  const searchUrl = `https://www.google.com/maps/search/?api=1&query=${encodedLocation}`;
  const embedUrl = keylessEmbedUrl(value);

  return { embedUrl, searchUrl, label: value };
}
