import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, db } from '@/config/firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { toast } from 'react-toastify';
import '../styles/signup.css'

interface FormData {
  email: string;
  password: string;
  fullName: string;
  role: 'admin' | 'technician';
}

export default function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    fullName: '',
    role: 'technician'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Validaciones
      if (!formData.email || !formData.password || !formData.fullName || !formData.role) {
        throw new Error('Todos los campos son requeridos');
      }

      if (formData.password.length < 6) {
        throw new Error('La contraseña debe tener al menos 6 caracteres');
      }

      // Crear usuario en Authentication
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        formData.email, 
        formData.password
      );
      
      // Actualizar el perfil del usuario
      await updateProfile(userCredential.user, { 
        displayName: formData.fullName
      });

      const timestamp = new Date().toISOString();

      // Datos base del usuario
      const userData = {
        email: formData.email,
        fullName: formData.fullName,
        role: formData.role,
        approved: false,
        active: false,
        createdAt: timestamp,
        updatedAt: timestamp,
        userId: userCredential.user.uid,
        lastLogin: timestamp
      };

      // Guardar en la colección general de usuarios
      await setDoc(doc(db, 'users', userCredential.user.uid), userData);

      // Guardar en la colección específica según el rol
      if (formData.role === 'technician') {
        await setDoc(doc(db, 'technicians', userCredential.user.uid), {
          ...userData,
          phone: '',
          availableForAssignment: false,
          currentAssignments: 0,
          totalAssignments: 0,
          completedAssignments: 0,
          rating: 0,
          ratingCount: 0
        });
      } else if (formData.role === 'admin') {
        await setDoc(doc(db, 'admins', userCredential.user.uid), {
          ...userData,
          permissionLevel: 'basic',
          lastActivity: timestamp,
          department: 'general',
          canApproveUsers: false,
          canAssignTasks: false
        });
      }

      toast.success('Tu registro fue exitoso. Un administrador revisará tu solicitud y aprobará tu cuenta. Recibirás una notificación cuando esto suceda.');
      navigate('/login');
    } catch (err) {
      console.error('Error en el proceso de registro:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error en el registro';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="login-container">
      <div className="background-effects" />
      
      <div className="flex flex-col items-center w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="flex items-center justify-center gap-3 mb-4 text-4xl font-bold tracking-tight text-white">
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
          <div className="w-20 h-1 mx-auto rounded-full bg-gradient-to-r from-blue-500 to-purple-500" />
        </div>

        <div className="w-full login-card">
          <div className="login-form">
            <div className="login-header">
              <p className="text-lg login-subtitle">Crear una nueva cuenta</p>
            </div>

            <form onSubmit={handleSubmit} className="form-container">
              <div className="space-y-4">
                <div className="form-group">
                  <label htmlFor="email" className="block mb-1 text-sm font-medium text-gray-300">
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
                  <label htmlFor="password" className="block mb-1 text-sm font-medium text-gray-300">
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
                    minLength={6}
                  />
                  <p className="mt-1 text-xs text-gray-400">
                    Mínimo 6 caracteres
                  </p>
                </div>

                <div className="form-group">
                  <label htmlFor="fullName" className="block mb-1 text-sm font-medium text-gray-300">
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
                  <label htmlFor="role" className="block mb-1 text-sm font-medium text-gray-300">
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

              <div className="flex justify-center mt-8">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="submit-button group"
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 mr-2 border-2 border-white rounded-full border-t-transparent animate-spin" />
                      Registrando...
                    </div>
                  ) : (
                    'Registrarse'
                  )}
                </button>
              </div>
            </form>

            <div className="pt-6 mt-8 border-t border-gray-700">
              <div className="text-sm text-center">
                <span className="text-gray-400">¿Ya tienes una cuenta? </span>
                <Link 
                  to="/" 
                  className="font-medium text-blue-400 transition-colors hover:text-blue-300"
                >
                  Inicia sesión aquí
                </Link>
              </div>
            </div>

            {error && (
              <div className="p-3 mt-4 border rounded-lg bg-red-500/10 border-red-500/20">
                <p className="text-sm text-center text-red-400">{error}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}