import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { auth } from '@/lib/firebase';
import { confirmPasswordReset, verifyPasswordResetCode } from 'firebase/auth';
import '@/styles/login.css';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const oobCode = searchParams.get('oobCode');
  const [isVerifying, setIsVerifying] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function verifyCode() {
      if (!oobCode) {
        setError('Link inválido');
        setIsVerifying(false);
        return;
      }

      try {
        const email = await verifyPasswordResetCode(auth, oobCode);
        setEmail(email);
      } catch (error) {
        setError('El link ha expirado o es inválido');
      } finally {
        setIsVerifying(false);
      }
    }

    verifyCode();
  }, [oobCode]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      setIsSubmitting(false);
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      setIsSubmitting(false);
      return;
    }

    try {
      if (!oobCode) throw new Error('Código inválido');
      await confirmPasswordReset(auth, oobCode, password);
      navigate('/?resetSuccess=true');
    } catch (error) {
      setError('Error al restablecer la contraseña. Por favor, intenta nuevamente.');
      setIsSubmitting(false);
    }
  }

  if (isVerifying) {
    return (
      <div className="login-container">
        <div className="background-effects" />
        <div className="flex flex-col items-center justify-center w-full max-w-md">
          <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
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
              <p className="login-subtitle text-lg">Restablecer contraseña</p>
              <p className="text-sm text-gray-400 mt-2">
                {email ? `Para la cuenta: ${email}` : 'Ingresa tu nueva contraseña'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="form-container">
              <div className="space-y-4">
                <div className="form-group">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
                    Nueva contraseña
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
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-1">
                    Confirmar contraseña
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="input-field"
                    required
                  />
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
                      Actualizando...
                    </div>
                  ) : (
                    'Actualizar contraseña'
                  )}
                </button>
              </div>
            </form>

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