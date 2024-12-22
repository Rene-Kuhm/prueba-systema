import React, { useEffect, useState, useCallback } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { ClaimFormProps, Claim, ClaimFormTechnician, NewClaim } from '@/lib/types/admin';
import { collection, getDocs, addDoc, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from 'react-toastify';
import { useCurrentTime } from '@/lib/hooks/useCurrentTime';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import config from '../../../../config';

// Importaciones de componentes UI
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
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
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

// WhatsApp Service Interface
interface WhatsAppMessage {
  to: string;
  body: string;
}

const ClaimForm: React.FC<ClaimFormProps> = ({ claim, onSubmit, onChange }) => {
  const currentTime = useCurrentTime();
  const [technicians, setTechnicians] = useState<ClaimFormTechnician[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTechnicianId, setSelectedTechnicianId] = useState(claim?.technicianId || '');
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [techniciansWithNotifications, setTechniciansWithNotifications] = useState<Set<string>>(new Set());

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
    receivedAt: currentTime,
    status: 'pending',
    title: '',
    customer: '',
    date: currentTime,
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

  // Función para enviar WhatsApp
  const sendWhatsAppMessage = async ({ to, body }: WhatsAppMessage) => {
    try {
      const token = import.meta.env.VITE_ULTRAMSG_TOKEN;
      const instance = import.meta.env.VITE_ULTRAMSG_INSTANCE;

      if (!token || !instance) {
        throw new Error('Faltan las credenciales de Ultramsg');
      }

      // Llamada directa a la API
      const url = `https://api.ultramsg.com/${instance}/messages/chat`;
      
      const formData = new URLSearchParams();
      formData.append('token', token);
      formData.append('to', to);
      formData.append('body', body);
      formData.append('priority', '1');
      formData.append('referenceId', '');

      const response = await fetch(url, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Error response:', errorData);
        throw new Error(`Error ${response.status}: ${errorData}`);
      }

      const data = await response.json();
      console.log('WhatsApp response:', data); // Para debug

      if (data.sent) {
        toast.success('Mensaje de WhatsApp enviado correctamente');
        return true;
      } else {
        throw new Error(data.message || 'Error al enviar mensaje de WhatsApp');
      }
    } catch (error) {
      console.error('Error en sendWhatsAppMessage:', error);
      toast.error('Error al enviar mensaje de WhatsApp');
      return false;
    }
  };

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

      const notificationStatus = new Set<string>();
      await Promise.all(
        technicianList.map(async (tech) => {
          const userDoc = await getDoc(doc(db, 'users', tech.id));
          const userData = userDoc.data();
          if (userData?.fcmToken && userData?.active !== false) {
            notificationStatus.add(tech.id);
          }
        })
      );

      setTechniciansWithNotifications(notificationStatus);
      setTechnicians(technicianList);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching technicians:', err);
      setError('Error al cargar los técnicos');
      setLoading(false);
    }
  };

  const sendNotification = async (claimId: string, technicianId: string, claimDetails: Claim) => {
    try {
      const technicianDoc = await getDoc(doc(db, 'users', technicianId));
      const technicianData = technicianDoc.data();

      if (!technicianData?.fcmToken) {
        toast.warning('El técnico no tiene notificaciones configuradas');
        return false;
      }

      // Usar la URL de la función con modo no-cors
      const response = await fetch('/sendClaimNotification', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notification: {
            title: 'Nuevo Reclamo Asignado',
            body: `Se te ha asignado un nuevo reclamo de ${claimDetails.name}`,
          },
          data: {
            claimId,
            customerName: claimDetails.name,
            customerAddress: claimDetails.address,
            customerPhone: claimDetails.phone,
            reason: claimDetails.reason,
          },
          token: technicianData.fcmToken,
        }),
      });

      if (!response.ok) throw new Error('Error al enviar la notificación');

      const data = await response.json();
      if (data.success) {
        toast.success('Notificación enviada al técnico');
        return true;
      }
      throw new Error(data.error || 'Error al enviar notificación');
    } catch (error) {
      console.error('Error al enviar la notificación:', error);
      toast.error(error instanceof Error ? error.message : 'Error al enviar la notificación');
      return false;
    }
  };

  const createClaim = async (claimData: NewClaim) => {
    try {
      const now = new Date();
      const docRef = await addDoc(collection(db, 'claims'), {
        ...claimData,
        createdAt: now,
        receivedAt: currentTime,
        status: 'pending' as const,
        notificationSent: false,
        lastUpdate: now,
        date: currentTime,
      });

      await setDoc(doc(db, 'claims', docRef.id), { id: docRef.id }, { merge: true });

      // Enviar notificación por Firebase
      const notificationSent = await sendNotification(
        docRef.id,
        claimData.technicianId,
        { ...claimData, id: docRef.id } as Claim
      );

      // Enviar WhatsApp al cliente y al técnico
      await sendMessagesToParticipants(docRef.id, claimData);

      await setDoc(
        doc(db, 'claims', docRef.id),
        {
          notificationSent,
          lastNotificationAttempt: new Date(),
        },
        { merge: true }
      );

      return docRef.id;
    } catch (e) {
      console.error('Error adding claim: ', e);
      throw e;
    }
  };

  // Función auxiliar para enviar mensajes de WhatsApp
  const sendMessagesToParticipants = async (claimId: string, claimData: NewClaim) => {
    // Enviar WhatsApp al cliente
    try {
      const messageToCustomer = `🔔 *Reclamo Registrado*\n\n`
        + `Hola ${claimData.name},\n\n`
        + `Tu reclamo ha sido registrado exitosamente:\n\n`
        + `📝 *Detalles:*\n`
        + `- N° de Reclamo: ${claimId}\n`
        + `- Dirección: ${claimData.address}\n`
        + `- Motivo: ${claimData.reason}\n\n`
        + `Te mantendremos informado sobre el estado de tu reclamo.`;

      await sendWhatsAppMessage({
        to: claimData.phone,
        body: messageToCustomer
      });
      
      toast.success('WhatsApp enviado al cliente');
    } catch (whatsappError) {
      console.error('Error enviando WhatsApp al cliente:', whatsappError);
      toast.warning('No se pudo enviar el WhatsApp al cliente');
    }

    // Enviar WhatsApp al técnico
    const technician = technicians.find(t => t.id === claimData.technicianId);
    if (technician?.phone) {
      try {
        // Asegurarse de que el número del técnico tenga el formato correcto
        let technicianPhone = technician.phone.replace(/[\s+\-()]/g, '');
        
        if (technicianPhone.startsWith('0')) {
          technicianPhone = technicianPhone.substring(1);
        }
        if (technicianPhone.includes('15')) {
          technicianPhone = technicianPhone.replace('15', '');
        }
        if (!technicianPhone.startsWith('549')) {
          technicianPhone = `549${technicianPhone}`;
        }

        const messageToTechnician = `🔧 *Nuevo Reclamo Asignado*\n\n`
          + `Se te ha asignado un nuevo reclamo:\n\n`
          + `👤 *Cliente:* ${claimData.name}\n`
          + `📍 *Dirección:* ${claimData.address}\n`
          + `📱 *Teléfono:* ${claimData.phone}\n`
          + `📝 *Motivo:* ${claimData.reason}\n\n`
          + `👨‍💼 *Recibido por:* ${claimData.receivedBy}\n`
          + `🕒 *Fecha y Hora:* ${currentTime}\n\n`
          + `Por favor, contacta al cliente para coordinar la visita.`;

        console.log('Enviando WhatsApp al técnico:', technicianPhone); // Para debug

        const sent = await sendWhatsAppMessage({
          to: technicianPhone,
          body: messageToTechnician
        });

        if (sent) {
          toast.success('WhatsApp enviado al técnico');
        } else {
          throw new Error('No se pudo enviar el mensaje al técnico');
        }
      } catch (whatsappError) {
        console.error('Error enviando WhatsApp al técnico:', whatsappError);
        toast.warning('No se pudo enviar el WhatsApp al técnico');
      }
    } else {
      console.warn('El técnico no tiene número de teléfono registrado');
      toast.warning('El técnico no tiene número de teléfono registrado');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!claim || !claim.phone || !claim.name || !claim.address || !claim.reason || 
        !selectedTechnicianId || !claim.receivedBy) {
        setAlertMessage('Todos los campos son requeridos');
        return;
    }

    setIsSubmitting(true);
    try {
      const baseData = createInitialClaim();
      const updatedClaim: NewClaim = {
        ...baseData,
        ...claim,
        receivedAt: currentTime,
        date: currentTime,
        technicianId: selectedTechnicianId,
        status: 'pending',
        notificationSent: false
      };

      const claimId = await createClaim(updatedClaim);
      await onSubmit();
      setAlertMessage('Reclamo guardado con éxito');
      resetForm();
    } catch (error) {
      console.error('Error al guardar:', error);
      setAlertMessage('Error al guardar el reclamo');
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
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="bg-slate-700 rounded-xl mb-8">
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
              <CheckCircle className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <AlertTitle>
              {alertMessage.includes('éxito') ? 'Éxito' : 'Error'}
            </AlertTitle>
            <AlertDescription>{alertMessage}</AlertDescription>
          </Alert>
        )}
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormItem>
                <FormLabel className="required-field text-green-400">Teléfono</FormLabel>
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
                <FormLabel className="required-field text-green-400">Nombre</FormLabel>
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
                <FormLabel className="required-field text-green-400">Dirección</FormLabel>
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
                <FormLabel className="required-field text-green-400">Técnico Asignado</FormLabel>
                <Select
                  value={selectedTechnicianId}
                  onValueChange={(value) => {
                    setSelectedTechnicianId(value);
                    onChange({ ...claim, technicianId: value });
                    if (value && !techniciansWithNotifications.has(value)) {
                      toast.warning('Este técnico no recibirá notificaciones automáticas');
                    }
                  }}
                >
                  <FormControl>
                    <SelectTrigger className='bg-slate-400 text-black'>
                      <SelectValue placeholder="Seleccionar Técnico" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {technicians.map((technician) => {
                      const hasNotifications = techniciansWithNotifications.has(technician.id);
                      return (
                        <SelectItem 
                          key={technician.id} 
                          value={technician.id}
                          className={cn(
                            "flex items-center justify-between",
                            !hasNotifications && "text-yellow-600"
                          )}
                        >
                          <span>{technician.name} - {technician.phone}</span>
                          {hasNotifications ? (
                            <Badge variant="default" className="ml-2">Con notificaciones</Badge>
                          ) : (
                            <Badge variant="outline" className="ml-2 text-yellow-600">Sin notificaciones</Badge>
                          )}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                {selectedTechnicianId && !techniciansWithNotifications.has(selectedTechnicianId) && (
                  <FormDescription className="text-yellow-600">
                    Este técnico no recibirá notificaciones automáticas
                  </FormDescription>
                )}
              </FormItem>
            </div>

            <FormItem>
              <FormLabel className="required-field text-green-400">Motivo del Reclamo</FormLabel>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormItem>
                <FormLabel className="required-field text-green-400">Recibido por</FormLabel>
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
                    value={currentTime}
                    readOnly
                    className="bg-muted"
                  />
                </FormControl>
              </FormItem>
            </div>

            <div className="flex justify-end mt-6">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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