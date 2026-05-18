import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function priorityColor(p: string) {
  switch (p) {
    case 'high': return 'text-red-400 bg-red-400/10';
    case 'medium': return 'text-amber-400 bg-amber-400/10';
    case 'low': return 'text-emerald-400 bg-emerald-400/10';
    default: return 'text-white/40 bg-white/10';
  }
}
