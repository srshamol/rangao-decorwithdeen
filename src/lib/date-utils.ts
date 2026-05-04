import { format, formatDistanceToNow } from 'date-fns';
import { bn, enUS } from 'date-fns/locale';

/**
 * Formats a date using date-fns with support for English and Bengali locales.
 * @param date The date to format (Date object, timestamp, or ISO string)
 * @param formatStr The format string (default: 'PPP' - Oct 29th, 2023)
 * @param language The language to use ('en' or 'bn')
 * @returns Formatted date string
 */
export const formatDate = (
  date: Date | string | number, 
  formatStr = 'PPP', 
  language: 'en' | 'bn' = 'en'
) => {
  if (!date) return '';
  const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  
  // Basic validation
  if (isNaN(d.getTime())) return String(date);

  return format(d, formatStr, {
    locale: language === 'bn' ? bn : enUS
  });
};

/**
 * Returns a relative date string (e.g., "2 hours ago" or "২ ঘণ্টা আগে")
 * @param date The date to format
 * @param language The language to use
 * @returns Relative date string
 */
export const formatRelativeDate = (
  date: Date | string | number, 
  language: 'en' | 'bn' = 'en'
) => {
  if (!date) return '';
  const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  
  // Basic validation
  if (isNaN(d.getTime())) return String(date);

  return formatDistanceToNow(d, {
    addSuffix: true,
    locale: language === 'bn' ? bn : enUS
  });
};

/**
 * Specific format for order timestamps in the admin dashboard
 */
export const formatOrderDate = (date: string | number | Date, language: 'en' | 'bn' = 'en') => {
  return formatDate(date, 'MMM dd, yyyy • hh:mm a', language);
};
