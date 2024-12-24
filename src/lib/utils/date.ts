import { format, parseISO, isValid } from 'date-fns';
import { es } from 'date-fns/locale';

export const formatDate = (date: string | Date | undefined | null): string => {
  if (!date) return 'Fecha no disponible';
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    
    if (!isValid(dateObj)) {
      throw new Error('Fecha inválida');
    }
    
    return format(dateObj, 'dd/MM/yyyy', { locale: es });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Fecha no disponible';
  }
};

export const formatDateTime = (date: string | Date | undefined | null): string => {
  if (!date) return 'Fecha no disponible';
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    
    if (!isValid(dateObj)) {
      throw new Error('Fecha inválida');
    }
    
    return format(dateObj, "dd 'de' MMMM 'de' yyyy 'a las' HH:mm", {
      locale: es
    });
  } catch (error) {
    console.error('Error formatting datetime:', error);
    return 'Fecha no disponible';
  }
};

export const getCurrentFormattedDateTime = (): string => {
  return new Date().toISOString();
};

export const isValidDate = (date: any): boolean => {
  if (!date) return false;
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return isValid(dateObj);
  } catch (error) {
    return false;
  }
};
