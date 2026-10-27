/**
 * Resolves API paths for client fetch calls.
 * In standalone native builds (e.g. EAS builds), relative URLs like '/api/search'
 * require an origin base URL when running outside the local Metro dev server.
 * If EXPO_PUBLIC_API_URL is defined, it prepends the base URL; otherwise returns
 * the relative path (which Metro resolves in development).
 */
export function getApiUrl(path: string): string {
  const base = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, "");
  if (base) {
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    return `${base}${cleanPath}`;
  }
  return path;
}
