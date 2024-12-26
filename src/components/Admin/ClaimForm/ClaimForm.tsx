import React, { useEffect, useState, useCallback } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { ClaimFormProps, ClaimFormTechnician, NewClaim } from '@/lib/types/admin';
import { collection, getDocs, addDoc, doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { toast } from 'react-toastify';
import { sendWhatsAppMessage } from '@/config/services/whatsappService';
import { useCurrentTime } from '@/hooks/useCurrentTime';

// Importaciones de componentes UI
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

// Modify hook return type to include isUsingLocalTime
interface CurrentTimeHook {
  currentTime: Date;
  formattedTime: string;
  isUsingLocalTime: boolean;
}

const ClaimForm: React.FC<ClaimFormProps> = ({ claim, onSubmit, onChange }) => {
  const { currentTime, formattedTime, isUsingLocalTime } = useCurrentTime() as CurrentTimeHook;
  const [technicians, setTechnicians] = useState<ClaimFormTechnician[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTechnicianId, setSelectedTechnicianId] = useState(claim?.technicianId || '');
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const methods = useForm({
    defaultValues: claim,
  });

  // Crear claim inicial con useCallback
  const createInitialClaim = useCallback((): NewClaim => ({
    id: '',
    name: '',
    phone: '',
    address: '',
    reason: '',
    technicianId: '',
    receivedBy: '',
    receivedAt:formattedTime,
    status: 'pending',
    title: '',
    customer: '',
    date: formattedTime,
    resolution: '',
    notificationSent: false,
    technicalDetails: '',
    notes: '',
    description: '',
    claimType: '',
    claimAmount: 0,
    updatedAt: new Date().toISOString()
  }), [currentTime]);

  useEffect(() => {
    if (!claim) {
      const initialClaim = createInitialClaim();
      onChange(initialClaim);
    }
  }, [claim, createInitialClaim, onChange]);

  useEffect(() => {
    fetchTechnicians();
  }, []);

  useEffect(() => {
    if (claim?.technicianId !== selectedTechnicianId) {
      setSelectedTechnicianId(claim?.technicianId || '');
    }
  }, [claim?.technicianId]);

  const fetchTechnicians = async () => {
    try {
      const technicianCollection = collection(db, 'technicians');
      const technicianSnapshot = await getDocs(technicianCollection);
      const technicianList: ClaimFormTechnician[] = [];

      await Promise.all(
        technicianSnapshot.docs.map(async (techDoc) => {
          const technicianData = techDoc.data();
          const userDoc = await getDoc(doc(db, 'users', techDoc.id));
          const userData = userDoc.data();

          if (userData?.role === 'technician' && userData.active !== false && userData.approved === true) {
            technicianList.push({
              id: techDoc.id,
              name: technicianData.name || userData.fullName,
              phone: technicianData.phone || '',
              email: userData.email,
            });
          }
        })
      );

      setTechnicians(technicianList);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching technicians:', err);
      setError('Error al cargar los técnicos');
      setLoading(false);
    }
  };

  const createClaim = async (claimData: NewClaim) => {
    try {
      const now = new Date();
      const docRef = await addDoc(collection(db, 'claims'), {
        ...claimData,
        createdAt: now.toISOString(),
        receivedAt: now.toISOString(),
        lastUpdate: now.toISOString(),
        date: now.toISOString(),
        status: 'pending' as const,
      });

      await setDoc(doc(db, 'claims', docRef.id), { id: docRef.id }, { merge: true });

      // Enviar WhatsApp al cliente y al técnico
      await sendMessagesToParticipants(docRef.id, claimData);

      return docRef.id;
    } catch (e) {
      console.error('Error adding claim: ', e);
      throw e;
    }
  };

  // Función auxiliar para enviar mensajes de WhatsApp
  const sendMessagesToParticipants = async (claimId: string, claimData: NewClaim) => {
    const timestamp = formattedTime;
    // Enviar WhatsApp al cliente
      const messageToCustomer = `🔔 *Reclamo Registrado*\n\n`
      + `Hola ${claimData.name},\n\n`
      + `Tu reclamo ha sido registrado exitosamente:\n\n`
      + `📝 *Detalles:*\n`
      + `- N° de Reclamo: ${claimId}\n`
      + `- Dirección: ${claimData.address}\n`
      + `- Motivo: ${claimData.reason}\n`
      + `- Fecha y Hora: ${timestamp}\n\n`
      + `Te mantendremos informado sobre el estado de tu reclamo.`;

      try {
        await sendWhatsAppMessage({
          to: claimData.phone,
          body: messageToCustomer
        });
        toast.success('Notificación enviada al cliente');
      } catch (error) {
        console.error('Error enviando notificación:', error);
        toast.error('No se pudo enviar la notificación al cliente');
      }

    // Enviar WhatsApp al técnico
    const technician = technicians.find(t => t.id === claimData.technicianId);
    if (technician?.phone) {
      const messageToTechnician = `🔧 *Nuevo Reclamo Asignado*\n\n`
        + `Se te ha asignado un nuevo reclamo:\n\n`
        + `👤 *Cliente:* ${claimData.name}\n`
        + `📍 *Dirección:* ${claimData.address}\n`
        + `📱 *Teléfono:* ${claimData.phone}\n`
        + `📝 *Motivo:* ${claimData.reason}\n\n`
        + `👨‍💼 *Recibido por:* ${claimData.receivedBy}\n`
        + `🕒 *Fecha y Hora:* ${timestamp}\n\n`
        + `Por favor, contacta al cliente para coordinar la visita.`;

      try {
        let techPhone = technician.phone.replace(/[\s+\-()]/g, '');
        if (!techPhone.startsWith('549')) {
          techPhone = `549${techPhone.replace(/^0|^15/, '')}`;
        }

        await sendWhatsAppMessage({
          to: techPhone,
          body: messageToTechnician
        });
        toast.success('Notificación enviada al técnico');
      } catch (error) {
        console.error('Error enviando notificación al técnico:', error);
        toast.error('No se pudo notificar al técnico');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!claim || !claim.phone || !claim.name || !claim.address || !claim.reason || 
        !selectedTechnicianId || !claim.receivedBy) {
        setAlertMessage('Por favor, complete todos los campos requeridos');
        return;
    }

    setIsSubmitting(true);
    try {
      const baseData = createInitialClaim();
      const updatedClaim: NewClaim = {
        ...baseData,
        ...claim,
        receivedAt: formattedTime,
        date: formattedTime,
        technicianId: selectedTechnicianId,
        status: 'pending',
        notificationSent: false
      };

      await createClaim(updatedClaim);
      await onSubmit();
      setAlertMessage('Reclamo registrado exitosamente');
      resetForm();
    } catch (error) {
      console.error('Error al guardar:', error);
      setAlertMessage('Error al registrar el reclamo');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    const initialClaim = createInitialClaim();
    onChange(initialClaim);
    setSelectedTechnicianId('');
    setAlertMessage(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="w-4 h-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="mb-8 bg-slate-700 rounded-xl">
      <CardHeader>
        <CardTitle className='text-green-400'>Cargar Nuevo Reclamo</CardTitle>
        <CardDescription className='text-white'>
          Complete todos los campos requeridos para registrar un nuevo reclamo.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {alertMessage && (
          <Alert
            variant={alertMessage.includes('éxito') ? 'default' : 'destructive'}
            className="mb-6"
          >
            {alertMessage.includes('éxito') ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <AlertCircle className="w-4 h-4" />
            )}
            <AlertTitle>
              {alertMessage.includes('éxito') ? 'Éxito' : 'Error'}
            </AlertTitle>
            <AlertDescription>{alertMessage}</AlertDescription>
          </Alert>
        )}
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormItem>
                <FormLabel className="text-green-400 required-field">Teléfono</FormLabel>
                <FormControl>
                  <Input
                    className='bg-slate-400'
                    placeholder="Ej: +54 11 1234-5678"
                    value={claim?.phone || ''}
                    onChange={(e) => onChange({ ...claim, phone: e.target.value })}
                    required
                  />
                </FormControl>
              </FormItem>

              <FormItem>
                <FormLabel className="text-green-400 required-field">Nombre</FormLabel>
                <FormControl>
                  <Input
                    className='bg-slate-400'
                    placeholder="Nombre completo"
                    value={claim?.name || ''}
                    onChange={(e) => onChange({ ...claim, name: e.target.value })}
                    required
                  />
                </FormControl>
              </FormItem>

              <FormItem>
                <FormLabel className="text-green-400 required-field">Dirección</FormLabel>
                <FormControl>
                  <Input
                    className='bg-slate-400'
                    placeholder="Dirección completa"
                    value={claim?.address || ''}
                    onChange={(e) => onChange({ ...claim, address: e.target.value })}
                    required
                  />
                </FormControl>
              </FormItem>

              <FormItem>
                <FormLabel className="text-green-400 required-field">Técnico Asignado</FormLabel>
                <Select
                  value={selectedTechnicianId}
                  onValueChange={(value) => {
                    setSelectedTechnicianId(value);
                    onChange({ ...claim, technicianId: value });
                  }}
                >
                  <FormControl>
                    <SelectTrigger className='text-black bg-slate-400'>
                      <SelectValue placeholder="Seleccionar Técnico" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {technicians.map((technician) => (
                      <SelectItem 
                        key={technician.id} 
                        value={technician.id}
                      >
                        {technician.name} - {technician.phone}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            </div>

            <FormItem>
              <FormLabel className="text-green-400 required-field">Motivo del Reclamo</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Descripción detallada del reclamo"
                  value={claim?.reason || ''}
                  onChange={(e) => onChange({ ...claim, reason: e.target.value })}
                  className="min-h-[100px] bg-slate-400 text-black"
                  required
                />
              </FormControl>
            </FormItem>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormItem>
                <FormLabel className="text-green-400 required-field">Recibido por</FormLabel>
                <FormControl>
                  <Input
                    className='bg-slate-400'
                    placeholder="Nombre del receptor"
                    value={claim?.receivedBy || ''}
                    onChange={(e) => onChange({ ...claim, receivedBy: e.target.value })}
                    required
                  />
                </FormControl>
              </FormItem>

              <FormItem>
                <FormLabel className="text-green-400">Fecha y Hora</FormLabel>
                <FormControl>
                  <Input 
                    value={formattedTime}
                    readOnly
                    className={cn(
                      "bg-muted",
                      isUsingLocalTime && "text-yellow-600"
                    )}
                  />
                </FormControl>
                {isUsingLocalTime && (
                  <FormDescription className="text-yellow-600">
                    Usando hora local del sistema
                  </FormDescription>
                )}
              </FormItem>
            </div>

            <div className="flex justify-end mt-6">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  'Cargar Reclamo'
                )}
              </Button>
            </div>
          </form>
        </FormProvider>  
      </CardContent>
    </Card>
  );
};

export default ClaimForm;