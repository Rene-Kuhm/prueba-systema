import React from 'react'
import ClaimForm from '@/components/Admin/ClaimForm/ClaimForm'
import ClaimsTable from '../ClaimTable/ClaimTable'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, List } from 'lucide-react'
import type { Claim, Technician, ExtendedClaim } from '@/lib/types/admin'
import '@/components/Admin/Claim/ClaimsSection.css'

// Remove the local ExtendedClaim interface since it's now imported

// Definir tipo para nuevo reclamo
type NewClaim = Omit<Claim, 'id'> & {
  description: string
  claimType: string
  claimAmount: number
  updatedAt: string
}

interface ClaimsSectionProps {
  claims: Claim[]
  technicians: Technician[]
  newClaim: NewClaim
  onSubmit: (claim: NewClaim) => Promise<{ success: boolean; id: string; message?: string }>
  onChange: (claim: NewClaim) => void
  onDelete: (id: string) => Promise<void>
  onShowDetails: (claim: ExtendedClaim) => void
  onEdit?: (claim: ExtendedClaim) => void
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
  const [showArchived, setShowArchived] = React.useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [claimToDelete, setClaimToDelete] = React.useState<string | null>(null);

  const handleDeleteClick = (id: string) => {
    setClaimToDelete(id);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!claimToDelete) return;
    
    try {
      setIsDeleting(true);
      await onDelete(claimToDelete);
      setShowDeleteDialog(false);
    } catch (error) {
      console.error('Error deleting claim:', error);
    } finally {
      setIsDeleting(false);
      setClaimToDelete(null);
    }
  };

  // Función para transformar los claims
  const transformClaims = (claims: Claim[]): ExtendedClaim[] => {
    return claims.map((claim) => ({
      ...claim,
      id: claim.id!, // ensure id is non-optional
      description: claim.reason || '',
      claimType: '',
      claimAmount: 0,
      updatedAt: new Date().toISOString(),
      createdAt: claim.receivedAt || claim.date, // Add createdAt field
      technicianName: technicians.find((t) => t.id === claim.technicianId)?.name,
    }))
  }

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
                onDelete={handleDeleteClick}
                onShowDetails={onShowDetails}
                onEdit={onEdit}
                showArchived={showArchived}
                showDeleteDialog={showDeleteDialog}
                isDeleting={isDeleting}
                onToggleArchived={() => setShowArchived(!showArchived)}
                onCancelDelete={() => {
                  setShowDeleteDialog(false);
                  setClaimToDelete(null);
                }}
                onConfirmDelete={handleConfirmDelete}
                onArchive={() => {}} // Implement if needed
                onRestore={() => {}} // Implement if needed
              />
            </TabsContent>

            <TabsContent value='new'>
              <ClaimForm
                claim={newClaim}
                technicians={technicians}
                onSubmit={async () => {
                  await onSubmit(newClaim);
                  return { success: true, id: 'temp-id' };
                }}
                onChange={(updatedClaim) => onChange(updatedClaim as NewClaim)}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

export default ClaimsSection
