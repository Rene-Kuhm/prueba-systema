// src/services/adminService.ts
import { db } from '../../config/firebase'
import { collection, query, where, getDocs, doc, updateDoc, addDoc, deleteDoc } from 'firebase/firestore'
import type { PendingUser, Claim, Technician } from '../../lib/types/admin'
import * as XLSX from 'xlsx'

export class AdminService {
    async fetchPendingUsers(): Promise<PendingUser[]> {
        const usersRef = collection(db, 'users')
        const q = query(usersRef, where('approved', '==', false))
        const querySnapshot = await getDocs(q)

        const users: PendingUser[] = []
        querySnapshot.forEach((doc) => {
            const userData = doc.data()
            users.push({
                id: doc.id,
                email: userData.email,
                fullName: userData.fullName,
                displayName: userData.displayName || userData.fullName,
                role: userData.role,
                createdAt: userData.createdAt,
            })
        })

        return users
    }

    async fetchTechnicians(): Promise<Technician[]> {
        const snapshot = await getDocs(collection(db, 'technicians'));
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as Technician[];
    }

    async fetchClaims(): Promise<Claim[]> {
        const claimsRef = collection(db, 'claims')
        const querySnapshot = await getDocs(claimsRef)

        const claims: Claim[] = []
        querySnapshot.forEach((doc) => {
            claims.push({ id: doc.id, ...doc.data() } as Claim)
        })

        return claims
    }

    async approveUser(userId: string): Promise<void> {
        if (!userId) throw new Error('User ID is required');
        const userRef = doc(db, 'users', userId)
        await updateDoc(userRef, { approved: true })
    }

    async addClaim(claim: Omit<Claim, 'id'>): Promise<void> {
        if (!claim) throw new Error('Claim data is required');
        const claimsRef = collection(db, 'claims')
        await addDoc(claimsRef, claim)
    }

    async deleteClaim(claimId: string): Promise<void> {
        if (!claimId) throw new Error('Claim ID is required');
        const claimRef = doc(db, 'claims', claimId)
        await deleteDoc(claimRef)
    }

    exportClaimsToExcel(claims: Claim[]): void {
        const data = claims.map((claim) => ({
            Teléfono: claim.phone,
            Nombre: claim.name,
            Dirección: claim.address,
            Motivo: claim.reason,
            Técnico: claim.technicianId || 'No asignado',
            Estado: claim.status === 'pending' ? 'Pendiente' : 'Asignado',
            Resolución: claim.resolution || 'No resuelto',
            'Recibido por': claim.receivedBy || 'N/A',
            'Recibido en': claim.receivedAt || 'N/A',
        }))

        const worksheet = XLSX.utils.json_to_sheet(data)
        const workbook = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Reclamos')
        XLSX.writeFile(workbook, 'reclamos.xlsx')
    }
}