import { format, parse, isValid } from 'date-fns';
import { es } from 'date-fns/locale';

interface FirestoreTimestamp {
    seconds: number;
    nanoseconds: number;
}

const isTimestamp = (value: any): value is FirestoreTimestamp => {
    return value && typeof value === 'object' && 'seconds' in value && 'nanoseconds' in value;
};

/**
 * Parsea una fecha en formato DD/MM/YYYY HH:mm
 */
const parseArgDate = (dateStr: string): Date | null => {
    const parts = dateStr.split(' ');
    if (parts.length >= 1) {
        const [day, month, year] = parts[0].split('/').map(Number);
        const time = parts[1]?.split(':').map(Number) || [0, 0];
        const date = new Date(year, month - 1, day, time[0] || 0, time[1] || 0);
        return isValid(date) ? date : null;
    }
    return null;
};

/**
 * Formatea una fecha al formato argentino
 */
export const formatDateTime = (date: string | Date | FirestoreTimestamp | undefined): string => {
    if (!date) {
        return "Fecha no disponible";
    }

    try {
        let dateObj: Date | null = null;

        if (isTimestamp(date)) {
            // Manejar Timestamp de Firestore
            dateObj = new Date(date.seconds * 1000 + date.nanoseconds / 1000000);
        } else if (typeof date === "string") {
            // Si ya viene en formato DD/MM/YYYY
            if (date.includes('/')) {
                dateObj = parseArgDate(date);
            } else {
                // Intentar parsear otros formatos (ISO, etc)
                dateObj = new Date(date);
            }
        } else if (date instanceof Date) {
            dateObj = date;
        }

        if (!dateObj || !isValid(dateObj)) {
            console.error('Fecha inválida:', date);
            return "Fecha inválida";
        }

        // Formatear al formato argentino
        return format(dateObj, "dd/MM/yyyy HH:mm", { locale: es });
        
    } catch (error) {
        console.error("Error en formatDateTime:", error, "para fecha:", date);
        return "Fecha inválida";
    }
};

/**
 * Obtiene la fecha actual formateada
 */
export const getCurrentFormattedDateTime = (): string => {
    return format(new Date(), "dd/MM/yyyy HH:mm", { locale: es });
};