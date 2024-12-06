// src/services/adminService.ts
import { db } from '@/lib/firebase'
import { collection, query, where, getDocs, doc, updateDoc, addDoc, deleteDoc } from 'firebase/firestore'
import { PendingUser, Claim } from '@/lib/types/admin'
import * as XLSX from 'xlsx'

export const adminService = {
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
    },

    async fetchClaims(): Promise<Claim[]> {
        const claimsRef = collection(db, 'claims')
        const querySnapshot = await getDocs(claimsRef)

        const claims: Claim[] = []
        querySnapshot.forEach((doc) => {
            claims.push({ id: doc.id, ...doc.data() } as Claim)
        })

        return claims
    },

    async approveUser(userId: string): Promise<void> {
        const userRef = doc(db, 'users', userId)
        await updateDoc(userRef, { approved: true })
    },

    async addClaim(claim: Omit<Claim, 'id'>): Promise<void> {
        const claimsRef = collection(db, 'claims')
        await addDoc(claimsRef, claim)
    },

    async deleteClaim(claimId: string): Promise<void> {
        const claimRef = doc(db, 'claims', claimId)
        await deleteDoc(claimRef)
    },

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