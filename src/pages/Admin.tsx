import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { UserApprovalList } from '@/components/UserApprovalList';

export default function Admin() {
  const navigate = useNavigate();
  const { userProfile, signOut } = useAuthStore();

  useEffect(() => {
    if (!userProfile) {
      navigate('/'); // Redirect to home if the user is not authenticated
    }
  }, [userProfile, navigate]);

  async function handleSignOut() {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
      alert('Error al cerrar sesión. Intenta de nuevo.');
    }
  }

  if (!userProfile) {
    return null; // Prevent rendering if userProfile is null (e.g., while redirecting)
  }

  return (
    <main className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Panel de Administración
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Bienvenido, {userProfile?.full_name || 'Administrador'}
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
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Usuarios Pendientes de Aprobación
              </h2>
            </div>
            <UserApprovalList />
          </div>
        </div>
      </div>
    </main>
  );
}
