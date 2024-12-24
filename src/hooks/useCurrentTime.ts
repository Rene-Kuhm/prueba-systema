import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export const useCurrentTime = () => {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [isUsingLocalTime, setIsUsingLocalTime] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Update time every second
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formattedTime = format(currentTime, "dd/MM/yyyy HH:mm:ss", { locale: es });

  return {
    currentTime,
    formattedTime,
    isUsingLocalTime,
    error
  };
};

export default useCurrentTime;