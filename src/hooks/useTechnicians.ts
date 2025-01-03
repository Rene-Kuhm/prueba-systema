import { useState, useEffect } from 'react';

interface Technician {
  id: string;
  name: string;
  phone: string;
}

interface TechniciansState {
  technicians: Technician[];
  loading: boolean;
  error: Error | null;
}

export const useTechnicians = () => {
  const [state, setState] = useState<TechniciansState>({
    technicians: [],
    loading: true,
    error: null
  });

  useEffect(() => {
    let mounted = true;

    const fetchTechnicians = async () => {
      try {
        const response = await fetch('/api/technicians');
        const data = await response.json();
        
        if (mounted) {
          setState({
            technicians: data,
            loading: false,
            error: null
          });
        }
      } catch (error) {
        if (mounted) {
          setState(prev => ({
            ...prev,
            loading: false,
            error: error as Error
          }));
        }
      }
    };

    fetchTechnicians();

    return () => {
      mounted = false;
    };
  }, []);

  return state;
};
