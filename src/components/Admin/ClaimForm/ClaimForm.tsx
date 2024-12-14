import React, { useEffect, useState } from 'react';
import { ClaimFormProps, Claim, Technician } from '@/lib/types/admin';
import '@/components/Admin/ClaimForm/ClaimForm.css';
import { collection, getDocs, addDoc, doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getMessaging, getToken } from 'firebase/messaging';
import { toast } from 'react-toastify';

const ClaimForm: React.FC<ClaimFormProps> = ({ claim, onSubmit, onChange }) => {
    const [technicians, setTechnicians] = useState<Technician[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedTechnicianId, setSelectedTechnicianId] = useState(claim.technicianId || '');
    const [alertMessage, setAlertMessage] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [techniciansWithNotifications, setTechniciansWithNotifications] = useState<Set<string>>(new Set());

    useEffect(() => {
        fetchTechnicians();
    }, []);

    useEffect(() => {
        if (claim.technicianId !== selectedTechnicianId) {
            setSelectedTechnicianId(claim.technicianId || '');
        }
    }, [claim.technicianId]);

    const fetchTechnicians = async () => {
        try {
            const technicianCollection = collection(db, 'technicians');
            const technicianSnapshot = await getDocs(technicianCollection);
            
            const technicianList: Technician[] = [];
            
            await Promise.all(
                technicianSnapshot.docs.map(async (techDoc) => {
                    const technicianData = techDoc.data();
                    
                    // Check corresponding user document
                    const userDoc = await getDoc(doc(db, 'users', techDoc.id));
                    const userData = userDoc.data();
                    
                    // Filter technicians based on multiple conditions
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
                            email: userData.email
                        } as Technician);
                    }
                })
            );
    
            // Verificar qué técnicos tienen token FCM
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
            console.error("Error fetching technicians:", err);
            setError("No se pudieron cargar los técnicos. Por favor, intente de nuevo más tarde.");
            setLoading(false);
        }
    };

    const handleTechnicianChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newTechnicianId = e.target.value;
        setSelectedTechnicianId(newTechnicianId);
        onChange({ ...claim, technicianId: newTechnicianId });

        // Advertir si el técnico no tiene notificaciones configuradas
        if (newTechnicianId && !techniciansWithNotifications.has(newTechnicianId)) {
            toast.warning('Este técnico no recibirá notificaciones automáticas');
        }
    };

    const sendNotification = async (claimId: string, technicianId: string, claimDetails: Claim) => {
        try {
            const technicianDoc = await getDoc(doc(db, 'users', technicianId));
            const technicianData = technicianDoc.data();
            const technicianName = technicians.find(t => t.id === technicianId)?.name || 'técnico';
            
            if (!technicianData?.fcmToken || technicianData?.active === false) {
                toast.warning(`El técnico ${technicianName} no tiene notificaciones configuradas`);
                // Guardar notificación pendiente
                await setDoc(doc(db, 'pendingNotifications', claimId), {
                    technicianId,
                    claimId,
                    customerName: claimDetails.name,
                    customerAddress: claimDetails.address,
                    customerPhone: claimDetails.phone,
                    reason: claimDetails.reason,
                    createdAt: new Date(),
                    attempts: 0,
                    technicianName
                });
                return false;
            }

            const sendNotificationUrl = `${import.meta.env.VITE_FIREBASE_FUNCTIONS_URL}/sendNotification`;
            
            const response = await fetch(sendNotificationUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    notification: {
                        title: "Nuevo Reclamo Asignado",
                        body: `Se te ha asignado un nuevo reclamo de ${claimDetails.name}`,
                        icon: '/logo192.png'
                    },
                    data: {
                        claimId,
                        customerName: claimDetails.name,
                        customerAddress: claimDetails.address,
                        customerPhone: claimDetails.phone,
                        reason: claimDetails.reason,
                        type: 'new_claim'
                    },
                    token: technicianData.fcmToken
                })
            });

            if (!response.ok) {
                throw new Error(`Error al enviar la notificación: ${response.statusText}`);
            }

            console.log('Notificación enviada exitosamente');
            toast.success(`Notificación enviada a ${technicianName}`);
            return true;
        } catch (error) {
            console.error('Error al enviar la notificación:', error);
            toast.error('No se pudo enviar la notificación al técnico');
            return false;
        }
    };

    const createClaim = async (claimData: Claim) => {
        try {
            const docRef = await addDoc(collection(db, "claims"), {
                ...claimData,
                createdAt: new Date(),
                status: 'pending',
                notificationSent: false,
                lastUpdate: new Date()
            });
            
            const notificationSent = await sendNotification(docRef.id, claimData.technicianId, claimData);
            
            await setDoc(doc(db, "claims", docRef.id), {
                notificationSent,
                lastNotificationAttempt: new Date()
            }, { merge: true });
            
            return docRef.id;
        } catch (e) {
            console.error("Error adding claim: ", e);
            throw e;
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!claim.phone || !claim.name || !claim.address || !claim.reason || !selectedTechnicianId || !claim.receivedBy) {
            setAlertMessage('Todos los campos son requeridos');
            return;
        }

        setIsSubmitting(true);
        try {
            const now = new Date().toLocaleString('es-AR');
            const updatedClaim: Claim = {
                ...claim,
                receivedAt: now,
                technicianId: selectedTechnicianId,
                id: claim.id || `temp_${Date.now()}`,
                status: claim.status || 'pending',
                receivedBy: claim.receivedBy,
                phone: claim.phone,
                name: claim.name,
                address: claim.address,
                reason: claim.reason,
                title: claim.title || '',
                customer: claim.customer || '',
                date: claim.date || now,
                resolution: claim.resolution || ''
            };
            
            const claimId = await createClaim(updatedClaim);
            updatedClaim.id = claimId;
            
            await onSubmit();
            toast.success('Reclamo guardado con éxito');
            setAlertMessage('Reclamo guardado con éxito');
        } catch (error) {
            console.error('Error in handleSubmit:', error);
            toast.error('Error al guardar el reclamo');
            setAlertMessage('Error al guardar el reclamo');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
    );

    if (error) return (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
            {error}
        </div>
    );

    return (
        <div className="claim-form-container">
            <h2 className="claim-form-title">Cargar Nuevo Reclamo</h2>
            {alertMessage && (
                <div className={`alert ${alertMessage.includes('éxito') ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'} mb-4`}>
                    {alertMessage}
                    <button 
                        onClick={() => setAlertMessage(null)}
                        className="ml-2 text-black hover:text-gray-700"
                    >
                        ×
                    </button>
                </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="claim-form-grid">
                    <div className="input-container">
                        <label className="form-label required-field">Teléfono</label>
                        <input
                            type="text"
                            placeholder="Ej: +54 11 1234-5678"
                            value={claim.phone}
                            onChange={(e) => onChange({ ...claim, phone: e.target.value })}
                            className="form-input"
                            required
                        />
                    </div>
                    <div className="input-container">
                        <label className="form-label required-field">Nombre</label>
                        <input
                            type="text"
                            placeholder="Nombre completo"
                            value={claim.name}
                            onChange={(e) => onChange({ ...claim, name: e.target.value })}
                            className="form-input"
                            required
                        />
                    </div>
                    <div className="input-container">
                        <label className="form-label required-field">Dirección</label>
                        <input
                            type="text"
                            placeholder="Dirección completa"
                            value={claim.address}
                            onChange={(e) => onChange({ ...claim, address: e.target.value })}
                            className="form-input"
                            required
                        />
                    </div>
                    <div className="input-container">
                        <label className="form-label required-field">
                            Técnico Asignado
                            <span className="ml-2 text-xs text-gray-400">
                                ({techniciansWithNotifications.size} de {technicians.length} con notificaciones)
                            </span>
                        </label>
                        <div className="relative">
                            <select
                                value={selectedTechnicianId}
                                onChange={handleTechnicianChange}
                                className={`form-select ${
                                    selectedTechnicianId && !techniciansWithNotifications.has(selectedTechnicianId)
                                    ? 'border-yellow-400'
                                    : ''
                                }`}
                                required
                            >
                                <option value="">Seleccionar Técnico</option>
                                {technicians.map((technician) => {
                                    const hasNotifications = techniciansWithNotifications.has(technician.id);
                                    return (
                                        <option 
                                            key={technician.id} 
                                            value={technician.id}
                                            className={`${
                                                hasNotifications 
                                                    ? 'text-green-700' 
                                                    : 'text-yellow-600'
                                            }`}
                                        >
                                            {technician.name} - {technician.phone}
                                            {!hasNotifications ? ' (Sin notificaciones)' : ' ✓'}
                                        </option>
                                    );
                                })}
                            </select>
                            {selectedTechnicianId && !techniciansWithNotifications.has(selectedTechnicianId) && (
                                <div className="absolute -bottom-6 left-0 text-sm text-yellow-600">
                                    Este técnico no recibirá notificaciones automáticas
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className="input-container">
                    <label className="form-label required-field">Motivo del Reclamo</label>
                    <textarea
                        placeholder="Descripción detallada del reclamo"
                        value={claim.reason}
                        onChange={(e) => onChange({ ...claim, reason: e.target.value })}
                        className="form-textarea"
                        required
                    />
                </div>
                <div className="claim-form-grid">
                    <div className="input-container">
                        <label className="form-label required-field">Recibido por</label>
                        <input
                            type="text"
                            placeholder="Nombre del receptor"
                            value={claim.receivedBy}
                            onChange={(e) => onChange({ ...claim, receivedBy: e.target.value })}
                            className="form-input"
                            required
                        />
                    </div>
                    <div className="input-container">
                        <label className="form-label">Recibido en</label>
                        <input
                            type="text"
                            value={claim.receivedAt || new Date().toLocaleString('es-AR')}
                            className="form-input"
                            readOnly
                        />
                    </div>
                </div>
                <div className="flex justify-end mt-6">
                    <button 
                        type="submit" 
                        className="submit-button"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <div className="flex items-center">
                                <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                                Guardando...
                            </div>
                        ) : (
                            'Cargar Reclamo'
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ClaimForm;