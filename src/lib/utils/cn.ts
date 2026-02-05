import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * cn(...) combines classes safely.
 * - clsx handles conditionals and arrays
 * - tailwind-merge deduplicates conflicting Tailwind classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
