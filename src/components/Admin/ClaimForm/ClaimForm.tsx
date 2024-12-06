import React from 'react';
import { ClaimFormProps } from '@/lib/types/admin';
import '@/components/Admin/ClaimForm/ClaimForm.css';

const ClaimForm: React.FC<ClaimFormProps> = ({ claim, technicians, onSubmit, onChange }) => {
    return (
        <div className="claim-form-container">
            <h2 className="claim-form-title">
                Cargar Nuevo Reclamo
            </h2>
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    onSubmit();
                }}
                className="space-y-6"
            >
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
                            value={claim.technicianId}
                            onChange={(e) => onChange({ ...claim, technicianId: e.target.value })}
                            className="form-select"
                            required
                        >
                            <option value="">Seleccionar Técnico</option>
                            {technicians.map((technician) => (
                                <option key={technician} value={technician}>
                                    {technician}
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
                            value={claim.receivedAt}
                            onChange={(e) => onChange({ ...claim, receivedAt: e.target.value })}
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