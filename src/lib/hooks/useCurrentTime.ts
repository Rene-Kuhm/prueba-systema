import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export const useCurrentTime = () => {
  const [currentTime, setCurrentTime] = useState(format(new Date(), "dd/MM/yyyy HH:mm", { locale: es }));

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentTime(format(new Date(), "dd/MM/yyyy HH:mm", { locale: es }));
    }, 60000);

    return () => clearInterval(intervalId);
  }, []);

  return currentTime;
};