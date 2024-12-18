import React, { useState, useEffect } from 'react';
import { Menu, LayoutDashboard, Users, FileText, X, LogOut, Settings } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

interface SidebarProps {
    activeSection: string;
    onSectionChange: (section: string) => void;
    onLogout?: () => void;
    pendingClaims?: number;
    pendingUsers?: number;
}

interface MenuItem {
    id: string;
    icon: React.ReactNode;
    text: string;
    badge?: number;
}

const SidebarItem = ({ 
    icon, 
    text, 
    active, 
    onClick,
    badge,
    showTooltip = false
}: { 
    icon: React.ReactNode; 
    text: string; 
    active: boolean; 
    onClick: () => void;
    badge?: number;
    showTooltip?: boolean;
}) => {
    const ItemContent = (
        <button
            onClick={onClick}
            className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                "hover:shadow-md hover:scale-[1.02]",
                active 
                    ? "bg-primary text-primary-foreground shadow-lg" 
                    : "hover:bg-secondary text-muted-foreground hover:text-foreground"
            )}
        >
            <span className="flex items-center gap-3">
                {icon}
                <span className="font-medium">{text}</span>
            </span>
            {badge !== undefined && badge > 0 && (
                <Badge variant={active ? "outline" : "default"} className="ml-auto">
                    {badge}
                </Badge>
            )}
        </button>
    );

    if (showTooltip) {
        return (
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        {ItemContent}
                    </TooltipTrigger>
                    <TooltipContent side="right">
                        <p>{text}</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        );
    }

    return ItemContent;
};

export const Sidebar = ({ 
    activeSection, 
    onSectionChange, 
    onLogout,
    pendingClaims = 0,
    pendingUsers = 0
}: SidebarProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    const menuItems: MenuItem[] = [
        { 
            id: 'dashboard', 
            icon: <LayoutDashboard size={20} />, 
            text: 'Dashboard'
        },
        { 
            id: 'users', 
            icon: <Users size={20} />, 
            text: 'Usuarios',
            badge: pendingUsers
        },
        { 
            id: 'claims', 
            icon: <FileText size={20} />, 
            text: 'Reclamos',
            badge: pendingClaims
        },
        {
            id: 'settings',
            icon: <Settings size={20} />,
            text: 'Configuración'
        }
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

    const SidebarContent = () => (
        <div className="flex flex-col h-full">
            <SheetHeader className="px-6 py-4 border-b">
                <SheetTitle className="text-lg font-bold">
                    Cospec Comunicaciones
                </SheetTitle>
            </SheetHeader>

            <ScrollArea className="flex-1 px-4 py-6">
                <nav className="space-y-2">
                    {menuItems.map(item => (
                        <SidebarItem
                            key={item.id}
                            icon={item.icon}
                            text={item.text}
                            active={activeSection === item.id}
                            onClick={() => handleSectionChange(item.id)}
                            badge={item.badge}
                            showTooltip={!isOpen && !isMobile}
                        />
                    ))}
                </nav>
            </ScrollArea>

            <div className="p-4 mt-auto border-t">
                <Button
                    variant="destructive"
                    className="w-full flex items-center gap-2 justify-center"
                    onClick={onLogout}
                >
                    <LogOut size={20} />
                    <span>Cerrar Sesión</span>
                </Button>
            </div>
        </div>
    );

    return (
        <>
            {isMobile ? (
                <Sheet open={isOpen} onOpenChange={setIsOpen}>
                    <SheetTrigger asChild>
                        <Button
                            variant="outline"
                            size="sm"
                            className="fixed top-4 left-4 z-50 md:hidden"
                        >
                            <Menu size={20} />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-64 p-0">
                        <SidebarContent />
                    </SheetContent>
                </Sheet>
            ) : (
                <aside className="h-screen w-64 border-r bg-background">
                    <SidebarContent />
                </aside>
            )}
        </>
    );
};

export default Sidebar;