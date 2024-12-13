import React, { useState, useEffect } from 'react';
import { Menu, LayoutDashboard, Users, FileText, X, LogOut } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface SidebarProps {
    activeSection: string;
    onSectionChange: (section: string) => void;
    onLogout?: () => void;
}

const SidebarItem = ({ 
    icon, 
    text, 
    active, 
    onClick 
}: { 
    icon: React.ReactNode; 
    text: string; 
    active: boolean; 
    onClick: () => void; 
}) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
            ${active 
                ? 'bg-primary text-primary-foreground' 
                : 'hover:bg-secondary text-muted-foreground hover:text-foreground'
            }`}
    >
        {icon}
        <span className="font-medium">{text}</span>
    </button>
);

export const Sidebar = ({ activeSection, onSectionChange, onLogout }: SidebarProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    const menuItems = [
        { id: 'dashboard', icon: <LayoutDashboard size={20} />, text: 'Dashboard' },
        { id: 'users', icon: <Users size={20} />, text: 'Usuarios' },
        { id: 'claims', icon: <FileText size={20} />, text: 'Reclamos' }
    ];

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        
        checkMobile();
        window.addEventListener('resize', checkMobile);
        
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const handleSectionChange = (section: string) => {
        onSectionChange(section);
        if (isMobile) {
            setIsOpen(false);
        }
    };

    const handleLogout = () => {
        if (onLogout) {
            onLogout();
        }
    };

    const toggleSidebar = () => setIsOpen(!isOpen);

    // Overlay for mobile
    const Overlay = () => (
        <div 
            className={`fixed inset-0 bg-black/50 transition-opacity z-40
                ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            onClick={() => setIsOpen(false)}
        />
    );

    return (
        <>
            {/* Mobile Menu Button */}
            <Button
                variant="outline"
                size="sm"
                className="fixed top-4 left-4 z-50 md:hidden"
                onClick={toggleSidebar}
            >
                {isOpen ? <X size={20} /> : <Menu size={20} />}
            </Button>

            {/* Overlay for mobile */}
            {isMobile && <Overlay />}

            {/* Sidebar */}
            <aside className={`
                fixed top-0 left-0 z-40 h-full w-64
                bg-background border-r
                transition-transform duration-300 ease-in-out
                md:translate-x-0 md:static
                flex flex-col
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="p-6 border-b">
                        <h1 className="text-lg font-semibold truncate">
                            Cospec Comunicaciones
                        </h1>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                        {menuItems.map(item => (
                            <SidebarItem
                                key={item.id}
                                icon={item.icon}
                                text={item.text}
                                active={activeSection === item.id}
                                onClick={() => handleSectionChange(item.id)}
                            />
                        ))}
                    </nav>

                    {/* Footer with Logout Button */}
                    <div className="border-t p-4">
                        <Button
                            variant="destructive"
                            className="w-full flex items-center gap-2 justify-start hover:bg-red-600/90"
                            onClick={handleLogout}
                        >
                            <LogOut size={20} />
                            <span>Cerrar Sesión</span>
                        </Button>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;