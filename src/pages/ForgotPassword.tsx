import React, { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'react-toastify';
import CospecLogo from '@/components/Logo/CospecLogo';
import { InputField, SubmitButton, ErrorMessage } from '@/components/common/FormComponents';

export default function ForgotPassword() {
  const { forgotPassword, loading } = useAuthStore();
  
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting || loading) return;

    setIsSubmitting(true);
    setLocalError(null);

    try {
      await forgotPassword(email);
      toast.success('Se ha enviado un correo con instrucciones para restablecer tu contraseña');
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Error al enviar el correo de recuperación');
    } finally {
      setIsSubmitting(false);
    }
  }, [email, isSubmitting, loading, forgotPassword]);

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
            Recuperar contraseña
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <InputField
                id="email"
                type="email"
                name="email"
                label="Correo electrónico"
                placeholder="ejemplo@correo.com"
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                disabled={isSubmitting}
                required
              />
            </div>

            <SubmitButton isSubmitting={isSubmitting || loading} text="Enviar correo de recuperación" />

            <div className="mt-6 text-center">
              <Link 
                to="/login"
                className="text-sm text-gray-400 transition-colors hover:text-blue-400"
              >
                Volver al inicio de sesión
              </Link>
            </div>
          </form>

          {localError && (
            <ErrorMessage message={localError} />
          )}
        </div>
      </div>
    </div>
  );
}

