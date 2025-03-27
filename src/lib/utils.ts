import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines multiple class names and merges Tailwind classes efficiently
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a date intelligently - show time for today's dates, date otherwise
 */
export function formatDate(date: Date): string {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dateToCheck = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  
  // Check if the date is today
  if (dateToCheck.getTime() === today.getTime()) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  
  // Check if the date is within the last 7 days
  const oneWeekAgo = new Date(today);
  oneWeekAgo.setDate(today.getDate() - 7);
  
  if (dateToCheck >= oneWeekAgo) {
    return date.toLocaleDateString([], { weekday: 'short' });
  }
  
  // Otherwise show the date
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

/**
 * Truncate a string to a specific length and add ellipsis
 */
export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}

export function formatTime(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

export function formatEmailPreview(content: string, maxLength: number = 80): string {
  if (!content) return "";
  
  // Remove HTML tags if present
  const plainText = content.replace(/<[^>]*>/g, "");
  
  // Trim and add ellipsis if necessary
  if (plainText.length > maxLength) {
    return plainText.slice(0, maxLength) + "...";
  }
  
  return plainText;
} 