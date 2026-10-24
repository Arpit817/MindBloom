import {
  format,
  formatDistanceToNow,
  isToday as fnsIsToday,
  isTomorrow as fnsIsTomorrow,
  isPast as fnsIsPast,
} from "date-fns";

function toDate(d) {
  return typeof d === "string" ? new Date(d) : d;
}

/** Format as "Oct 22, 2026" */
export function formatDate(date) {
  return format(toDate(date), "MMM d, yyyy");
}

/** Format as "2 days ago" or "in 3 days" */
export function formatRelative(date) {
  return formatDistanceToNow(toDate(date), { addSuffix: true });
}

/** Format as "Oct 22, 2026 at 10:30 PM" */
export function formatDateTime(date) {
  return format(toDate(date), "MMM d, yyyy 'at' h:mm a");
}

/** Returns true if the date is today */
export function isToday(date) {
  return fnsIsToday(toDate(date));
}

/** Returns true if the date is tomorrow */
export function isTomorrow(date) {
  return fnsIsTomorrow(toDate(date));
}

/** Returns true if the date is in the past */
export function isPast(date) {
  return fnsIsPast(toDate(date));
}

/** Returns days until a date (negative if past) */
export function daysUntil(date) {
  const now = new Date();
  const target = toDate(date);
  const diff = target.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}
