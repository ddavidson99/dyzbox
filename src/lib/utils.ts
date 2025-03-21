import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
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