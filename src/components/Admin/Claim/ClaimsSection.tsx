import React from 'react';
import ClaimForm from '@/components/Admin/ClaimForm/ClaimForm';
import { ClaimsTable } from '../ClainTable/ClaimTable';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, List } from 'lucide-react';
import type { Claim, Technician } from '@/lib/types/admin';
import '@/components/Admin/Claim/ClaimsSection.css';

// Definir ExtendedClaim
interface ExtendedClaim extends Claim {
    description: string;
    claimType: string;
    claimAmount: number;
    updatedAt: string;
    technicianName?: string;
}

// Definir tipo para nuevo reclamo
type NewClaim = Omit<Claim, 'id'>;

interface ClaimsSectionProps {
    claims: Claim[];
    technicians: Technician[];
    newClaim: NewClaim;
    onSubmit: (claim: NewClaim) => void;
    onChange: (claim: NewClaim) => void;
    onDelete: (id: string) => Promise<void>;
    onShowDetails: (claim: ExtendedClaim) => void;
    onEdit?: (claim: ExtendedClaim) => void;
}

export const ClaimsSection: React.FC<ClaimsSectionProps> = ({
    claims,
    technicians,
    newClaim,
    onSubmit,
    onChange,
    onDelete,
    onShowDetails,
    onEdit,
}) => {
    // Función para transformar los claims
    const transformClaims = (claims: Claim[]): ExtendedClaim[] => {
        return claims.map(claim => ({
            ...claim,
            description: claim.reason || '',
            claimType: '',
            claimAmount: 0,
            updatedAt: new Date().toISOString(),
            technicianName: technicians.find(t => t.id === claim.technicianId)?.name
        }));
    };

    return (
        <div className='claims-section'>
            <Card>
                <CardHeader>
                    <CardTitle className='claims-title'>Gestión de Reclamos</CardTitle>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue='list' className='claims-tabs'>
                        <TabsList className='claims-tabs-list'>
                            <TabsTrigger value='list' className='claims-tab'>
                                <List className='tab-icon' />
                                Lista de Reclamos
                            </TabsTrigger>
                            <TabsTrigger value='new' className='claims-tab'>
                                <Plus className='tab-icon' />
                                Nuevo Reclamo
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value='list'>
                            <ClaimsTable
                                claims={transformClaims(claims)}
                                onDelete={onDelete}
                                onShowDetails={onShowDetails}
                                onEdit={onEdit}
                            />
                        </TabsContent>

                        <TabsContent value='new'>
                            <ClaimForm
                                claim={newClaim}
                                technicians={technicians}
                                onSubmit={async () => onSubmit(newClaim)}
                                onChange={(updatedClaim) => onChange(updatedClaim as NewClaim)}
                            />
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
};

export default ClaimsSection;