import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, db } from '@/lib/firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

export default function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    role: 'technician' as 'admin' | 'technician'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      if (!formData.email || !formData.password || !formData.fullName || !formData.role) {
        throw new Error('Todos los campos son requeridos');
      }

      if (formData.password.length < 6) {
        throw new Error('La contraseña debe tener al menos 6 caracteres');
      }

      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        formData.email, 
        formData.password
      );
      
      await updateProfile(userCredential.user, { displayName: formData.fullName });

      await setDoc(doc(db, 'users', userCredential.user.uid), {
        email: formData.email,
        fullName: formData.fullName,
        role: formData.role,
        approved: false,
        createdAt: new Date().toISOString(),
      });

      navigate('/');
    } catch (err) {
      console.error('Error en el proceso de registro:', err);
      setError(err instanceof Error ? err.message : 'Error en el registro');
    } finally {
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
              <p className="login-subtitle text-lg">Crear una nueva cuenta</p>
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
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
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
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="input-field"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-300 mb-1">
                    Nombre Completo
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    placeholder="John Doe"
                    value={formData.fullName}
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
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
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value as 'admin' | 'technician'})}
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
                  disabled={isSubmitting}
                  className="submit-button group"
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Registrando...
                    </div>
                  ) : (
                    'Registrarse'
                  )}
                </button>
              </div>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-700">
              <div className="text-center text-sm">
                <span className="text-gray-400">¿Ya tienes una cuenta? </span>
                <Link 
                  to="/" 
                  className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
                >
                  Inicia sesión aquí
                </Link>
              </div>
            </div>

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