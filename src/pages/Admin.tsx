import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { UserApprovalList } from '@/components/UserApprovalList'
import { auth, db } from '@/lib/firebase'
import { signOut, onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import type { User } from '@/lib/types/firebase'

export default function Admin() {
  const navigate = useNavigate()
  const { userProfile, setUserProfile } = useAuthStore()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDocRef = doc(db, 'users', firebaseUser.uid)
          const userDoc = await getDoc(userDocRef)
          if (userDoc.exists()) {
            setUserProfile({ ...firebaseUser, ...userDoc.data() } as User)
          } else {
            console.error('User document does not exist')
            navigate('/')
          }
        } catch (error) {
          console.error('Error fetching user data:', error)
          navigate('/')
        }
      } else {
        setUserProfile(null)
        navigate('/')
      }
    })

    return () => unsubscribe()
  }, [setUserProfile, navigate])

  async function handleSignOut() {
    try {
      await signOut(auth)
      setUserProfile(null)
      navigate('/')
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
      alert('Error al cerrar sesión. Intenta de nuevo.')
    }
  }

  if (!userProfile) {
    return null // Prevent rendering if userProfile is null (e.g., while redirecting)
  }

  return (
    <main className='min-h-screen bg-gray-100 dark:bg-gray-900'>
      <div className='px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8'>
        <div className='flex items-center justify-between mb-8'>
          <div>
            <h1 className='text-3xl font-bold text-gray-900 dark:text-white'>
              Panel de Administración
            </h1>
            <p className='mt-1 text-sm text-gray-500 dark:text-gray-400'>
              Bienvenido, {userProfile.displayName || 'Administrador'}
            </p>
          </div>
          <button
            onClick={handleSignOut}
            aria-label='Cerrar sesión'
            className='px-4 py-2 text-white transition-colors bg-red-600 rounded-lg hover:bg-red-700'
          >
            Cerrar Sesión
          </button>
        </div>

        <div className='p-6 bg-white rounded-lg shadow-sm dark:bg-gray-800'>
          <div className='space-y-6'>
            <div className='flex items-center justify-between'>
              <h2 className='text-xl font-semibold text-gray-900 dark:text-white'>
                Usuarios Pendientes de Aprobación
              </h2>
            </div>
            <UserApprovalList />
          </div>
        </div>
      </div>
    </main>
  )
}