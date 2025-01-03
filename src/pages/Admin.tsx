import { useState, useEffect } from 'react'
import { AdminLayout } from '@/components/Admin/Layout/AdminLayout'
import { DashboardCard } from '@/components/Admin/Dashboard/DashboardCard'
import { Header } from '@/components/Admin/Header'
import { PendingUsers } from '@/components/Admin/PendingUsers'
import ClaimForm from '@/components/Admin/ClaimForm/ClaimForm'
import ClaimTableContainer from '@/components/Admin/ClaimTable/ClaimTableContainer'
import ClaimDetailsModal from '@/components/Admin/ClaimTableDetails/ClaimDetailsModal'
import { Notification } from '@/lib/types/notifications'
import { Claim, NewClaim } from '@/lib/types/admin'
import { useAdmin } from '@/hooks/useAdmin'
import { Wrench, FileText, Users, Calendar } from 'lucide-react' // Add this import
import { collection, getDocs, onSnapshot } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { toast } from 'react-toastify'

const initialClaim: NewClaim = {
  id: '',
  name: '',
  phone: '',
  address: '',
  reason: '',
  technicianId: '',
  receivedBy: '',
  receivedAt: new Date().toLocaleString('es-AR'),
  status: 'pending',
  title: '',
  customer: '',
  date: new Date().toLocaleString('es-AR'),
  resolution: '',
  technicalDetails: '',
  notes: '',
  notificationSent: false,
  description: '',
  createdAt: new Date().toISOString(),
  claimType: '',           // Add this
  claimAmount: 0,          // Add this
  updatedAt: new Date().toISOString()  // Add this
}

// Add loading and error states
const LoadingState = () => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900">
    <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900" />
    
    <div className="relative z-10 flex flex-col items-center space-y-4">
      {/* Texto Cospec estilizado */}
      <h1 className="text-4xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
        Cospec
      </h1>

      {/* Spinner pequeño debajo del texto */}
      <div className="w-6 h-6 mt-4 rounded-full border-3 border-blue-500/30 border-t-blue-500 animate-spin" />
    </div>
  </div>
);

const ErrorState = ({ message }: { message: string }) => (
  <div className='flex items-center justify-center h-screen'>
    <div>Error: {message}</div>
  </div>
)

// Add dashboard stats type and initial state
interface DashboardStats {
  totalTechnicians: number
  totalClaims: number
  totalAdmins: number
  monthClaims: number
  yearClaims: number
}

interface Technician {
  id: string;
  name: string;
}

const Admin = () => {
  const {
    pendingUsers,
    claims,
    technicians,
    newClaim,
    selectedClaim,
    showModal,
    handleSignOut,
    addNewClaim,
    setShowModal,
    setSelectedClaim,
    setNewClaim,
  } = useAdmin()

  const [activeSection, setActiveSection] = useState('dashboard')
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalTechnicians: 0,
    totalClaims: 0,
    totalAdmins: 0,
    monthClaims: 0,
    yearClaims: 0,
  })
  const [isInitialized, setIsInitialized] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const techsSnapshot = await getDocs(collection(db, 'technicians'))
      const claimsSnapshot = await getDocs(collection(db, 'claims'))
      const usersSnapshot = await getDocs(collection(db, 'users'))

      const now = new Date()
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      const firstDayOfYear = new Date(now.getFullYear(), 0, 1)

      const claimDocs = claimsSnapshot.docs.map((doc) => ({
        ...doc.data(),
        receivedAt: doc.data().receivedAt
          ? new Date(doc.data().receivedAt)
          : null,
      }))

      const monthClaims = claimDocs.filter(
        (claim) => claim.receivedAt && claim.receivedAt >= firstDayOfMonth,
      ).length

      const yearClaims = claimDocs.filter(
        (claim) => claim.receivedAt && claim.receivedAt >= firstDayOfYear,
      ).length

      const adminUsers = usersSnapshot.docs.filter(
        (doc) => doc.data().role === 'admin',
      ).length

      setDashboardStats({
        totalTechnicians: techsSnapshot.size,
        totalClaims: claimsSnapshot.size,
        totalAdmins: adminUsers,
        monthClaims,
        yearClaims,
      })
      setIsInitialized(true)
    } catch (err) {
      toast.error('Error al cargar datos del dashboard')
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
      setIsInitialized(true)
    }
  }

  useEffect(() => {
    fetchDashboardData()

    const unsubscribeClaims = onSnapshot(collection(db, 'claims'), () => {
      fetchDashboardData()
    })

    const unsubscribeTechs = onSnapshot(collection(db, 'technicians'), () => {
      fetchDashboardData()
    })

    return () => {
      unsubscribeClaims()
      unsubscribeTechs()
    }
  }, [])

  const handleExport = async () => {
    return claims.map((claim) => ({
      ...claim,
    }))
  }

  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif)),
    )
  }

  const handleClearAllNotifications = () => {
    setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })))
  }

  const handleSubmitNewClaim = async (
    claim: NewClaim
  ): Promise<{ success: boolean; id: string; message?: string }> => {
    try {
      const claimToAdd: Omit<Claim, 'id'> = {
        name: claim.name,
        phone: claim.phone,
        address: claim.address,
        reason: claim.reason,
        technicianId: claim.technicianId,
        receivedBy: claim.receivedBy,
        receivedAt: claim.receivedAt,
        status: claim.status,
        title: claim.title,
        customer: claim.customer,
        date: claim.date,
        resolution: claim.resolution,
        technicalDetails: claim.technicalDetails,
        notes: claim.notes,
        notificationSent: claim.notificationSent,
        createdAt: claim.createdAt || new Date().toISOString(),
        description: claim.description || claim.reason || '',
        claimType: claim.claimType || '',          // Añadir claimType
        claimAmount: claim.claimAmount || 0,       // Añadir claimAmount
        updatedAt: claim.updatedAt || new Date().toISOString() // Añadir updatedAt
      }

      await addNewClaim(claimToAdd)
      setNewClaim(initialClaim)

      return {
        success: true,
        id: Date.now().toString(),
        message: 'Reclamo creado exitosamente',
      }
    } catch (error) {
      toast.error('Error al crear el reclamo')
      return {
        success: false,
        id: '',
        message: 'Error al crear el reclamo',
      }
    }
  }

  const handleClaimChange = (claim: NewClaim) => {
    setNewClaim({
      ...initialClaim,
      ...claim,
    })
  }

  // Render cards seccion dashboard
  if (loading) return <LoadingState />
  if (error) return <ErrorState message={error} />
  if (!isInitialized) return <LoadingState />

  const renderDashboard = () => (
    <div className='p-6 space-y-8'>
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
        <DashboardCard
          title='Total Técnicos'
          value={dashboardStats.totalTechnicians}
          icon={<Wrench size={24} />}
          variant='techs'
        />
        <DashboardCard
          title='Total Reclamos'
          value={dashboardStats.totalClaims}
          icon={<FileText size={24} />}
          variant='claims'
        />
        <DashboardCard
          title='Total Administradores'
          value={dashboardStats.totalAdmins}
          icon={<Users size={24} />}
          variant='users'
        />
        <DashboardCard
          title='Reclamos del Mes'
          value={dashboardStats.monthClaims}
          icon={<Calendar size={24} />}
          variant='claims'
        />
        <DashboardCard
          title='Reclamos del Año'
          value={dashboardStats.yearClaims}
          icon={<Calendar size={24} />}
          variant='claims'
        />
      </div>
    </div>
  )

  const renderContent = () => {
    switch (activeSection) {
      case 'users':
        return <PendingUsers />
      case 'claims':
        return (
          <div className='claims-section'>
            <ClaimForm
              claim={
                newClaim
                  ? {
                      ...newClaim,
                      description: newClaim.reason || ''
                      // Remove claimType, claimAmount, and updatedAt as they don't exist in Claim type
                    }
                  : initialClaim
              }
              onSubmit={handleSubmitNewClaim}
              onChange={handleClaimChange}
              technicians={technicians}
            />
            <ClaimTableContainer />
          </div>
        )
      default:
        return renderDashboard() // Use the dashboard component here
    }
  }

  return (
    <AdminLayout
      activeSection={activeSection}
      setActiveSection={setActiveSection}
      pendingUsers={pendingUsers || []}
      claims={claims || []}
      technicians={(technicians || []).map((tech: Technician) => ({
        id: tech.id || '',
        name: tech.name || '',
      }))}
      onSelectClaim={(claim) => {
        setSelectedClaim(claim)
        setShowModal(true)
      }}
      notifications={notifications || []}
      onMarkAsRead={handleMarkAsRead}
      onClearAllNotifications={handleClearAllNotifications}
    >
      <Header
        title='Panel de Administración'
        description='Gestión de reclamos y técnicos'
        onExport={handleExport}
        onSignOut={handleSignOut}
      />
      <main className='main-content'>{renderContent()}</main>
      <ClaimDetailsModal
        claim={selectedClaim}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />
    </AdminLayout>
  )
}

export default Admin
