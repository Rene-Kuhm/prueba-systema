import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthLayout } from '@/components/AuthLayout'
import { auth, db } from '@/lib/firebase'
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { doc, setDoc, getDoc } from 'firebase/firestore'

export default function Signup() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [role, setRole] = useState<'admin' | 'technician'>('technician')
  const [success, setSuccess] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function signUp(
    email: string,
    password: string,
    fullName: string,
    role: 'admin' | 'technician',
  ) {
    try {
      if (!email || !password || !fullName || !role) {
        throw new Error('Todos los campos son requeridos')
      }

      if (password.length < 6) {
        throw new Error('La contraseña debe tener al menos 6 caracteres')
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      await updateProfile(user, { displayName: fullName })

      await setDoc(doc(db, 'users', user.uid), {
        email,
        fullName,
        role,
        approved: false,
        createdAt: new Date().toISOString(),
      })

      setSuccess(true)
    } catch (error) {
      console.error('Error en el proceso de registro:', error)
      setError(error instanceof Error ? error.message : 'Error en el registro')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      await signUp(email, password, fullName, role)
      navigate(`/`)
    } catch {
      // Error is handled in the signUp function
    }
  }

  if (success) {
    return (
      <AuthLayout title='COSPEC'>
        <div className='space-y-6 text-center' aria-live='polite'>
          <h2 className='text-2xl font-semibold text-blue-300'>
            ¡Registro Exitoso!
          </h2>
          <p className='text-blue-200'>
            Tu cuenta ha sido creada y está pendiente de aprobación por un
            administrador. Te notificaremos por email cuando tu cuenta sea
            activada.
          </p>
          <Link
            to='/'
            className='inline-block w-full py-2.5 px-4 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-medium text-center transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]'
            aria-label='Volver al Login'
          >
            Volver al Login
          </Link>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout title='Registro'>
      <form onSubmit={handleSubmit} className='space-y-6'>
        <div>
          <label htmlFor='email' className='block font-medium text-gray-300'>
            Correo Electrónico
          </label>
          <input
            type='email'
            id='email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
          />
        </div>
        <div>
          <label htmlFor='password' className='block font-medium text-gray-300'>
            Contraseña
          </label>
          <input
            type='password'
            id='password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
          />
        </div>
        <div>
          <label htmlFor='fullName' className='block font-medium text-gray-300'>
            Nombre Completo
          </label>
          <input
            type='text'
            id='fullName'
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
          />
        </div>
        <div>
          <label htmlFor='role' className='block font-medium text-gray-300'>
            Rol
          </label>
          <select
            id='role'
            value={role}
            onChange={(e) => setRole(e.target.value as 'admin' | 'technician')}
            className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
          >
            <option value='technician'>Técnico</option>
            <option value='admin'>Administrador</option>
          </select>
        </div>
        <button
          type='submit'
          disabled={isSubmitting}
          className='inline-block w-full py-2.5 px-4 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-medium text-center transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]'
        >
          {isSubmitting ? 'Registrando...' : 'Registrarse'}
        </button>
        {error && <div className='font-medium text-red-500'>{error}</div>}
      </form>
    </AuthLayout>
  )
}

function ProtectedComponent() {
  const [userRole, setUserRole] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkUserRole = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUserRole(userData.role);
          
          if (userData.role !== 'admin' && userData.role !== 'technician') {
            navigate('/acceso-denegado');
          }
        } else {
          navigate('/acceso-denegado');
        }
      } else {
        navigate('/login');
      }
    };

    checkUserRole();
  }, [navigate]);

  if (!userRole) {
    return <div>Cargando...</div>;
  }

  return (
    <div>
      <h1>Bienvenido, {userRole}</h1>
    </div>
  );
}

function AccesoDenegado() {
  return (
    <div>
      <h1>Acceso Denegado</h1>
      <p>No tienes los permisos necesarios para acceder a esta página.</p>
      <p>Si crees que esto es un error, por favor contacta al administrador.</p>
      <Link to="/">Volver a la página principal</Link>
    </div>
  );
}

export { ProtectedComponent, AccesoDenegado }