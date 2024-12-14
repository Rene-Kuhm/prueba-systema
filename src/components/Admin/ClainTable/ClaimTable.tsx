import type { Claim } from '@/lib/types/admin';
import { Eye, Trash2, FileText, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import '@/components/Admin/ClainTable/ClaimTable.css';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

export interface ClaimsTableProps {
    claims: Claim[];
    onDelete: (claimId: string) => Promise<void>;
    onShowDetails: (claim: Claim) => void;
    onExport: () => void;
}

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
        <Badge variant="default" className={`${config.color} flex items-center gap-1`}>
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

export function ClaimsTable({
    claims,
    onDelete,
    onShowDetails,
    onExport,
}: ClaimsTableProps) {
    return (
        <div className="claims-table-container p-4">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-2xl font-bold">Gestión de Reclamos</h3>
                    <p className="text-gray-500">{claims.length} reclamos en total</p>
                </div>
                <Button onClick={onExport} variant="outline" className="flex items-center gap-2">
                    <FileText size={18} />
                    Exportar
                </Button>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Estado</TableHead>
                            <TableHead>Teléfono</TableHead>
                            <TableHead>Nombre</TableHead>
                            <TableHead>Dirección</TableHead>
                            <TableHead>Técnico</TableHead>
                            <TableHead>Motivo</TableHead>
                            <TableHead>Recibido por</TableHead>
                            <TableHead>Fecha y Hora</TableHead>
                            <TableHead>Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {claims.length > 0 ? (
                            claims.map((claim: Claim) => (
                                <TableRow key={claim.id}>
                                    <TableCell>
                                        {getStatusBadge(claim.status || 'pending')}
                                    </TableCell>
                                    <TableCell>{claim.phone}</TableCell>
                                    <TableCell>{claim.name}</TableCell>
                                    <TableCell className="max-w-[200px]">
                                        <div className="truncate" title={claim.address}>
                                            {claim.address}
                                        </div>
                                    </TableCell>
                                    <TableCell>{claim.technicianId}</TableCell>
                                    <TableCell className="max-w-[200px]">
                                        <div className="truncate" title={claim.reason}>
                                            {claim.reason}
                                        </div>
                                    </TableCell>
                                    <TableCell>{claim.receivedBy || 'N/A'}</TableCell>
                                    <TableCell>{formatDateTime(claim.receivedAt)}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => onShowDetails(claim)}
                                                className="hover:bg-blue-50"
                                            >
                                                <Eye size={18} />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => claim.id && onDelete(claim.id)}
                                                className="hover:bg-red-50 text-red-600"
                                            >
                                                <Trash2 size={18} />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={9} className="text-center py-8">
                                    No hay reclamos disponibles
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}

export default ClaimsTable;