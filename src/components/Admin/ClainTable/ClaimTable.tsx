import type { Claim } from '@/lib/types/admin';
import { Eye, Trash2, FileText } from 'lucide-react';
import '@/components/Admin/ClainTable/ClaimTable.css'

export interface ClaimsTableProps {
    claims: Claim[];
    onDelete: (claimId: string) => Promise<void>;
    onShowDetails: (claim: Claim) => void;
    onExport: () => void;
}

const formatDateTime = (dateString: string | undefined) => {
    if (!dateString) return 'Fecha no disponible';
    try {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('es-AR', {
            dateStyle: 'short',
            timeStyle: 'short'
        }).format(date);
    } catch {
        return 'Fecha inválida';
    }
};

export function ClaimsTable({
    claims,
    onDelete,
    onShowDetails,
    onExport,
}: ClaimsTableProps) {
    return (
        <div className="claims-table-container">
            <div className="flex items-center justify-between table-header-section">
                <div>
                    <h3 className="table-title">Gestión de Reclamos</h3>
                    <p className="table-subtitle">{claims.length} reclamos en total</p>
                </div>
                <button onClick={onExport} className="export-button">
                    <FileText size={18} />
                    Exportar
                </button>
            </div>

            <div className="table-wrapper">
                {claims.length > 0 ? (
                    <table className="claims-table">
                        <thead>
                            <tr>
                                <th>Teléfono</th>
                                <th>Nombre</th>
                                <th>Dirección</th>
                                <th>Servicio</th>
                                <th>Motivo</th>
                                <th>Recibido por</th>
                                <th>Fecha y Hora</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {claims.map((claim: Claim) => (
                                <tr key={claim.id}>
                                    <td>{claim.phone}</td>
                                    <td>{claim.name}</td>
                                    <td>
                                        <div className="truncate-text" title={claim.address}>
                                            {claim.address}
                                        </div>
                                    </td>
                                    <td>{claim.technicianId}</td>
                                    <td>
                                        <div className="truncate-text" title={claim.reason}>
                                            {claim.reason}
                                        </div>
                                    </td>
                                    <td>{claim.receivedBy || 'N/A'}</td>
                                    <td>{formatDateTime(claim.receivedAt)}</td>
                                    <td>
                                        <div className="action-buttons">
                                            <button
                                                onClick={() => onShowDetails(claim)}
                                                className="action-button action-view"
                                                title="Ver detalles"
                                            >
                                                <Eye size={18} />
                                            </button>
                                            <button
                                                onClick={() => claim.id && onDelete(claim.id)}
                                                className="action-button action-delete"
                                                title="Eliminar reclamo"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="table-empty">
                        No hay reclamos disponibles
                    </div>
                )}
            </div>
        </div>
    );
}

export default ClaimsTable;