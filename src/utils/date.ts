import { format } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * Formats a date object into a string with the format 'dd/MM/yyyy HH:mm'.
 * @param date - The date to format.
 * @returns A formatted date string.
 * @throws Error if the input is not a valid date.
 */
export function formatDate(date: Date): string {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    throw new Error('Invalid date provided');
  }
  return format(date, 'dd/MM/yyyy HH:mm', { locale: es });
}
