import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { auth, db } from '@/lib/firebase';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, collection, query, where, getDocs, updateDoc, addDoc } from 'firebase/firestore';
import * as XLSX from 'xlsx';
import type { User } from '@/lib/types/firebase';

interface PendingUser {
  id: string;
  email: string;
  fullName: string;
  role: string;
  createdAt: string;
}

interface Claim {
  id?: string;
  phone: string;
  name: string;
  address: string;
  reason: string;
  technician?: string;
  status: 'pending' | 'assigned';
  resolution?: string;
  receivedBy?: string;
  receivedAt?: string;
}

export default function Admin() {
  const navigate = useNavigate();
  const { userProfile, setUserProfile } = useAuthStore();
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newClaim, setNewClaim] = useState<Omit<Claim, 'id'>>({
    phone: '',
    name: '',
    address: '',
    reason: '',
    technician: '',
    status: 'pending',
    resolution: '',
    receivedBy: userProfile?.displayName || '',
    receivedAt: new Date().toLocaleString(),
  });
  const technicians = ['René', 'Roman', 'Oscar', 'Dalmiro'];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            setUserProfile({ ...firebaseUser, ...userDoc.data() } as User);
          } else {
            console.error('User document does not exist');
            navigate('/');
          }
        } catch (err) {
          console.error('Error fetching user data:', err);
          navigate('/');
        }
      } else {
        setUserProfile(null);
        navigate('/');
      }
    });

    fetchPendingUsers();
    fetchClaims();

    return () => unsubscribe();
  }, [setUserProfile, navigate]);

  async function fetchPendingUsers() {
    setLoading(true);
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('approved', '==', false));
      const querySnapshot = await getDocs(q);

      const users: PendingUser[] = [];
      querySnapshot.forEach((doc) => {
        const userData = doc.data();
        users.push({
          id: doc.id,
          email: userData.email,
          fullName: userData.fullName,
          role: userData.role,
          createdAt: userData.createdAt,
        });
      });

      setPendingUsers(users);
    } catch (err) {
      console.error('Error fetching pending users:', err);
      setError('Error al cargar usuarios pendientes');
    } finally {
      setLoading(false);
    }
  }

  async function fetchClaims() {
    setLoading(true);
    try {
      const claimsRef = collection(db, 'claims');
      const querySnapshot = await getDocs(claimsRef);

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
          resolution: claimData.resolution,
          receivedBy: claimData.receivedBy,
          receivedAt: claimData.receivedAt,
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

  async function approveUser(userId: string) {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, { approved: true });
      setPendingUsers(pendingUsers.filter((user) => user.id !== userId));
    } catch (err) {
      console.error('Error approving user:', err);
      alert('Error al aprobar usuario');
    }
  }

  async function addNewClaim() {
    try {
      const claimsRef = collection(db, 'claims');
      await addDoc(claimsRef, { ...newClaim, status: 'pending' });
      setNewClaim({
        phone: '',
        name: '',
        address: '',
        reason: '',
        technician: '',
        status: 'pending',
        resolution: '',
        receivedBy: userProfile?.displayName || '',
        receivedAt: new Date().toLocaleString(),
      });
      fetchClaims(); // Actualizar la lista de reclamos después de agregar uno nuevo
    } catch (err) {
      console.error('Error adding new claim:', err);
      alert('Error al agregar un nuevo reclamo.');
    }
  }

  async function exportClaimsToExcel() {
    try {
      const data = claims.map((claim) => ({
        Teléfono: claim.phone,
        Nombre: claim.name,
        Dirección: claim.address,
        Motivo: claim.reason,
        Técnico: claim.technician || 'No asignado',
        Estado: claim.status === 'pending' ? 'Pendiente' : 'Asignado',
        Resolución: claim.resolution || 'No resuelto',
        'Recibido por': claim.receivedBy || 'N/A',
        'Recibido en': claim.receivedAt || 'N/A',
      }));

      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Reclamos');

      XLSX.writeFile(workbook, 'reclamos.xlsx');
    } catch (err) {
      console.error('Error exporting claims to Excel:', err);
      alert('Error al exportar los reclamos.');
    }
  }

  async function handleSignOut() {
    try {
      await signOut(auth);
      setUserProfile(null);
      navigate('/');
    } catch (err) {
      console.error('Error al cerrar sesión:', err);
      alert('Error al cerrar sesión. Intenta de nuevo.');
    }
  }

  if (loading) return <div>Cargando datos...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <main className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Panel de Administración
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Bienvenido, {userProfile?.displayName || 'Administrador'}
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

        {/* Lista de usuarios pendientes */}
        <div className="p-6 mb-8 bg-white rounded-lg shadow-sm dark:bg-gray-800">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Usuarios Pendientes</h2>
          {pendingUsers.length === 0 ? (
            <p>No hay usuarios pendientes de aprobación.</p>
          ) : (
            <ul className="mt-4 space-y-4">
              {pendingUsers.map((user) => (
                <li key={user.id} className="flex justify-between p-4 bg-gray-100 rounded-md dark:bg-gray-700">
                  <span>
                    {user.fullName} ({user.email})
                  </span>
                  <button
                    onClick={() => approveUser(user.id)}
                    className="px-4 py-2 text-white bg-green-600 rounded-md hover:bg-green-700"
                  >
                    Aprobar
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Formulario para cargar nuevos reclamos */}
        <div className="p-6 mb-8 bg-white rounded-lg shadow-sm dark:bg-gray-800">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Cargar Nuevo Reclamo</h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              addNewClaim();
            }}
            className="space-y-4"
          >
            <div>
              <label htmlFor="phone" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                Teléfono
              </label>
              <input
                type="text"
                id="phone"
                value={newClaim.phone}
                onChange={(e) => setNewClaim({ ...newClaim, phone: e.target.value })}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                Nombre
              </label>
              <input
                type="text"
                id="name"
                value={newClaim.name}
                onChange={(e) => setNewClaim({ ...newClaim, name: e.target.value })}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label htmlFor="address" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                Dirección
              </label>
              <input
                type="text"
                id="address"
                value={newClaim.address}
                onChange={(e) => setNewClaim({ ...newClaim, address: e.target.value })}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label htmlFor="reason" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                Motivo
              </label>
              <textarea
                id="reason"
                value={newClaim.reason}
                onChange={(e) => setNewClaim({ ...newClaim, reason: e.target.value })}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                required
              ></textarea>
            </div>
            <div>
              <label htmlFor="technician" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                Técnico Asignado
              </label>
              <select
                id="technician"
                value={newClaim.technician}
                onChange={(e) => setNewClaim({ ...newClaim, technician: e.target.value })}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              >
                <option value="">Seleccionar técnico</option>
                {technicians.map((technician) => (
                  <option key={technician} value={technician}>
                    {technician}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            >
              Guardar Reclamo
            </button>
          </form>
        </div>

        {/* Lista de reclamos */}
        <div className="p-6 mb-8 bg-white rounded-lg shadow-sm dark:bg-gray-800">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Reclamos</h2>
          <button
            onClick={exportClaimsToExcel}
            className="px-4 py-2 mb-4 text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Exportar Reclamos a Excel
          </button>
          <ul className="mt-4 space-y-4">
          {claims.map((claim) => (
              <li key={claim.id} className="p-4 bg-gray-100 rounded-md dark:bg-gray-700">
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
                  <strong>Técnico Asignado:</strong> {claim.technician || 'No asignado'}
                </div>
                <div>
                  <strong>Estado:</strong> {claim.status === 'pending' ? 'Pendiente' : 'Asignado'}
                </div>
                {claim.status === 'assigned' && (
                  <div>
                    <strong>Resolución:</strong> {claim.resolution || 'No resuelto'}
                  </div>
                )}
                <div>
                  <strong>Recibido por:</strong> {claim.receivedBy || 'N/A'}
                </div>
                <div>
                  <strong>Recibido en:</strong> {claim.receivedAt || 'N/A'}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  );
}