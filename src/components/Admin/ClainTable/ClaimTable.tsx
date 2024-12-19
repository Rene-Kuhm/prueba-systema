import React, { useState, useEffect } from 'react';
import { Eye, Trash2, CheckCircle, Clock, AlertCircle, Edit2, MoreHorizontal, Phone, MapPin, User } from 'lucide-react';
import type { Claim } from '@/lib/types/admin';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

const CLAIMS_STORAGE_KEY = 'stored_claims';

interface ExtendedClaim extends Claim {
  exported?: boolean;
}

interface ClaimsTableProps {
    claims: ExtendedClaim[];
    onDelete: (id: string) => Promise<void>;
    onShowDetails: (claim: ExtendedClaim) => void;
    onExport: () => void;
    onEdit?: (claim: ExtendedClaim) => void;
}

const formatDateTime = (date: string | Date | undefined) => {
    if (!date) return 'Fecha no disponible';
    try {
        const dateObj = date instanceof Date ? date : new Date(date);
        if (isNaN(dateObj.getTime())) {
            return 'Fecha inválida';
        }
        return new Intl.DateTimeFormat('es-AR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        }).format(dateObj);
    } catch (error) {
        return 'Fecha inválida';
    }
};

const getStatusConfig = (status: string) => {
    const configs = {
        pending: {
            color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            icon: Clock,
            text: 'Pendiente'
        },
        in_progress: {
            color: 'bg-blue-100 text-blue-800 border-blue-200',
            icon: Clock,
            text: 'En Proceso'
        },
        completed: {
            color: 'bg-green-100 text-green-800 border-green-200',
            icon: CheckCircle,
            text: 'Completado'
        },
        cancelled: {
            color: 'bg-red-100 text-red-800 border-red-200',
            icon: AlertCircle,
            text: 'Cancelado'
        }
    };

    return configs[status as keyof typeof configs] || configs.pending;
};

const StatusBadge = ({ status }: { status: string }) => {
    const config = getStatusConfig(status);
    const Icon = config.icon;

    return (
        <Badge variant="outline" className={cn("flex items-center gap-1", config.color)}>
            <Icon size={14} />
            <span>{config.text}</span>
        </Badge>
    );
};

const MobileClaimCard = ({ 
    claim,
    onShowDetails,
    onEdit,
    onDelete
}: { 
    claim: ExtendedClaim;
    onShowDetails: (claim: ExtendedClaim) => void;
    onEdit?: (claim: ExtendedClaim) => void;
    onDelete: (id: string) => Promise<void>;
}) => (
    <Card className="mb-4">
        <CardContent className="p-4">
            <div className="flex justify-between items-start mb-3">
                <div>
                    <h3 className="font-medium">{claim.name}</h3>
                    <p className="text-muted-foreground text-sm">{formatDateTime(claim.receivedAt)}</p>
                </div>
                <StatusBadge status={claim.status} />
            </div>

            <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-muted-foreground">
                    <Phone className="h-4 w-4 mr-2 shrink-0" />
                    <span className="truncate">{claim.phone}</span>
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 mr-2 shrink-0" />
                    <span className="truncate">{claim.address}</span>
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                    <User className="h-4 w-4 mr-2 shrink-0" />
                    <span className="truncate">{claim.technicianId}</span>
                </div>
            </div>

            <div className="border-t pt-3 flex justify-end gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onShowDetails(claim)}
                >
                    <Eye className="h-4 w-4 mr-1" />
                    Ver
                </Button>
                {onEdit && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(claim)}
                    >
                        <Edit2 className="h-4 w-4 mr-1" />
                        Editar
                    </Button>
                )}
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDelete(claim.id)}
                    className="text-destructive hover:text-destructive"
                    disabled={!claim.exported}
                >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Eliminar
                </Button>
            </div>
        </CardContent>
    </Card>
);

export function ClaimsTable({
    claims: initialClaims,
    onDelete,
    onEdit,
    onExport: originalOnExport,
    onShowDetails
}: ClaimsTableProps) {
    const [claims, setClaims] = useState<ExtendedClaim[]>([]);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [claimToDelete, setClaimToDelete] = useState<string | null>(null);
    const [showErrorDialog, setShowErrorDialog] = useState(false);

    // Cargar claims del localStorage al iniciar
    useEffect(() => {
        try {
            const storedClaims = localStorage.getItem(CLAIMS_STORAGE_KEY);
            if (storedClaims) {
                const parsedClaims = JSON.parse(storedClaims);
                setClaims(parsedClaims);
            } else {
                setClaims(initialClaims);
                if (initialClaims.length > 0) {
                    localStorage.setItem(CLAIMS_STORAGE_KEY, JSON.stringify(initialClaims));
                }
            }
        } catch (error) {
            console.error('Error al cargar los reclamos:', error);
            setClaims(initialClaims);
        }
    }, [initialClaims]);

    // Actualizar localStorage cuando cambian los claims
    useEffect(() => {
        if (claims.length > 0) {
            localStorage.setItem(CLAIMS_STORAGE_KEY, JSON.stringify(claims));
        }
    }, [claims]);

    // Manejar la exportación desde ClaimForm
    useEffect(() => {
        if (originalOnExport) {
            originalOnExport = () => {
                const updatedClaims = claims.map(claim => ({
                    ...claim,
                    exported: true
                }));
                setClaims(updatedClaims);
                localStorage.setItem(CLAIMS_STORAGE_KEY, JSON.stringify(updatedClaims));
            };
        }
    }, [claims]);

    const handleDelete = async (claimId: string) => {
        const claim = claims.find(c => c.id === claimId);
        if (!claim?.exported) {
            setShowErrorDialog(true);
            return;
        }
        setClaimToDelete(claimId);
        setShowDeleteDialog(true);
    };

    const handleDeleteConfirm = async () => {
        if (claimToDelete) {
            await onDelete(claimToDelete);
            const updatedClaims = claims.filter(claim => claim.id !== claimToDelete);
            setClaims(updatedClaims);
            localStorage.setItem(CLAIMS_STORAGE_KEY, JSON.stringify(updatedClaims));
            setShowDeleteDialog(false);
            setClaimToDelete(null);
        }
    };

    return (
        <div className="space-y-4">
            <Card className="bg-slate-700 rounded-xl mb-8">
                <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0 pb-6">
                    <div>
                        <CardTitle className="text-xl sm:text-2xl font-bold text-green-400">
                            Gestión de Reclamos
                        </CardTitle>
                        <p className="text-muted-foreground text-sm mt-1 text-white">
                            {claims.length} reclamos en total
                        </p>
                    </div>
                </CardHeader>
                <CardContent>
                    {/* Vista móvil */}
                    <div className="block md:hidden space-y-4">
                        {claims.map((claim) => (
                            <MobileClaimCard
                                key={claim.id}
                                claim={claim}
                                onShowDetails={onShowDetails}
                                onEdit={onEdit}
                                onDelete={handleDelete}
                            />
                        ))}
                        {claims.length === 0 && (
                            <div className="text-center py-8 text-muted-foreground">
                                No hay reclamos disponibles
                            </div>
                        )}
                    </div>

                    {/* Vista desktop */}
                    <div className="hidden md:block rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent">
                                    <TableHead className="w-[120px] text-green-400">Estado</TableHead>
                                    <TableHead className="text-green-400">Cliente</TableHead>
                                    <TableHead className="text-green-400">Teléfono</TableHead>
                                    <TableHead className="hidden lg:table-cell text-green-400">Dirección</TableHead>
                                    <TableHead className="text-green-400">Técnico</TableHead>
                                    <TableHead className="hidden lg:table-cell text-green-400">Recibido por</TableHead>
                                    <TableHead className="text-green-400">Fecha</TableHead>
                                    <TableHead className="text-right text-green-400">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {claims.map((claim) => (
                                    <TableRow key={claim.id}>
                                        <TableCell><StatusBadge status={claim.status} /></TableCell>
                                        <TableCell className="font-medium">{claim.name}</TableCell>
                                        <TableCell>{claim.phone}</TableCell>
                                        <TableCell className="hidden lg:table-cell max-w-[200px] truncate">
                                            {claim.address}
                                        </TableCell>
                                        <TableCell>{claim.technicianId}</TableCell>
                                        <TableCell className="hidden lg:table-cell">{claim.receivedBy}</TableCell>
                                        <TableCell>{formatDateTime(claim.receivedAt)}</TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem onClick={() => onShowDetails(claim)}>
                                                        <Eye className="mr-2 h-4 w-4" /> Ver detalles
                                                    </DropdownMenuItem>
                                                    {onEdit && (
                                                        <DropdownMenuItem onClick={() => onEdit(claim)}>
                                                            <Edit2 className="mr-2 h-4 w-4" /> Editar
                                                        </DropdownMenuItem>
                                                    )}
                                                    <DropdownMenuItem
                                                        className="text-destructive"
                                                        onClick={() => handleDelete(claim.id)}
                                                        disabled={!claim.exported}
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {claims.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={8} className="h-24 text-center">
                                            No hay reclamos disponibles
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Delete Confirmation Dialog */}
            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>No se puede eliminar</DialogTitle>
                        <DialogDescription>
                        Este reclamo no puede ser eliminado porque aún no ha sido exportado. Por favor, exporta el reclamo primero.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                            Entendido
                        </Button>
                        <Button 
                            variant="destructive" 
                            onClick={handleDeleteConfirm}
                        >
                            Eliminar
                        </Button>
                    </DialogFooter>
                    </DialogContent>
            </Dialog>
        </div>
    );
}

export default ClaimsTable;