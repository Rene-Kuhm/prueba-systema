import { useEffect } from 'react';
import PropTypes from 'prop-types';
import { Eye, Trash2, CheckCircle, Clock, AlertCircle, Edit2, MoreHorizontal, Phone, MapPin, User, Archive, RefreshCw } from 'lucide-react';
import { format, isValid } from 'date-fns';
import { es } from 'date-fns/locale';
import type { ExtendedClaim } from '@/lib/types/admin';
import { toast } from 'react-toastify';
import { useCurrentTime } from '@/hooks/useCurrentTime';
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

interface ClaimsTableProps {
   claims: ExtendedClaim[];
   showArchived: boolean;
   showDeleteDialog: boolean;
   isDeleting: boolean;
   onShowDetails: (claim: ExtendedClaim) => void;
   onEdit?: (claim: ExtendedClaim) => void;
   onDelete?: (id: string) => void;
   onArchive?: (id: string) => void;
   onRestore?: (id: string) => void;
   onToggleArchived: () => void;
   onCancelDelete: () => void;
   onConfirmDelete: () => void;
}

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

const formatClaimDateTime = (date: string | Date | null | undefined | { toDate(): Date }): string => {
  if (!date) return '---';
  
  try {
      let dateObj: Date;
      
      if (typeof date === 'object' && 'toDate' in date) {
          dateObj = date.toDate();
      } else if (typeof date === 'string') {
          dateObj = new Date(date);
      } else if (date instanceof Date) {
          dateObj = date;
      } else {
          return '---';
      }
      
      if (!isValid(dateObj)) {
          return '---';
      }
      
      return format(dateObj, "dd/MM/yyyy 'a las' HH:mm:ss", {
          locale: es
      });
  } catch (error) {
      console.error('Error al formatear fecha:', error);
      return '---';
  }
};
interface MobileClaimCardProps {
 claim: ExtendedClaim;
 onShowDetails: (claim: ExtendedClaim) => void;
 onEdit?: (claim: ExtendedClaim) => void;
 onDelete?: (id: string) => void;
 onArchive?: (id: string) => void;
 onRestore?: (id: string) => void;
}

const MobileClaimCard: React.FC<MobileClaimCardProps> = ({
 claim,
 onShowDetails,
 onEdit,
 onDelete,
 onArchive,
 onRestore,
}) => {
 return (
   <Card className="mb-4">
     <CardContent className="p-4">
       <div className="flex items-start justify-between mb-3">
         <div>
           <h3 className="font-medium">{claim.name}</h3>
           <p className="text-sm text-muted-foreground">
             {formatClaimDateTime(claim.receivedAt || claim.date)}
           </p>
         </div>
         <div className="flex flex-col gap-2">
           <StatusBadge status={claim.status} />
           {claim.isArchived && (
             <Badge variant="secondary">Archivado</Badge>
           )}
         </div>
       </div>

       <div className="mb-4 space-y-2">
         <div className="flex items-center text-sm text-muted-foreground">
           <Phone className="w-4 h-4 mr-2 shrink-0" />
           <span className="truncate">{claim.phone}</span>
         </div>
         <div className="flex items-center text-sm text-muted-foreground">
           <MapPin className="w-4 h-4 mr-2 shrink-0" />
           <span className="truncate">{claim.address}</span>
         </div>
         <div className="flex items-center text-sm text-muted-foreground">
           <User className="w-4 h-4 mr-2 shrink-0" />
           <span className="truncate">
             {claim.technicianName || claim.technicianId}
           </span>
         </div>
       </div>

       <div className="flex justify-end gap-2 pt-3 border-t">
         <Button variant="outline" size="sm" onClick={() => onShowDetails(claim)}>
           <Eye className="w-4 h-4 mr-1" /> Ver
         </Button>
         {!claim.isArchived && onEdit && (
           <Button variant="outline" size="sm" onClick={() => onEdit(claim)}>
             <Edit2 className="w-4 h-4 mr-1" /> Editar
           </Button>
         )}
         {!claim.isArchived && onArchive && claim.id && (
           <Button variant="outline" size="sm" onClick={() => onArchive(claim.id)}>
             <Archive className="w-4 h-4 mr-1" /> Archivar
           </Button>
         )}
         {claim.isArchived && (
           <>
             {onRestore && claim.id && (
               <Button variant="outline" size="sm" onClick={() => onRestore(claim.id)}>
                 <RefreshCw className="w-4 h-4 mr-1" /> Restaurar
               </Button>
             )}
             {onDelete && claim.id && (
               <Button
                 variant="outline"
                 size="sm"
                 onClick={() => onDelete(claim.id)}
                 className="text-destructive hover:text-destructive"
               >
                 <Trash2 className="w-4 h-4 mr-1" /> Eliminar
               </Button>
             )}
           </>
         )}
       </div>
     </CardContent>
   </Card>
 );
};

const ClaimsTable: React.FC<ClaimsTableProps> = ({
 claims,
 showArchived,
 showDeleteDialog,
 isDeleting,
 onShowDetails,
 onEdit,
 onDelete,
 onArchive,
 onRestore,
 onToggleArchived,
 onCancelDelete,
 onConfirmDelete
}) => {
 const { formattedTime } = useCurrentTime();
 const isUsingLocalTime = true;
 const timeError = null;

 useEffect(() => {
   if (timeError) {
     toast.warn('Error al sincronizar la hora: ' + timeError);
   }
 }, [timeError]);

 const filteredClaims = claims.filter((claim): claim is ExtendedClaim => 
   showArchived ? Boolean(claim.isArchived) : !claim.isArchived
 );

 const handleIdAction = (id: string | undefined, action?: (id: string) => void) => {
   if (id && action) {
     action(id);
   }
 };

 return (
   <div className="space-y-4">
     <Card className="mb-8 bg-slate-700 rounded-xl">
       <CardHeader className="flex flex-col items-start justify-between pb-6 space-y-2 sm:flex-row sm:items-center sm:space-y-0">
         <div>
           <CardTitle className="text-xl font-bold text-green-400 sm:text-2xl">
             Gestión de Reclamos
           </CardTitle>
           <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
             <p className="text-sm text-white text-muted-foreground">
               Reclamos {showArchived ? 'archivados' : 'activos'}
             </p>
             <span className="text-white sm:ml-2">•</span>
             <div className="text-sm text-white">
               {formattedTime}
               {isUsingLocalTime && (
                 <span className="ml-1 text-xs text-white">(hora local)</span>
               )}
             </div>
           </div>
         </div>
         <Button variant="outline" onClick={onToggleArchived} className="text-black">
           {showArchived ? 'Ver Activos' : 'Ver Archivados'}
         </Button>
       </CardHeader>
       <CardContent>
         <div className="block space-y-4 md:hidden">
           {filteredClaims.map((claim) => (
             <MobileClaimCard
               key={claim.id}
               claim={claim}
               onShowDetails={onShowDetails}
               onEdit={onEdit}
               onDelete={onDelete}
               onArchive={onArchive}
               onRestore={onRestore}
             />
           ))}
           {filteredClaims.length === 0 && (
             <div className="py-8 text-center text-muted-foreground">
               No hay reclamos {showArchived ? 'archivados' : 'activos'}
             </div>
           )}
         </div>

         <div className="hidden border rounded-md md:block">
           <Table>
             <TableHeader>
               <TableRow className="hover:bg-transparent">
                 <TableHead className="w-[120px] text-green-400">Estado</TableHead>
                 <TableHead className="text-green-400">Cliente</TableHead>
                 <TableHead className="text-green-400">Teléfono</TableHead>
                 <TableHead className="hidden text-green-400 lg:table-cell">Dirección</TableHead>
                 <TableHead className="text-green-400">Técnico</TableHead>
                 <TableHead className="hidden text-green-400 lg:table-cell">Recibido por</TableHead>
                 <TableHead className="w-[180px] text-green-400 whitespace-nowrap">
                   <div className="flex items-center gap-1">
                     <Clock className="w-4 h-4" />
                     <span>Fecha y Hora de Registro</span>
                   </div>
                 </TableHead>
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
                   <TableCell className="whitespace-nowrap">
                     <div className="font-medium">
                       {formatClaimDateTime(claim.createdAt || claim.receivedAt || claim.date)}
                     </div>
                     {claim.createdAt !== claim.lastUpdate && claim.lastUpdate && (
                       <div className="text-xs text-muted-foreground">
                         Actualizado: {formatClaimDateTime(claim.lastUpdate)}
                       </div>
                     )}
                   </TableCell>
                   <TableCell className="text-right">
                     <DropdownMenu>
                       <DropdownMenuTrigger asChild>
                         <Button variant="outline" size="sm" className="w-8 h-8 p-0">
                           <MoreHorizontal className="w-4 h-4" />
                         </Button>
                       </DropdownMenuTrigger>
                       <DropdownMenuContent align="end">
                         <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                         <DropdownMenuSeparator />
                         <DropdownMenuItem onClick={() => onShowDetails(claim)}>
                           <Eye className="w-4 h-4 mr-2" /> Ver detalles
                         </DropdownMenuItem>
                         {!claim.isArchived && onEdit && (
                           <DropdownMenuItem onClick={() => onEdit(claim)}>
                             <Edit2 className="w-4 h-4 mr-2" /> Editar
                           </DropdownMenuItem>
                         )}
                         {!claim.isArchived && onArchive && (
                           <DropdownMenuItem onClick={() => handleIdAction(claim.id, onArchive)}>
                             <Archive className="w-4 h-4 mr-2" /> Archivar
                           </DropdownMenuItem>
                         )}
                         {claim.isArchived && (
                           <>
                             <DropdownMenuItem onClick={() => handleIdAction(claim.id, onRestore)}>
                               <RefreshCw className="w-4 h-4 mr-2" /> Restaurar
                             </DropdownMenuItem>
                             <DropdownMenuItem
                               className="text-destructive"
                               onClick={() => handleIdAction(claim.id, onDelete)}
                             >
                               <Trash2 className="w-4 h-4 mr-2" /> Eliminar
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

     <Dialog open={showDeleteDialog} onOpenChange={onCancelDelete}>
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
             onClick={onCancelDelete}
             disabled={isDeleting}
           >
             Cancelar
           </Button>
           <Button 
             variant="destructive" 
             onClick={onConfirmDelete}
             disabled={isDeleting}
           >
             {isDeleting ? 'Eliminando...' : 'Eliminar'}
           </Button>
         </DialogFooter>
       </DialogContent>
     </Dialog>
   </div>
 );
};

const ClaimPropTypes = PropTypes.shape({
 id: PropTypes.string,
 name: PropTypes.string,
 phone: PropTypes.string,
 address: PropTypes.string,
 status: PropTypes.string,
 technicianId: PropTypes.string,
 technicianName: PropTypes.string,
 receivedAt: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date), PropTypes.object]),
 receivedBy: PropTypes.string,
 date: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date), PropTypes.object]),
 createdAt: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date), PropTypes.object]),
 lastUpdate: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date), PropTypes.object]),
 isArchived: PropTypes.bool
});

MobileClaimCard.propTypes = {
 claim: ClaimPropTypes.isRequired,
 onShowDetails: PropTypes.func.isRequired,
 onEdit: PropTypes.func,
 onDelete: PropTypes.func,
 onArchive: PropTypes.func,
 onRestore: PropTypes.func
};

ClaimsTable.propTypes = {
 claims: PropTypes.arrayOf(ClaimPropTypes).isRequired,
 showArchived: PropTypes.bool.isRequired,
 showDeleteDialog: PropTypes.bool.isRequired,
 isDeleting: PropTypes.bool.isRequired,
 onShowDetails: PropTypes.func.isRequired,
 onEdit: PropTypes.func,
 onDelete: PropTypes.func,
 onArchive: PropTypes.func,
 onRestore: PropTypes.func,
 onToggleArchived: PropTypes.func.isRequired,
 onCancelDelete: PropTypes.func.isRequired,
 onConfirmDelete: PropTypes.func.isRequired
};

export default ClaimsTable;