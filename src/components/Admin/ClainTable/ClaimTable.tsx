import React, { useState, useEffect } from 'react';
import { Eye, Trash2, CheckCircle, Clock, AlertCircle, Edit2, MoreHorizontal, Phone, MapPin, User, Archive, RefreshCw } from 'lucide-react';
import type { Claim, NewClaim } from '@/lib/types/admin';
import { toast } from 'react-toastify';
import { collection, doc, updateDoc, addDoc, deleteDoc, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
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
import { cn } from "@/lib/utils";

interface ExtendedClaim extends NewClaim {
    technicianName?: string;
    isArchived?: boolean;
    archivedAt?: string;
}

interface ClaimsTableProps {
    claims?: ExtendedClaim[];
    onShowDetails: (claim: ExtendedClaim) => void;
    onEdit?: (claim: ExtendedClaim) => void;
    onDelete: (id: string) => Promise<void>;
    onArchive?: (id: string) => Promise<void>;
    onRestore?: (id: string) => Promise<void>;
}

const formatDateTime = (date: string | Date | undefined) => {
    if (!date) {
        return formatDateTime(new Date());
    }
    
    try {
        let dateObj: Date;
        
        if (typeof date === 'string') {
            if (date.includes('/')) {
                const parts = date.split(/[/ :]/).map(part => part.trim());
                if (parts.length >= 3) {
                    const [day, month, year] = parts;
                    const time = parts.slice(3).join(':') || '00:00';
                    dateObj = new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${time}`);
                } else {
                    dateObj = new Date();
                }
            } else {
                dateObj = new Date(date);
            }
        } else {
            dateObj = date;
        }

        if (isNaN(dateObj.getTime())) {
            console.warn('Fecha inválida, usando fecha actual:', date);
            return formatDateTime(new Date());
        }

        return new Intl.DateTimeFormat('es-AR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
            timeZone: 'America/Argentina/Buenos_Aires'
        }).format(dateObj);
    } catch (error) {
        console.error('Error formateando fecha:', error);
        return formatDateTime(new Date());
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
    onDelete,
    onArchive,
    onRestore
}: { 
    claim: ExtendedClaim;
    onShowDetails: (claim: ExtendedClaim) => void;
    onEdit?: (claim: ExtendedClaim) => void;
    onDelete: (id: string) => Promise<void>;
    onArchive: (id: string) => Promise<void>;
    onRestore: (id: string) => Promise<void>;
}) => (
    <Card className="mb-4">
        <CardContent className="p-4">
            <div className="flex justify-between items-start mb-3">
                <div>
                    <h3 className="font-medium">{claim.name}</h3>
                    <p className="text-muted-foreground text-sm">
                        {formatDateTime(claim.receivedAt || claim.date)}
                    </p>
                </div>
                <div className="flex flex-col gap-2">
                    <StatusBadge status={claim.status} />
                    {claim.isArchived && (
                        <Badge variant="secondary">Archivado</Badge>
                    )}
                </div>
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
                    <span className="truncate">
                        {claim.technicianName || claim.technicianId}
                    </span>
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
                {!claim.isArchived && onEdit && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(claim)}
                    >
                        <Edit2 className="h-4 w-4 mr-1" />
                        Editar
                    </Button>
                )}
                {!claim.isArchived && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onArchive(claim.id)}
                    >
                        <Archive className="h-4 w-4 mr-1" />
                        Archivar
                    </Button>
                )}
                {claim.isArchived && (
                    <>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onRestore(claim.id)}
                        >
                            <RefreshCw className="h-4 w-4 mr-1" />
                            Restaurar
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onDelete(claim.id)}
                            className="text-destructive hover:text-destructive"
                        >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Eliminar
                        </Button>
                    </>
                )}
            </div>
        </CardContent>
    </Card>
);

export function ClaimsTable({
    claims: initialClaims = [],
    onShowDetails,
    onEdit,
    onDelete,
    onArchive: externalOnArchive,
    onRestore: externalOnRestore
}: ClaimsTableProps) {
    const [claims, setClaims] = useState<ExtendedClaim[]>(initialClaims);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [claimToDelete, setClaimToDelete] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showArchived, setShowArchived] = useState(false);

    useEffect(() => {
        const fetchClaims = async () => {
            try {
                const snapshot = await getDocs(collection(db, 'claims'));
                const fetchedClaims = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                })) as ExtendedClaim[];
                setClaims(fetchedClaims);
            } catch (error) {
                console.error('Error al obtener los reclamos:', error);
                toast.error('Error al obtener los reclamos');
            }
        };

        fetchClaims();
    }, []);

    const filteredClaims = claims.filter(claim => 
        showArchived ? claim.isArchived : !claim.isArchived
    );

    const handleArchive = async (claimId: string) => {
        try {
            if (externalOnArchive) {
                await externalOnArchive(claimId);
            } else {
                await updateDoc(doc(db, 'claims', claimId), { 
                    isArchived: true, 
                    archivedAt: new Date().toISOString()
                });
            }
            
            setClaims(prevClaims => 
                prevClaims.map(claim => 
                    claim.id === claimId 
                        ? { ...claim, isArchived: true, archivedAt: new Date().toISOString() } 
                        : claim
                )
            );
            
            toast.success('Reclamo archivado exitosamente');
        } catch (error) {
            console.error('Error al archivar:', error);
            toast.error('Error al archivar el reclamo');
        }
    };

    const handleRestore = async (claimId: string) => {
        try {
            if (externalOnRestore) {
                await externalOnRestore(claimId);
            } else {
                await updateDoc(doc(db, 'claims', claimId), {
                    isArchived: false,
                    archivedAt: undefined
                });
            }
            
            setClaims(prevClaims => 
                prevClaims.map(claim => 
                    claim.id === claimId 
                        ? { 
                            ...claim, 
                            isArchived: false, 
                            archivedAt: undefined 
                          } 
                        : claim
                )
            );
            
            toast.success('Reclamo restaurado exitosamente');
        } catch (error) {
            console.error('Error al restaurar:', error);
            toast.error('Error al restaurar el reclamo');
        }
    };

    const handleDelete = async (claimId: string) => {
        const claim = claims.find(c => c.id === claimId);
        if (!claim?.isArchived) {
            toast.warning('Debe archivar el reclamo antes de eliminarlo');
            return;
        }
        setClaimToDelete(claimId);
        setShowDeleteDialog(true);
    };

    const handleDeleteConfirm = async () => {
        if (claimToDelete) {
            try {
                setIsDeleting(true);
                await deleteDoc(doc(db, 'claims', claimToDelete));
                setClaims(prevClaims => prevClaims.filter(claim => claim.id !== claimToDelete));
                setShowDeleteDialog(false);
                setClaimToDelete(null);
                toast.success('Reclamo eliminado exitosamente');
            } catch (error) {
                console.error('Error al eliminar:', error);
                toast.error('Error al eliminar el reclamo');
            } finally {
                setIsDeleting(false);
            }
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
                            {filteredClaims.length} reclamos {showArchived ? 'archivados' : 'activos'}
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        onClick={() => setShowArchived(!showArchived)}
                        className="text-white"
                    >
                        {showArchived ? 'Ver Activos' : 'Ver Archivados'}
                    </Button>
                </CardHeader>
                <CardContent>
                    {/* Vista móvil */}
                    <div className="block md:hidden space-y-4">
                        {filteredClaims.map((claim) => (
                            <MobileClaimCard
                                key={claim.id}
                                claim={claim}
                                onShowDetails={onShowDetails}
                                onEdit={onEdit}
                                onDelete={handleDelete}
                                onArchive={handleArchive}
                                onRestore={handleRestore}
                            />
                        ))}
                        {filteredClaims.length === 0 && (
                            <div className="text-center py-8 text-muted-foreground">
                                No hay reclamos {showArchived ? 'archivados' : 'activos'}
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
                                    <TableHead className="text-green-400">Fecha y Hora</TableHead>
                                    <TableHead className="text-right text-green-400">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredClaims.map((claim) => (
                                    <TableRow key={claim.id}>
                                        <TableCell>
                                            <div className="flex flex-col gap-1">
                                                <StatusBadge status={claim.status} />
                                                {claim.isArchived && (
                                                    <Badge variant="secondary">Archivado</Badge>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-medium">{claim.name}</TableCell>
                                        <TableCell>{claim.phone}</TableCell>
                                        <TableCell className="hidden lg:table-cell max-w-[200px] truncate">
                                            {claim.address}
                                        </TableCell>
                                        <TableCell>{claim.technicianName || claim.technicianId}</TableCell>
                                        <TableCell className="hidden lg:table-cell">{claim.receivedBy}</TableCell>
                                        <TableCell>
                                            {formatDateTime(claim.receivedAt || claim.date)}
                                        </TableCell>
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
                                                    {!claim.isArchived && onEdit && (
                                                        <DropdownMenuItem onClick={() => onEdit(claim)}>
                                                            <Edit2 className="mr-2 h-4 w-4" /> Editar
                                                        </DropdownMenuItem>
                                                    )}
                                                    {!claim.isArchived && (
                                                        <DropdownMenuItem onClick={() => handleArchive(claim.id)}>
                                                            <Archive className="mr-2 h-4 w-4" /> Archivar
                                                        </DropdownMenuItem>
                                                    )}
                                                    {claim.isArchived && (
                                                        <>
                                                            <DropdownMenuItem onClick={() => handleRestore(claim.id)}>
                                                                <RefreshCw className="mr-2 h-4 w-4" /> Restaurar
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                className="text-destructive"
                                                                onClick={() => handleDelete(claim.id)}
                                                            >
                                                                <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                                                            </DropdownMenuItem>
                                                        </>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {filteredClaims.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={8} className="h-24 text-center">
                                            No hay reclamos {showArchived ? 'archivados' : 'activos'}
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Diálogo de confirmación de eliminación */}
            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirmar eliminación</DialogTitle>
                        <DialogDescription>
                            ¿Estás seguro de que deseas eliminar este reclamo? Esta acción no se puede deshacer.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button 
                            variant="outline" 
                            onClick={() => setShowDeleteDialog(false)}
                            disabled={isDeleting}
                        >
                            Cancelar
                        </Button>
                        <Button 
                            variant="destructive" 
                            onClick={handleDeleteConfirm}
                            disabled={isDeleting}
                        >
                            {isDeleting ? 'Eliminando...' : 'Eliminar'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default ClaimsTable;