import React, { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { ClaimFormProps, Claim, ClaimFormTechnician, NewClaim } from '@/lib/types/admin';
import { collection, getDocs, addDoc, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from 'react-toastify';
import config from '../../../../config';
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
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
// import { N } from 'node_modules/react-router/dist/development/route-data-DuV3tXo2.mjs';
import { useCurrentTime } from '@/lib/hooks/useCurrentTime';

// WhatsApp Service
interface WhatsAppMessage {
  to: string;
  body: string;
}

// Reemplaza la función sendWhatsAppMessage actual con esta:

const sendWhatsAppMessage = async ({ to, body }: WhatsAppMessage) => {
  try {
    const token = import.meta.env.VITE_ULTRAMSG_TOKEN;
    const instance = import.meta.env.VITE_ULTRAMSG_INSTANCE;

    if (!token || !instance) {
      throw new Error('Faltan las credenciales de Ultramsg');
    }

    // Limpieza y formateo del número
    const cleanPhone = to.replace(/[\s+\-()]/g, ''); // Elimina espacios, +, -, ()
    
    // Formateo específico para Argentina
    let formattedPhone = cleanPhone;
    if (cleanPhone.startsWith('0')) {
      // Si empieza con 0, lo quitamos
      formattedPhone = cleanPhone.substring(1);
    }
    if (formattedPhone.includes('15')) {
      // Si contiene 15, lo quitamos
      formattedPhone = formattedPhone.replace('15', '');
    }
    // Aseguramos que tenga el prefijo correcto
    if (!formattedPhone.startsWith('549')) {
      formattedPhone = `549${formattedPhone}`;
    }

    console.log('Número original:', to);
    console.log('Número formateado:', formattedPhone);
    
    const url = `https://api.ultramsg.com/${instance}/messages/chat`;
    
    const params = new URLSearchParams();
    params.append('token', token);
    params.append('to', formattedPhone);
    params.append('body', body);
    params.append('priority', '1');
    params.append('referenceId', '');

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params
    });

    const data = await response.json();
    console.log('Respuesta de UltraMsg:', data);

    if (!response.ok) {
      throw new Error(data.message || 'Error al enviar mensaje de WhatsApp');
    }

    toast.success('Mensaje de WhatsApp enviado correctamente');
    return data.sent;
  } catch (error) {
    console.error('Error en sendWhatsAppMessage:', error);
    toast.error('Error al enviar mensaje de WhatsApp');
    return false;
  }
};

// Definimos un creador de claim inicial
const createInitialClaim = (): NewClaim => ({
  id: '',
  name: '',
  phone: '',
  address: '',
  reason: '',
  technicianId: '',
  receivedBy: '',
  receivedAt: format(new Date(), "dd/MM/yyyy HH:mm", { locale: es }),
  status: 'pending',
  title: '',
  customer: '',
  date: format(new Date(), "dd/MM/yyyy HH:mm", { locale: es }),
  resolution: '',
  notificationSent: false,
  technicalDetails: '',
  notes: '',
  description: '',
  claimType: '',
  claimAmount: 0,
  updatedAt: new Date().toISOString()
});

const ClaimForm: React.FC<ClaimFormProps> = ({ claim, onSubmit, onChange }) => {
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

  useEffect(() => {
    if (!claim) {
      const initialClaim = createInitialClaim();
      onChange(initialClaim);
    }
  }, []);

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

          if (
            userData &&
            userData.role === 'technician' &&
            userData.active !== false &&
            userData.approved === true
          ) {
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

      const response = await fetch(config.firebase.functionUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        mode: 'cors',
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
        receivedAt: now,
        status: 'pending' as const,
        notificationSent: false,
        lastUpdate: now,
        date: format(now, "dd/MM/yyyy HH:mm", { locale: es }),
      });

      await setDoc(
        doc(db, 'claims', docRef.id),
        { id: docRef.id },
        { merge: true }
      );

      // Enviar notificación por Firebase
      const notificationSent = await sendNotification(
        docRef.id,
        claimData.technicianId,
        { ...claimData, id: docRef.id } as Claim
      );

      // Enviar WhatsApp al cliente
      try {
        const messageToCustomer = `🔔 *Reclamo Registrado*\n\n`
          + `Hola ${claimData.name},\n\n`
          + `Tu reclamo ha sido registrado exitosamente:\n\n`
          + `📝 *Detalles:*\n`
          + `- N° de Reclamo: ${docRef.id}\n`
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
          const messageToTechnician = `🔧 *Nuevo Reclamo Asignado*\n\n`
            + `Se te ha asignado un nuevo reclamo:\n\n`
            + `👤 *Cliente:* ${claimData.name}\n`
            + `📍 *Dirección:* ${claimData.address}\n`
            + `📱 *Teléfono:* ${claimData.phone}\n`
            + `📝 *Motivo:* ${claimData.reason}\n\n`
            + `👨‍💼 *Recibido por:* ${claimData.receivedBy}\n`
            + `🕒 *Fecha y Hora:* ${format(new Date(), "dd/MM/yyyy HH:mm", { locale: es })}\n\n`
            + `Por favor, contacta al cliente para coordinar la visita.`;

          await sendWhatsAppMessage({
            to: technician.phone,
            body: messageToTechnician
          });
          
          toast.success('WhatsApp enviado al técnico');
        } catch (whatsappError) {
          console.error('Error enviando WhatsApp al técnico:', whatsappError);
          toast.warning('No se pudo enviar el WhatsApp al técnico');
        }
      }

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!claim || !claim.phone || !claim.name || !claim.address || !claim.reason || 
        !selectedTechnicianId || !claim.receivedBy) {
        setAlertMessage('Todos los campos son requeridos');
        return;
    }

    setIsSubmitting(true);
    try {
      const now = new Date();
      const baseData = createInitialClaim();
      const updatedClaim: NewClaim = {
        ...baseData,
        ...claim,
        receivedAt: format(now, "dd/MM/yyyy HH:mm", { locale: es }),
        date: format(now, "dd/MM/yyyy HH:mm", { locale: es }),
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

  const currentTime = useCurrentTime();

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
                    value={currentTime}
                    readOnly
                    className="bg-muted"
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
                    value={format(new Date(), "dd/MM/yyyy HH:mm", { locale: es })}
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