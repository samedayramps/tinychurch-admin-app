/**
 * Utility functions for formatting data
 */

/**
 * Formats a phone number to XXX-XXX-XXXX format
 * @param value - The input phone number string
 * @returns Formatted phone number
 */
export const formatPhoneNumber = (value: string): string => {
  // Remove all non-digits
  const digits = value.replace(/\D/g, '')
  
  // Format as XXX-XXX-XXXX
  if (digits.length <= 3) {
    return digits
  } else if (digits.length <= 6) {
    return `${digits.slice(0, 3)}-${digits.slice(3)}`
  } else {
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6, 10)}`
  }
}

/**
 * Formats a currency amount
 * @param amount - Number to format
 * @param currency - Currency code (default: 'USD')
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount)
}

/**
 * Formats a date string
 * @param date - Date to format
 * @param format - Optional format style
 * @returns Formatted date string
 */
export const formatDate = (date: Date | string, format: 'short' | 'long' | 'full' = 'short'): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  switch (format) {
    case 'long':
      return dateObj.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    case 'full':
      return dateObj.toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      })
    default:
      return dateObj.toLocaleDateString('en-US')
  }
}

/**
 * Formats a time string in 12-hour format with AM/PM
 * @param time - Time string in 24-hour format (HH:mm)
 * @returns Formatted time string in 12-hour format
 */
export const formatTime = (time: string): string => {
  const [hours, minutes] = time.split(':').map(Number)
  const period = hours >= 12 ? 'PM' : 'AM'
  const hour12 = hours % 12 || 12
  return `${hour12}:${minutes.toString().padStart(2, '0')} ${period}`
} 