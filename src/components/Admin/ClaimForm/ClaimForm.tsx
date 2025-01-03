import React, { useEffect, useState, useCallback } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { ClaimFormProps, NewClaim } from '@/lib/types/admin'
import { sendWhatsAppMessage } from '@/config/services/whatsappService'
import { useCurrentTime } from '@/hooks/useCurrentTime'
import { toast } from 'react-toastify'
import {
  fetchTechnicians,
  Technician,
} from '@/config/services/technicianService'

// Importaciones de componentes UI
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CurrentTimeHook {
  currentTime: Date
  formattedTime: string
  isUsingLocalTime: boolean
}

const ClaimForm: React.FC<ClaimFormProps> = ({ claim, onSubmit, onChange }) => {
  // Estados y hooks
  const [technicians, setTechnicians] = useState<Technician[]>([])
  const [loadingTechnicians, setLoadingTechnicians] = useState(true)
  const [selectedTechnician, setSelectedTechnician] =
    useState<Technician | null>(null)
  const { formattedTime, isUsingLocalTime } =
    useCurrentTime() as CurrentTimeHook
  const [selectedTechnicianId, setSelectedTechnicianId] = useState(
    claim?.technicianId || '',
  )
  const [alertMessage, setAlertMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const methods = useForm({
    defaultValues: claim,
  })

  // Crear claim inicial con useCallback
  const createInitialClaim = useCallback(
    (): NewClaim => ({
      id: '',
      name: '',
      phone: '',
      address: '',
      reason: '',
      technicianId: '',
      receivedBy: '',
      receivedAt: formattedTime,
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
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    }),
    [formattedTime],
  )

  // Efectos
  useEffect(() => {
    if (!claim) {
      const initialClaim = createInitialClaim()
      onChange(initialClaim)
    }
  }, [claim, createInitialClaim, onChange])

  useEffect(() => {
    if (claim?.technicianId !== selectedTechnicianId) {
      setSelectedTechnicianId(claim?.technicianId || '')
    }
  }, [claim?.technicianId])

  useEffect(() => {
    const loadTechnicians = async () => {
      try {
        const techData = await fetchTechnicians()
        'Datos crudos de técnicos:', techData

        if (!Array.isArray(techData)) {
          console.error('Los datos de técnicos no son un array:', techData)
          setTechnicians([])
          return
        }

        // Filtramos los técnicos activos y aprobados aquí en vez de en el render
        const validTechnicians = techData.filter(
          (tech) => tech && typeof tech === 'object' && 'id' in tech,
        )

        'Técnicos válidos:', validTechnicians
        setTechnicians(validTechnicians)
      } catch (error) {
        console.error('Error detallado al cargar técnicos:', error)
        setTechnicians([])
      } finally {
        setLoadingTechnicians(false)
      }
    }

    loadTechnicians()
  }, [])

  useEffect(() => {
    if (technicians.length > 0 && selectedTechnicianId) {
      const tech = technicians.find((t) => t.id === selectedTechnicianId)
      setSelectedTechnician(tech || null)
    }
  }, [technicians, selectedTechnicianId])

  // Funciones auxiliares
  const sendMessagesToParticipants = async (
    claimId: string,
    claimData: NewClaim,
  ) => {
    const timestamp = formattedTime
    // Mensaje al cliente
    const messageToCustomer =
      `🔔 *Reclamo Registrado*\n\n` +
      `Hola ${claimData.name},\n\n` +
      `Tu reclamo ha sido registrado exitosamente:\n\n` +
      `📝 *Detalles:*\n` +
      `- N° de Reclamo: ${claimId}\n` +
      `- Dirección: ${claimData.address}\n` +
      `- Motivo: ${claimData.reason}\n` +
      `- Fecha y Hora: ${timestamp}\n\n` +
      `Te mantendremos informado sobre el estado de tu reclamo.`

    try {
      await sendWhatsAppMessage({
        to: claimData.phone,
        body: messageToCustomer,
      })
      toast.success('Notificación enviada al cliente')

      // Mensaje al técnico
      const technician = technicians.find(
        (t) => t.id === claimData.technicianId,
      )
      if (technician?.phone) {
        const messageToTechnician =
          `🔧 *Nuevo Reclamo Asignado*\n\n` +
          `Se te ha asignado un nuevo reclamo:\n\n` +
          `👤 *Cliente:* ${claimData.name}\n` +
          `📍 *Dirección:* ${claimData.address}\n` +
          `📱 *Teléfono:* ${claimData.phone}\n` +
          `📝 *Motivo:* ${claimData.reason}\n\n` +
          `👨‍💼 *Recibido por:* ${claimData.receivedBy}\n` +
          `🕒 *Fecha y Hora: ${timestamp}*\n\n` +
          `Por favor, contacta al cliente para coordinar la visita.`

        let techPhone = technician.phone.replace(/[\s+\-()]/g, '')
        if (!techPhone.startsWith('549')) {
          techPhone = `549${techPhone.replace(/^0|^15/, '')}`
        }

        await sendWhatsAppMessage({
          to: techPhone,
          body: messageToTechnician,
        })
        toast.success('Notificación enviada al técnico')
      }
    } catch (error) {
      console.error('Error enviando notificación:', error)
      toast.error('Error al enviar notificaciones')
    }
  }

  // Manejadores de eventos
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (isSubmitting) return

    if (
      !claim ||
      !claim.phone ||
      !claim.name ||
      !claim.address ||
      !claim.reason ||
      !selectedTechnicianId ||
      !claim.receivedBy
    ) {
      setAlertMessage('Por favor, complete todos los campos requeridos')
      return
    }

    setIsSubmitting(true)
    try {
      const updatedClaim: NewClaim = {
        ...claim,
        technicianId: selectedTechnicianId,
        status: 'pending',
        notificationSent: false,
        receivedAt: formattedTime,
        date: formattedTime,
        description: claim.reason || '',
        claimType: '',
        claimAmount: 0,
        updatedAt: new Date().toISOString(),
        id: '', // Firebase generará el ID
      }

      const result = await onSubmit(updatedClaim)

      if (result?.success && result?.id) {
        await sendMessagesToParticipants(result.id, updatedClaim)
        setAlertMessage('Reclamo registrado exitosamente')
        // Disparar un evento para actualizar la tabla
        window.dispatchEvent(new CustomEvent('claimCreated'))
        resetForm()
      }
    } catch (error) {
      console.error('Error al guardar:', error)
      setAlertMessage('Error al registrar el reclamo')
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    const initialClaim = createInitialClaim()
    onChange(initialClaim)
    setSelectedTechnicianId('')
    setSelectedTechnician(null)
    setAlertMessage(null)
  }

  const updateClaim = (updates: Partial<NewClaim>) => {
    if (!claim) return
    const updatedClaim: NewClaim = {
      ...claim,
      ...updates,
      id: claim.id || '',
    }
    onChange(updatedClaim)
  }

  // Renderizado del formulario
  return (
    <Card className='mb-8 bg-slate-700 rounded-xl'>
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
            className='mb-6'
          >
            {alertMessage.includes('éxito') ? (
              <CheckCircle className='w-4 h-4' />
            ) : (
              <AlertCircle className='w-4 h-4' />
            )}
            <AlertTitle>
              {alertMessage.includes('éxito') ? 'Éxito' : 'Error'}
            </AlertTitle>
            <AlertDescription>{alertMessage}</AlertDescription>
          </Alert>
        )}
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit} className='space-y-6'>
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
              <FormItem>
                <FormLabel className='text-green-400 required-field'>
                  Teléfono
                </FormLabel>
                <FormControl>
                  <Input
                    className='bg-slate-400'
                    placeholder='Ej: +54 11 1234-5678'
                    value={claim?.phone || ''}
                    onChange={(e) => updateClaim({ phone: e.target.value })}
                    required
                  />
                </FormControl>
              </FormItem>

              <FormItem>
                <FormLabel className='text-green-400 required-field'>
                  Nombre
                </FormLabel>
                <FormControl>
                  <Input
                    className='bg-slate-400'
                    placeholder='Nombre completo'
                    value={claim?.name || ''}
                    onChange={(e) => updateClaim({ name: e.target.value })}
                    required
                  />
                </FormControl>
              </FormItem>

              <FormItem>
                <FormLabel className='text-green-400 required-field'>
                  Dirección
                </FormLabel>
                <FormControl>
                  <Input
                    className='bg-slate-400'
                    placeholder='Dirección completa'
                    value={claim?.address || ''}
                    onChange={(e) => updateClaim({ address: e.target.value })}
                    required
                  />
                </FormControl>
              </FormItem>

              <FormItem>
                <FormLabel className='text-green-400 required-field'>
                  Técnico Asignado
                </FormLabel>
                <Select
                  value={selectedTechnicianId}
                  onValueChange={(value) => {
                    const tech = technicians.find((t) => t.id === value)
                    setSelectedTechnicianId(value)
                    setSelectedTechnician(tech || null)
                    updateClaim({ technicianId: value })
                  }}
                >
                  <FormControl>
                    <SelectTrigger className='text-black bg-slate-400'>
                      <SelectValue>
                        {loadingTechnicians
                          ? 'Cargando técnicos...'
                          : selectedTechnician
                          ? `${selectedTechnician.fullName} - ${
                              selectedTechnician.phone || ''
                            }`
                          : 'Seleccionar Técnico'}
                      </SelectValue>
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {loadingTechnicians ? (
                      <SelectItem value='loading' disabled>
                        Cargando técnicos...
                      </SelectItem>
                    ) : technicians.length > 0 ? (
                      technicians.map((technician) => (
                        <SelectItem
                          key={technician.id}
                          value={technician.id}
                          className='cursor-pointer hover:bg-slate-100'
                        >
                          {technician.fullName || 'Sin nombre'} -{' '}
                          {technician.phone || 'Sin teléfono'}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value='no-technicians' disabled>
                        No hay técnicos disponibles
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                {!loadingTechnicians && technicians.length === 0 && (
                  <FormDescription className='text-red-400'>
                    No se encontraron técnicos en la base de datos
                  </FormDescription>
                )}
              </FormItem>
            </div>

            <FormItem>
              <FormLabel className='text-green-400 required-field'>
                Motivo del Reclamo
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder='Descripción detallada del reclamo'
                  value={claim?.reason || ''}
                  onChange={(e) => updateClaim({ reason: e.target.value })}
                  className='min-h-[100px] bg-slate-400 text-black'
                  required
                />
              </FormControl>
            </FormItem>

            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
              <FormItem>
                <FormLabel className='text-green-400 required-field'>
                  Recibido por
                </FormLabel>
                <FormControl>
                  <Input
                    className='bg-slate-400'
                    placeholder='Nombre del receptor'
                    value={claim?.receivedBy || ''}
                    onChange={(e) =>
                      updateClaim({ receivedBy: e.target.value })
                    }
                    required
                  />
                </FormControl>
              </FormItem>

              <FormItem>
                <FormLabel className='text-green-400'>Fecha y Hora</FormLabel>
                <FormControl>
                  <Input
                    value={formattedTime}
                    readOnly
                    className={cn(
                      'bg-muted',
                      isUsingLocalTime && 'text-yellow-600',
                    )}
                  />
                </FormControl>
                {isUsingLocalTime && (
                  <FormDescription className='text-yellow-600'>
                    Usando hora local del sistema
                  </FormDescription>
                )}
              </FormItem>
            </div>

            <div className='flex justify-end mt-6'>
              <Button
                type='submit'
                disabled={isSubmitting}
                className='text-white bg-green-500 hover:bg-green-600'
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className='w-4 h-4 mr-2 animate-spin' />
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
  )
}

// Optimizamos el componente con React.memo para evitar re-renders innecesarios
export default React.memo(ClaimForm)
