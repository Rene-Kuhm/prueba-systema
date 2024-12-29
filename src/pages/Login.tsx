import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'react-toastify';
import '../styles/login.css';

const CospecLogo = lazy(() => import('../components/Logo/CospecLogo'));

const LoadingSpinner = () => (
  <div className="flex items-center justify-center w-12 h-12">
    <div className="w-8 h-8 border-4 border-blue-500 rounded-full border-t-transparent animate-spin" />
  </div>
);

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
    <div className="login-container">
      <div className="background-effects" />
      
      <div className="login-content">
        <div className="login-header">
          <h1 
            className="login-title"
            style={{
              contentVisibility: 'auto',
              containIntrinsicSize: '4rem'
            }}
          >
            <Suspense fallback={<LoadingSpinner />}>
              <CospecLogo />
            </Suspense>
            <span 
              style={{
                transform: 'translateZ(0)',
                willChange: 'transform'
              }}
            >
              Cospec
            </span>
          </h1>
          <div className="header-underline" />
        </div>

        <div className="login-card">
          <div className="login-form">
            <p className="login-subtitle">Ingresa para continuar</p>

            <form onSubmit={handleSubmit} className="form-container">
              <div className="form-fields">
                <div className="form-group">
                  <label htmlFor="email" className="form-label">
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
                    disabled={isSubmitting}
                    autoComplete="email"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="password" className="form-label">
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
                    disabled={isSubmitting}
                    autoComplete="current-password"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="role" className="form-label">
                    Rol
                  </label>
                  <select
                    id="role"
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value as 'admin' | 'technician')}
                    className="input-field"
                    disabled={isSubmitting}
                  >
                    <option value="technician">Técnico</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>
              </div>

              <div className="submit-container">
                <button
                  type="submit"
                  disabled={isSubmitting || loading}
                  className="submit-button"
                >
                  {(isSubmitting || loading) ? (
                    <div className="loading-state">
                      <div className="spinner" />
                      Ingresando...
                    </div>
                  ) : (
                    'Ingresar'
                  )}
                </button>
              </div>

              <div className="forgot-password">
                <Link to="/forgot-password" className="forgot-password-link">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
            </form>

            <div className="signup-section">
              <div className="signup-text">
                <span>¿No tienes una cuenta? </span>
                <Link to="/signup" className="signup-link">
                  Regístrate aquí
                </Link>
              </div>
            </div>

            {resetSuccess && (
              <div className="success-message">
                <p>Tu contraseña ha sido actualizada exitosamente</p>
              </div>
            )}

            {localError && (
              <div className="error-message">
                <p>{localError}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}