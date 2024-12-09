import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import '@/styles/login.css';

export default function Login() {
  const navigate = useNavigate();
  const { signIn, error } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<'admin' | 'technician'>('technician');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (error) setIsSubmitting(false);
  }, [error]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await signIn(email, password, selectedRole);
      // Solicitar permisos de notificaciones
      if (Notification.permission !== 'granted') {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          console.log('Permiso de notificaciones denegado');
        }
      }
      navigate(`/${selectedRole}`);
    } catch {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="login-container">
      <div className="background-effects" />
      
      <div className="content-wrapper">
        <div className="brand-container">
          <h1 className="brand-title">COSPEC</h1>
          <p className="brand-subtitle">COMUNICACIONES</p>
        </div>

        <div className="login-card">
          <div className="form-header">
            <h2 className="form-title">Iniciar Sesión</h2>
            <p className="form-subtitle">Ingresa tus credenciales para continuar</p>
          </div>

          <form onSubmit={handleSubmit}>
            {error && (
              <div className="error-message" role="alert">
                {error}
              </div>
            )}

            <div className="input-group">
              <div className="input-wrapper">
                <label htmlFor="email" className="input-label">
                  Correo electrónico
                </label>
                <input
                  id="email"
                  type="email"
                  className="input-field"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  required
                />
              </div>

              <div className="input-wrapper">
                <label htmlFor="password" className="input-label">
                  Contraseña
                </label>
                <input
                  id="password"
                  type="password"
                  className="input-field"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Tu contraseña"
                  required
                />
              </div>
            </div>

            <div className="role-selector">
              <label className="input-label">Selecciona tu rol</label>
              <div className="role-buttons">
                <button
                  type="button"
                  className={`role-button ${selectedRole === 'admin' ? 'active' : ''}`}
                  onClick={() => setSelectedRole('admin')}
                >
                  Administrador
                </button>
                <button
                  type="button"
                  className={`role-button ${selectedRole === 'technician' ? 'active' : ''}`}
                  onClick={() => setSelectedRole('technician')}
                >
                  Técnico
                </button>
              </div>
            </div>

            <button 
              type="submit"
              className="mt-8 submit-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Ingresando...' : 'Ingresar'}
            </button>

            <Link to="/signup" className="signup-link">
              ¿No tienes una cuenta? Regístrate aquí
            </Link>
          </form>
        </div>
      </div>
    </div>
  );
}