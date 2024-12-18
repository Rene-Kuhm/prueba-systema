import React, { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { ClaimFormProps, Claim, ClaimFormTechnician } from '@/lib/types/admin';
import { collection, getDocs, addDoc, doc, getDoc, setDoc } from 'firebase/firestore';
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

// Definimos un creador de claim inicial
const createInitialClaim = (): Omit<Claim, "id"> => ({
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
  notes: ''
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

  const createClaim = async (claimData: Claim) => {
    try {
      const now = new Date();
      const docRef = await addDoc(collection(db, 'claims'), {
        ...claimData,
        createdAt: now,
        receivedAt: now,
        status: 'pending',
        notificationSent: false,
        lastUpdate: now,
        date: now,
      });

      const notificationSent = await sendNotification(
        docRef.id,
        claimData.technicianId,
        claimData
      );

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
      const updatedClaim: Claim = {
        ...createInitialClaim(),
        ...claim,
        id: claim.id || `temp_${Date.now()}`,
        receivedAt: now.toISOString(),
        date: now.toISOString(),
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
    <Card className= "bg-slate-700 rounded-xl mb-8">
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
                <Input className='bg-slate-400'
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
                <Input className='bg-slate-400 '
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
                <Input className='bg-slate-400 '
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
                <Input className='bg-slate-400'
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