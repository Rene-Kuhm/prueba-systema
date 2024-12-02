import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { auth, db } from '@/lib/firebase'
import { signOut, onAuthStateChanged } from 'firebase/auth'
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  addDoc,
  deleteDoc,
} from 'firebase/firestore'
import * as XLSX from 'xlsx'
import type { User } from '@/lib/types/firebase'

interface PendingUser {
  id: string
  email: string
  fullName: string
  role: string
  createdAt: string
}

interface Claim {
  id?: string
  phone: string
  name: string
  address: string
  reason: string
  technician?: string
  status: 'pending' | 'assigned'
  resolution?: string
  receivedBy?: string
  receivedAt?: string
}

export default function Admin() {
  const navigate = useNavigate()
  const { userProfile, setUserProfile } = useAuthStore()
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([])
  const [claims, setClaims] = useState<Claim[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newClaim, setNewClaim] = useState<Omit<Claim, 'id'>>({
    phone: '',
    name: '',
    address: '',
    reason: '',
    technician: '',
    status: 'pending',
    resolution: '',
    receivedBy: userProfile?.displayName || '',
    receivedAt: new Date().toLocaleString(),
  })
  const [editingClaim, setEditingClaim] = useState<Claim | null>(null)
  const technicians = ['René', 'Roman', 'Oscar', 'Dalmiro']

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
        } catch (err) {
          console.error('Error fetching user data:', err)
          navigate('/')
        }
      } else {
        setUserProfile(null)
        navigate('/')
      }
    })

    fetchPendingUsers()
    fetchClaims()

    return () => unsubscribe()
  }, [setUserProfile, navigate])

  async function fetchPendingUsers() {
    setLoading(true)
    try {
      const usersRef = collection(db, 'users')
      const q = query(usersRef, where('approved', '==', false))
      const querySnapshot = await getDocs(q)

      const users: PendingUser[] = []
      querySnapshot.forEach((doc) => {
        const userData = doc.data()
        users.push({
          id: doc.id,
          email: userData.email,
          fullName: userData.fullName,
          role: userData.role,
          createdAt: userData.createdAt,
        })
      })

      setPendingUsers(users)
    } catch (err) {
      console.error('Error fetching pending users:', err)
      setError('Error al cargar usuarios pendientes')
    } finally {
      setLoading(false)
    }
  }

  async function fetchClaims() {
    setLoading(true)
    try {
      const claimsRef = collection(db, 'claims')
      const querySnapshot = await getDocs(claimsRef)

      const claimsData: Claim[] = []
      querySnapshot.forEach((doc) => {
        const claimData = doc.data()
        claimsData.push({
          id: doc.id,
          phone: claimData.phone,
          name: claimData.name,
          address: claimData.address,
          reason: claimData.reason,
          technician: claimData.technician,
          status: claimData.status,
          resolution: claimData.resolution,
          receivedBy: claimData.receivedBy,
          receivedAt: claimData.receivedAt,
        })
      })

      setClaims(claimsData)
    } catch (err) {
      console.error('Error fetching claims:', err)
      setError('Error al cargar reclamos')
    } finally {
      setLoading(false)
    }
  }

  async function approveUser(userId: string) {
    try {
      const userRef = doc(db, 'users', userId)
      await updateDoc(userRef, { approved: true })
      setPendingUsers(pendingUsers.filter((user) => user.id !== userId))
    } catch (err) {
      console.error('Error approving user:', err)
      alert('Error al aprobar usuario')
    }
  }

  async function addNewClaim() {
    try {
      const claimsRef = collection(db, 'claims')
      await addDoc(claimsRef, { ...newClaim, status: 'pending' })
      setNewClaim({
        phone: '',
        name: '',
        address: '',
        reason: '',
        technician: '',
        status: 'pending',
        resolution: '',
        receivedBy: userProfile?.displayName || '',
        receivedAt: new Date().toLocaleString(),
      })
      fetchClaims()
    } catch (err) {
      console.error('Error adding new claim:', err)
      alert('Error al agregar un nuevo reclamo.')
    }
  }

  async function updateClaim(claim: Claim) {
    try {
      const claimRef = doc(db, 'claims', claim.id!)
      await updateDoc(claimRef, { ...claim })
      fetchClaims()
      setEditingClaim(null)
    } catch (err) {
      console.error('Error updating claim:', err)
      alert('Error al actualizar el reclamo.')
    }
  }

  async function deleteClaim(claimId: string) {
    try {
      const claimRef = doc(db, 'claims', claimId)
      await deleteDoc(claimRef)
      fetchClaims()
    } catch (err) {
      console.error('Error deleting claim:', err)
      alert('Error al eliminar el reclamo.')
    }
  }

  async function handleSignOut() {
    try {
      await signOut(auth)
      setUserProfile(null)
      navigate('/')
    } catch (err) {
      console.error('Error al cerrar sesión:', err)
      alert('Error al cerrar sesión. Intenta de nuevo.')
    }
  }

  async function exportClaimsToExcel() {
    try {
      const data = claims.map((claim) => ({
        Teléfono: claim.phone,
        Nombre: claim.name,
        Dirección: claim.address,
        Motivo: claim.reason,
        Técnico: claim.technician || 'No asignado',
        Estado: claim.status === 'pending' ? 'Pendiente' : 'Asignado',
        Resolución: claim.resolution || 'No resuelto',
        'Recibido por': claim.receivedBy || 'N/A',
        'Recibido en': claim.receivedAt || 'N/A',
      }))

      const worksheet = XLSX.utils.json_to_sheet(data)
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Reclamos')

      XLSX.writeFile(workbook, 'reclamos.xlsx')
    } catch (err) {
      console.error('Error exporting claims to Excel:', err)
      alert('Error al exportar los reclamos.')
    }
  }

  if (loading) return <div className='text-center'>Cargando datos...</div>

  if (error)
    return <div className='text-center text-red-500'>Error: {error}</div>

  return (
    <main className='min-h-screen bg-gray-100 dark:bg-gray-900'>
      <div className='px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8'>
        <div className='flex items-center justify-between mb-8'>
          <h1 className='text-3xl font-bold text-gray-900 dark:text-white'>
            Panel de Administración
          </h1>
          <button
            onClick={handleSignOut}
            className='px-4 py-2 text-white bg-red-600 rounded hover:bg-red-700'
          >
            Cerrar Sesión
          </button>
        </div>

        {/* Lista de usuarios pendientes */}
        <div className='p-6 mb-8 bg-white rounded-lg shadow-sm dark:bg-gray-800'>
          <h2 className='text-xl font-semibold text-gray-900 dark:text-white'>
            Usuarios Pendientes
          </h2>
          {pendingUsers.length === 0 ? (
            <p>No hay usuarios pendientes de aprobación.</p>
          ) : (
            <ul className='mt-4 space-y-4'>
              {pendingUsers.map((user) => (
                <li
                  key={user.id}
                  className='flex justify-between p-4 bg-gray-100 rounded-md dark:bg-gray-700'
                >
                  <span>
                    {user.fullName} ({user.email})
                  </span>
                  <button
                    onClick={() => approveUser(user.id)}
                    className='px-4 py-2 text-white bg-green-600 rounded-md hover:bg-green-700'
                  >
                    Aprobar
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Formulario para cargar nuevos reclamos */}
        <div className='p-6 mb-8 bg-white rounded-lg shadow-sm dark:bg-gray-800'>
          <h2 className='text-xl font-semibold text-gray-900 dark:text-white'>
            Cargar Nuevo Reclamo
          </h2>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              addNewClaim()
            }}
            className='space-y-4'
          >
            <input
              type='text'
              placeholder='Teléfono'
              value={newClaim.phone}
              onChange={(e) =>
                setNewClaim({ ...newClaim, phone: e.target.value })
              }
              className='w-full p-2 border rounded'
              required
            />
            <input
              type='text'
              placeholder='Nombre'
              value={newClaim.name}
              onChange={(e) =>
                setNewClaim({ ...newClaim, name: e.target.value })
              }
              className='w-full p-2 border rounded'
              required
            />
            <input
              type='text'
              placeholder='Dirección'
              value={newClaim.address}
              onChange={(e) =>
                setNewClaim({ ...newClaim, address: e.target.value })
              }
              className='w-full p-2 border rounded'
              required
            />
            <textarea
              placeholder='Motivo del Reclamo'
              value={newClaim.reason}
              onChange={(e) =>
                setNewClaim({ ...newClaim, reason: e.target.value })
              }
              className='w-full p-2 border rounded'
              required
            ></textarea>
            <select
              value={newClaim.technician}
              onChange={(e) =>
                setNewClaim({ ...newClaim, technician: e.target.value })
              }
              className='w-full p-2 border rounded'
            >
              <option value=''>Seleccionar Técnico</option>
              {technicians.map((technician) => (
                <option key={technician} value={technician}>
                  {technician}
                </option>
              ))}
            </select>
            <input
              type='text'
              placeholder='Recibido por'
              value={newClaim.receivedBy}
              onChange={(e) =>
                setNewClaim({ ...newClaim, receivedBy: e.target.value })
              }
              className='w-full p-2 border rounded'
              required
            />
            <input
              type='text'
              placeholder='Recibido en'
              value={newClaim.receivedAt}
              defaultValue={new Date().toLocaleString()}
              onChange={(e) =>
                setNewClaim({ ...newClaim, receivedAt: e.target.value })
              }
              className='w-full p-2 border rounded'
              required
            />
            <button
              type='submit'
              className='px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700'
            >
              Guardar Reclamo
            </button>
          </form>
        </div>

        {/* Lista de reclamos */}
        <div className='p-6 mb-8 bg-white rounded-lg shadow-sm dark:bg-gray-800'>
          <div className='flex items-center justify-between mb-4'>
            <h2 className='text-xl font-semibold text-gray-900 dark:text-white'>
              Reclamos
            </h2>
            <button
              onClick={exportClaimsToExcel}
              className='px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700'
            >
              Exportar a Excel
            </button>
          </div>
          <div className='overflow-x-auto'>
            <table className='w-full table-auto'>
              <thead>
                <tr className='bg-gray-200 dark:bg-gray-700'>
                  <th className='px-4 py-2 text-left text-gray-700 dark:text-gray-300'>
                    Teléfono
                  </th>
                  <th className='px-4 py-2 text-left text-gray-700 dark:text-gray-300'>
                    Nombre
                  </th>
                  <th className='px-4 py-2 text-left text-gray-700 dark:text-gray-300'>
                    Dirección
                  </th>
                  <th className='px-4 py-2 text-left text-gray-700 dark:text-gray-300'>
                    Motivo
                  </th>
                  <th className='px-4 py-2 text-left text-gray-700 dark:text-gray-300'>
                    Técnico
                  </th>
                  <th className='px-4 py-2 text-left text-gray-700 dark:text-gray-300'>
                    Estado
                  </th>
                  <th className='px-4 py-2 text-left text-gray-700 dark:text-gray-300'>
                    Resolución
                  </th>
                  <th className='px-4 py-2 text-left text-gray-700 dark:text-gray-300'>
                    Recibido por
                  </th>
                  <th className='px-4 py-2 text-left text-gray-700 dark:text-gray-300'>
                    Recibido en
                  </th>
                  <th className='px-4 py-2 text-left text-gray-700 dark:text-gray-300'>
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {claims.map((claim) => (
                  <tr
                    key={claim.id}
                    className='border-b border-gray-200 dark:border-gray-600'
                  >
                    <td className='px-4 py-2 text-gray-800 dark:text-gray-400'>
                      {claim.phone}
                    </td>
                    <td className='px-4 py-2 text-gray-800 dark:text-gray-400'>
                      {claim.name}
                    </td>
                    <td className='px-4 py-2 text-gray-800 dark:text-gray-400'>
                      {claim.address}
                    </td>
                    <td className='px-4 py-2 text-gray-800 dark:text-gray-400'>
                      {claim.reason}
                    </td>
                    <td className='px-4 py-2 text-gray-800 dark:text-gray-400'>
                      {claim.technician || 'No asignado'}
                    </td>
                    <td className='px-4 py-2 text-gray-800 dark:text-gray-400'>
                      {claim.status === 'pending' ? 'Pendiente' : 'Asignado'}
                    </td>
                    <td className='px-4 py-2 text-gray-800 dark:text-gray-400'>
                      {claim.resolution || 'No resuelto'}
                    </td>
                    <td className='px-4 py-2 text-gray-800 dark:text-gray-400'>
                      {claim.receivedBy || 'N/A'}
                    </td>
                    <td className='px-4 py-2 text-gray-800 dark:text-gray-400'>
                      {claim.receivedAt || 'N/A'}
                    </td>
                    <td className='px-4 py-2 text-gray-800 dark:text-gray-400'>
                      {editingClaim?.id === claim.id ? (
                        <>
                          <button
                            onClick={() => updateClaim(editingClaim!)}
                            className='px-2 py-1 mr-2 text-white bg-blue-600 rounded-md hover:bg-blue-700'
                          >
                            Guardar
                          </button>
                          <button
                            onClick={() => setEditingClaim(null)}
                            className='px-2 py-1 text-white bg-gray-600 rounded-md hover:bg-gray-700'
                          >
                            Cancelar
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => setEditingClaim(claim)}
                            className='px-2 py-1 mr-2 text-white bg-yellow-600 rounded-md hover:bg-yellow-700'
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => deleteClaim(claim.id!)}
                            className='px-2 py-1 text-white bg-red-600 rounded-md hover:bg-red-700'
                          >
                            Eliminar
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  )
}
