import React from 'react';
import { useAuthStore } from '@/stores/authStore';
import {
    LayoutDashboard,
    Users,
    FileText,
    Settings as SettingsIcon,
} from 'lucide-react';
import { AdminSearch } from '@/components/Admin/Search/Search';
import type { PendingUser, Claim, UpdateProfileData } from '@/lib/types/admin';
import { Notifications } from '@/components/Admin/Notifications/Notifications';
import { Notification } from '@/lib/types/notifications';
import AdminProfile from '@/components/Admin/Profile/AdminProfile';
import LogOut from '@/components/Admin/Logout/Logout';
import Settings from '@/components/Admin/Settings/Settings';
import '@/components/Admin/Layout/AdminLayout.css';

interface AdminLayoutProps {
    children: React.ReactNode;
    activeSection: string;
    setActiveSection: (section: string) => void;
    pendingUsers: PendingUser[];
    claims: Claim[];
    technicians: { id: string; name: string }[];
    onSelectClaim?: (claim: Claim) => void;
    notifications: Notification[];
    onMarkAsRead: (id: string) => void;
    onClearAllNotifications: () => void;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
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
}) => {
    const { signOut } = useAuthStore();

    const handleSignOut = async () => {
        try {
            await signOut();
            // Redirect or perform other actions after logout
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };

    const handleUpdateProfile = async (data: UpdateProfileData) => {
        try {
            // Implement the logic to update the user's profile
            console.log('Updating profile:', data);
        } catch (error) {
            console.error('Error updating profile:', error);
        }
    };

    return (
        <div className="admin-layout">
            <aside className="admin-sidebar">
                <div className="sidebar-header">
                    <h1 className="sidebar-title">COSPEC</h1>
                    <span className="sidebar-badge">Admin Panel</span>
                </div>

                <nav className="sidebar-nav">
                    <button
                        className={`nav-item ${activeSection === 'dashboard' ? 'active' : ''
                            }`}
                        onClick={() => setActiveSection('dashboard')}
                    >
                        <LayoutDashboard className="nav-icon" />
                        <span>Dashboard</span>
                    </button>

                    <button
                        className={`nav-item ${activeSection === 'users' ? 'active' : ''}`}
                        onClick={() => setActiveSection('users')}
                    >
                        <Users className="nav-icon" />
                        <span>Users</span>
                    </button>

                    <button
                        className={`nav-item ${activeSection === 'claims' ? 'active' : ''}`}
                        onClick={() => setActiveSection('claims')}
                    >
                        <FileText className="nav-icon" />
                        <span>Claims</span>
                    </button>

                    <button
                        className={`nav-item ${activeSection === 'settings' ? 'active' : ''}`}
                        onClick={() => setActiveSection('settings')}
                    >
                        <SettingsIcon className="nav-icon" />
                        <span>Settings</span>
                    </button>
                </nav>

                <div className="sidebar-footer">
                    <button className="text-red-400 nav-item hover:text-red-300">
                        <LogOut />
                    </button>
                </div>
            </aside>

            <div className="admin-main">
                {activeSection === 'settings' ? (
                    <Settings />
                ) : (
                    <>
                        <header className="main-header">
                            <div className="header-search">
                                <AdminSearch
                                    pendingUsers={pendingUsers}
                                    claims={claims}
                                    technicians={technicians}
                                    onResultClick={(result) => {
                                        if (result.type === 'claim' && onSelectClaim) {
                                            onSelectClaim(result.data as Claim);
                                        }
                                        setActiveSection(result.section);
                                    }}
                                    setActiveSection={setActiveSection}
                                />
                            </div>
                            <div className="header-actions">
                                <Notifications
                                    notifications={notifications}
                                    onMarkAsRead={onMarkAsRead}
                                    onClearAll={onClearAllNotifications}
                                    onNotificationClick={(notification) => {
                                        if (notification.type === 'registration') {
                                            setActiveSection('users');
                                        } else if (notification.type.includes('claim')) {
                                            setActiveSection('claims');
                                        }
                                    }}
                                />
                                <div className="user-profile">
                                    <AdminProfile
                                        fullName="John Doe"
                                        email="john@example.com"
                                        avatar="/path/to/avatar.jpg"
                                        onLogout={handleSignOut}
                                        onUpdateProfile={handleUpdateProfile}
                                    />
                                    <span className="profile" />
                                </div>
                            </div>
                        </header>

                        <main className="main-content">{children}</main>
                    </>
                )}
            </div>
        </div>
    );
};