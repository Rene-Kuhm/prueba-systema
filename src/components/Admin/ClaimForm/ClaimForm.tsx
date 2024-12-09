import React, { useEffect, useState } from 'react';
import { ClaimFormProps, Claim, Technician } from '@/lib/types/admin';
import '@/components/Admin/ClaimForm/ClaimForm.css';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { handleReclamo } from '@/reclamoHandler'; // Importa la función handleReclamo

const ClaimForm: React.FC<ClaimFormProps> = ({ claim, onSubmit, onChange }) => {
    const [technicians, setTechnicians] = useState<Technician[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedTechnicianId, setSelectedTechnicianId] = useState(claim.technicianId || '');
    const [alertMessage, setAlertMessage] = useState<string | null>(null);

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
            const technicianList = technicianSnapshot.docs.map(doc => ({
                id: doc.id,
                name: doc.data().name,
                phone: doc.data().phone
            } as Technician));
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
    };

    const createClaim = async (claimData: Claim) => {
        try {
            const docRef = await addDoc(collection(db, "claims"), {
                ...claimData,
                createdAt: new Date(),
                notificationSent: false
            });
            console.log("Claim created with ID: ", docRef.id);
            await handleReclamo({ ...claimData, description: claimData.description || '' }); // Llama a handleReclamo después de crear el reclamo
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
            setAlertMessage('Reclamo guardado con éxito');
        } catch (error) {
            console.error('Error in handleSubmit:', error);
            setAlertMessage('Error al guardar el reclamo');
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
                    <button type="submit" className="submit-button">
                        Cargar Reclamo
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ClaimForm;