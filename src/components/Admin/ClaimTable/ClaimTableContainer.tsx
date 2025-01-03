// ClaimTableContainer.tsx

import { useEffect, useState } from 'react';
import { Fragment } from 'react';
import { collection, query, onSnapshot, orderBy, doc, setDoc } from 'firebase/firestore';
import ClaimDetailsModal from '@/components/Admin/ClaimTableDetails/ClaimDetailsModal';
import ClaimEditModal from '@/components/Admin/ClaimEditModal/ClaimEditModal';
import { db } from '@/config/firebase';
import { ExtendedClaim } from '@/lib/types/admin';
import ClaimTable from '@/components/Admin/ClaimTable/ClaimTable';
import { toast } from 'react-toastify';
import { 
 deleteClaim, 
 archiveClaim, 
 restoreClaim 
} from '@/config/services/claimService';

const ClaimTableContainer = () => {
 const [claims, setClaims] = useState<ExtendedClaim[]>([]);
 const [loading, setLoading] = useState(true);
 const [showArchived, setShowArchived] = useState(false);
 const [showDeleteDialog, setShowDeleteDialog] = useState(false);
 const [isDeleting, setIsDeleting] = useState(false);
 const [claimToDelete, setClaimToDelete] = useState<string | null>(null);
 const [showDetailsModal, setShowDetailsModal] = useState(false);
 const [showEditModal, setShowEditModal] = useState(false);
 const [selectedClaim, setSelectedClaim] = useState<ExtendedClaim | null>(null);

 useEffect(() => {
   const claimsRef = collection(db, 'claims');
   const q = query(claimsRef, orderBy('createdAt', 'desc'));

   const unsubscribe = onSnapshot(q, 
     (snapshot) => {
       const claimsData = snapshot.docs.map(doc => ({
         id: doc.id,
         ...doc.data()
       })) as ExtendedClaim[];
       
       setClaims(claimsData);
       setLoading(false);
     },
     (error) => {
       console.error('Error fetching claims:', error);
       toast.error('Error al cargar los reclamos');
       setLoading(false);
     }
   );

   return () => unsubscribe();
 }, [showArchived]);

 const handleShowDetails = (claim: ExtendedClaim) => {
   setSelectedClaim(claim);
   setShowDetailsModal(true);
 };

 const handleDelete = (id: string) => {
   setClaimToDelete(id);
   setShowDeleteDialog(true);
 };

 const handleConfirmDelete = async () => {
   if (!claimToDelete) return;
   
   setIsDeleting(true);
   try {
     await deleteClaim(claimToDelete);
     toast.success('Reclamo eliminado exitosamente');
   } catch (error) {
     console.error('Error deleting claim:', error);
     toast.error('Error al eliminar el reclamo');
   } finally {
     setIsDeleting(false);
     setShowDeleteDialog(false);
     setClaimToDelete(null);
   }
 };

 const handleArchive = async (id: string) => {
   try {
     await archiveClaim(id);
     toast.success('Reclamo archivado exitosamente');
   } catch (error) {
     console.error('Error archiving claim:', error);
     toast.error('Error al archivar el reclamo');
   }
 };

 const handleRestore = async (id: string) => {
   try {
     await restoreClaim(id);
     toast.success('Reclamo restaurado exitosamente');
   } catch (error) {
     console.error('Error restoring claim:', error);
     toast.error('Error al restaurar el reclamo');
   }
 };

 const handleEdit = (claim: ExtendedClaim) => {
   setSelectedClaim(claim);
   setShowEditModal(true);
 };

 const handleSave = async (updatedClaim: ExtendedClaim) => {
   try {
     const claimRef = doc(db, 'claims', updatedClaim.id);
     // eslint-disable-next-line @typescript-eslint/no-unused-vars
     const { id, ...claimWithoutId } = updatedClaim;
     await setDoc(claimRef, claimWithoutId, { merge: true });
     toast.success('Reclamo actualizado exitosamente');
     setShowEditModal(false);
   } catch (error) {
     console.error('Error updating claim:', error);
     toast.error('Error al actualizar el reclamo');
   }
 };

 if (loading) {
   return <div>Cargando reclamos...</div>;
 }

 return (
   <Fragment>
     <ClaimTable
       claims={claims}
       showArchived={showArchived}
       showDeleteDialog={showDeleteDialog}
       isDeleting={isDeleting}
       onShowDetails={handleShowDetails}
       onEdit={handleEdit}
       onDelete={handleDelete}
       onArchive={handleArchive}
       onRestore={handleRestore}
       onToggleArchived={() => setShowArchived(!showArchived)}
       onCancelDelete={() => {
         setShowDeleteDialog(false);
         setClaimToDelete(null);
       }}
       onConfirmDelete={handleConfirmDelete}
     />
     {showDetailsModal && (
       <ClaimDetailsModal 
         isOpen={showDetailsModal}
         onClose={() => setShowDetailsModal(false)}
         claim={selectedClaim}
       />
     )}
     {showEditModal && (
       <ClaimEditModal
         isOpen={showEditModal}
         onClose={() => setShowEditModal(false)}
         onSave={handleSave}
         claim={selectedClaim}
       />
     )}
   </Fragment>
 );
};

export default ClaimTableContainer;