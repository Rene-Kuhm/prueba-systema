import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import '../styles/login.css';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { toast } from 'react-toastify';

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
      toast.error(error);
    }
  }, [error]);

  const setupFirebaseMessaging = async (userId: string) => {
    try {
      const messaging = getMessaging();

      // Verificar soporte de notificaciones
      if (!('Notification' in window)) {
        console.log('Este navegador no soporta notificaciones');
        toast.warning('Tu navegador no soporta notificaciones');
        return false;
      }

      // Verificar permiso actual
      let permission = Notification.permission;
      if (permission === 'default') {
        permission = await Notification.requestPermission();
      }

      if (permission !== 'granted') {
        console.log('Permiso de notificación denegado');
        toast.warning('Se requiere permiso para recibir notificaciones');
        return false;
      }

      // Manejar mensajes en primer plano
      onMessage(messaging, (payload) => {
        console.log('Mensaje recibido en primer plano:', payload);
        
        // Obtener los datos del reclamo de la carga útil
        const { claimId, customerName, claimDescription, receivedBy, receivedAt } = payload.data as {
          claimId?: string;
          customerName?: string;
          claimDescription?: string;
          receivedBy?: string;
          receivedAt?: string;
        };
        
        // Mostrar notificación usando toast
        toast.info(
          ({ closeToast }) => (
            <div 
              className="cursor-pointer"
              onClick={() => {
                closeToast();
                window.location.href = "https://www.tdpblog.com.ar";
              }}
            >
              <div className="font-bold text-lg mb-2">{payload.notification?.title}</div>
              <p className="text-sm">{payload.notification?.body}</p>
              {customerName && (
                <p className="text-sm mt-1">Cliente: {customerName}</p>
              )}
              {claimDescription && (
                <p className="text-sm mt-1">Descripción: {claimDescription}</p>
              )}
              {receivedBy && (
                <p className="text-sm mt-1">Recibido por: {receivedBy}</p>
              )}
              {receivedAt && (
                <p className="text-sm mt-1">Recibido en: {receivedAt}</p>
              )}
            </div>
          ),
          {
            autoClose: false,
            closeOnClick: false,
            draggable: false,
            position: "bottom-right",
            className: "bg-blue-500 text-white p-4 rounded-lg shadow-lg",
            bodyClassName: "text-sm",
            progressClassName: "bg-blue-700",
          }
        );
      
        // Reproducir sonido de notificación
        try {
          const audio = new Audio('/assets/notification.mp3');
          audio.volume = 0.5; // Reducir volumen al 50%
          const playPromise = audio.play();
          
          if (playPromise !== undefined) {
            playPromise
              .then(() => {
                // La reproducción se inició correctamente
                console.log('Sonido de notificación reproducido');
              })
              .catch(error => {
                console.log('Error al reproducir sonido:', error);
              });
          }
        } catch (error) {
          console.log('Error al inicializar el sonido:', error);
        }
      });

      // Obtener el token del dispositivo automáticamente
      const token = await getDeviceToken();

      if (!token) {
        console.error('No se pudo obtener el token FCM');
        toast.error('Error al configurar las notificaciones');
        return false;
      }

      console.log('Token de FCM obtenido:', token);

      // Guardar datos del usuario
      const userData = {
        role: selectedRole,
        email,
        fcmToken: token,
        lastLogin: new Date().toISOString(),
        lastTokenUpdate: new Date().toISOString(),
        userId,
        fullName: userProfile?.displayName || email.split('@')[0],
        active: true
      };

      await setDoc(doc(db, 'users', userId), userData, { merge: true });

      // Verificar que se guardó correctamente
      const verifyDoc = await getDoc(doc(db, 'users', userId));
      const verifyData = verifyDoc.data();

      if (!verifyData?.fcmToken) {
        throw new Error('Error al guardar el token');
      }

      console.log('Datos de usuario actualizados en Firestore');
      toast.success('Notificaciones configuradas correctamente');
      return true;

    } catch (error) {
      console.error('Error configurando Firebase Messaging:', error);
      toast.error('Error al configurar las notificaciones');
      return false;
    }
  };

  // Obtener el token del dispositivo automáticamente
  const getDeviceToken = async () => {
    try {
      const messaging = getMessaging();
      const currentToken = await getToken(messaging, {
        vapidKey: import.meta.env.VITE_FIREBASE_PUSH_PUBLIC_KEY,
      });

      if (currentToken) {
        console.log('Token de registro:', currentToken);
        // Enviar el token al servidor para almacenarlo y usarlo posteriormente
        await sendTokenToServer(currentToken);
        return currentToken;
      } else {
        console.log('No se pudo obtener el token de registro');
        return null;
      }
    } catch (error) {
      console.log('Error al obtener el token de registro:', error);
      return null;
    }
  };

  // Enviar el token al servidor
  const sendTokenToServer = async (token: string) => {
    try {
      // Aquí puedes hacer una solicitud HTTP para enviar el token al servidor
      // y almacenarlo asociado al usuario o dispositivo correspondiente
      // Ejemplo:
      const response = await fetch('/api/save-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      if (response.ok) {
        console.log('Token enviado al servidor correctamente');
      } else {
        console.log('Error al enviar el token al servidor');
      }
    } catch (error) {
      console.log('Error al enviar el token al servidor:', error);
    }
  };

  useEffect(() => {
    const handleUserLogin = async () => {
      if (userProfile && userProfile.uid && isSubmitting) {
        try {
          const notificationsConfigured = await setupFirebaseMessaging(userProfile.uid);
          if (!notificationsConfigured) {
            console.warn('Notificaciones no configuradas correctamente');
          }
        } catch (error) {
          console.error('Error en la configuración de notificaciones:', error);
        } finally {
          console.log('Navegando a:', `/${selectedRole}`);
          navigate(`/${selectedRole}`);
          setIsSubmitting(false);
        }
      } else if (userProfile && !isSubmitting) {
        navigate(`/${selectedRole}`);
      }
    };

    handleUserLogin();
  }, [userProfile, isSubmitting, email, selectedRole, navigate]);

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
      toast.success('Inicio de sesión exitoso');
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