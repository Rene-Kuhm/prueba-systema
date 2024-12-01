import { useState, useEffect } from 'react'
import { db } from '@/lib/firebase'
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore'
import { formatDate } from '@/utils/date'

interface FirebaseUser {
  id: string
  name: string
  email: string
  role: string
  createdAt: string
  updatedAt: string
  approved: boolean
}

export function UserApprovalList() {
  const [pendingUsers, setPendingUsers] = useState<FirebaseUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchPendingUsers()
  }, [])

  async function fetchPendingUsers() {
    setLoading(true)
    setError(null)
    try {
      const usersRef = collection(db, 'users')
      const q = query(usersRef, where('approved', '==', false))
      const querySnapshot = await getDocs(q)

      const users: FirebaseUser[] = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data() as Omit<FirebaseUser, 'id'>
      }))

      setPendingUsers(users)
    } catch (error) {
      setError('Error fetching users. Please try again.')
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  async function approveUser(userId: string) {
    try {
      const userRef = doc(db, 'users', userId)
      await updateDoc(userRef, { approved: true })

      setPendingUsers((users) => users.filter((user) => user.id !== userId))
    } catch (error) {
      console.error('Error:', error)
      alert('Error approving user')
    }
  }

  if (loading) {
    return (
      <div className='py-8 text-center'>
        <p className='text-gray-500 dark:text-gray-400'>Loading users...</p>
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
          No pending users to approve
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
              Name
            </th>
            <th className='px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-300'>
              Email
            </th>
            <th className='px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-300'>
              Role
            </th>
            <th className='px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-300'>
              Registration Date
            </th>
            <th className='px-6 py-3 text-xs font-medium tracking-wider text-right text-gray-500 uppercase dark:text-gray-300'>
              Actions
            </th>
          </tr>
        </thead>
        <tbody className='bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700'>
          {pendingUsers.map((user) => (
            <tr key={user.id}>
              <td className='px-6 py-4 text-sm text-gray-900 whitespace-nowrap dark:text-white'>
                {user.name}
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
                  {user.role === 'admin' ? 'Admin' : 'Technician'}
                </span>
              </td>
              <td className='px-6 py-4 text-sm text-gray-900 whitespace-nowrap dark:text-white'>
                {formatDate(new Date(user.createdAt))}
              </td>
              <td className='px-6 py-4 text-sm font-medium text-right whitespace-nowrap'>
                <button
                  onClick={() => approveUser(user.id)}
                  className='font-medium text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300'
                  aria-label={`Approve user ${user.name}`}
                >
                  Approve
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}