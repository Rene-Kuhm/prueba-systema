import React, { useState } from 'react';
import { Eye, Trash2, FileText, CheckCircle, Clock, AlertCircle, Edit2 } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import * as ScrollArea from '@radix-ui/react-scroll-area';
import * as Separator from '@radix-ui/react-separator';

// Interfaces para los componentes de tabla
interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
    children: React.ReactNode;
    className?: string;
}

interface TableHeadProps extends React.ThHTMLAttributes<HTMLTableHeaderCellElement> {
    children: React.ReactNode;
    className?: string;
}

interface TableRowProps {
    children: React.ReactNode;
    className?: string;
}

interface BadgeProps {
    children: React.ReactNode;
    className?: string;
}

// Tipos y interfaces
export interface Claim {
    id: string;
    status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
    phone: string;
    name: string;
    address: string;
    technicianId: string;
    reason: string;
    receivedBy: string;
    receivedAt: Date | string;
    technicalDetails?: string;
    resolution?: string;
    notes?: string;
}

export interface ClaimsTableProps {
    claims: Claim[];
    onDelete: (claimId: string) => Promise<void>;
    onEdit: (claim: Claim) => void;
    onExport: () => void;
}

// Componente Table base
const Table: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <table className="w-full border-collapse">{children}</table>
);

const TableHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <thead className="bg-gray-50">{children}</thead>
);

const TableBody: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <tbody>{children}</tbody>
);

const TableRow: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
    <tr className={className}>{children}</tr>
);

const TableHead: React.FC<TableHeadProps> = ({ children, className, ...props }) => (
    <th className={`px-4 py-3 text-left text-sm font-medium text-gray-500 ${className}`} {...props}>
        {children}
    </th>
);

const TableCell: React.FC<TableCellProps> = ({ children, className, ...props }) => (
    <td className={`px-4 py-3 text-sm text-gray-900 ${className}`} {...props}>
        {children}
    </td>
);

// Componente Badge personalizado
const Badge: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}>
        {children}
    </span>
);

// Funciones auxiliares
const getStatusBadge = (status: string) => {
    const statusConfig = {
        pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, text: 'Pendiente' },
        in_progress: { color: 'bg-blue-100 text-blue-800', icon: Clock, text: 'En Proceso' },
        completed: { color: 'bg-green-100 text-green-800', icon: CheckCircle, text: 'Completado' },
        cancelled: { color: 'bg-red-100 text-red-800', icon: AlertCircle, text: 'Cancelado' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
        <Badge className={`${config.color} flex items-center gap-1`}>
            <Icon size={14} />
            {config.text}
        </Badge>
    );
};

const formatDateTime = (dateString: string | Date | undefined) => {
    if (!dateString) return 'Fecha no disponible';
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    
    if (isNaN(date.getTime())) return 'Fecha inválida';
    
    return new Intl.DateTimeFormat('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    }).format(date);
};

// Componente principal
export function ClaimsTable({
    claims,
    onDelete,
    onEdit,
    onExport,
}: ClaimsTableProps) {
    const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [claimToDelete, setClaimToDelete] = useState<string | null>(null);

    const handleDelete = async (claimId: string) => {
        setClaimToDelete(claimId);
        setShowDeleteDialog(true);
    };

    const confirmDelete = async () => {
        if (claimToDelete) {
            await onDelete(claimToDelete);
            setShowDeleteDialog(false);
            setClaimToDelete(null);
        }
    };

    return (
        <div className="space-y-4">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 bg-slate-500 rounded-lg shadow-sm">
                <div>
                    <h3 className="text-2xl font-bold text-white">Gestión de Reclamos</h3>
                    <p className="text-gray-500 text-sm">{claims.length} reclamos en total</p>
                </div>
                <button 
                    onClick={onExport}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 border border-gray-200 rounded-md text-white hover:bg-blue-700 transition-colors"
                >
                    <FileText size={18} />
                    Exportar Datos
                </button>
            </div>

            {/* Responsive Table */}
            <div className="overflow-hidden rounded-lg border bg-slate-500 shadow">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className='bg-slate-600'>
                                <TableHead className="w-[120px] text-white">Estado</TableHead>
                                <TableHead className="hidden md:table-cell text-white">Teléfono</TableHead>
                                <TableHead className="text-white">Cliente</TableHead>
                                <TableHead className="hidden lg:table-cell text-white">Dirección</TableHead>
                                <TableHead className="hidden md:table-cell text-white">Técnico</TableHead>
                                <TableHead className="text-white">Motivo</TableHead>
                                <TableHead className="hidden lg:table-cell text-white">Recibido por</TableHead>
                                <TableHead className="hidden md:table-cell text-white">Fecha</TableHead>
                                <TableHead className="text-right text-white">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {claims.map((claim) => (
                                <TableRow 
                                    key={claim.id}
                                    className="hover:bg-gray-50 transition-colors"
                                >
                                    <TableCell>{getStatusBadge(claim.status)}</TableCell>
                                    <TableCell className="hidden md:table-cell">{claim.phone}</TableCell>
                                    <TableCell className="font-medium">{claim.name}</TableCell>
                                    <TableCell className="hidden lg:table-cell max-w-[200px] truncate">
                                        {claim.address}
                                    </TableCell>
                                    <TableCell className="hidden md:table-cell">{claim.technicianId}</TableCell>
                                    <TableCell className="max-w-[200px] truncate">
                                        {claim.reason}
                                    </TableCell>
                                    <TableCell className="hidden lg:table-cell">{claim.receivedBy}</TableCell>
                                    <TableCell className="hidden md:table-cell whitespace-nowrap">
                                        {formatDateTime(claim.receivedAt)}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => setSelectedClaim(claim)}
                                                className="p-1 hover:bg-blue-50 hover:text-blue-600 rounded-md transition-colors"
                                            >
                                                <Eye size={18} />
                                            </button>
                                            <button
                                                onClick={() => onEdit(claim)}
                                                className="p-1 hover:bg-green-50 hover:text-green-600 rounded-md transition-colors"
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(claim.id)}
                                                className="p-1 hover:bg-red-50 hover:text-red-600 rounded-md transition-colors"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {claims.length === 0 && (
                                <TableRow>
                                    <TableCell 
                                        colSpan={9} 
                                        className="h-32 text-center text-gray-500"
                                    >
                                        No hay reclamos disponibles
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Details Modal */}
            <Dialog.Root open={!!selectedClaim} onOpenChange={(open) => !open && setSelectedClaim(null)}>
                <Dialog.Portal>
                    <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
                    <Dialog.Content className="fixed top-[50%] left-[50%] max-h-[85vh] w-[90vw] max-w-[600px] translate-x-[-50%] translate-y-[-50%] rounded-lg bg-white p-6 shadow-lg">
                        <Dialog.Title className="text-xl font-bold text-gray-900 mb-2">
                            Detalles del Reclamo
                        </Dialog.Title>
                        <Dialog.Description className="text-sm text-gray-500 mb-4">
                            Información completa del reclamo y notas técnicas
                        </Dialog.Description>

                        {selectedClaim && (
                            <ScrollArea.Root className="h-[400px] overflow-hidden">
                                <ScrollArea.Viewport className="h-full w-full pr-4">
                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <h4 className="font-medium text-gray-900">Estado</h4>
                                                {getStatusBadge(selectedClaim.status)}
                                            </div>
                                            <Separator.Root className="h-px bg-gray-200" />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <h4 className="font-medium text-gray-900">Cliente</h4>
                                                <p className="text-gray-600">{selectedClaim.name}</p>
                                            </div>
                                            <div>
                                                <h4 className="font-medium text-gray-900">Teléfono</h4>
                                                <p className="text-gray-600">{selectedClaim.phone}</p>
                                            </div>
                                        </div>

                                        <div>
                                            <h4 className="font-medium text-gray-900">Dirección</h4>
                                            <p className="text-gray-600">{selectedClaim.address}</p>
                                        </div>

                                        <div>
                                            <h4 className="font-medium text-gray-900">Motivo del Reclamo</h4>
                                            <p className="text-gray-600">{selectedClaim.reason}</p>
                                        </div>

                                        {selectedClaim.technicalDetails && (
                                            <div>
                                                <h4 className="font-medium text-gray-900">Detalles Técnicos</h4>
                                                <p className="text-gray-600 whitespace-pre-line">
                                                    {selectedClaim.technicalDetails}
                                                </p>
                                            </div>
                                        )}

                                        {selectedClaim.resolution && (
                                            <div>
                                                <h4 className="font-medium text-gray-900">Resolución</h4>
                                                <p className="text-gray-600 whitespace-pre-line">
                                                    {selectedClaim.resolution}
                                                </p>
                                            </div>
                                        )}

                                        {selectedClaim.notes && (
                                            <div>
                                                <h4 className="font-medium text-gray-900">Notas Adicionales</h4>
                                                <p className="text-gray-600 whitespace-pre-line">
                                                    {selectedClaim.notes}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </ScrollArea.Viewport>
                                <ScrollArea.Scrollbar
                                    className="flex select-none touch-none p-0.5 bg-gray-100 transition-colors duration-150 ease-out hover:bg-gray-200 rounded-full"
                                    orientation="vertical"
                                >
                                    <ScrollArea.Thumb className="flex-1 bg-gray-300 rounded-full relative" />
                                </ScrollArea.Scrollbar>
                            </ScrollArea.Root>
                        )}

                        <div className="mt-6 flex justify-end gap-2">
                            <button
                                onClick={() => setSelectedClaim(null)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                            >
                                Cerrar
                            </button>
                        </div>
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>

            {/* Delete Confirmation Dialog */}
            <Dialog.Root open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <Dialog.Portal>
                    <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
                    <Dialog.Content className="fixed top-[50%] left-[50%] max-w-[450px] translate-x-[-50%] translate-y-[-50%] rounded-lg bg-white p-6 shadow-lg">
                        <Dialog.Title className="text-xl font-bold text-gray-900 mb-2">
                            Confirmar Eliminación
                        </Dialog.Title>
                        <Dialog.Description className="text-sm text-gray-500 mb-4">
                            ¿Estás seguro de que deseas eliminar este reclamo? Esta acción no se puede deshacer.
                        </Dialog.Description>
                        <div className="mt-6 flex justify-end gap-2">
                            <button
                                onClick={() => setShowDeleteDialog(false)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                            >
                                Eliminar
                            </button>
                        </div>
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>
        </div>
    );
}

export default ClaimsTable;