import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import '@/styles/login.css';
import { subscribeUser, addUserData } from '@/lib/onesignal';

export default function Login() {
  const navigate = useNavigate();
  const { signIn, error, userProfile, loading } = useAuthStore();
  const [searchParams] = useSearchParams();
  const resetSuccess = searchParams.get('resetSuccess');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<'admin' | 'technician'>('technician');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (userProfile) {
      console.log('Usuario autenticado:', userProfile);
      navigate(`/${selectedRole}`);
    }
  }, [userProfile, selectedRole, navigate]);

  useEffect(() => {
    if (error) {
      console.log('Error detectado:', error);
      setIsSubmitting(false);
    }
  }, [error]);
  
  useEffect(() => {
    const setupOneSignal = async () => {
      if (userProfile && userProfile.uid && isSubmitting) {
        console.log('Configurando OneSignal para usuario:', userProfile.uid);
        try {
          const subscribed = await subscribeUser(email, userProfile.uid);
          console.log('Resultado suscripción OneSignal:', subscribed);
          
          if (subscribed) {
            await addUserData({
              role: selectedRole,
              email,
              lastLogin: new Date().toISOString(),
              userId: userProfile.uid,
              fullName: userProfile.displayName || email.split('@')[0]
            });
            console.log('Datos de usuario añadidos a OneSignal');
          }
        } catch (error) {
          console.error('Error configurando OneSignal:', error);
        } finally {
          console.log('Navegando a:', `/${selectedRole}`);
          navigate(`/${selectedRole}`);
          setIsSubmitting(false);
        }
      } else if (userProfile && !isSubmitting) {
        // Si tenemos usuario pero no estamos en proceso de submit, solo navegamos
        navigate(`/${selectedRole}`);
      }
    };

    setupOneSignal();
  }, [userProfile, isSubmitting, email, selectedRole, navigate]);

  useEffect(() => {
    if (error) {
      console.log('Error detectado:', error);
      setIsSubmitting(false);
    }
  }, [error]);


  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    console.log('Iniciando login...', { email, role: selectedRole });
    
    if (isSubmitting || loading) {
      console.log('Ya hay una solicitud en proceso');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      console.log('Llamando a signIn...');
      await signIn(email, password, selectedRole);
      console.log('SignIn completado');
    } catch (err) {
      console.error('Error en login:', err);
      setIsSubmitting(false);
    }
  }

  return (
    <div className="login-container">
      <div className="background-effects" />
      
      <div className="flex flex-col items-center w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-4 tracking-tight flex items-center justify-center gap-3">
            <svg 
              className="w-12 h-12"
              viewBox="0 0 24 24" 
              fill="none"
            >
              <circle 
                cx="12" 
                cy="12" 
                r="10" 
                className="stroke-blue-500" 
                strokeWidth="2"
              />
              <path 
                d="M8 12 C8 8, 16 8, 16 12" 
                className="stroke-blue-400" 
                strokeWidth="2"
              />
              <path 
                d="M6 12 C6 6, 18 6, 18 12" 
                className="stroke-blue-300 opacity-60" 
                strokeWidth="2"
              />
              <circle 
                cx="12" 
                cy="12" 
                r="2" 
                className="fill-blue-500"
              />
            </svg>
            Cospec 
          </h1>
          <div className="h-1 w-20 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full" />
        </div>

        <div className="login-card w-full">
          <div className="login-form">
            <div className="login-header">
              <p className="login-subtitle text-lg">Ingresa para continuar</p>
            </div>

            <form onSubmit={handleSubmit} className="form-container">
              <div className="space-y-4">
                <div className="form-group">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                    Correo electrónico
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="ejemplo@correo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-field"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
                    Contraseña
                  </label>
                  <input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-field"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="role" className="block text-sm font-medium text-gray-300 mb-1">
                    Rol
                  </label>
                  <select
                    id="role"
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value as 'admin' | 'technician')}
                    className="input-field"
                  >
                    <option value="technician">Técnico</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>
              </div>

              <div className="mt-8 flex justify-center">
                <button
                  type="submit"
                  disabled={isSubmitting || loading}
                  className="submit-button group"
                >
                  {(isSubmitting || loading) ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Ingresando...
                    </div>
                  ) : (
                    'Ingresar'
                  )}
                </button>
              </div>

              <div className="mt-6 text-center">
                <Link 
                  to="/forgot-password" 
                  className="text-sm text-gray-400 hover:text-blue-400 transition-colors"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-700">
              <div className="text-center text-sm">
                <span className="text-gray-400">¿No tienes una cuenta? </span>
                <Link 
                  to="/signup" 
                  className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
                >
                  Regístrate aquí
                </Link>
              </div>
            </div>

            {resetSuccess && (
              <div className="mt-4 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                <p className="text-sm text-green-400 text-center">
                  Tu contraseña ha sido actualizada exitosamente
                </p>
              </div>
            )}

            {error && (
              <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                <p className="text-sm text-red-400 text-center">{error}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}