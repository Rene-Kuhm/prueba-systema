import React from 'react';
import { Claim, Technician } from '@/lib/types/admin';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogDescription,
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
  Activity,
  Wrench,
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

interface ReadOnlyFieldProps {
  label: string;
  value: string;
  icon: React.ElementType;
  multiline?: boolean;
}

const ReadOnlyField = ({
  label,
  value,
  icon: Icon,
  multiline = false
}: ReadOnlyFieldProps) => (
  <div className="space-y-1 sm:space-y-2">
    <Label className="flex items-center gap-2 text-xs font-medium sm:text-sm">
      <Icon className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
      {label}
    </Label>
    {multiline ? (
      <Textarea
        value={value}
        readOnly
        className="resize-none bg-muted text-xs sm:text-sm min-h-[60px] sm:min-h-[80px]"
        rows={3}
      />
    ) : (
      <Input
        value={value}
        readOnly
        className="h-8 text-xs bg-muted sm:text-sm sm:h-10"
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
      <Icon className="w-3 h-3" />
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
  const technicianName = claim?.technicianId
    ? technicians.find(tech => tech.id === claim.technicianId)?.name ?? 'Técnico no encontrado'
    : 'No asignado';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-2xl mx-auto my-4 p-4 sm:p-6 h-[90vh] sm:h-auto fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] rounded-lg">
        <DialogHeader className="space-y-2">
          <DialogTitle className="text-lg sm:text-xl">Detalles del Reclamo</DialogTitle>
          <DialogDescription>
            Información detallada del reclamo y su estado actual
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 h-[calc(100%-8rem)] sm:max-h-[70vh] px-1 sm:px-4 -mx-2 sm:mx-0">
          <div className="pb-4 space-y-4 sm:space-y-6">
            <Card className="border-0 sm:border">
              <CardHeader className="px-0 sm:px-6">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <CardTitle className="text-base sm:text-lg">Estado del Reclamo</CardTitle>
                  {claim && <StatusBadge status={claim.status} />}
                </div>
                <CardDescription className="text-sm">
                  Información general del reclamo
                </CardDescription>
              </CardHeader>
              <CardContent className="px-0 sm:px-6">
                <div className="grid gap-4">
                  <ReadOnlyField
                    label="Cliente"
                    value={claim?.name || 'No especificado'}
                    icon={User}
                  />
                  <ReadOnlyField
                    label="Técnico Asignado"
                    value={technicianName}
                    icon={Wrench}
                  />
                  {/* ...remaining ReadOnlyFields... */}
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 sm:border">
              <CardHeader className="px-0 sm:px-6">
                <CardTitle className="text-base sm:text-lg">Detalles del Problema</CardTitle>
                <CardDescription className="text-sm">
                  Descripción y resolución del reclamo
                </CardDescription>
              </CardHeader>
              <CardContent className="px-0 sm:px-6">
                <div className="grid gap-4">
                  <ReadOnlyField
                    label="Descripción del Problema"
                    value={claim?.description || 'No hay descripción disponible'}
                    icon={AlertCircle}
                    multiline
                  />
                  <ReadOnlyField
                    label="Resolución"
                    value={claim?.resolution || 'Pendiente de resolución'}
                    icon={CheckCircle}
                    multiline
                  />
                  {claim?.notes && (
                    <ReadOnlyField
                      label="Notas Adicionales"
                      value={claim.notes}
                      icon={Activity}
                      multiline
                    />
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>

        <DialogFooter className="px-0 mt-2 sm:mt-4">
          <Button
            onClick={onClose}
            className="w-full sm:w-auto"
          >
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>

    </Dialog>
  );
}