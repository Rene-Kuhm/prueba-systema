// src/hooks/useClaims.ts
import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  onSnapshot, 
  orderBy,
  where,
  QuerySnapshot,
  DocumentData
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import { ExtendedClaim } from '@/lib/types/admin';

export const useClaims = (showArchived: boolean) => {
  const [claims, setClaims] = useState<ExtendedClaim[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let retryCount = 0;
    const maxRetries = 3;
    
    const setupListener = () => {
      const claimsRef = collection(db, 'claims');
      // Simplified query that requires proper indexing
      const q = query(
        claimsRef, 
        where('isArchived', '==', showArchived),
        orderBy('createdAt', 'desc'),
        orderBy('__name__', 'desc')
      );

      return onSnapshot(q, 
        (snapshot: QuerySnapshot<DocumentData>) => {
          const claimsData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as ExtendedClaim[];
          
          setClaims(claimsData);
          setLoading(false);
        },
        (error: Error) => {
          console.error('Error en Firestore:', error);
          
          // Check if error is related to missing index
          if (error.message.includes('index')) {
            setError(`Error: Se requiere crear un índice en Firestore. 
              Por favor, siga el enlace en la consola para crearlo.`);
          } else if (retryCount < maxRetries) {
            retryCount++;
            setTimeout(setupListener, 1000 * retryCount);
          } else {
            setError('Error de conexión con la base de datos');
          }
          setLoading(false);
        }
      );
    };

    const unsubscribe = setupListener();
    return () => unsubscribe();
  }, [showArchived]);

  return { claims, loading, error };
};