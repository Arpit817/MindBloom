/**
 * Truncates a string to max length, appending "…" if needed.
 */
export function truncate(str, max) {
  if (!str) return "";
  return str.length > max ? str.slice(0, max - 1) + "…" : str;
}

/**
 * Returns singular or plural form based on count.
 * Example: pluralize(1, "note") → "1 note", pluralize(3, "note") → "3 notes"
 */
export function pluralize(count, singular, plural) {
  const form = count === 1 ? singular : (plural ?? singular + "s");
  return `${count} ${form}`;
}

/**
 * Formats bytes into human-readable file size.
 * Example: formatFileSize(2400000) → "2.4 MB"
 */
export function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

/**
 * Capitalizes the first letter of a string.
 */
export function capitalizeFirst(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Converts a slug like "review_stage" to "Review Stage".
 */
export function slugToLabel(slug) {
  return slug
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Safely joins CSS class names (space-separated).
 */
export function joinClasses(...classes) {
  return classes.filter(Boolean).join(" ");
}
