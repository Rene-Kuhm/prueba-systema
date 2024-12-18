import React from 'react';
import { Claim, Technician } from '@/lib/types/admin';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  User,
  Phone,
  MapPin,
  Activity,
  Wrench,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import { cn } from "@/lib/utils";

interface ClaimDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    claim: Claim | null;
    technicians?: Technician[];
}

const ReadOnlyField = ({ 
  label, 
  value, 
  icon: Icon,
  multiline = false
}: { 
  label: string; 
  value: string;
  icon: React.ElementType;
  multiline?: boolean;
}) => (
  <div className="space-y-2">
    <Label className="text-sm font-medium flex items-center gap-2">
      <Icon className="h-4 w-4 text-muted-foreground" />
      {label}
    </Label>
    {multiline ? (
      <Textarea
        value={value}
        readOnly
        className="resize-none bg-muted"
        rows={3}
      />
    ) : (
      <Input
        value={value}
        readOnly
        className="bg-muted"
      />
    )}
  </div>
);

const StatusBadge = ({ status }: { status: string }) => {
  const statusConfig = {
    pending: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Clock, text: 'Pendiente' },
    assigned: { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: Wrench, text: 'Asignado' },
    in_progress: { color: 'bg-purple-100 text-purple-800 border-purple-200', icon: Activity, text: 'En Progreso' },
    completed: { color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle, text: 'Completado' },
    default: { color: 'bg-gray-100 text-gray-800 border-gray-200', icon: AlertCircle, text: 'Desconocido' }
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.default;
  const Icon = config.icon;

  return (
    <Badge variant="outline" className={cn("gap-1", config.color)}>
      <Icon className="h-3 w-3" />
      {config.text}
    </Badge>
  );
};

export default function ClaimDetailsModal({
    isOpen,
    onClose,
    claim,
    technicians = []
}: ClaimDetailsModalProps) {
    const getTechnicianName = () => {
        if (!claim?.technicianId) return 'No asignado';
        const technician = technicians.find(tech => tech.id === claim.technicianId);
        return technician ? technician.name : 'Técnico no encontrado';
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Detalles del Reclamo</DialogTitle>
                </DialogHeader>

                <ScrollArea className="max-h-[70vh] pr-4">
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle>Estado del Reclamo</CardTitle>
                                    {claim && <StatusBadge status={claim.status} />}
                                </div>
                                <CardDescription>
                                    Información general del reclamo
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="grid gap-4">
                                <ReadOnlyField
                                    label="Cliente"
                                    value={claim?.name || 'No especificado'}
                                    icon={User}
                                />
                                <ReadOnlyField
                                    label="Teléfono"
                                    value={claim?.phone || 'No especificado'}
                                    icon={Phone}
                                />
                                <ReadOnlyField
                                    label="Dirección"
                                    value={claim?.address || 'No especificada'}
                                    icon={MapPin}
                                />
                                <ReadOnlyField
                                    label="Técnico Asignado"
                                    value={getTechnicianName()}
                                    icon={Wrench}
                                />
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Detalles del Problema</CardTitle>
                                <CardDescription>
                                    Descripción y resolución del reclamo
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="grid gap-4">
                                <ReadOnlyField
                                    label="Motivo del Reclamo"
                                    value={claim?.reason || 'No especificado'}
                                    icon={FileText}
                                    multiline
                                />
                                <ReadOnlyField
                                    label="Resolución"
                                    value={claim?.resolution || 'No resuelto'}
                                    icon={CheckCircle}
                                    multiline
                                />
                            </CardContent>
                        </Card>
                    </div>
                </ScrollArea>

                <DialogFooter>
                    <Button onClick={onClose}>Cerrar</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}