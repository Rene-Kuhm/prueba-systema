import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { User } from '@/lib/types/firebase';

interface Claim {
  id?: string;
  phone: string;
  name: string;
  address: string;
  reason: string;
  technician?: string;
  status: 'pending' | 'assigned';
}

export default function Technician() {
  const navigate = useNavigate();
  const { userProfile, signOut } = useAuthStore();
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Redirect if the user is not logged in or is not a technician
    if (!userProfile || userProfile.role !== 'technician') {
      navigate('/'); // Redirect to home or login page
    }

    fetchClaimsByTechnician();
  }, [userProfile, navigate]);

  async function fetchClaimsByTechnician() {
    setLoading(true);
    try {
      const claimsRef = collection(db, 'claims');
      const q = query(claimsRef, where('technician', '==', (userProfile as User).uid));
      const querySnapshot = await getDocs(q);

      const claimsData: Claim[] = [];
      querySnapshot.forEach((doc) => {
        const claimData = doc.data();
        claimsData.push({
          id: doc.id,
          phone: claimData.phone,
          name: claimData.name,
          address: claimData.address,
          reason: claimData.reason,
          technician: claimData.technician,
          status: claimData.status,
        });
      });

      setClaims(claimsData);
    } catch (err) {
      console.error('Error fetching claims:', err);
      setError('Error al cargar reclamos');
    } finally {
      setLoading(false);
    }
  }

  async function handleSignOut() {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
      alert('Error al cerrar sesión. Intenta nuevamente.');
    }
  }

  if (!userProfile || userProfile.role !== 'technician') {
    return null; // Avoid rendering if the user is not authenticated or unauthorized
  }

  return (
    <main className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Panel de Técnico
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Bienvenido, {(userProfile as User).displayName || 'Usuario'}
            </p>
          </div>
          <button
            onClick={handleSignOut}
            aria-label="Cerrar sesión"
            className="px-4 py-2 text-white transition-colors bg-red-600 rounded-lg hover:bg-red-700"
          >
            Cerrar Sesión
          </button>
        </div>

        {/* Lista de reclamos asignados al técnico */}
        <div className="p-6 bg-white rounded-lg shadow-sm dark:bg-gray-800">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Reclamos Asignados
          </h2>
          {loading ? (
            <div>Cargando reclamos...</div>
          ) : error ? (
            <div>Error: {error}</div>
          ) : claims.length === 0 ? (
            <div>No hay reclamos asignados.</div>
          ) : (
            <ul className="mt-4 space-y-4">
              {claims.map((claim) => (
                <li
                  key={claim.id}
                  className="p-4 bg-gray-100 rounded-md dark:bg-gray-700"
                >
                  <div>
                    <strong>Teléfono:</strong> {claim.phone}
                  </div>
                  <div>
                    <strong>Nombre:</strong> {claim.name}
                  </div>
                  <div>
                    <strong>Dirección:</strong> {claim.address}
                  </div>
                  <div>
                    <strong>Motivo:</strong> {claim.reason}
                  </div>
                  <div>
                    <strong>Estado:</strong>{' '}
                    {claim.status === 'pending' ? 'Pendiente' : 'Asignado'}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </main>
  );
}