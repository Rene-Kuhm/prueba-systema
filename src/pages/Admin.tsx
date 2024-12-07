import { useState } from 'react'
import { ErrorState } from '@/components/Admin/States/ErrorState'
import { LoadingState } from '@/components/Admin/States/LoadingState'
import { Users, FileText } from 'lucide-react'
import { AdminLayout } from '@/components/Admin/Layout/AdminLayout'
import { DashboardCard } from '@/components/Admin/Dashboard/DashboardCard'
import { Header } from '@/components/Admin/Header/index'
import { PendingUsers } from '@/components/Admin/PendingUsers'
import ClaimForm from '@/components/Admin/ClaimForm/ClaimForm'
import { ClaimsTable } from '@/components/Admin/ClainTable/ClaimTable'
import ClaimDetailsModal from '@/components/Admin/ClaimDetailsModal'
import { useAdmin } from '@/hooks/useAdmin'
import type { Claim } from '@/lib/types/admin'
import type { Notification } from '@/lib/types/notifications';
import '@/styles/admin.css'

export default function Admin() {
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
    approveUser,
    addNewClaim,
    deleteClaim,
    exportClaimsToExcel,
    setNewClaim,
    setShowModal,
    setSelectedClaim,
  } = useAdmin()

  const [activeSection, setActiveSection] = useState('dashboard');
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const handleClearAllNotifications = () => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const handleNewClaimChange = (claim: Partial<Claim>) => {
    setNewClaim(claim as Omit<Claim, "id">);
  };

  if (loading) {
    return <LoadingState />
  }

  if (error) {
    return <ErrorState message={error} />
  }

  const renderDashboard = () => (
    <div className='dashboard-grid'>
      <DashboardCard
        title='Usuarios Pendientes'
        value={pendingUsers.length}
        icon={<Users className='w-6 h-6' />}
        variant='users'
      />
      <DashboardCard
        title='Reclamos Totales'
        value={claims.length}
        icon={<FileText className='w-6 h-6' />}
        variant='claims'
      />
      <DashboardCard
        title='Técnicos'
        value={technicians.length}
        icon={<Users className='w-6 h-6' />}
        variant='techs'
      />
    </div>
  )

  const renderContent = () => {
    switch (activeSection) {
      case 'users':
        return <PendingUsers users={pendingUsers} onApprove={approveUser} />
      case 'claims':
        return (
          <div className='claims-section'>
            <ClaimForm
              claim={newClaim}
              technicians={technicians.map(tech => ({ id: tech, name: tech, phone: 'N/A' }))}
              onSubmit={addNewClaim}
              onChange={handleNewClaimChange}
            />
            <ClaimsTable
              claims={claims}
              onExport={exportClaimsToExcel}
              onDelete={async (claimId) => {
                if (claimId) {
                  await deleteClaim(claimId)
                }
              }}
              onShowDetails={(claim: Claim) => {
                setShowModal(true)
                setSelectedClaim(claim)
              }}
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
      pendingUsers={pendingUsers}
      claims={claims}
      technicians={technicians.map(tech => ({
        id: tech,
        name: tech,
        phone: 'N/A'
      }))}
      onSelectClaim={(claim) => {
        setSelectedClaim(claim);
        setShowModal(true);
      }}
      notifications={notifications}
      onMarkAsRead={handleMarkAsRead}
      onClearAllNotifications={handleClearAllNotifications}
    >
      <Header onSignOut={handleSignOut} onExport={exportClaimsToExcel} />
      <main className="main-content">{renderContent()}</main>
      <ClaimDetailsModal
        claim={selectedClaim}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />
    </AdminLayout>
  )
}