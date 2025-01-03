import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, getDoc } from 'firebase/firestore';
import { auth } from '@/config/firebase';
import { useNavigate } from 'react-router-dom';
import { db } from '@/config/firebase';
import { Claim, Technician } from '@/lib/types/admin';
import { toast } from 'react-toastify';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import * as Dialog from '@radix-ui/react-dialog';
import * as ScrollArea from '@radix-ui/react-scroll-area';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Mail, Phone } from 'lucide-react';
import {
  Loader2,
  Menu,
  Bell,
  LogOut as LogOutIcon,
  User,
  Settings,
  ChevronDown,
  Home,
  FileText,
  Activity,
  HelpCircle
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/contexts/AuthContext';
import { messaging } from "@/config/firebase";
import { getToken } from "firebase/messaging";



const TechnicianPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth(); // Cambiamos user por currentUser
  const [claims, setClaims] = useState<Claim[]>([]);
  const [technician, setTechnician] = useState<Technician | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [resolution, setResolution] = useState('');
  const [isCompletingClaim, setIsCompletingClaim] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const updateTechnicianStatus = async (field: string, value: boolean) => {
    if (!technician) return;

    try {
      const technicianDoc = doc(db, 'users', technician.id);
      await updateDoc(technicianDoc, {
        [field]: value,
        updatedAt: new Date().toISOString(),
      });

      setTechnician(prev => prev ? { ...prev, [field]: value } : null);
      toast.success(`Estado actualizado correctamente`);
    } catch (error) {
      console.error('Error updating technician status:', error);
      toast.error(`Error al actualizar el estado`);
    }
  };

  const handleClaimSelect = (claim: Claim) => {
    setSelectedClaim(claim);
    setResolution(claim.resolution || '');
  };

  const handleResolutionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setResolution(e.target.value);
  };

  const markClaimAsCompleted = async () => {
    if (!selectedClaim || !technician) return;

    try {
      setIsCompletingClaim(true);

      const claimDoc = doc(db, 'claims', selectedClaim.id);
      await updateDoc(claimDoc, {
        status: 'completed',
        resolution,
        completedBy: technician.name,
        completedAt: new Date().toISOString(),
      });

      const technicianDoc = doc(db, 'users', technician.id);
      await updateDoc(technicianDoc, {
        completedAssignments: (technician.completedAssignments || 0) + 1,
        currentAssignments: Math.max((technician.currentAssignments || 0) - 1, 0),
      });

      toast.success('Reclamo completado exitosamente');

      setClaims(prevClaims =>
        prevClaims.map(claim =>
          claim.id === selectedClaim.id
            ? { ...claim, status: 'completed', resolution }
            : claim
        )
      );

      setSelectedClaim(null);
      setResolution('');
    } catch (error) {
      console.error('Error completing claim:', error);
      toast.error('Error al completar el reclamo');
    } finally {
      setIsCompletingClaim(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!currentUser) {
          navigate('/login');
          return;
        }
        setIsLoading(true);

      // Verificar permisos antes de hacer las consultas
      const userDoc = doc(db, 'users', currentUser.uid);
      const userSnapshot = await getDoc(userDoc);

      if (!userSnapshot.exists() || userSnapshot.data()?.role !== 'technician') {
        throw new Error('No tienes permisos para acceder a esta sección');
      }

        const technicianDoc = doc(db, 'users', currentUser.uid);
        const technicianSnapshot = await getDoc(technicianDoc);
        const technicianData = technicianSnapshot.data();

        if (technicianData) {
          const technicianInfo: Technician = {
            id: technicianSnapshot.id,
            name: technicianData.fullName || '',
            email: technicianData.email || '',
            phone: technicianData.phone || '',
            active: technicianData.active || false,
            availableForAssignment: technicianData.availableForAssignment || false,
            currentAssignments: technicianData.currentAssignments || 0,
            completedAssignments: technicianData.completedAssignments || 0,
            totalAssignments: technicianData.totalAssignments || 0,
            status: technicianData.status || 'active',
            avatarUrl: technicianData.avatarUrl || '' // Agregar status
          };
          setTechnician(technicianInfo);
        }

        const claimsCollection = collection(db, 'claims');
        const claimsSnapshot = await getDocs(claimsCollection);
        const claimsData = claimsSnapshot.docs
          .filter(doc => doc.data().technicianId === currentUser.uid)
          .map(doc => ({
            id: doc.id,
            ...doc.data(),
          })) as Claim[];

        setClaims(claimsData);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Error al cargar los datos');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [currentUser, navigate]);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
      toast.error('Error al cerrar sesión');
    }
  };

  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return 'No disponible';
    try {
      return new Date(dateString).toLocaleString('es-AR', {
        dateStyle: 'medium',
        timeStyle: 'short'
      });
    } catch (error) {
      return 'Fecha inválida';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="text-yellow-100 bg-yellow-600">Pendiente</Badge>;
      case 'completed':
        return <Badge className="text-green-100 bg-green-600">Completado</Badge>;
      default:
        return <Badge className="text-gray-100 bg-gray-600">{status}</Badge>;
    }
  };

  const enableNotifications = async () => {
    try {
      // Verificar autenticación
      if (!currentUser?.uid) {
        toast.error('Por favor, inicia sesión nuevamente');
        navigate('/login');
        return;
      }

      // Verificar si el navegador soporta notificaciones
      if (!('Notification' in window)) {
        toast.error('Tu navegador no soporta notificaciones');
        return;
      }

      // Solicitar permiso de notificaciones
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        toast.error('Necesitamos permiso para enviar notificaciones');
        return;
      }

      // Verificar si Firebase Messaging está disponible
      if (!messaging) {
        toast.error('El servicio de mensajería no está disponible');
        return;
      }

      // Obtener el token FCM
      const token = await getToken(messaging, {
        vapidKey: import.meta.env.VITE_FIREBASE_PUSH_PUBLIC_KEY
      });

      if (!token) {
        toast.error('No se pudo obtener el token de notificaciones');
        return;
      }

      // Actualizar el documento del usuario con el token FCM
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        fcmToken: token,
        active: true,
        notificationsEnabled: true
      });

      toast.success('Notificaciones habilitadas correctamente');
    } catch (error) {
      console.error('Error al habilitar notificaciones:', error);
      toast.error('Error al habilitar las notificaciones');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <nav className="border-b bg-slate-800 border-slate-700">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="inline-flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-slate-500 md:hidden"
              >
                <Menu size={24} />
              </button>
              <div className="flex items-center flex-shrink-0 ml-4 md:ml-0">
                <h1 className="text-2xl font-bold text-slate-100">TechPanel</h1>
              </div>
              <div className="hidden md:ml-6 md:flex md:items-center md:space-x-4">
              </div>
            </div>

            <div className="flex items-center">
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <button className="relative p-2 rounded-full text-slate-400 hover:text-slate-200 hover:bg-slate-700">
                    <Bell size={20} />
                    <span className="absolute top-0 right-0 block w-2 h-2 bg-red-400 rounded-full ring-2 ring-slate-800" />
                  </button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Portal>
                  <DropdownMenu.Content
                    className="min-w-[220px] bg-slate-800 rounded-md p-2 shadow-xl"
                    sideOffset={5}
                  >
                    <DropdownMenu.Item className="p-2 text-sm rounded cursor-pointer text-slate-200 hover:bg-slate-700">
                      No hay notificaciones nuevas
                    </DropdownMenu.Item>
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>

              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <button className="flex items-center ml-3 text-slate-300 hover:text-slate-100">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-700">
                    {technician?.avatarUrl ? (
          <img 
            src={technician.avatarUrl} 
            alt={`Avatar de ${technician.name}`}
            className="object-cover w-full h-full"
          />
        ) : (
          <User size={20} />
        )}
                    </div>
                    <ChevronDown className="w-4 h-4 ml-1" />
                  </button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Portal>
                  <DropdownMenu.Content
                    className="min-w-[200px] bg-slate-800 rounded-md p-2 shadow-xl"
                    sideOffset={5}
                  >
                    {technician && (
                      <div className="px-3 py-2 border-b border-slate-700">
                        <p className="font-medium text-slate-200">{technician.name}</p>
                        <p className="text-sm text-slate-400">{technician.email}</p>
                      </div>
                    )}
                    <DropdownMenu.Item className="flex items-center p-2 text-sm rounded cursor-pointer text-slate-200 hover:bg-slate-700">
                      <Settings className="w-4 h-4 mr-2" />
                      Configuración
                    </DropdownMenu.Item>
                    <DropdownMenu.Item className="flex items-center p-2 text-sm rounded cursor-pointer text-slate-200 hover:bg-slate-700">
                      <HelpCircle className="w-4 h-4 mr-2" />
                      Ayuda
                    </DropdownMenu.Item>
                    <DropdownMenu.Separator className="h-px my-1 bg-slate-700" />
                    <DropdownMenu.Item
                      className="flex items-center p-2 text-sm text-red-400 rounded cursor-pointer hover:bg-slate-700"
                      onClick={handleLogout}
                    >
                      <LogOutIcon className="w-4 h-4 mr-2" />
                      Cerrar Sesión
                    </DropdownMenu.Item>
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>
            </div>
          </div>
        </div>
      </nav>

      {showMobileMenu && (
        <div className="border-b md:hidden bg-slate-800 border-slate-700">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Button variant="outline" className="w-full text-left text-slate-300">
              <Home className="inline w-4 h-4 mr-2" />
              Inicio
            </Button>
            <Button variant="outline" className="w-full text-left text-slate-300">
              <FileText className="inline w-4 h-4 mr-2" />
              Reclamos
            </Button>
            <Button variant="outline" className="w-full text-left text-slate-300">
              <Activity className="inline w-4 h-4 mr-2" />
              Estadísticas
            </Button>
          </div>
        </div>
      )}

      <main className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {technician && (
          <Card className="mb-8 shadow-xl bg-slate-800 border-slate-700">
            <CardHeader className="border-b border-slate-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-slate-100">Estado del Técnico</h2>
                <Badge variant="outline" className="text-slate-300">
                  ID: {technician.id}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-slate-700/50">
                    <div>
                      <p className="text-sm tracking-wide uppercase text-slate-300">Nombre</p>
                      <p className="font-medium text-slate-100">{technician.name}</p>
                    </div>
                    <User size={24} className="text-slate-400" />
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-lg bg-slate-700/50">
                    <div>
                      <p className="text-sm tracking-wide uppercase text-slate-300">Email</p>
                      <p className="font-medium text-slate-100">{technician.email}</p>
                    </div>
                    <Mail size={24} className="text-slate-400" />
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-lg bg-slate-700/50">
                    <div>
                      <p className="text-sm tracking-wide uppercase text-slate-300">Teléfono</p>
                      <p className="font-medium text-slate-100">{technician.phone}</p>
                    </div>
                    <Phone size={24} className="text-slate-400" />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-slate-700/50">
                    <span className="text-slate-300">Activo</span>
                    <Switch
                      checked={technician.active}
                      onCheckedChange={(checked: boolean) => updateTechnicianStatus('active', checked)}
                      className="data-[state=checked]:bg-green-500"
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-lg bg-slate-700/50">
                    <span className="text-slate-300">Disponible</span>
                    <Switch
                      checked={technician.availableForAssignment}
                      onCheckedChange={(checked: boolean) => updateTechnicianStatus('availableForAssignment', checked)}
                      className="data-[state=checked]:bg-green-500"
                    />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="p-4 text-center rounded-lg bg-slate-700/50">
                  <p className="text-sm tracking-wide uppercase text-slate-300">Asignaciones Actuales</p>
                  <p className="text-2xl font-bold text-slate-100">{technician.currentAssignments}</p>
                </div>
                <div className="p-4 text-center rounded-lg bg-slate-700/50">
                  <p className="text-sm tracking-wide uppercase text-slate-300">Completadas</p>
                  <p className="text-2xl font-bold text-slate-100">{technician.completedAssignments}</p>
                </div>
                <div className="p-4 text-center rounded-lg bg-slate-700/50">
                  <p className="text-sm tracking-wide uppercase text-slate-300">Total Asignaciones</p>
                  <p className="text-2xl font-bold text-slate-100">{technician.totalAssignments}</p>
                </div>
              </div>
              <Button 
                onClick={enableNotifications}
                className="text-white bg-blue-500 hover:bg-blue-600"
              >
                Habilitar Notificaciones
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <Card className="shadow-xl lg:col-span-2 bg-slate-800 border-slate-700">
            <CardHeader className="border-b border-slate-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-slate-100">Reclamos Asignados</h2>
                <Badge className="bg-slate-700 text-slate-200">
                  {claims.length} Totales
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
                </div>
              ) : claims.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-800/50">
                        <TableHead className="text-slate-300">Estado</TableHead>
                        <TableHead className="text-slate-300">Teléfono</TableHead>
                        <TableHead className="text-slate-300">Cliente</TableHead>
                        <TableHead className="hidden text-slate-300 md:table-cell">Dirección</TableHead>
                        <TableHead className="text-slate-300">Motivo</TableHead>
                        <TableHead className="text-slate-300">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {claims.map((claim) => (
                        <TableRow
                          key={claim.id}
                          className={`
                            cursor-pointer
                            border-b border-slate-700
                            hover:bg-slate-700/50
                            ${selectedClaim?.id === claim.id ? 'bg-slate-700/50' : ''}
                          `}
                          onClick={() => handleClaimSelect(claim)}
                        >
                          <TableCell>{getStatusBadge(claim.status)}</TableCell>
                          <TableCell className="text-slate-300">{claim.phone}</TableCell>
                          <TableCell className="text-slate-300">{claim.name}</TableCell>
                          <TableCell className="hidden text-slate-300 md:table-cell">{claim.address}</TableCell>
                          <TableCell className="text-slate-300">{claim.reason}</TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleClaimSelect(claim);
                              }}
                              className="bg-slate-700 hover:bg-slate-600 text-slate-200"
                            >
                              Ver Detalles
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                  <FileText size={48} className="mb-4 text-slate-500" />
                  <p>No hay reclamos asignados.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {selectedClaim && (
            <Card className="shadow-xl bg-slate-800 border-slate-700">
              <Dialog.Root open={!!selectedClaim} onOpenChange={(open) => !open && setSelectedClaim(null)}>
                <Dialog.Portal>
                  <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
                  <Dialog.Content className="fixed top-[50%] left-[50%] max-h-[85vh] w-[90vw] max-w-[600px] translate-x-[-50%] translate-y-[-50%] rounded-lg bg-slate-800 shadow-xl border border-slate-700">
                    <div className="p-6">
                      <Dialog.Title className="mb-2 text-xl font-semibold text-slate-100">
                        Detalles del Reclamo
                      </Dialog.Title>
                      <Dialog.Description className="mb-4 text-slate-400">
                        Revisa y gestiona los detalles del reclamo seleccionado.
                      </Dialog.Description>

                      <ScrollArea.Root className="h-[calc(85vh-200px)] overflow-hidden">
                        <ScrollArea.Viewport className="w-full h-full pr-4">
                          <div className="space-y-4">
                            {/* Información del Cliente */}
                            <div className="p-4 rounded-lg bg-slate-700/50">
                              <h3 className="mb-3 font-medium text-slate-200">Información del Cliente</h3>
                              <div className="space-y-2">
                                <div className="flex justify-between">
                                  <span className="text-slate-400">Nombre:</span>
                                  <span className="text-slate-200">{selectedClaim.name}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-slate-400">Teléfono:</span>
                                  <span className="text-slate-200">{selectedClaim.phone}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-slate-400">Dirección:</span>
                                  <span className="text-slate-200">{selectedClaim.address}</span>
                                </div>
                              </div>
                            </div>

                            {/* Detalles del Reclamo */}
                            <div className="p-4 rounded-lg bg-slate-700/50">
                              <h3 className="mb-3 font-medium text-slate-200">Detalles del Reclamo</h3>
                              <div className="space-y-2">
                                <div className="flex justify-between">
                                  <span className="text-slate-400">Estado:</span>
                                  <span>{getStatusBadge(selectedClaim.status)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-slate-400">Fecha de recepción:</span>
                                  <span className="text-slate-200">{formatDate(selectedClaim.receivedAt)}</span>
                                </div>
                                <div>
                                  <span className="block mb-2 text-slate-400">Motivo del reclamo:</span>
                                  <p className="p-2 rounded text-slate-200 bg-slate-700/70">{selectedClaim.reason}</p>
                                </div>
                              </div>
                            </div>

                            {/* Resolución del Reclamo */}
                            <div className="p-4 rounded-lg bg-slate-700/50">
                              <h3 className="mb-3 font-medium text-slate-200">Resolución</h3>
                              <Textarea
                                value={resolution}
                                onChange={handleResolutionChange}
                                placeholder="Describe la resolución del reclamo..."
                                className="min-h-[100px] w-full bg-slate-700 text-slate-200 border-slate-600"
                                disabled={selectedClaim.status === 'completed'}
                              />
                              {selectedClaim.status === 'completed' && (
                                <div className="mt-4">
                                  <span className="block mb-2 text-slate-400">Completado por:</span>
                                  <span className="text-slate-200">{selectedClaim.completedBy}</span>
                                  <span className="block mt-2 mb-1 text-slate-400">Fecha de completado:</span>
                                  <span className="text-slate-200">{formatDate(selectedClaim.completedAt)}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </ScrollArea.Viewport>
                        <ScrollArea.Scrollbar
                          className="flex select-none touch-none p-0.5 bg-slate-700/50 transition-colors duration-150 ease-out hover:bg-slate-700 rounded-full"
                          orientation="vertical"
                        >
                          <ScrollArea.Thumb className="relative flex-1 rounded-full bg-slate-600" />
                        </ScrollArea.Scrollbar>
                      </ScrollArea.Root>

                      {/* Botones */}
                      <div className="flex justify-between pt-4 mt-6 border-t border-slate-700">
                        <Button
                          variant="outline"
                          onClick={() => setSelectedClaim(null)}
                          className="text-slate-300 hover:text-slate-100"
                        >
                          Cerrar
                        </Button>
                        {selectedClaim?.status === 'pending' && (
                          <Button
                            onClick={markClaimAsCompleted}
                            disabled={isCompletingClaim}
                            className="text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
                          >
                            {isCompletingClaim ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Guardando...
                              </>
                            ) : (
                              'Marcar como Completado'
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  </Dialog.Content>
                </Dialog.Portal>
              </Dialog.Root>
            </Card>
          )}
        </div>
      </main >
    </div >
  );
};

export default TechnicianPage;