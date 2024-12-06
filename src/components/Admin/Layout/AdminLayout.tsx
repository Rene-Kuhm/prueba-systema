import React from 'react'
import { useAuthStore } from '@/stores/authStore' // Asegúrate de importar el store
import {
    LayoutDashboard,
    Users,
    FileText,
    Settings,
    LogOut,
} from 'lucide-react'
import { AdminSearch } from '@/components/Admin/Search/Search'
import type { PendingUser, Claim, UpdateProfileData } from '@/lib/types/admin'
import { Notifications } from '@/components/Admin/Notifications/Notifications'
import { Notification } from '@/lib/types/notifications'
import  AdminProfile  from '@/components/Admin/Profile/AdminProfile'
import '@/components/Admin/Layout/AdminLayout.css'

interface AdminLayoutProps {
    children: React.ReactNode
    activeSection: string
    setActiveSection: (section: string) => void
    pendingUsers: PendingUser[]
    claims: Claim[]
    technicians: { id: string; name: string }[]
    onSelectClaim?: (claim: Claim) => void
    notifications: Notification[]
    onMarkAsRead: (id: string) => void
    onClearAllNotifications: () => void
}






export const AdminLayout = ({
    children,
    activeSection,
    setActiveSection,
    pendingUsers,
    claims,
    technicians,
    onSelectClaim,
    notifications,
    onMarkAsRead,
    onClearAllNotifications,
}: AdminLayoutProps) => {
    const { signOut } = useAuthStore();
    const handleSignOut = async () => {
        try {
            await signOut();
            // Redirigir o realizar otras acciones después de cerrar sesión
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
        }
    };

    const handleUpdateProfile = async (data: UpdateProfileData) => {
        try {
            // Implementa la lógica para actualizar el perfil del usuario
            console.log('Actualizando perfil:', data);
        } catch (error) {
            console.error('Error al actualizar el perfil:', error);
        }


    }
    return (
        <div className='admin-layout'>
            <aside className='admin-sidebar'>
                <div className='sidebar-header'>
                    <h1 className='sidebar-title'>COSPEC</h1>
                    <span className='sidebar-badge'>Admin Panel</span>
                </div>

                <nav className='sidebar-nav'>
                    <button
                        className={`nav-item ${activeSection === 'dashboard' ? 'active' : ''
                            }`}
                        onClick={() => setActiveSection('dashboard')}
                    >
                        <LayoutDashboard className='nav-icon' />
                        <span>Dashboard</span>
                    </button>

                    <button
                        className={`nav-item ${activeSection === 'users' ? 'active' : ''}`}
                        onClick={() => setActiveSection('users')}
                    >
                        <Users className='nav-icon' />
                        <span>Usuarios</span>
                    </button>

                    <button
                        className={`nav-item ${activeSection === 'claims' ? 'active' : ''}`}
                        onClick={() => setActiveSection('claims')}
                    >
                        <FileText className='nav-icon' />
                        <span>Reclamos</span>
                    </button>
                </nav>

                <div className='sidebar-footer'>
                    <button className='nav-item'>
                        <Settings className='nav-icon' />
                        <span>Configuración</span>
                    </button>
                    <button className='text-red-400 nav-item hover:text-red-300'>
                        <LogOut className='nav-icon' />
                        <span>Cerrar Sesión</span>
                    </button>
                </div>
            </aside>

            <div className='admin-main'>
                <header className='main-header'>
                    <div className='header-search'>
                        <AdminSearch
                            pendingUsers={pendingUsers}
                            claims={claims}
                            technicians={technicians}
                            onResultClick={(result) => {
                                if (result.type === 'claim' && onSelectClaim) {
                                    onSelectClaim(result.data as Claim)
                                }
                                setActiveSection(result.section)
                            }}
                            setActiveSection={setActiveSection}
                        />
                    </div>
                    <div className='header-actions'>
                        <Notifications
                            notifications={notifications}
                            onMarkAsRead={onMarkAsRead}
                            onClearAll={onClearAllNotifications}
                            onNotificationClick={(notification) => {
                                if (notification.type === 'registration') {
                                    setActiveSection('users')
                                } else if (notification.type.includes('claim')) {
                                    setActiveSection('claims')
                                }
                            }}
                        />
                        <div className='user-profile'>
                            <AdminProfile
                                fullName="John Doe"
                                email="john@example.com"
                                avatar="/path/to/avatar.jpg"
                                onLogout={handleSignOut}
                                onUpdateProfile={handleUpdateProfile}
                            />
                            <span className='profile' />
                        </div>
                    </div>
                </header>

                <main className='main-content'>{children}</main>
            </div>
        </div>
    )
}
