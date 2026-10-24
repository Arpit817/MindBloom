import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges Tailwind CSS class names safely, handling conflicts correctly.
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
