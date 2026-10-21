// API photos may be private. Fetch them in the browser with its session,
// never through Next's shared image optimizer (which has no user's API cookie).
export function apiPhotoImageProps(src, apiUrl) {
  if (typeof src !== 'string' || !apiUrl) return {};
  try {
    const base = new URL(apiUrl);
    const image = new URL(src, base);
    const photosPath = `${base.pathname.replace(/\/$/, '')}/photos/`;
    if (image.origin === base.origin && image.pathname.startsWith(photosPath)) {
      return { unoptimized: true, crossOrigin: 'use-credentials' };
    }
  } catch { /* Local/static image sources retain ordinary rendering. */ }
  return {};
}
