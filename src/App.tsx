import React, { useEffect, useCallback, Suspense, useMemo, useRef, lazy } from 'react'
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useSearchParams,
  Navigate,
} from 'react-router-dom'
import { getToken, onMessage } from 'firebase/messaging'
import type { MessagePayload } from 'firebase/messaging'
import { ProtectedRoute } from '@/components/common/auth/ProtectedRoute'
import UnauthorizedRoute from '@/components/common/auth/UnauthorizedRoute' // Fixed import
import { debounce } from 'lodash'
import { messaging } from '@/config/firebase'
import { ToastContainer, toast } from 'react-toastify'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import 'react-toastify/dist/ReactToastify.css'

// Importaciones directas
const Login = lazy(() => import('@/pages/Login'))
const Signup = lazy(() => import('@/pages/Signup'))
const ForgotPassword = lazy(() => import('@/pages/ForgotPassword'))
const ResetPassword = lazy(() => import('@/pages/ResetPassword'))
const Dashboard = lazy(() => import('@/pages/Dashboard'))
const AdminRoutes = lazy(() => import('@/routes/AdminRoutes'))
const TechnicianRoutes = lazy(() => import('@/routes/TechnicianRoutes'))

// Types
interface NotificationButtonProps {
  onClick: () => void;
}

// Componentes
const LoadingSpinner = () => (
  <div className='min-h-screen flex items-center justify-center'>
    <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500'></div>
  </div>
)

const AuthAction: React.FC = () => {
  const [searchParams] = useSearchParams()
  const mode = searchParams.get('mode')

  switch (mode) {
    case 'resetPassword':
      return <ResetPassword />
    default:
      return <Navigate to='/' replace />
  }
}

const NotFound: React.FC = () => (
  <div className='min-h-screen flex items-center justify-center'>
    <div className='text-center'>
      <h1 className='text-4xl font-bold text-red-500 mb-4'>404</h1>
      <p className='text-xl text-gray-600'>Página no encontrada</p>
    </div>
  </div>
)

const NotificationButton: React.FC<NotificationButtonProps> = React.memo(
  ({ onClick }) => (
    <button
      onClick={onClick}
      className='fixed bottom-4 right-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 transition-colors'
      type='button'
    >
      Activar Notificaciones
    </button>
  ),
)

const AppContent: React.FC = () => {
  const { isLoading, currentUser } = useAuth()
  const serviceWorkerRegistered = useRef(false)
  const authLogged = useRef(false)

  const registerSW = async () => {
    // Only register SW in production or if explicitly enabled in development
    if (process.env.NODE_ENV !== 'production' && !import.meta.env.VITE_ENABLE_SW) {
      console.log('Service Worker disabled in development');
      return;
    }
  
    try {
      if ('serviceWorker' in navigator) {
        // Unregister any existing service workers first
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map(registration => registration.unregister()));
  
        // Register new service worker
        const registration = await navigator.serviceWorker.register('/service-worker.js', {
          scope: '/',
          type: 'classic'
        });
  
        // Ensure the service worker is activated
        if (registration.active) {
          console.log('Service Worker already active');
        } else {
          registration.addEventListener('activate', () => {
            console.log('Service Worker activated');
          });
        }
      }
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  };

  useEffect(() => {
    registerSW();
  }, []);

  useEffect(() => {
    if (!authLogged.current && (currentUser?.email || !isLoading)) {
      if (process.env.NODE_ENV === 'development') {
        console.log('Estado de autenticación:', {
          isLoading,
          currentUser: currentUser?.email || null
        })
      }
      authLogged.current = true
    }
  }, [isLoading, currentUser])

  // Memoize notification permission callback
  const requestNotificationPermission = useMemo(
    () =>
      debounce(async () => {
        try {
          if (!('Notification' in window)) {
            toast.error('Este navegador no soporta notificaciones')
            return
          }

          const permission = await Notification.requestPermission()

          if (permission === 'granted') {
            if (!messaging) {
              toast.error('Firebase messaging no está inicializado')
              return
            }

            try {
              const token = await getToken(messaging, {
                vapidKey: import.meta.env.VITE_FIREBASE_PUSH_PUBLIC_KEY,
              })

              if (token) {
                console.log('Token FCM:', token)
                toast.success('¡Notificaciones activadas con éxito!')
              } else {
                toast.error('No se pudo obtener el token de notificación')
              }
            } catch (fcmError) {
              console.error('Error de token FCM:', fcmError)
              toast.error('Error al configurar las notificaciones')
            }
          } else {
            toast.warning('Permiso de notificación denegado')
          }
        } catch (error) {
          console.error('Error al solicitar permiso de notificación:', error)
          toast.error('Error al activar las notificaciones')
        }
      }, 500),
    [],
  )

  useEffect(() => {
    if (!messaging) return

    const unsubscribe = onMessage(messaging, (payload: MessagePayload) => {
      console.log('Mensaje recibido en primer plano:', payload)
      if (payload.notification?.title) {
        toast(payload.notification.title)
      }
    })

    return () => unsubscribe()
  }, [])

  // Renderizar el LoadingSpinner mientras se carga la autenticación
  if (isLoading) {
    return <LoadingSpinner />
  }

  return (
    <Router>
      <div className='min-h-screen bg-gray-50'>
        <ToastContainer
          position='top-right'
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme='light'
          limit={3}
        />

        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            {/* Ruta raíz siempre redirige a login */}
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* Rutas públicas */}
            <Route path="/login" element={
              <UnauthorizedRoute>
                <Login />
              </UnauthorizedRoute>
            } />
            <Route path="/signup" element={
              <UnauthorizedRoute>
                <Signup />
              </UnauthorizedRoute>
            } />
            <Route path="/forgot-password" element={
              <UnauthorizedRoute>
                <ForgotPassword />
              </UnauthorizedRoute>
            } />

            {/* Rutas protegidas */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Navigate to={currentUser?.role ? `/${currentUser.role}` : '/login'} replace />
              </ProtectedRoute>
            } />

            {/* Rutas específicas por rol */}
            <Route path="/admin/*" element={
              <ProtectedRoute role="admin">
                <AdminRoutes />
              </ProtectedRoute>
            } />
            <Route path="/technician/*" element={
              <ProtectedRoute role="technician">
                <TechnicianRoutes />
              </ProtectedRoute>
            } />

            {/* Ruta 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>

        {Notification.permission !== 'granted' && currentUser && (
          <NotificationButton onClick={requestNotificationPermission} />
        )}
      </div>
    </Router>
  )
}

const App: React.FC = () => (
  <Suspense fallback={<LoadingSpinner />}>
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  </Suspense>
)

export default App
