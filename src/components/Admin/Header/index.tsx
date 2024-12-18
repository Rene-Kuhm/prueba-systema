import React from 'react';
import { Button } from "@/components/ui/button";
import { FileDown, Settings, BarChart3 } from "lucide-react";
import * as XLSX from 'xlsx';
import { toast } from "react-toastify";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

// Import the required Firebase functions
import { getDocs, collection, QueryDocumentSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface HeaderProps {
    onSignOut: () => void;
    onExport: () => Promise<any[]>;
    title?: string;
    description?: string;
}

export const Header = ({ 
    onSignOut, 
    onExport,
    title = "Dashboard",
    description = "Vista general del sistema"
}: HeaderProps): JSX.Element => {
    const handleExport = async () => {
        try {
            const data = await onExport();
            
            // Create a workbook
            const wb = XLSX.utils.book_new();
            
            // Convert the data to a worksheet
            const ws = XLSX.utils.json_to_sheet(data);
            
            // Add the worksheet to the workbook
            XLSX.utils.book_append_sheet(wb, ws, 'Datos');
            
            // Generate the file and download it
            XLSX.writeFile(wb, `export_${new Date().toISOString().split('T')[0]}.xlsx`);
            
            toast.success('Datos exportados exitosamente');
        } catch (error) {
            console.error('Error al exportar:', error);
            toast.error('Error al exportar los datos');
        }
    };
    
    return (
        <div className="border-b mb-6">
            <div className="flex h-16 items-center px-4">
                <div className="flex items-center space-x-4">
                    <BarChart3 className="h-6 w-6" />
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-green-400">{title}</h2>
                        <p className="text-muted-foreground text-white">{description}</p>
                    </div>
                </div>
                
                <div className="ml-auto flex items-center space-x-4">
                    {/* Breadcrumb */}
                    <Breadcrumb className="hidden md:flex">
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbLink className='text-white'  href="/">Inicio</BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator className='bg-white' />
                            <BreadcrumbItem>
                                <BreadcrumbPage className='text-white'>{title}</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>

                    {/* Actions */}
                    <div className="flex items-center space-x-2">
                        <Button
                            onClick={handleExport}
                            className="flex items-center gap-2"
                            variant="outline"
                        >
                            <FileDown className="h-4 w-4" />
                            <span className="hidden sm:inline">Exportar Datos</span>
                        </Button>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-9 w-9"
                                >
                                    <Settings className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onClick={handleExport}
                                    className="flex items-center gap-2"
                                >
                                    <FileDown className="h-4 w-4" />
                                    Exportar Datos
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Utility function to format data before exporting
const formatDataForExport = (data: any[]) => {
    return data.map(item => {
        // Format dates
        const formattedDate = item.date ? new Date(item.date).toLocaleDateString() : '';
        
        return {
            ID: item.id,
            Fecha: formattedDate,
            Estado: item.status,
            Cliente: item.name,
            Teléfono: item.phone,
            Dirección: item.address,
            Técnico: item.technicianId,
            Motivo: item.reason,
            // ... other fields you need
        };
    });
};

// Usage in the parent component:
const ParentComponent = () => {
    const handleExport = async () => {
        try {
            // Fetch data (example with Firebase)
            const querySnapshot = await getDocs(collection(db, 'claims'));
            const claims = querySnapshot.docs.map((doc: QueryDocumentSnapshot) => ({
                id: doc.id,
                ...doc.data()
            }));
            
            // Format data
            const formattedData = formatDataForExport(claims);
            
            // Pass the data to the Header
            return formattedData;
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Error al obtener los datos');
            return [];
        }
    };
    
    // Define the handleSignOut function
    const handleSignOut = () => {
        // Implement the sign out logic here
        // Example using Firebase Authentication:
        // auth.signOut();
    };
    
    return (
        <Header 
            onSignOut={handleSignOut}
            onExport={handleExport}
            title="Dashboard"
            description="Vista general del sistema"
        />
    );
};