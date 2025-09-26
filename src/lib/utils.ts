import { type ClassNameValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassNameValue[]): string {
  return twMerge(clsx(inputs));
}
