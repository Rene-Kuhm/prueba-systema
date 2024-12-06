import React from 'react'
import ClaimForm from '@/components/Admin/ClaimForm/ClaimForm'
import { ClaimsTable } from '../ClainTable/ClaimTable'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, List } from 'lucide-react'
import type { Claim } from '@/lib/types/admin'
import '@/components/Admin/Claim/ClaimsSection.css'

// Definimos un tipo para un nuevo reclamo, omitiendo el id
type NewClaim = Omit<Claim, 'id'>

interface ClaimsSectionProps {
  claims: Claim[]
  technicians: Array<{ id: string; name: string }>
  newClaim: NewClaim // Cambiamos el tipo aquí
  onSubmit: (claim: NewClaim) => void // Y aquí
  onChange: (claim: NewClaim) => void // Y aquí
  onDelete: (id: string) => Promise<void>
  onShowDetails: (claim: Claim) => void
  onExport: () => void
}

export const ClaimsSection: React.FC<ClaimsSectionProps> = ({
  claims,
  technicians,
  newClaim,
  onSubmit,
  onChange,
  onDelete,
  onShowDetails,
  onExport,
}) => {
  // Convertir technicians a array de strings (nombres)
  const technicianNames = technicians.map((tech) => tech.name)

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
                claims={claims}
                onExport={onExport}
                onDelete={onDelete}
                onShowDetails={onShowDetails}
              />
            </TabsContent>

            <TabsContent value='new'>
              <ClaimForm
                claim={newClaim as NewClaim} // Aseguramos que es del tipo correcto
                technicians={technicianNames} // Pasamos solo los nombres
                onSubmit={() => onSubmit(newClaim)} // Ajustamos la función
                onChange={(updatedClaim) => onChange(updatedClaim as NewClaim)} // Y aquí también
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
