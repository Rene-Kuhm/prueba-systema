import React, { useEffect, useState } from 'react';
import { ClaimFormProps, Claim, Technician } from '@/lib/types/admin';
import '@/components/Admin/ClaimForm/ClaimForm.css';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getFunctions, httpsCallable, Functions } from 'firebase/functions';

const ClaimForm: React.FC<ClaimFormProps> = ({ claim, onSubmit, onChange }) => {
    const [technicians, setTechnicians] = useState<Technician[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedTechnicianId, setSelectedTechnicianId] = useState(claim.technicianId || '');
    const [alertMessage, setAlertMessage] = useState<string | null>(null);
    const [functions, setFunctions] = useState<Functions | null>(null);

    useEffect(() => {
        const initializeFunctions = async () => {
            try {
                const functionsInstance = getFunctions();
                setFunctions(functionsInstance);
                console.log('Firebase Functions initialized');
            } catch (error) {
                console.error('Error initializing Firebase Functions:', error);
                setError('Error initializing Firebase Functions. Please try again later.');
            }
        };

        initializeFunctions();
    }, []);

    useEffect(() => {
        const fetchTechnicians = async () => {
            try {
                const technicianCollection = collection(db, 'technicians');
                const technicianSnapshot = await getDocs(technicianCollection);
                const technicianList = technicianSnapshot.docs.map(doc => ({
                    id: doc.id,
                    name: doc.data().name,
                    phone: doc.data().phone
                } as Technician));
                console.log("Lista de técnicos:", technicianList);
                setTechnicians(technicianList);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching technicians:", err);
                setError("No se pudieron cargar los técnicos. Por favor, intente de nuevo más tarde.");
                setLoading(false);
            }
        };

        fetchTechnicians();
    }, []);

    useEffect(() => {
        if (claim.technicianId !== selectedTechnicianId) {
            setSelectedTechnicianId(claim.technicianId || '');
        }
    }, [claim.technicianId]);

    const handleTechnicianChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newTechnicianId = e.target.value;
        setSelectedTechnicianId(newTechnicianId);
        onChange({ ...claim, technicianId: newTechnicianId });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!claim.phone || !claim.name || !claim.address || !claim.reason || !selectedTechnicianId) {
            setAlertMessage('Todos los campos son requeridos');
            return;
        }
        try {
            // Set the current date and time
            const now = new Date().toLocaleString('es-AR');
            const updatedClaim = { ...claim, receivedAt: now, technicianId: selectedTechnicianId };
            await onSubmit();

            if (updatedClaim.id && updatedClaim.phone && updatedClaim.name) {
                await sendClaimNotification(updatedClaim as Claim);
            } else {
                setAlertMessage('Faltan campos requeridos en el reclamo para la notificación');
            }
        } catch (error) {
            console.error('Error al guardar el reclamo o enviar la notificación:', error);
            setAlertMessage('Error al guardar el reclamo o enviar la notificación');
        }
    };

    const sendClaimNotification = async (claim: Claim) => {
        if (!functions) {
            console.error('Firebase Functions not initialized');
            setAlertMessage('Error: Firebase Functions not initialized');
            return;
        }

        try {
            const sendNotificationFunction = httpsCallable(functions, 'sendClaimNotification');
            const result = await sendNotificationFunction({ claim });
            console.log('Cloud Function response:', result.data);
            setAlertMessage('Notificación enviada con éxito');
        } catch (error) {
            console.error('Error in sendClaimNotification:', error);
            setAlertMessage(`Error al enviar la notificación: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    };

    if (loading) return <div>Cargando técnicos...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div className="claim-form-container">
            <h2 className="claim-form-title">Cargar Nuevo Reclamo</h2>
            {alertMessage && (
                <div className="alert alert-info mb-4">
                    {alertMessage}
                    <button onClick={() => setAlertMessage(null)} className="ml-2">×</button>
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
                        <label className="form-label required-field">Técnico Asignado</label>
                        <select
                            value={selectedTechnicianId}
                            onChange={handleTechnicianChange}
                            className="form-select"
                            required
                        >
                            <option value="">Seleccionar Técnico</option>
                            {technicians.map((technician) => (
                                <option key={technician.id} value={technician.id}>
                                    {technician.name} - {technician.phone}
                                </option>
                            ))}
                        </select>
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

                <div className="flex justify-end mt-6">
                    <button type="submit" className="submit-button">
                        Guardar Reclamo
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ClaimForm;