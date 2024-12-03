import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(date));
}

export function formatPhoneNumber(phone: string): string {
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '')
  
  // Return empty string if no numbers
  if (!cleaned) return ''
  
  // Format the number
  if (cleaned.length >= 10) {
    const areaCode = cleaned.slice(-10, -7)
    const firstPart = cleaned.slice(-7, -4)
    const lastPart = cleaned.slice(-4)
    
    return `${areaCode}-${firstPart}-${lastPart}`
  }
  
  return phone // Return original if not enough digits
}

// Add any other utility functions you need here 