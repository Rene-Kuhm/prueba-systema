import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { auth } from '@/lib/firebase';
import { sendPasswordResetEmail } from 'firebase/auth';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess(true);
    } catch (err) {
      console.error('Error al enviar el correo de recuperación:', err);
      setError('Error al enviar el correo de recuperación. Por favor, verifica el correo e intenta nuevamente.');
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
              <p className="login-subtitle text-lg">Recuperar contraseña</p>
              <p className="text-sm text-gray-400 mt-2">
                Ingresa tu correo electrónico y te enviaremos instrucciones para restablecer tu contraseña.
              </p>
            </div>

            {success ? (
              <div className="mt-6">
                <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                  <p className="text-sm text-green-400 text-center">
                    Se ha enviado un correo con las instrucciones para restablecer tu contraseña.
                  </p>
                </div>
                <div className="mt-6 text-center">
                  <Link 
                    to="/" 
                    className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
                  >
                    Volver al inicio de sesión
                  </Link>
                </div>
              </div>
            ) : (
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
                        Enviando...
                      </div>
                    ) : (
                      'Enviar instrucciones'
                    )}
                  </button>
                </div>

                <div className="mt-6 text-center">
                  <Link 
                    to="/" 
                    className="text-sm text-gray-400 hover:text-blue-400 transition-colors"
                  >
                    Volver al inicio de sesión
                  </Link>
                </div>
              </form>
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