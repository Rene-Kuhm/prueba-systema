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
import { Dialog, Transition } from '@headlessui/react'
import { Fragment } from 'react'

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
  const [showModal, setShowModal] = useState(false)
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null)
  const [_editingClaim, setEditingClaim] = useState<Claim | null>(null)
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

  // @ts-ignore: to be used in upcoming feature
  async function _updateClaim(claim: Claim) {
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
        <div className='p-4 mb-8 bg-white rounded-lg shadow-sm md:p-6 dark:bg-gray-800'>
          <div className='flex flex-col mb-4 md:flex-row md:items-center md:justify-between'>
            <h2 className='mb-2 text-xl font-semibold text-gray-900 dark:text-white md:mb-0'>
              Reclamos
            </h2>
            <button
              onClick={exportClaimsToExcel}
              className='w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 md:w-auto'
            >
              Exportar a Excel
            </button>
          </div>
          <div className='-mx-4 overflow-x-auto md:mx-0'>
            <table className='w-full table-auto'>
              <thead className='bg-gray-200 dark:bg-gray-700'>
                <tr>
                  {[
                    'Teléfono',
                    'Nombre',
                    'Dirección',
                    'Motivo',
                    'Técnico',
                    'Estado',
                    'Resolución',
                    'Recibido por',
                    'Recibido en',
                    'Acciones',
                  ].map((header) => (
                    <th
                      key={header}
                      className='px-4 py-2 text-sm text-left text-gray-700 dark:text-gray-300 md:text-base'
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {claims.map((claim) => (
                  <tr
                    key={claim.id}
                    className='border-b border-gray-200 dark:border-gray-600'
                  >
                    {[
                      'phone',
                      'name',
                      'address',
                      'reason',
                      'technician',
                      'status',
                      'resolution',
                      'receivedBy',
                      'receivedAt',
                    ].map((field) => (
                      <td
                        key={field}
                        className='px-4 py-2 text-sm text-gray-800 dark:text-gray-400 md:text-base'
                      >
                        {field === 'status' ? (
                          <span
                            className={`${
                              claim.status === 'pending'
                                ? 'text-yellow-600 dark:text-yellow-400'
                                : 'text-green-600 dark:text-green-400'
                            }`}
                          >
                            {claim.status === 'pending'
                              ? 'Pendiente'
                              : 'Completado'}
                          </span>
                        ) : field === 'technician' ? (
                          claim[field] || 'No asignado'
                        ) : field === 'resolution' ? (
                          claim[field] || 'No resuelto'
                        ) : (
                          claim[field as keyof Claim] || 'N/A'
                        )}
                      </td>
                    ))}
                    <td className='px-4 py-2 text-gray-800 dark:text-gray-400'>
                      <div className='flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2'>
                        <button
                          onClick={() => {
                            if (claim.id) {
                              setShowModal(true)
                              setSelectedClaim(claim)
                            }
                          }}
                          className='px-2 py-1 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 md:text-base'
                        >
                          Detalles
                        </button>
                        <button
                          onClick={() => deleteClaim(claim.id!)}
                          className='px-2 py-1 text-sm text-white bg-red-600 rounded-md hover:bg-red-700 md:text-base'
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Modal para los detalles del reclamo */}
          <Transition.Root show={showModal} as={Fragment}>
            <Dialog as='div' className='relative z-10' onClose={setShowModal}>
              <Transition.Child
                as={Fragment}
                enter='ease-out duration-300'
                enterFrom='opacity-0'
                enterTo='opacity-100'
                leave='ease-in duration-200'
                leaveFrom='opacity-100'
                leaveTo='opacity-0'
              >
                <div className='fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75' />
              </Transition.Child>

              <div className='fixed inset-0 z-10 overflow-y-auto'>
                <div className='flex items-end justify-center min-h-full p-4 text-center sm:items-center sm:p-0'>
                  <Transition.Child
                    as={Fragment}
                    enter='ease-out duration-300'
                    enterFrom='opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95'
                    enterTo='opacity-100 translate-y-0 sm:scale-100'
                    leave='ease-in duration-200'
                    leaveFrom='opacity-100 translate-y-0 sm:scale-100'
                    leaveTo='opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95'
                  >
                    <Dialog.Panel className='relative w-full max-w-lg px-4 pt-5 pb-4 overflow-hidden text-left transition-all transform bg-white rounded-lg shadow-xl dark:bg-gray-800 sm:my-8 sm:w-full sm:max-w-lg sm:p-6'>
                      <div>
                        <div className='mt-3 text-center sm:mt-0 sm:text-left'>
                          <Dialog.Title
                            as='h3'
                            className='text-lg font-medium leading-6 text-gray-900 dark:text-white'
                          >
                            Detalles del Reclamo
                          </Dialog.Title>
                          <div className='mt-4'>
                            <div className='space-y-4'>
                              <div>
                                <label className='block text-sm font-medium text-gray-700 dark:text-gray-400'>
                                  Técnico Asignado
                                </label>
                                <input
                                  type='text'
                                  value={selectedClaim?.technician || ''}
                                  readOnly
                                  className='block w-full mt-1 bg-gray-100 border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm'
                                />
                              </div>
                              <div>
                                <label className='block text-sm font-medium text-gray-700 dark:text-gray-400'>
                                  Descripción de la Resolución
                                </label>
                                <textarea
                                  value={
                                    selectedClaim?.resolution || 'No resuelto'
                                  }
                                  readOnly
                                  className='block w-full mt-1 bg-gray-100 border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm'
                                  rows={3}
                                ></textarea>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className='mt-5 sm:mt-6'>
                        <button
                          type='button'
                          className='inline-flex justify-center w-full px-4 py-2 text-base font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:text-sm'
                          onClick={() => setShowModal(false)}
                        >
                          Cerrar
                        </button>
                      </div>
                    </Dialog.Panel>
                  </Transition.Child>
                </div>
              </div>
            </Dialog>
          </Transition.Root>
        </div>
      </div>
    </main>
  )
}
