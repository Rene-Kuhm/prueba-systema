import { type Claim } from '@/lib/types/technician';
import { ClaimItem } from './ClaimItem';
import type { FC } from 'react';

interface ClaimsListProps {
    claims: Claim[];
    loading: boolean;
    error: string | null;
}

export const ClaimsList: FC<ClaimsListProps> = ({ claims, loading, error }) => (
    <div className="claims-container">
        <h2 className="claims-title">Reclamos Asignados</h2>
        {loading ? (
            <div className="loading-state">Cargando reclamos...</div>
        ) : error ? (
            <div className="error-state">Error: {error}</div>
        ) : claims.length === 0 ? (
            <div className="empty-state">No hay reclamos asignados.</div>
        ) : (
            <ul className="claims-list">
                {claims.map((claim) => (
                    <ClaimItem key={claim.id} claim={claim} />
                ))}
            </ul>
        )}
    </div>
);

export { ClaimItem };