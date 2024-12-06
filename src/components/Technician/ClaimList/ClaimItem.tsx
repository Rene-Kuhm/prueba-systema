import { type Claim } from '@/lib/types/technician'
interface ClaimItemProps {
    claim: Claim;
}

export const ClaimItem: React.FC<ClaimItemProps> = ({ claim }) => (
    <li key={claim.id} className="claim-item">
        <div className="claim-field">
            <span className="claim-field-label">Teléfono:</span> {claim.phone}
        </div>
        <div className="claim-field">
            <span className="claim-field-label">Nombre:</span> {claim.name}
        </div>
        <div className="claim-field">
            <span className="claim-field-label">Dirección:</span> {claim.address}
        </div>
        <div className="claim-field">
            <span className="claim-field-label">Motivo:</span> {claim.reason}
        </div>
        <div className="claim-field">
            <span className="claim-field-label">Estado:</span>{' '}
            {claim.status === 'pending' ? 'Pendiente' : 'Asignado'}
        </div>
    </li>
);