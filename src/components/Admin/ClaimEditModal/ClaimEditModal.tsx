// ClaimEditModal.tsx
import { useState, useEffect } from 'react';
import {
 Dialog,
 DialogContent,
 DialogHeader,
 DialogTitle,
 DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
 Select,
 SelectContent,
 SelectItem,
 SelectTrigger,
 SelectValue,
} from "@/components/ui/select";
import { ExtendedClaim, Technician } from '@/lib/types/admin';
import { toast } from 'react-toastify';

interface ClaimEditModalProps {
 isOpen: boolean;
 onClose: () => void;
 onSave: (claim: ExtendedClaim) => Promise<void>;
 claim: ExtendedClaim | null;
 technicians?: Technician[];
}

type ClaimStatus = 'pending' | 'in_progress' | 'completed';

interface FormData {
 name: string;
 phone: string;
 address: string;
 status: ClaimStatus;
 technicianId: string;
 reason: string;
 resolution: string;
}

const INITIAL_FORM_DATA: FormData = {
 name: '',
 phone: '',
 address: '',
 status: 'pending',
 technicianId: 'unassigned',
 reason: '',
 resolution: ''
};

const STATUS_OPTIONS = [
 { value: 'pending', label: 'Pendiente' },
 { value: 'in_progress', label: 'En Proceso' },
 { value: 'completed', label: 'Completado' }
] as const;

export default function ClaimEditModal({
 isOpen,
 onClose,
 onSave,
 claim,
 technicians = []
}: ClaimEditModalProps) {
 const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA);
 const [isSubmitting, setIsSubmitting] = useState(false);
 const [errors, setErrors] = useState<Partial<FormData>>({});

 useEffect(() => {
   if (claim) {
     setFormData({
       name: claim.name || '',
       phone: claim.phone || '',
       address: claim.address || '',
       status: (claim.status as ClaimStatus) || 'pending',
       technicianId: claim.technicianId || 'unassigned',
       reason: claim.reason || '',
       resolution: claim.resolution || ''
     });
     setErrors({});
   }
 }, [claim]);

 const validateForm = (): boolean => {
   const newErrors: Partial<FormData> = {};
   if (!formData.name.trim()) newErrors.name = 'El nombre es requerido';
   if (!formData.phone.trim()) newErrors.phone = 'El teléfono es requerido';
   if (!formData.address.trim()) newErrors.address = 'La dirección es requerida';
   if (!formData.reason.trim()) newErrors.reason = 'El motivo es requerido';
   setErrors(newErrors);
   return Object.keys(newErrors).length === 0;
 };

 const handleChange = (
   e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
 ) => {
   const { name, value } = e.target;
   setFormData(prev => ({
     ...prev,
     [name]: value
   }));
   if (errors[name as keyof FormData]) {
     setErrors(prev => ({ ...prev, [name]: undefined }));
   }
 };

 const handleSelectChange = (name: keyof FormData, value: string) => {
   setFormData(prev => ({
     ...prev,
     [name]: value
   }));
 };

 const handleSubmit = async (e: React.FormEvent) => {
   e.preventDefault();
   if (!claim || !validateForm()) return;

   setIsSubmitting(true);
   try {
     const updatedClaim: ExtendedClaim = {
       ...claim,
       ...formData,
       lastUpdate: new Date().toISOString()
     };
     await onSave(updatedClaim);
     toast.success('Reclamo actualizado exitosamente');
     onClose();
   } catch (error) {
     console.error('Error saving claim:', error);
     toast.error('Error al actualizar el reclamo');
   } finally {
     setIsSubmitting(false);
   }
 };

 const handleClose = () => {
   setFormData(INITIAL_FORM_DATA);
   setErrors({});
   onClose();
 };

 if (!claim) return null;

 return (
   <Dialog open={isOpen} onOpenChange={handleClose}>
     <DialogContent className="max-w-2xl">
       <DialogHeader>
         <DialogTitle className="text-xl font-bold">Editar Reclamo</DialogTitle>
       </DialogHeader>
       <form onSubmit={handleSubmit} className="space-y-6">
         <div className="grid gap-4 md:grid-cols-2">
           <div className="space-y-2">
             <Label htmlFor="name" className="required">Nombre del Cliente</Label>
             <Input
               id="name"
               name="name"
               value={formData.name}
               onChange={handleChange}
               className={errors.name ? 'border-red-500' : ''}
               aria-invalid={errors.name ? 'true' : 'false'}
             />
             {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
           </div>

           <div className="space-y-2">
             <Label htmlFor="phone" className="required">Teléfono</Label>
             <Input
               id="phone"
               name="phone"
               value={formData.phone}
               onChange={handleChange}
               className={errors.phone ? 'border-red-500' : ''}
               aria-invalid={errors.phone ? 'true' : 'false'}
             />
             {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
           </div>

           <div className="space-y-2 md:col-span-2">
             <Label htmlFor="address" className="required">Dirección</Label>
             <Input
               id="address"
               name="address"
               value={formData.address}
               onChange={handleChange}
               className={errors.address ? 'border-red-500' : ''}
               aria-invalid={errors.address ? 'true' : 'false'}
             />
             {errors.address && <p className="text-sm text-red-500">{errors.address}</p>}
           </div>

           <div className="space-y-2">
             <Label htmlFor="status">Estado</Label>
             <Select 
               value={formData.status}
               onValueChange={(value) => handleSelectChange('status', value)}
             >
               <SelectTrigger>
                 <SelectValue placeholder="Seleccionar estado" />
               </SelectTrigger>
               <SelectContent>
                 {STATUS_OPTIONS.map(option => (
                   <SelectItem key={option.value} value={option.value}>
                     {option.label}
                   </SelectItem>
                 ))}
               </SelectContent>
             </Select>
           </div>

           <div className="space-y-2">
             <Label htmlFor="technicianId">Técnico</Label>
             <Select
               value={formData.technicianId}
               onValueChange={(value) => handleSelectChange('technicianId', value)}
             >
               <SelectTrigger>
                 <SelectValue placeholder="Seleccionar técnico" />
               </SelectTrigger>
               <SelectContent>
                 <SelectItem value="unassigned">Sin asignar</SelectItem>
                 {technicians.map(tech => (
                   <SelectItem key={tech.id} value={tech.id}>
                     {tech.name}
                   </SelectItem>
                 ))}
               </SelectContent>
             </Select>
           </div>

           <div className="space-y-2 md:col-span-2">
             <Label htmlFor="reason" className="required">Motivo del Reclamo</Label>
             <Textarea
               id="reason"
               name="reason"
               value={formData.reason}
               onChange={handleChange}
               rows={3}
               className={errors.reason ? 'border-red-500' : ''}
               aria-invalid={errors.reason ? 'true' : 'false'}
             />
             {errors.reason && <p className="text-sm text-red-500">{errors.reason}</p>}
           </div>

           <div className="space-y-2 md:col-span-2">
             <Label htmlFor="resolution">Resolución</Label>
             <Textarea
               id="resolution"
               name="resolution"
               value={formData.resolution}
               onChange={handleChange}
               rows={3}
             />
           </div>
         </div>

         <DialogFooter>
           <Button
             type="button"
             variant="outline"
             onClick={handleClose}
             disabled={isSubmitting}
           >
             Cancelar
           </Button>
           <Button
             type="submit"
             disabled={isSubmitting}
             className="ml-2"
           >
             {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
           </Button>
         </DialogFooter>
       </form>
     </DialogContent>
   </Dialog>
 );
}