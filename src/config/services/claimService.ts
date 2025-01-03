// src/config/services/claimService.ts
import { db } from '@/config/firebase';
import { 
 doc,
 deleteDoc,
 updateDoc,
 Timestamp 
} from 'firebase/firestore';

export const deleteClaim = async (id: string) => {
 try {
   const claimRef = doc(db, 'claims', id);
   await deleteDoc(claimRef);
   return { success: true };
 } catch (error) {
   console.error('Error deleting claim:', error);
   throw error;
 }
};

export const archiveClaim = async (id: string) => {
 try {
   const claimRef = doc(db, 'claims', id);
   await updateDoc(claimRef, {
     isArchived: true,
     lastUpdate: Timestamp.now()
   });
   return { success: true };
 } catch (error) {
   console.error('Error archiving claim:', error);
   throw error;
 }
};

export const restoreClaim = async (id: string) => {
 try {
   const claimRef = doc(db, 'claims', id);
   await updateDoc(claimRef, {
     isArchived: false,
     lastUpdate: Timestamp.now()
   });
   return { success: true };
 } catch (error) {
   console.error('Error restoring claim:', error);
   throw error;
 }
};