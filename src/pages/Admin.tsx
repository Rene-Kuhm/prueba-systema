import React, { useState, useEffect } from 'react'
import { ErrorState } from '@/components/Admin/States/ErrorState'
import { LoadingState } from '@/components/Admin/States/LoadingState'
import { Users, FileText, Wrench, Calendar } from 'lucide-react'
import { AdminLayout } from '@/components/Admin/Layout/AdminLayout'
import { DashboardCard } from '@/components/Admin/Dashboard/DashboardCard'
import { Header } from '@/components/Admin/Header'
import {
  collection,
  getDocs,
  onSnapshot,
} from 'firebase/firestore'
import { db } from '@/config/firebase'
import { toast } from 'react-toastify'
import { PendingUsers } from '@/components/Admin/PendingUsers'
import ClaimForm from '@/components/Admin/ClaimForm/ClaimForm'
import ClaimTable from '@/components/Admin/ClaimTable/ClaimTable'
import ClaimDetailsModal from '@/components/Admin/ClaimDetailsModal'
import { Notification } from '@/lib/types/notifications'
import { Claim } from '@/lib/types/admin'
import { useAdmin } from '@/hooks/useAdmin'

interface ExtendedClaim extends Claim {
  description: string
  claimType: string
  claimAmount: number
  updatedAt: string
  technicianName?: string
}

const initialClaim: Claim = {
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
}

const Admin = () => {
  const {
    loading,
    error,
    pendingUsers,
    claims,
    technicians,
    newClaim,
    selectedClaim,
    showModal,
    handleSignOut,
    addNewClaim,
    deleteClaim,
    setNewClaim,
    setShowModal,
    setSelectedClaim,
  } = useAdmin()

  const [activeSection, setActiveSection] = useState('dashboard')
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [dashboardStats, setDashboardStats] = useState({
    totalTechnicians: 0,
    totalClaims: 0,
    totalAdmins: 0,
    monthClaims: 0,
    yearClaims: 0,
  })

  // Add initialization check
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
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
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
        toast.error('Error al cargar datos del dashboard')
        setIsInitialized(true)
      }
    }

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
    try {
      const querySnapshot = await getDocs(collection(db, 'claims'))
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
    } catch (error) {
      console.error('Error:', error)
      return []
    }
  }

  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif)),
    )
  }

  const handleNewClaimChange = (claim: Partial<Claim>) => {
    setNewClaim(claim as Omit<Claim, 'id'>)
  }

  const handleClearAllNotifications = () => {
    setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })))
  }

  const handleSubmitNewClaim = async () => {
    const claimWithId = { ...newClaim, id: crypto.randomUUID() }
    await addNewClaim(claimWithId)
  }

  const handleDelete = async (id: string) => {
    await deleteClaim(id)
  }

  const handleShowDetails = (claim: ExtendedClaim) => {
    setSelectedClaim(claim)
    setShowModal(true)
  }

  const handleEdit = (claim: ExtendedClaim) => {
    setSelectedClaim(claim)
    setShowModal(true)
  }

  // Add early return for initialization
  if (!isInitialized || loading) return <LoadingState />
  if (error) return <ErrorState message={error} />

  const transformClaims = (claims: Claim[]): ExtendedClaim[] => {
    return (
      claims?.map((claim) => ({
        ...claim,
        description: claim.reason || '',
        claimType: '',
        claimAmount: 0,
        updatedAt: new Date().toISOString(),
        technicianName:
          technicians?.find((t) => t.id === claim.technicianId)?.name || '',
      })) || []
    )
  }

  const renderDashboard = () => {
    return (
      <div className='space-y-8 p-6'>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
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
  }

  const renderContent = () => {
    switch (activeSection) {
      case 'users':
        return <PendingUsers />
      case 'claims':
        return (
          <div className='claims-section'>
            <ClaimForm
              claim={newClaim || initialClaim}
              technicians={technicians}
              onSubmit={handleSubmitNewClaim}
              onChange={handleNewClaimChange}
            />
            <ClaimTable
              claims={transformClaims(claims)}
              onDelete={handleDelete}
              onShowDetails={handleShowDetails}
              onEdit={handleEdit}
            />
          </div>
        )
      default:
        return renderDashboard()
    }
  }

  return (
    <AdminLayout
      activeSection={activeSection}
      setActiveSection={setActiveSection}
      pendingUsers={pendingUsers || []}
      claims={claims || []}
      technicians={(technicians || []).map((tech) => ({
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
        title="Panel de Administración"
        description="Gestión de reclamos y técnicos"
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
