// Helper to build Cloudinary delivery URLs with transformations
// Usage: transformImageUrl(url, { w: 1600, c: 'limit', q: 'auto:good', f: 'auto', dpr: 'auto' })

export function transformImageUrl(url, params = {}) {
  try {
    if (!url || typeof url !== "string") return url;
    const uploadMarker = "/upload/";
    const idx = url.indexOf(uploadMarker);
    if (idx === -1) return url;

    const defaults = { f: "auto", q: "auto", dpr: "auto", a: "auto" };
    const final = { ...defaults, ...params };

    // Build transformation string in stable order
    const order = ["f", "q", "dpr", "a", "c", "g", "w", "h", "e"];
    const parts = [];
    for (const key of order) {
      if (
        final[key] !== undefined &&
        final[key] !== null &&
        final[key] !== ""
      ) {
        parts.push(`${key}_${final[key]}`);
      }
    }
    const transformation = parts.join(",");
    if (!transformation) return url;

    return url.replace(uploadMarker, `/upload/${transformation}/`);
  } catch {
    return url;
  }
}

export function thumbUrl(url) {
  return transformImageUrl(url, {
    c: "fill",
    g: "auto",
    w: 600,
    h: 600,
    q: "auto:eco",
  });
}

export function galleryUrl(url) {
  return transformImageUrl(url, { c: "limit", w: 1600, q: "auto:good" });
}

export async function uploadToCloudinary(file, { preset, folder } = {}) {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  if (!cloudName) throw new Error("Missing VITE_CLOUDINARY_CLOUD_NAME env var");
  if (!preset) throw new Error("Missing upload preset");
  const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/upload`;
  const fd = new FormData();
  fd.append("file", file);
  fd.append("upload_preset", preset);
  if (folder) fd.append("folder", folder);
  const res = await fetch(endpoint, { method: "POST", body: fd });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Cloudinary upload failed: ${res.status} ${txt}`);
  }
  const json = await res.json();
  return json.secure_url;
}
