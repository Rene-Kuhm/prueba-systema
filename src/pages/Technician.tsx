import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

export default function Technician() {
  const navigate = useNavigate();
  const { userProfile, signOut } = useAuthStore();

  useEffect(() => {
    // Redirect if the user is not logged in or is not a technician
    if (!userProfile || userProfile.role !== 'technician') {
      navigate('/'); // Redirect to home or login page
    }
  }, [userProfile, navigate]);

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Panel de Técnico
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Bienvenido, {userProfile.full_name || 'Usuario'}
            </p>
          </div>
          <button
            onClick={handleSignOut}
            aria-label="Cerrar sesión"
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Cerrar Sesión
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <p className="text-gray-700 dark:text-gray-300">
            Aquí encontrarás tus tareas asignadas, reportes, y más.
          </p>
          {/* Add technician-specific content here */}
        </div>
      </div>
    </main>
  );
}
