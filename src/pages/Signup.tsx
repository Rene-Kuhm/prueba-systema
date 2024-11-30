import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AuthLayout } from '@/components/AuthLayout';
import { useAuthStore } from '@/stores/authStore';

export default function Signup() {
  const { signUp, error } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'admin' | 'technician'>('technician');
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (error) {
      setIsSubmitting(false); // Re-enable form submission if there's an error
    }
  }, [error]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await signUp(email, password, fullName, role);
      setSuccess(true);
    } catch {
      setIsSubmitting(false);
      // Error is handled by the store
    }
  }

  if (success) {
    return (
      <AuthLayout title="COSPEC">
        <div className="text-center space-y-6" aria-live="polite">
          <h2 className="text-2xl font-semibold text-blue-300">¡Registro Exitoso!</h2>
          <p className="text-blue-200">
            Tu cuenta ha sido creada y está pendiente de aprobación por un administrador.
            Te notificaremos por email cuando tu cuenta sea activada.
          </p>
          <Link
            to="/"
            className="inline-block w-full py-2.5 px-4 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-medium text-center transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
            aria-label="Volver al Login"
          >
            Volver al Login
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="COSPEC">
      <form onSubmit={handleSubmit} className="space-y-6 relative">
        {error && (
          <div
            className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 animate-shake"
            aria-live="polite"
          >
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <div className="space-y-2">
          <label htmlFor="fullName" className="block text-sm font-medium text-blue-300">
            Nombre Completo
          </label>
          <input
            type="text"
            id="fullName"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            className="w-full px-4 py-2.5 rounded-lg glass glass-hover input-glow text-white placeholder-blue-300/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300"
            placeholder="Tu nombre completo"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-medium text-blue-300">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2.5 rounded-lg glass glass-hover input-glow text-white placeholder-blue-300/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300"
            placeholder="tu@email.com"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="block text-sm font-medium text-blue-300">
            Contraseña
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full px-4 py-2.5 rounded-lg glass glass-hover input-glow text-white placeholder-blue-300/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300"
            placeholder="Mínimo 6 caracteres"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-blue-300">Tipo de Usuario</label>
          <div className="grid grid-cols-2 gap-4">
            <label className="relative">
              <input
                type="radio"
                value="admin"
                checked={role === 'admin'}
                onChange={(e) => setRole(e.target.value as 'admin' | 'technician')}
                className="peer sr-only"
                required
              />
              <div className="w-full py-2.5 px-4 rounded-lg glass glass-hover text-blue-300 font-medium text-center cursor-pointer transition-all duration-300 peer-checked:bg-blue-600 peer-checked:text-white">
                Administrador
              </div>
            </label>
            <label className="relative">
              <input
                type="radio"
                value="technician"
                checked={role === 'technician'}
                onChange={(e) => setRole(e.target.value as 'admin' | 'technician')}
                className="peer sr-only"
                required
              />
              <div className="w-full py-2.5 px-4 rounded-lg glass glass-hover text-blue-300 font-medium text-center cursor-pointer transition-all duration-300 peer-checked:bg-blue-600 peer-checked:text-white">
                Técnico
              </div>
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-2.5 px-4 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-medium transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50"
          aria-label="Registrar usuario"
        >
          {isSubmitting ? 'Registrando...' : 'Registrarse'}
        </button>

        <div className="text-center">
          <Link
            to="/"
            className="text-blue-400 hover:text-blue-300 transition-colors text-sm font-medium hover:underline"
          >
            Volver al Login
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}
