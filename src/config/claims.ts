// src/lib/firebase/claims.ts

import { doc, updateDoc, deleteField } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export const archiveClaim = async (claimId: string) => {
    try {
        const claimRef = doc(db, 'claims', claimId);
        await updateDoc(claimRef, {
            isArchived: true,
            archivedAt: new Date().toISOString()
        });
        return true;
    } catch (error) {
        console.error('Error archivando reclamo:', error);
        throw error;
    }
};

export const restoreClaim = async (claimId: string) => {
    try {
        const claimRef = doc(db, 'claims', claimId);
        await updateDoc(claimRef, {
            isArchived: false,
            archivedAt: deleteField()
        });
        return true;
    } catch (error) {
        console.error('Error restaurando reclamo:', error);
        throw error;
    }
};