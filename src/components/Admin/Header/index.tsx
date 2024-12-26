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
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface HeaderProps {
    onSignOut: () => void;
    onExport: () => Promise<ComplaintData[]>;
    title?: string;
    description?: string;
}

interface ComplaintData {
    id?: string;
    receivedAt?: Date | string;
    date?: Date | string;
    status?: string;
    name?: string;
    phone?: string;
    address?: string;
    technicianName?: string;
    technicianId?: string;
    reason?: string;
}

interface CellStyle {
    font?: {
        sz?: number;
        bold?: boolean;
        color?: { rgb: string };
    };
    fill?: {
        fgColor: { rgb: string };
    };
    alignment?: {
        horizontal?: string;
        vertical?: string;
        wrapText?: boolean;
    };
    border?: {
        left?: { style: string; color?: { rgb: string } };
        right?: { style: string; color?: { rgb: string } };
        top?: { style: string; color?: { rgb: string } };
        bottom?: { style: string; color?: { rgb: string } };
    };
}

// Funciones auxiliares
const isValidDate = (date: Date | string | undefined): boolean => {
    if (!date) return false;
    const d = new Date(date);
    return d instanceof Date && !isNaN(d.getTime());
};

const formatDate = (date: Date | string | undefined): string => {
    if (!date) return 'N/A';
    try {
        const dateValue = typeof date === 'string' ? new Date(date) : date;
        if (!isValidDate(dateValue)) return 'N/A';
        return format(dateValue, 'dd/MM/yyyy HH:mm', { locale: es });
    } catch (error) {
        return 'N/A';
    }
};

const formatStatus = (status: string = 'pending'): string => {
    const statusMap: { [key: string]: string } = {
        'pending': 'Pendiente',
        'in_progress': 'En Proceso',
        'completed': 'Completado',
        'cancelled': 'Cancelado'
    };
    return statusMap[status] || status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
};

// Función principal para crear la hoja de cálculo con estilos
const createStyledWorksheet = (data: ComplaintData[]) => {
    const ws = XLSX.utils.json_to_sheet([]);
    
    // Estilos base
    const titleStyle: CellStyle = {
        font: { sz: 16, bold: true, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "9BBB59" } },
        alignment: { horizontal: "center", vertical: "center" },
        border: {
            left: { style: 'thin', color: { rgb: '000000' } },
            right: { style: 'thin', color: { rgb: '000000' } },
            top: { style: 'thin', color: { rgb: '000000' } },
            bottom: { style: 'thin', color: { rgb: '000000' } }
        }
    };

    const subtitleStyle: CellStyle = {
        font: { sz: 12, bold: true },
        fill: { fgColor: { rgb: "FFEB9C" } },
        alignment: { horizontal: "center", vertical: "center" }
    };

    const headerStyle: CellStyle = {
        font: { sz: 11, bold: true, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "4472C4" } },
        alignment: { horizontal: "center", vertical: "center", wrapText: true },
        border: {
            left: { style: 'thin', color: { rgb: '000000' } },
            right: { style: 'thin', color: { rgb: '000000' } },
            top: { style: 'thin', color: { rgb: '000000' } },
            bottom: { style: 'thin', color: { rgb: '000000' } }
        }
    };

    // Agregar encabezado corporativo
    XLSX.utils.sheet_add_aoa(ws, [
        ['COSPEC COMUNICACIONES'],
        ['Reporte de Reclamos'],
        [`Fecha de generación: ${formatDate(new Date())}`],
        []
    ], { origin: 'A1' });

    // Preparar y agregar datos
    const formattedData = data.map(item => ({
        'ID Reclamo': item.id || 'N/A',
        'Fecha': formatDate(item.receivedAt || item.date),
        'Estado': formatStatus(item.status),
        'Cliente': item.name || 'Sin nombre',
        'Teléfono': item.phone || 'Sin teléfono',
        'Dirección': item.address || 'Sin dirección',
        'Técnico': item.technicianName || item.technicianId || 'Sin asignar',
        'Motivo': item.reason || 'Sin motivo'
    }));

    XLSX.utils.sheet_add_json(ws, formattedData, {
        origin: 'A5',
        skipHeader: false
    });

    // Configurar anchos de columna
    ws['!cols'] = [
        { wch: 15 },  // ID
        { wch: 20 },  // Fecha
        { wch: 12 },  // Estado
        { wch: 25 },  // Cliente
        { wch: 15 },  // Teléfono
        { wch: 35 },  // Dirección
        { wch: 35 },  // Técnico
        { wch: 40 }   // Motivo
    ];

    // Configurar fusiones de celdas
    ws['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 7 } },
        { s: { r: 1, c: 0 }, e: { r: 1, c: 7 } },
        { s: { r: 2, c: 0 }, e: { r: 2, c: 7 } }
    ];

    // Aplicar estilos a todas las celdas
    const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
    
    for (let R = range.s.r; R <= range.e.r; R++) {
        for (let C = range.s.c; C <= range.e.c; C++) {
            const cellRef = XLSX.utils.encode_cell({ r: R, c: C });
            if (!ws[cellRef]) continue;

            if (R === 0) {
                ws[cellRef].s = titleStyle;
            } else if (R === 1) {
                ws[cellRef].s = subtitleStyle;
            } else if (R === 4) {
                ws[cellRef].s = headerStyle;
            } else if (R > 4) {
                const cellStyle: CellStyle = {
                    font: { sz: 10 },
                    alignment: { vertical: "center", wrapText: true },
                    border: {
                        left: { style: 'thin' },
                        right: { style: 'thin' },
                        top: { style: 'thin' },
                        bottom: { style: 'thin' }
                    }
                };

                // Estilos para estados
                if (C === 2) {
                    const status = ws[cellRef].v?.toString().toLowerCase();
                    const statusColors: { [key: string]: string } = {
                        'completado': '70AD47',
                        'pendiente': 'ED7D31',
                        'en proceso': '4472C4',
                        'cancelado': 'FF0000'
                    };
                    cellStyle.font!.color = { rgb: statusColors[status] || '000000' };
                    cellStyle.font!.bold = true;
                }

                // Filas alternadas
                if (R % 2 === 1) {
                    cellStyle.fill = { fgColor: { rgb: 'F5F5F5' } };
                }

                ws[cellRef].s = cellStyle;
            }
        }
    }

    return ws;
};

export const Header = ({ 
    title = "Dashboard",
    description = "Vista general del sistema",
    onExport,
    onSignOut
}: HeaderProps): JSX.Element => {
    const handleExport = async () => {
        try {
            toast.info('Preparando exportación...');
            const data = await onExport();
            
            if (!Array.isArray(data)) {
                throw new Error('Los datos recibidos no son válidos');
            }

            const wb = XLSX.utils.book_new();
            const ws = createStyledWorksheet(data);
            
            XLSX.utils.book_append_sheet(wb, ws, 'Reclamos');
            
            const fileName = `COSPEC_Reclamos_${format(new Date(), 'dd-MM-yyyy')}.xlsx`;
            XLSX.writeFile(wb, fileName);
            
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
                                <DropdownMenuItem
                                    onClick={onSignOut}
                                    className="flex items-center gap-2"
                                >
                                    <Settings className="h-4 w-4" />
                                    Cerrar Sesión
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>
        </div>
    );
};