import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'react-toastify';
import { auth, db } from '@/config/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import CospecLogo from '../components/Logo/CospecLogo';
import '../styles/login.css';

export default function Login() {
  const navigate = useNavigate();
  const { signIn, error: authError, loading } = useAuthStore();
  const [searchParams] = useSearchParams();
  const resetSuccess = searchParams.get('resetSuccess');
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    selectedRole: 'technician' as 'admin' | 'technician'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (authError) {
      setLocalError(authError);
      setIsSubmitting(false);
      toast.error(authError);
    }
  }, [authError]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleLoginSuccess = useCallback((role: 'admin' | 'technician') => {
    navigate(`/${role}`, { replace: true });
  }, [navigate]);

  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting || loading) return;

    setIsSubmitting(true);
    setLocalError(null);

    try {
      const result = await signIn(formData.email, formData.password, formData.selectedRole);
      
      if (!result?.user?.uid) {
        throw new Error('Error al iniciar sesión');
      }

      // Verificar si el usuario está aprobado
      const userDoc = await getDoc(doc(db, 'users', result.user.uid));
      const userData = userDoc.data();

      if (!userData?.approved) {
        await auth.signOut();
        throw new Error('Tu cuenta está pendiente de aprobación por un administrador.');
      }

      // Si está aprobado, actualizar último login
      await setDoc(doc(db, 'users', result.user.uid), {
        lastLogin: new Date().toISOString()
      }, { merge: true });

      handleLoginSuccess(formData.selectedRole);
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Error al iniciar sesión');
      toast.error(err instanceof Error ? err.message : 'Error al iniciar sesión');
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, isSubmitting, loading, signIn, handleLoginSuccess]);

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gray-900">
      <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900" />
      
      <div className="relative z-10 flex flex-col items-center w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="flex items-center justify-center gap-3 mb-4 text-4xl font-bold tracking-tight text-white">
            <CospecLogo />
            <span className="cospec">Cospec</span>
          </h1>
          <div className="w-20 h-1 mx-auto rounded-full bg-gradient-to-r from-blue-500 to-purple-500" />
        </div>

        <div className="w-full p-6 bg-gray-800 border border-gray-700 shadow-xl rounded-xl">
          <p className="mb-6 text-lg text-center text-gray-300">
            Ingresa para continuar
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <InputField
                id="email"
                type="email"
                name="email"
                label="Correo electrónico"
                placeholder="ejemplo@correo.com"
                value={formData.email}
                onChange={handleInputChange}
                disabled={isSubmitting}
                required
              />
              <InputField
                id="password"
                type="password"
                name="password"
                label="Contraseña"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleInputChange}
                disabled={isSubmitting}
                required
              />
              <SelectField
                id="role"
                name="selectedRole"
                label="Rol"
                value={formData.selectedRole}
                onChange={handleInputChange}
                disabled={isSubmitting}
                options={[
                  { value: 'technician', label: 'Técnico' },
                  { value: 'admin', label: 'Administrador' }
                ]}
              />
            </div>

            <SubmitButton isSubmitting={isSubmitting || loading} />

            <div className="mt-6 space-y-2 text-center">
              <Link 
                to="/forgot-password"
                className="block text-sm text-gray-400 transition-colors hover:text-blue-400"
              >
                ¿Olvidaste tu contraseña?
              </Link>
              <p className="text-sm text-gray-400">
                ¿No tienes una cuenta?{' '}
                <Link 
                  to="/signup"
                  className="text-blue-400 hover:text-blue-300"
                >
                  Regístrate aquí
                </Link>
              </p>
            </div>
          </form>

          {resetSuccess && (
            <SuccessMessage message="Tu contraseña ha sido actualizada exitosamente" />
          )}

          {localError && (
            <ErrorMessage message={localError} />
          )}
        </div>
      </div>
    </div>
  );
}

const InputField = React.memo(({ id, type, name, label, placeholder, value, onChange, disabled, required }: {
  id: string;
  type: string;
  name: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled: boolean;
  required: boolean;
}) => (
  <div className="space-y-1">
    <label htmlFor={id} className="block text-sm font-medium text-gray-300">
      {label}
    </label>
    <input
      id={id}
      type={type}
      name={name}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className="w-full px-4 py-2 text-white placeholder-gray-400 transition-colors bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
      required={required}
      disabled={disabled}
      autoComplete={type === 'email' ? 'email' : type === 'password' ? 'current-password' : undefined}
    />
  </div>
));
InputField.displayName = 'InputField';

const SelectField = React.memo(({ id, name, label, value, onChange, disabled, options }: {
  id: string;
  name: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  disabled: boolean;
  options: { value: string; label: string }[];
}) => (
  <div className="space-y-1">
    <label htmlFor={id} className="block text-sm font-medium text-gray-300">
      {label}
    </label>
    <select
      id={id}
      name={name}
      value={value}
      onChange={onChange}
      className="w-full px-4 py-2 text-white transition-colors bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
      disabled={disabled}
    >
      {options.map(option => (
        <option key={option.value} value={option.value}>{option.label}</option>
      ))}
    </select>
  </div>
));
SelectField.displayName = 'SelectField';

const SubmitButton = React.memo(({ isSubmitting }: { isSubmitting: boolean }) => (
  <div className="mt-8">
    <button
      type="submit"
      disabled={isSubmitting}
      className="w-full px-6 py-3 font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isSubmitting ? (
        <div className="flex items-center justify-center">
          <div className="w-5 h-5 mr-2 border-2 border-white rounded-full border-t-transparent animate-spin" />
          Ingresando...
        </div>
      ) : (
        'Ingresar'
      )}
    </button>
  </div>
));
SubmitButton.displayName = 'SubmitButton';

const SuccessMessage = React.memo(({ message }: { message: string }) => (
  <div className="p-3 mt-4 border rounded-lg bg-green-500/10 border-green-500/20">
    <p className="text-sm text-center text-green-400">{message}</p>
  </div>
));
SuccessMessage.displayName = 'SuccessMessage';

const ErrorMessage = React.memo(({ message }: { message: string }) => (
  <div className="p-3 mt-4 border rounded-lg bg-red-500/10 border-red-500/20">
    <p className="text-sm text-center text-red-400">{message}</p>
  </div>
));
ErrorMessage.displayName = 'ErrorMessage';
