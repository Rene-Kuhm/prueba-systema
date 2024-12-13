import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import {
    LayoutDashboard,
    Users,
    FileText,
    Settings as SettingsIcon,
    Menu,
    X
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { AdminSearch } from '@/components/Admin/Search/Search';
import type { PendingUser, Claim, UpdateProfileData } from '@/lib/types/admin';
import { Notifications } from '@/components/Admin/Notifications/Notifications';
import { Notification } from '@/lib/types/notifications';
import AdminProfile from '@/components/Admin/Profile/AdminProfile';
import LogOut from '@/components/Admin/Logout/Logout';
import Settings from '@/components/Admin/Settings/Settings';


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
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const handleSignOut = async () => {
        try {
            await signOut();
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };

    const handleUpdateProfile = async (data: UpdateProfileData) => {
        try {
            console.log('Updating profile:', data);
        } catch (error) {
            console.error('Error updating profile:', error);
        }
    };

    const scrollToElement = (elementId: string) => {
        const element = document.getElementById(elementId);
        if (element) {
            element.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
            });
        }
    };

    const handleSectionChange = (section: string) => {
        setActiveSection(section);
        if (isMobile) {
            setIsSidebarOpen(false);
        }
    };

    return (
        <div className="relative min-h-screen bg-slate-700">
            {/* Mobile Menu Button */}
            <Button
                variant="outline"
                size="sm"
                className="fixed top-4 left-4 z-50 md:hidden"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
                {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </Button>

            {/* Overlay for mobile */}
            {isMobile && (
                <div 
                    className={`fixed inset-0 bg-black/50 transition-opacity z-40
                        ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed top-0 left-0 z-40 h-full w-64
                bg-slate-700 border-slate-600 border-r
                transition-transform duration-300 ease-in-out
                md:translate-x-0 custom-scrollbar
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <div className="flex flex-col h-full">
                    <div className="p-6 border-slate-600 border-b">
                        <h1 className="text-xl text-green-700 font-bold">COSPEC</h1>
                        <span className="text-sm text-white text-muted-foreground">Comunicasiones</span>
                    </div>

                    <nav className="flex-1 p-4 space-y-2">
                        <button
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                                ${activeSection === 'dashboard' 
                                    ? 'bg-primary text-primary-foreground' 
                                    : 'hover:bg-secondary text-muted-foreground hover:text-foreground'}`}
                            onClick={() => handleSectionChange('dashboard')}
                        >
                            <LayoutDashboard size={20} />
                            <span>Dashboard</span>
                        </button>

                        <button
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                                ${activeSection === 'users' 
                                    ? 'bg-primary text-primary-foreground' 
                                    : 'hover:bg-secondary text-muted-foreground hover:text-foreground'}`}
                            onClick={() => handleSectionChange('users')}
                        >
                            <Users size={20} />
                            <span>Users</span>
                        </button>

                        <button
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                                ${activeSection === 'claims' 
                                    ? 'bg-primary text-primary-foreground' 
                                    : 'hover:bg-secondary text-muted-foreground hover:text-foreground'}`}
                            onClick={() => handleSectionChange('claims')}
                        >
                            <FileText size={20} />
                            <span>Claims</span>
                        </button>

                        <button
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                                ${activeSection === 'settings' 
                                    ? 'bg-primary text-primary-foreground' 
                                    : 'hover:bg-secondary text-muted-foreground hover:text-foreground'}`}
                            onClick={() => handleSectionChange('settings')}
                        >
                            <SettingsIcon size={20} />
                            <span>Settings</span>
                        </button>
                    </nav>

                    <div className="border-t border-slate-600  p-4">
                        <LogOut onLogout={handleSignOut} />
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="md:ml-64 min-h-screen custom-scrollbar">
                {activeSection === 'settings' ? (
                    <Settings />
                ) : (
                    <>
                        <header className="sticky top-0 z-30 w-full bg-slate-700 border-b border-slate-600 p-4">
                            <div className="flex items-center justify-between gap-4 md:ml-12">
                                <div className="flex-1 max-w-2xl">
                                    <AdminSearch
                                        pendingUsers={pendingUsers}
                                        claims={claims}
                                        technicians={technicians}
                                        onResultClick={(result) => {
                                            if (result.type === 'claim' && onSelectClaim) {
                                                onSelectClaim(result.data as Claim);
                                            }
                                            handleSectionChange(result.section);
                                        }}
                                        setActiveSection={handleSectionChange}
                                    />
                                </div>
                                <div className="flex items-center gap-4">
                                    <Notifications
                                        notifications={notifications}
                                        onMarkAsRead={onMarkAsRead}
                                        onClearAll={onClearAllNotifications}
                                        onNotificationClick={(notification) => {
                                            if (notification.type === 'registration') {
                                                handleSectionChange('users');
                                            } else if (notification.type.includes('claim')) {
                                                handleSectionChange('claims');
                                            }
                                        }}
                                    />
                                    <AdminProfile
                                        fullName="John Doe"
                                        email="john@example.com"
                                        avatar="/path/to/avatar.jpg"
                                        onLogout={handleSignOut}
                                        onUpdateProfile={handleUpdateProfile}
                                    />
                                </div>
                            </div>
                        </header>

                        <main className="p-4 md:p-6 custom-scrollbar">{children}</main>
                    </>
                )}
            </div>
        </div>
    );
};