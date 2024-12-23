import React from 'react';
import { Button } from "@/components/ui/button";
import { FileDown, Settings, BarChart3 } from "lucide-react";
import * as XLSX from 'xlsx';
import { toast } from "react-toastify";
import {
    Breadcrumb, BreadcrumbItem, BreadcrumbLink,
    BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem,
    DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getDocs, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface HeaderProps {
    onSignOut: () => void;
    onExport: () => Promise<any[]>;
    title?: string;
    description?: string;
}

interface CellStyle {
    alignment?: {
        horizontal?: 'left' | 'center' | 'right';
        vertical?: 'top' | 'center' | 'bottom';
        wrapText?: boolean;
    };
    font?: {
        sz?: number;
        bold?: boolean;
        name?: string;
    };
    fill?: {
        fgColor?: { rgb: string };
    };
    border?: {
        top?: { style: string; };
        bottom?: { style: string; };
        left?: { style: string; };
        right?: { style: string; };
    };
}

const formatStatus = (status: string) => {
    const statusMap: { [key: string]: string } = {
        'pending': 'Pendiente',
        'in_progress': 'En Proceso',
        'completed': 'Completado',
        'cancelled': 'Cancelado'
    };
    return statusMap[status] || status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
};

const formatDataForExport = (data: any[]) => {
    return data.map(item => ({
        'ID Reclamo': item.id,
        'Fecha': item.date ? format(new Date(item.date), 'dd/MM/yyyy HH:mm', { locale: es }) : '',
        'Estado': formatStatus(item.status),
        'Cliente': item.name,
        'Teléfono': item.phone,
        'Dirección': item.address,
        'Técnico': item.technicianName || item.technicianId,
        'Motivo': item.reason,
        'Notas': item.notes || '',
    }));
};

const createWorksheet = (data: any[]) => {
    const ws = XLSX.utils.json_to_sheet([]);
    
    // Agregar título
    XLSX.utils.sheet_add_aoa(ws, [
        ['COSPEC COMUNICACIONES'],
        ['Reporte de Reclamos'],
        [`Fecha de generación: ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: es })}`],
        [] // Línea en blanco
    ]);

    // Agregar datos
    XLSX.utils.sheet_add_json(ws, data, {
        origin: 'A5',
        skipHeader: false,
    });

    // Configurar anchos de columna
    const columnWidths = [
        { wch: 12 }, // ID
        { wch: 20 }, // Fecha
        { wch: 15 }, // Estado
        { wch: 25 }, // Cliente
        { wch: 15 }, // Teléfono
        { wch: 35 }, // Dirección
        { wch: 25 }, // Técnico
        { wch: 40 }, // Motivo
        { wch: 30 }, // Notas
    ];
    ws['!cols'] = columnWidths;

    // Estilos básicos
    const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
    
    // Estilo para el título
    const titleStyle: CellStyle = {
        font: { sz: 16, bold: true },
        alignment: { horizontal: 'center' }
    };

    // Estilo para los encabezados
    const headerStyle: CellStyle = {
        font: { sz: 12, bold: true },
        alignment: { horizontal: 'center' },
        fill: { fgColor: { rgb: 'E5E7EB' } }
    };

    // Aplicar estilos
    for (let C = range.s.c; C <= range.e.c; ++C) {
        const headerCell = XLSX.utils.encode_cell({ r: 4, c: C });
        if (ws[headerCell]) {
            ws[headerCell].s = headerStyle;
        }
    }

    // Aplicar estilo al título
    ws['A1'].s = titleStyle;

    return ws;
};

export const Header = ({ 
    onSignOut, 
    onExport,
    title = "Dashboard",
    description = "Vista general del sistema"
}: HeaderProps): JSX.Element => {
    const handleExport = async () => {
        try {
            const data = await onExport();
            const formattedData = formatDataForExport(data);
            
            const wb = XLSX.utils.book_new();
            const ws = createWorksheet(formattedData);
            
            XLSX.utils.book_append_sheet(wb, ws, 'Reclamos');
            XLSX.writeFile(wb, `COSPEC_Reclamos_${format(new Date(), 'dd-MM-yyyy')}.xlsx`);
            
            toast.success('Reporte exportado exitosamente');
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
                    <Breadcrumb className="hidden md:flex">
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbLink className='text-white' href="/">Inicio</BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator className='bg-white' />
                            <BreadcrumbItem>
                                <BreadcrumbPage className='text-white'>{title}</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>

                    <div className="flex items-center space-x-2">
                        <Button
                            onClick={handleExport}
                            className="flex items-center gap-2"
                            variant="outline"
                        >
                            <FileDown className="h-4 w-4" />
                            <span className="hidden sm:inline">Exportar Reporte</span>
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
                                    Exportar Reporte
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>
        </div>
    );
};