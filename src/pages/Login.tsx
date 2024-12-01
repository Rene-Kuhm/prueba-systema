import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthLayout } from '@/components/AuthLayout';
import { useAuthStore } from '@/stores/authStore';

export default function Login() {
  const navigate = useNavigate();
  const { signIn, error } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<'admin' | 'technician'>('technician');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (error) {
      setIsSubmitting(false); // Reset submitting state on error
    }
  }, [error]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true); // Disable buttons while submitting

    try {
      await signIn(email, password, selectedRole);
      navigate(`/${selectedRole}`);
    } catch {
      // Error is handled by the store
      setIsSubmitting(false);
    }
  }

  return (
    <AuthLayout title="COSPEC">
      <form onSubmit={handleSubmit} className="relative space-y-6">
        {error && (
          <div
            className="p-3 border rounded-lg bg-red-500/10 border-red-500/20 animate-shake"
            aria-live="polite"
          >
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-blue-200">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="block w-full mt-1 text-white border rounded-md bg-white/10 border-white/20 placeholder-blue-200/50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="tu@email.com"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-blue-200">
            Contraseña
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="block w-full mt-1 text-white border rounded-md bg-white/10 border-white/20 placeholder-blue-200/50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Tu contraseña"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-blue-200">Selecciona tu rol</label>
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={() => setSelectedRole('admin')}
              className={`w-full py-2.5 px-4 rounded-md transition-all duration-300 transform focus:outline-none focus:ring-2 ${
                selectedRole === 'admin'
                  ? 'bg-blue-600 text-white scale-[1.02]'
                  : 'bg-white/10 text-blue-300 border border-blue-500/30'
              }`}
              aria-pressed={selectedRole === 'admin'}
              aria-label="Seleccionar Administrador"
            >
              Administrador
            </button>
            <button
              type="button"
              onClick={() => setSelectedRole('technician')}
              className={`w-full py-2.5 px-4 rounded-md transition-all duration-300 transform focus:outline-none focus:ring-2 ${
                selectedRole === 'technician'
                  ? 'bg-blue-600 text-white scale-[1.02]'
                  : 'bg-white/10 text-blue-300 border border-blue-500/30'
              }`}
              aria-pressed={selectedRole === 'technician'}
              aria-label="Seleccionar Técnico"
            >
              Técnico
            </button>
          </div>
        </div>

        <div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 px-4 rounded-md bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-medium transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50"
          >
            Iniciar Sesión
          </button>
        </div>

        <div className="text-center">
          <Link
            to="/signup"
            className="text-sm font-medium text-blue-400 transition-colors hover:text-blue-300 hover:underline"
          >
            ¿No tienes una cuenta? Regístrate aquí
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}