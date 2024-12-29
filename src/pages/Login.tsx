import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'react-toastify';
import CospecLogo from '../components/Logo/CospecLogo';
import '../styles/login.css';

export default function Login() {
  const navigate = useNavigate();
  const { signIn, error: authError, userProfile, loading } = useAuthStore();
  const [searchParams] = useSearchParams();
  const resetSuccess = searchParams.get('resetSuccess');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<'admin' | 'technician'>('technician');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (authError) {
      setLocalError(authError);
      setIsSubmitting(false);
      toast.error(authError);
    }
  }, [authError]);

  useEffect(() => {
    if (userProfile?.role && !loading) {
      navigate(`/${userProfile.role}`, { replace: true });
    }
  }, [userProfile, loading, navigate]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting || loading) return;

    setIsSubmitting(true);
    setLocalError(null);

    try {
      await signIn(email, password, selectedRole);
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Error al iniciar sesión');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gray-900">
      <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900" />
      
      <div className="relative z-10 flex flex-col items-center w-full max-w-md">
        {/* Header optimizado */}
        <div className="mb-8 text-center">
          <h1 className="flex items-center justify-center gap-3 mb-4 text-4xl font-bold tracking-tight text-white">
            <CospecLogo />
            <span 
              className="font-bold leading-none text-white"
              style={{
               /* transform: 'translate3d(0,0,0)',*/
               /* backfaceVisibility: 'hidden',*/
               /* perspective: '1000px',*/
                WebkitFontSmoothing: 'antialiased'
              }}
            >
              Cospec
            </span>
          </h1>
          <div className="w-20 h-1 mx-auto rounded-full bg-gradient-to-r from-blue-500 to-purple-500" />
        </div>

        {/* Card de login */}
        <div className="w-full p-6 bg-gray-800 border border-gray-700 shadow-xl rounded-xl">
          <p className="mb-6 text-lg text-center text-gray-300">
            Ingresa para continuar
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              {/* Email field */}
              <div className="space-y-1">
                <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                  Correo electrónico
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="ejemplo@correo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 text-white placeholder-gray-400 transition-colors bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                  required
                  disabled={isSubmitting}
                  autoComplete="email"
                />
              </div>

              {/* Password field */}
              <div className="space-y-1">
                <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                  Contraseña
                </label>
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 text-white placeholder-gray-400 transition-colors bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                  required
                  disabled={isSubmitting}
                  autoComplete="current-password"
                />
              </div>

              {/* Role selector */}
              <div className="space-y-1">
                <label htmlFor="role" className="block text-sm font-medium text-gray-300">
                  Rol
                </label>
                <select
                  id="role"
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as 'admin' | 'technician')}
                  className="w-full px-4 py-2 text-white transition-colors bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSubmitting}
                >
                  <option value="technician">Técnico</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
            </div>

            {/* Submit button */}
            <div className="mt-8">
              <button
                type="submit"
                disabled={isSubmitting || loading}
                className="w-full px-6 py-3 font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {(isSubmitting || loading) ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 mr-2 border-2 border-white rounded-full border-t-transparent animate-spin" />
                    Ingresando...
                  </div>
                ) : (
                  'Ingresar'
                )}
              </button>
            </div>

            {/* Links */}
            <div className="mt-6 text-center">
              <Link 
                to="/forgot-password"
                className="text-sm text-gray-400 transition-colors hover:text-blue-400"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
          </form>

          {/* Sign up section */}
          <div className="pt-6 mt-8 border-t border-gray-700">
            <div className="text-sm text-center">
              <span className="text-gray-400">¿No tienes una cuenta? </span>
              <Link 
                to="/signup"
                className="font-medium text-blue-400 transition-colors hover:text-blue-300"
              >
                Regístrate aquí
              </Link>
            </div>
          </div>

          {/* Messages */}
          {resetSuccess && (
            <div className="p-3 mt-4 border rounded-lg bg-green-500/10 border-green-500/20">
              <p className="text-sm text-center text-green-400">
                Tu contraseña ha sido actualizada exitosamente
              </p>
            </div>
          )}

          {localError && (
            <div className="p-3 mt-4 border rounded-lg bg-red-500/10 border-red-500/20">
              <p className="text-sm text-center text-red-400">{localError}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}