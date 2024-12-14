import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from '@/lib/firebase';
import { Claim, Technician } from '@/lib/types/admin';
import { toast } from 'react-toastify';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

const TechnicianPage: React.FC = () => {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [technician, setTechnician] = useState<Technician | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [resolution, setResolution] = useState('');
  const [isCompletingClaim, setIsCompletingClaim] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const authUser = getAuth().currentUser;
        if (!authUser) {
          console.error('No se pudo obtener el usuario autenticado');
          setIsLoading(false);
          return;
        }

        const technicianDoc = doc(db, 'users', authUser.uid);
        const technicianSnapshot = await getDoc(technicianDoc);
        const technicianData = technicianSnapshot.data();
        setTechnician({
          id: technicianSnapshot.id,
          name: technicianData?.fullName || '',
          phone: technicianData?.phone || '',
          email: technicianData?.email || '',
          active: technicianData?.active || false,
          availableForAssignment: technicianData?.availableForAssignment || false,
          currentAssignments: technicianData?.currentAssignments || 0,
          completedAssignments: technicianData?.completedAssignments || 0,
          totalAssignments: technicianData?.totalAssignments || 0,
        });

        const claimsCollection = collection(db, 'claims');
        const claimsSnapshot = await getDocs(claimsCollection);
        const claimsData = claimsSnapshot.docs
          .filter((doc) => doc.data().technicianId === authUser.uid)
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Claim[];
        setClaims(claimsData);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleClaimSelect = (claim: Claim) => {
    setSelectedClaim(claim);
    setResolution(claim.resolution || '');
  };

  const handleResolutionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setResolution(e.target.value);
  };

  const updateTechnicianStatus = async (field: string, value: boolean) => {
    if (!technician) return;

    try {
      const technicianDoc = doc(db, 'users', technician.id);
      await updateDoc(technicianDoc, {
        [field]: value,
        updatedAt: new Date().toISOString(),
      });

      setTechnician(prev => prev ? { ...prev, [field]: value } : null);
      toast.success(`Estado de ${field} actualizado correctamente`);
    } catch (error) {
      console.error('Error updating technician status:', error);
      toast.error(`Error al actualizar el estado de ${field}`);
    }
  };

  const markClaimAsCompleted = async () => {
    if (!selectedClaim || !technician) return;

    try {
      setIsCompletingClaim(true);

      const claimDoc = doc(db, 'claims', selectedClaim.id);
      const claimSnapshot = await getDoc(claimDoc);

      if (!claimSnapshot.exists()) {
        console.error(`No se encontró el reclamo con ID: ${selectedClaim.id}`);
        toast.error('Error al marcar el reclamo como completado');
        return;
      }

      await updateDoc(claimDoc, {
        status: 'completed',
        resolution,
        completedBy: technician.name,
        completedAt: new Date().toISOString(),
      });

      // Actualizar el documento del técnico
      const technicianDoc = doc(db, 'users', technician.id);
      await updateDoc(technicianDoc, {
        completedAssignments: (technician.completedAssignments || 0) + 1,
        currentAssignments: Math.max((technician.currentAssignments || 0) - 1, 0),
        updatedAt: new Date().toISOString(),
      });

      toast.success('Reclamo marcado como completado');
      
      setClaims(prevClaims => 
        prevClaims.map(claim => 
          claim.id === selectedClaim.id 
            ? { ...claim, status: 'completed', resolution } 
            : claim
        )
      );
      
      setTechnician(prev => prev ? {
        ...prev,
        completedAssignments: (prev.completedAssignments || 0) + 1,
        currentAssignments: Math.max((prev.currentAssignments || 0) - 1, 0),
      } : null);

      setSelectedClaim(null);
      setResolution('');
    } catch (error) {
      console.error('Error updating claim:', error);
      toast.error('Error al marcar el reclamo como completado');
    } finally {
      setIsCompletingClaim(false);
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
    <div className="min-h-screen bg-gray-900 text-gray-900">
      <header className="bg-gray-800 p-4 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-100">Panel de Técnicos</h1>
          {technician && (
            <div className="flex items-center space-x-4">
              <span className="font-semibold text-gray-200">{technician.name}</span>
              <span className="text-gray-400 text-sm">{technician.email}</span>
            </div>
          )}
        </div>
      </header>
      <main className="container mx-auto py-8 ">
        {technician && (
          <Card className="bg-slate-400 shadow-xl mb-8">
            <CardHeader>
              <h2 className="text-xl font-semibold text-gray-900">Estado del Técnico</h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Activo</span>
                <Switch
                  checked={technician.active}
                  onCheckedChange={(checked: boolean) => updateTechnicianStatus('active', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <span>Disponible para Asignaciones</span>
                <Switch
                  checked={technician.availableForAssignment}
                  onCheckedChange={(checked: boolean) => updateTechnicianStatus('availableForAssignment', checked)}
                />
              </div>
              <div>
                <span>Asignaciones Actuales: {technician.currentAssignments}</span>
              </div>
              <div>
                <span>Asignaciones Completadas: {technician.completedAssignments}</span>
              </div>
              <div>
                <span>Total de Asignaciones: {technician.totalAssignments}</span>
              </div>
            </CardContent>
          </Card>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2 bg-slate-800 shadow-xl">
            <CardHeader>
              <h2 className="text-xl font-semibold text-gray-100">Reclamos Asignados</h2>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                </div>
              ) : claims.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-800">
                        <TableHead className="text-gray-200">Teléfono</TableHead>
                        <TableHead className="text-gray-200">Nombre</TableHead>
                        <TableHead className="text-gray-200">Dirección</TableHead>
                        <TableHead className="text-gray-200">Motivo</TableHead>
                        <TableHead className="text-gray-200">Estado</TableHead>
                        <TableHead className="text-gray-200">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {claims.map((claim) => (
                        <TableRow
                          key={claim.id}
                          className={`cursor-pointer hover:bg-gray-700 ${
                            selectedClaim?.id === claim.id ? 'bg-gray-700' : ''
                          }`}
                          onClick={() => handleClaimSelect(claim)}
                        >
                          <TableCell className="text-gray-300">{claim.phone}</TableCell>
                          <TableCell className="text-gray-300">{claim.name}</TableCell>
                          <TableCell className="text-gray-300">{claim.address}</TableCell>
                          <TableCell className="text-gray-300">{claim.reason}</TableCell>
                          <TableCell>{getStatusBadge(claim.status)}</TableCell>
                          <TableCell>
                            {claim.status === 'pending' && (
                              <Button
                                size="sm"
                                className="bg-blue-600 hover:bg-blue-700 text-gray-100"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleClaimSelect(claim);
                                }}
                              >
                                Ver Detalles
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="flex justify-center items-center h-64 text-gray-400">
                  <p>No hay reclamos asignados.</p>
                </div>
              )}
            </CardContent>
          </Card>
          {selectedClaim && (
            <Card className="bg-slate-800 shadow-xl">
              <CardHeader>
                <h2 className="text-xl font-semibold text-gray-100">Detalles del Reclamo</h2>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="font-semibold text-gray-300">Teléfono:</label>
                  <Input value={selectedClaim.phone} readOnly className="mt-1 bg-gray-700 text-gray-200 border-gray-600" />
                </div>
                <div>
                  <label className="font-semibold text-gray-300">Nombre:</label>
                  <Input value={selectedClaim.name} readOnly className="mt-1 bg-gray-700 text-gray-200 border-gray-600" />
                </div>
                <div>
                  <label className="font-semibold text-gray-300">Dirección:</label>
                  <Input value={selectedClaim.address} readOnly className="mt-1 bg-gray-700 text-gray-200 border-gray-600" />
                </div>
                <div>
                  <label className="font-semibold text-gray-300">Motivo:</label>
                  <Input value={selectedClaim.reason} readOnly className="mt-1 bg-gray-700 text-gray-200 border-gray-600" />
                </div>
                <div>
                  <label className="font-semibold text-gray-300">Estado:</label>
                  <div className="mt-1">{getStatusBadge(selectedClaim.status)}</div>
                </div>
                <div>
                  <label className="font-semibold text-gray-300">Recibido por:</label>
                  <Input value={selectedClaim.receivedBy} readOnly className="mt-1 bg-gray-700 text-gray-200 border-gray-600" />
                </div>
                <div>
                  <label className="font-semibold text-gray-300">Recibido el:</label>
                  <Input value={selectedClaim.receivedAt} readOnly className="mt-1 bg-gray-700 text-gray-200 border-gray-600" />
                </div>
                <div>
                  <label htmlFor="resolution" className="font-semibold text-gray-300">
                    Observaciones:
                  </label>
                  <Textarea
                    id="resolution"
                    rows={4}
                    className="mt-1 bg-gray-700 text-gray-200 border-gray-600"
                    value={resolution}
                    onChange={handleResolutionChange}
                  />
                </div>
              </CardContent>
              <div className="p-6 mt-4 flex justify-end">
                {selectedClaim.status === 'pending' && (
                  <Button
                    onClick={markClaimAsCompleted}
                    disabled={isCompletingClaim}
                    className="bg-green-600 hover:bg-green-700 text-gray-100"
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
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default TechnicianPage;
