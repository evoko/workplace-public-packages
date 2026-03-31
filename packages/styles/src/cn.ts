import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind CSS classes with proper precedence.
 *
 * Combines clsx (conditional classes) with tailwind-merge
 * (deduplication / conflict resolution).
 *
 * Usage:
 *   cn('px-4 py-2', isActive && 'bg-brand-500', className)
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
