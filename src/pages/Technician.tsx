import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, getDoc } from 'firebase/firestore';
import { getAuth, signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { db } from '@/lib/firebase';
import { Claim, Technician } from '@/lib/types/admin';
import { toast } from 'react-toastify';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import * as Dialog from '@radix-ui/react-dialog';
import * as ScrollArea from '@radix-ui/react-scroll-area';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Mail, Phone } from 'lucide-react';
import {
  Loader2,
  Menu,
  Bell,
  LogOut,
  User,
  Settings,
  ChevronDown,
  Home,
  FileText,
  Activity,
  HelpCircle
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';

const TechnicianPage: React.FC = () => {
  const navigate = useNavigate();
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
        const authUser = getAuth().currentUser;
        if (!authUser) {
          navigate('/');
          return;
        }

        const technicianDoc = doc(db, 'users', authUser.uid);
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
          };
          setTechnician(technicianInfo);
        }

        const claimsCollection = collection(db, 'claims');
        const claimsSnapshot = await getDocs(claimsCollection);
        const claimsData = claimsSnapshot.docs
          .filter(doc => doc.data().technicianId === authUser.uid)
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
  }, [navigate]);

  const handleLogout = async () => {
    try {
      const auth = getAuth();
      await signOut(auth);
      navigate('/');
      toast.success('Sesión cerrada correctamente');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
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
        return <Badge className="bg-yellow-600 text-yellow-100">Pendiente</Badge>;
      case 'completed':
        return <Badge className="bg-green-600 text-green-100">Completado</Badge>;
      default:
        return <Badge className="bg-gray-600 text-gray-100">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <nav className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="inline-flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-slate-500 md:hidden"
              >
                <Menu size={24} />
              </button>
              <div className="flex-shrink-0 flex items-center ml-4 md:ml-0">
                <h1 className="text-2xl font-bold text-slate-100">TechPanel</h1>
              </div>
              <div className="hidden md:ml-6 md:flex md:items-center md:space-x-4">
              </div>
            </div>

            <div className="flex items-center">
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <button className="p-2 rounded-full text-slate-400 hover:text-slate-200 hover:bg-slate-700 relative">
                    <Bell size={20} />
                    <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-slate-800" />
                  </button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Portal>
                  <DropdownMenu.Content
                    className="min-w-[220px] bg-slate-800 rounded-md p-2 shadow-xl"
                    sideOffset={5}
                  >
                    <DropdownMenu.Item className="text-slate-200 text-sm p-2 hover:bg-slate-700 rounded cursor-pointer">
                      No hay notificaciones nuevas
                    </DropdownMenu.Item>
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>

              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <button className="ml-3 flex items-center text-slate-300 hover:text-slate-100">
                    <div className="h-8 w-8 rounded-full bg-slate-700 flex items-center justify-center">
                      <User size={20} />
                    </div>
                    <ChevronDown className="ml-1 h-4 w-4" />
                  </button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Portal>
                  <DropdownMenu.Content
                    className="min-w-[200px] bg-slate-800 rounded-md p-2 shadow-xl"
                    sideOffset={5}
                  >
                    {technician && (
                      <div className="px-3 py-2 border-b border-slate-700">
                        <p className="text-slate-200 font-medium">{technician.name}</p>
                        <p className="text-slate-400 text-sm">{technician.email}</p>
                      </div>
                    )}
                    <DropdownMenu.Item className="flex items-center text-slate-200 text-sm p-2 hover:bg-slate-700 rounded cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      Configuración
                    </DropdownMenu.Item>
                    <DropdownMenu.Item className="flex items-center text-slate-200 text-sm p-2 hover:bg-slate-700 rounded cursor-pointer">
                      <HelpCircle className="mr-2 h-4 w-4" />
                      Ayuda
                    </DropdownMenu.Item>
                    <DropdownMenu.Separator className="h-px bg-slate-700 my-1" />
                    <DropdownMenu.Item
                      className="flex items-center text-red-400 text-sm p-2 hover:bg-slate-700 rounded cursor-pointer"
                      onClick={handleLogout}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
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
        <div className="md:hidden bg-slate-800 border-b border-slate-700">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Button variant="outline" className="w-full text-left text-slate-300">
              <Home className="mr-2 h-4 w-4 inline" />
              Inicio
            </Button>
            <Button variant="outline" className="w-full text-left text-slate-300">
              <FileText className="mr-2 h-4 w-4 inline" />
              Reclamos
            </Button>
            <Button variant="outline" className="w-full text-left text-slate-300">
              <Activity className="mr-2 h-4 w-4 inline" />
              Estadísticas
            </Button>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {technician && (
          <Card className="bg-slate-800 border-slate-700 shadow-xl mb-8">
            <CardHeader className="border-b border-slate-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-slate-100">Estado del Técnico</h2>
                <Badge variant="outline" className="text-slate-300">
                  ID: {technician.id}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
                    <div>
                      <p className="text-slate-300 text-sm uppercase tracking-wide">Nombre</p>
                      <p className="text-slate-100 font-medium">{technician.name}</p>
                    </div>
                    <User size={24} className="text-slate-400" />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
                    <div>
                      <p className="text-slate-300 text-sm uppercase tracking-wide">Email</p>
                      <p className="text-slate-100 font-medium">{technician.email}</p>
                    </div>
                    <Mail size={24} className="text-slate-400" />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
                    <div>
                      <p className="text-slate-300 text-sm uppercase tracking-wide">Teléfono</p>
                      <p className="text-slate-100 font-medium">{technician.phone}</p>
                    </div>
                    <Phone size={24} className="text-slate-400" />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
                    <span className="text-slate-300">Activo</span>
                    <Switch
                      checked={technician.active}
                      onCheckedChange={(checked: boolean) => updateTechnicianStatus('active', checked)}
                      className="data-[state=checked]:bg-green-500"
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
                    <span className="text-slate-300">Disponible</span>
                    <Switch
                      checked={technician.availableForAssignment}
                      onCheckedChange={(checked: boolean) => updateTechnicianStatus('availableForAssignment', checked)}
                      className="data-[state=checked]:bg-green-500"
                    />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-700/50 rounded-lg text-center">
                  <p className="text-slate-300 text-sm uppercase tracking-wide">Asignaciones Actuales</p>
                  <p className="text-2xl font-bold text-slate-100">{technician.currentAssignments}</p>
                </div>
                <div className="p-4 bg-slate-700/50 rounded-lg text-center">
                  <p className="text-slate-300 text-sm uppercase tracking-wide">Completadas</p>
                  <p className="text-2xl font-bold text-slate-100">{technician.completedAssignments}</p>
                </div>
                <div className="p-4 bg-slate-700/50 rounded-lg text-center">
                  <p className="text-slate-300 text-sm uppercase tracking-wide">Total Asignaciones</p>
                  <p className="text-2xl font-bold text-slate-100">{technician.totalAssignments}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2 bg-slate-800 border-slate-700 shadow-xl">
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
                <div className="flex justify-center items-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
                </div>
              ) : claims.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-800/50">
                        <TableHead className="text-slate-300">Estado</TableHead>
                        <TableHead className="text-slate-300">Teléfono</TableHead>
                        <TableHead className="text-slate-300">Cliente</TableHead>
                        <TableHead className="text-slate-300 hidden md:table-cell">Dirección</TableHead>
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
                          <TableCell className="text-slate-300 hidden md:table-cell">{claim.address}</TableCell>
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
            <Card className="bg-slate-800 border-slate-700 shadow-xl">
              <Dialog.Root open={!!selectedClaim} onOpenChange={(open) => !open && setSelectedClaim(null)}>
                <Dialog.Portal>
                  <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
                  <Dialog.Content className="fixed top-[50%] left-[50%] max-h-[85vh] w-[90vw] max-w-[600px] translate-x-[-50%] translate-y-[-50%] rounded-lg bg-slate-800 shadow-xl border border-slate-700">
                    <div className="p-6">
                      <Dialog.Title className="text-xl font-semibold text-slate-100 mb-2">
                        Detalles del Reclamo
                      </Dialog.Title>

                      <ScrollArea.Root className="h-[calc(85vh-200px)] overflow-hidden">
                        <ScrollArea.Viewport className="h-full w-full pr-4">
                          <div className="space-y-4">
                            {/* Información del Cliente */}
                            <div className="p-4 bg-slate-700/50 rounded-lg">
                              <h3 className="text-slate-200 font-medium mb-3">Información del Cliente</h3>
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
                            <div className="p-4 bg-slate-700/50 rounded-lg">
                              <h3 className="text-slate-200 font-medium mb-3">Detalles del Reclamo</h3>
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
                                  <span className="text-slate-400 block mb-2">Motivo del reclamo:</span>
                                  <p className="text-slate-200 bg-slate-700/70 p-2 rounded">{selectedClaim.reason}</p>
                                </div>
                              </div>
                            </div>

                            {/* Resolución del Reclamo */}
                            <div className="p-4 bg-slate-700/50 rounded-lg">
                              <h3 className="text-slate-200 font-medium mb-3">Resolución</h3>
                              <Textarea
                                value={resolution}
                                onChange={handleResolutionChange}
                                placeholder="Describe la resolución del reclamo..."
                                className="min-h-[100px] w-full bg-slate-700 text-slate-200 border-slate-600"
                                disabled={selectedClaim.status === 'completed'}
                              />
                              {selectedClaim.status === 'completed' && (
                                <div className="mt-4">
                                  <span className="text-slate-400 block mb-2">Completado por:</span>
                                  <span className="text-slate-200">{selectedClaim.completedBy}</span>
                                  <span className="text-slate-400 block mt-2 mb-1">Fecha de completado:</span>
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
                          <ScrollArea.Thumb className="flex-1 bg-slate-600 rounded-full relative" />
                        </ScrollArea.Scrollbar>
                      </ScrollArea.Root>

                      {/* Botones */}
                      <div className="mt-6 pt-4 border-t border-slate-700 flex justify-between">
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
                            className="bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
                          >
                            {isCompletingClaim ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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