/**
 * Generates a clean, URL-safe slug from a string (e.g. listing title).
 */
export function generateSlug(title: string): string {
  if (!title) return "";
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // remove non-alphanumeric except whitespace & hyphens
    .replace(/[\s_-]+/g, "-") // collapse whitespace and underscores to single hyphen
    .replace(/^-+|-+$/g, ""); // remove leading/trailing hyphens
}
