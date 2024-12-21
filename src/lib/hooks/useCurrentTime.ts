import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export const useCurrentTime = () => {
  const [currentTime, setCurrentTime] = useState(format(new Date(), "dd/MM/yyyy HH:mm", { locale: es }));

  useEffect(() => {
    // Actualizar inmediatamente para sincronizar con el servidor NTP
    const updateTimeFromServer = async () => {
      try {
        const response = await fetch('http://worldtimeapi.org/api/timezone/America/Argentina/Buenos_Aires');
        const data = await response.json();
        const serverTime = new Date(data.datetime);
        setCurrentTime(format(serverTime, "dd/MM/yyyy HH:mm", { locale: es }));
      } catch (error) {
        // Si falla la petición, usar la hora local
        console.warn('Error fetching server time, using local time:', error);
        setCurrentTime(format(new Date(), "dd/MM/yyyy HH:mm", { locale: es }));
      }
    };

    // Actualizar la hora cada minuto
    const intervalId = setInterval(() => {
      updateTimeFromServer();
    }, 60000); // 60000 ms = 1 minuto

    // Primera actualización
    updateTimeFromServer();

    // Limpiar el intervalo cuando el componente se desmonte
    return () => clearInterval(intervalId);
  }, []);

  return currentTime;
};