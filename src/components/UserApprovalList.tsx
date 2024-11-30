import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { formatDate } from '@/utils/date'
import type { Profile } from '@/lib/types/supabase'

// Interfaz para los datos como vienen de la base de datos
interface DatabaseProfile extends Omit<Profile, 'email'> {
  email: { email: string }[] | null
}

// Interfaz para el usuario procesado
interface ProcessedProfile extends Omit<Profile, 'email'> {
  email: string
}

export function UserApprovalList() {
  const [pendingUsers, setPendingUsers] = useState<ProcessedProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchPendingUsers()
  }, [])

  async function fetchPendingUsers() {
    setLoading(true)
    setError(null)
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(
          'id, full_name, role, created_at, updated_at, approved, email:users(email)',
        )
        .eq('approved', false)
        .order('created_at', { ascending: false })

      if (error) {
        throw error
      }

      if (data) {
        // Procesar los datos para que coincidan con ProcessedProfile
        const processedUsers: ProcessedProfile[] = (
          data as DatabaseProfile[]
        ).map((user) => ({
          ...user,
          email: user.email?.[0]?.email || 'N/A',
        }))

        setPendingUsers(processedUsers)
      }
    } catch (error) {
      setError('Error fetching users. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function approveUser(userId: string) {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ approved: true })
        .eq('id', userId)

      if (error) throw error

      setPendingUsers((users) => users.filter((user) => user.id !== userId))
    } catch (error) {
      console.error('Error:', error)
      alert('Error al aprobar usuario')
    }
  }

  if (loading) {
    return (
      <div className='py-8 text-center'>
        <p className='text-gray-500 dark:text-gray-400'>Cargando usuarios...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className='py-8 text-center'>
        <p className='text-red-500 dark:text-red-400'>{error}</p>
      </div>
    )
  }

  if (pendingUsers.length === 0) {
    return (
      <div className='py-8 text-center'>
        <p className='text-gray-500 dark:text-gray-400'>
          No hay usuarios pendientes de aprobación
        </p>
      </div>
    )
  }

  return (
    <div className='overflow-x-auto'>
      <table className='min-w-full divide-y divide-gray-200 dark:divide-gray-700'>
        <thead className='bg-gray-50 dark:bg-gray-800'>
          <tr>
            <th className='px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-300'>
              Nombre
            </th>
            <th className='px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-300'>
              Email
            </th>
            <th className='px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-300'>
              Rol
            </th>
            <th className='px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-300'>
              Fecha de Registro
            </th>
            <th className='px-6 py-3 text-xs font-medium tracking-wider text-right text-gray-500 uppercase dark:text-gray-300'>
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className='bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700'>
          {pendingUsers.map((user) => (
            <tr key={user.id}>
              <td className='px-6 py-4 text-sm text-gray-900 whitespace-nowrap dark:text-white'>
                {user.full_name}
              </td>
              <td className='px-6 py-4 text-sm text-gray-900 whitespace-nowrap dark:text-white'>
                {user.email}
              </td>
              <td className='px-6 py-4 text-sm whitespace-nowrap'>
                <span
                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    user.role === 'admin'
                      ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                      : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                  }`}
                >
                  {user.role === 'admin' ? 'Administrador' : 'Técnico'}
                </span>
              </td>
              <td className='px-6 py-4 text-sm text-gray-900 whitespace-nowrap dark:text-white'>
                {formatDate(new Date(user.created_at || ''))}
              </td>
              <td className='px-6 py-4 text-sm font-medium text-right whitespace-nowrap'>
                <button
                  onClick={() => approveUser(user.id)}
                  className='font-medium text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300'
                  aria-label={`Approve user ${user.full_name}`}
                >
                  Aprobar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
