import { useState } from 'react';
import { Menu, LayoutDashboard, Users, FileText } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { SidebarItem } from '@/components/Admin/Sidebar/SidebarItem';
import './Sidebar.css';

interface SidebarProps {
    activeSection: string;
    onSectionChange: (section: string) => void;
}

export const Sidebar = ({ activeSection, onSectionChange }: SidebarProps) => {
    const [isOpen, setIsOpen] = useState(true);

    const menuItems = [
        { id: 'dashboard', icon: <LayoutDashboard />, text: 'Dashboard' },
        { id: 'users', icon: <Users />, text: 'Usuarios' },
        { id: 'claims', icon: <FileText />, text: 'Reclamos' }
    ];

    return (
        <>
            <Button
                variant="outline"
                className="sidebar-toggle"
                onClick={() => setIsOpen(!isOpen)}
            >
                <Menu className="w-6 h-6" />
            </Button>

            <div className={`sidebar ${isOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
                <div className="sidebar-header">
                    <h1 className="sidebar-title">Cospec Comunicasiones</h1>
                </div>

                <nav className="sidebar-nav">
                    {menuItems.map(item => (
                        <SidebarItem
                            key={item.id}
                            icon={item.icon}
                            text={item.text}
                            active={activeSection === item.id}
                            onClick={() => onSectionChange(item.id)}
                        />
                    ))}
                </nav>
            </div>
        </>
    );
};