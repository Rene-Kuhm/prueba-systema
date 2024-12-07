import React, { useEffect, useState } from 'react';
import { ClaimFormProps, Claim, Technician } from '@/lib/types/admin';
import '@/components/Admin/ClaimForm/ClaimForm.css';
import { sendWhatsAppMessage } from '@/services/watsappService';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const formatClaimMessage = (claim: Partial<Claim>, technicianPhone: string): string => {
    return `
Nuevo reclamo recibido:
Teléfono: ${claim.phone || 'N/A'}
Nombre: ${claim.name || 'N/A'}
Dirección: ${claim.address || 'N/A'}
Técnico: ${claim.technicianId || 'N/A'}
Teléfono Técnico: ${technicianPhone || 'N/A'}
Motivo: ${claim.reason || 'N/A'}
Recibido por: ${claim.receivedBy || 'N/A'}
Fecha y Hora: ${claim.receivedAt || 'N/A'}
  `;
};

const formatDateForInput = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
        console.error('Fecha inválida:', dateString);
        return '';
    }
    return date.toISOString().slice(0, 16);
};

const ClaimForm: React.FC<ClaimFormProps> = ({ claim, onSubmit, onChange }) => {
    const [technicians, setTechnicians] = useState<Technician[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedTechnicianId, setSelectedTechnicianId] = useState(claim.technicianId || '');

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

    useEffect(() => {
        console.log('selectedTechnicianId actualizado:', selectedTechnicianId);
    }, [selectedTechnicianId]);

    useEffect(() => {
        console.log('Claim actualizado:', JSON.stringify(claim, null, 2));
    }, [claim]);

    const handleTechnicianChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newTechnicianId = e.target.value;
        console.log('Nuevo técnico seleccionado:', newTechnicianId);
        setSelectedTechnicianId(newTechnicianId);
        const updatedClaim = { ...claim, technicianId: newTechnicianId };
        console.log('Claim actualizado en handleTechnicianChange:', updatedClaim);
        onChange(updatedClaim);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await onSubmit(); // Guarda el reclamo

            // Obtén la información del técnico asignado
            const selectedTechnician = technicians.find(tech => tech.id === selectedTechnicianId);
            const technicianPhone = selectedTechnician ? selectedTechnician.phone : 'N/A';

            // Formatea el mensaje de WhatsApp
            const message = formatClaimMessage(claim, technicianPhone);

            // Envía el mensaje de WhatsApp al técnico
            await sendWhatsAppMessage(technicianPhone, message);
            console.log('Notificación de WhatsApp enviada al técnico con éxito');

            // Envía el mensaje de WhatsApp al administrador (si está configurado)
            const adminPhoneNumber = import.meta.env.VITE_ADMIN_WHATSAPP_NUMBER;
            if (adminPhoneNumber) {
                await sendWhatsAppMessage(adminPhoneNumber, message);
                console.log('Notificación de WhatsApp enviada al administrador con éxito');
            } else {
                console.warn('Número de administrador no configurado para WhatsApp');
            }
        } catch (error) {
            console.error('Error al guardar el reclamo o enviar la notificación:', error);
        }
    };

    // Muestra el formulario solo cuando se hayan cargado los técnicos
    if (loading) return <div>Cargando técnicos...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div className="claim-form-container">
            <h2 className="claim-form-title">Cargar Nuevo Reclamo</h2>
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
                        <label className="form-label required-field">Recibido en</label>
                        <input
                            type="datetime-local"
                            value={formatDateForInput(claim.receivedAt ?? '')}
                            onChange={(e) => {
                                const newDate = e.target.value ? new Date(e.target.value).toLocaleString('es-AR') : '';
                                onChange({ ...claim, receivedAt: newDate });
                            }}
                            className="form-input"
                            required
                        />
                    </div>
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
