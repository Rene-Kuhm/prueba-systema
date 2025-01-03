import { db } from '../../config/firebase';
import { collection, query, where, getDocs, doc, deleteDoc, addDoc } from 'firebase/firestore';
import type { PendingUser, Claim, Technician } from '../../lib/types/admin';
import * as XLSX from 'xlsx';

export class AdminService {
    async fetchPendingUsers(): Promise<PendingUser[]> {
        try {
            const usersRef = collection(db, 'users');
            const q = query(usersRef, where('approved', '==', false));
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) return [];

            const users: PendingUser[] = [];
            querySnapshot.forEach((doc) => {
                const userData = doc.data();
                if (userData.email && userData.fullName) {
                    users.push({
                        id: doc.id,
                        email: userData.email,
                        fullName: userData.fullName,
                        displayName: userData.displayName || userData.fullName,
                        role: userData.role || 'user',
                        createdAt: userData.createdAt || new Date().toISOString(),
                    });
                }
            });

            return users;
        } catch (error) {
            console.error('[AdminService] Error fetching pending users:', error);
            throw error;
        }
    }

    async fetchClaims(): Promise<Claim[]> {
        try {
            const claimsRef = collection(db, 'claims');
            const snapshot = await getDocs(claimsRef);

            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Claim));
        } catch (error) {
            console.error('[AdminService] Error fetching claims:', error);
            throw error;
        }
    }
    async fetchTechnicians(): Promise<Technician[]> {
        try {
            const techRef = collection(db, 'technicians');
            const snapshot = await getDocs(techRef);

            if (snapshot.empty) return [];

            return snapshot.docs
                .map(doc => ({
                    id: doc.id,
                    ...doc.data()
                } as Technician))
                .filter(tech => Boolean(tech.name));
        } catch (error) {
            console.error('[AdminService] Error fetching technicians:', error);
            throw error;
        }
    }

    async fetchCompletedClaims(): Promise<Claim[]> {
        try {
            const claimsRef = collection(db, 'claims');
            const q = query(claimsRef, where('status', '==', 'completed'));
            const snapshot = await getDocs(q);

            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Claim));
        } catch (error) {
            console.error('[AdminService] Error fetching completed claims:', error);
            throw error;
        }
    }

    async addClaim(claim: Omit<Claim, 'id'>): Promise<void> {
        if (!claim) throw new Error('Claim data is required');
        await addDoc(collection(db, 'claims'), claim);
    }

    async deleteClaim(claimId: string): Promise<void> {
        if (!claimId) throw new Error('Claim ID is required');
        await deleteDoc(doc(db, 'claims', claimId));
    }

    async exportClaimsToExcel(): Promise<void> {
        try {
            const claims = await this.fetchCompletedClaims();
            if (claims.length === 0) throw new Error('No hay reclamos completados para exportar');
     
            // Estilos
            const styles = {
                headerTitle: {
                    font: { bold: true, color: { rgb: "2E7D32" }, size: 14 },
                    alignment: { horizontal: "center", vertical: "center" }
                },
                tableHeader: {
                    font: { bold: true, color: { rgb: "FFFFFF" } },
                    fill: { fgColor: { rgb: "2E7D32" } },
                    alignment: { horizontal: "center", vertical: "center" }
                },
                completedRow: {
                    font: { color: { rgb: "000000" } },
                    fill: { fgColor: { rgb: "E8F5E9" } }
                }
            };
     
            const header = [
                ['COSPEC COMUNICACIONES'],
                ['Reporte de Reclamos Completados'],
                [`Fecha de generación: ${new Date().toLocaleDateString('es-AR')} ${new Date().toLocaleTimeString('es-AR')}`],
                [''],
                ['ID','Estado','Nombre','Teléfono','Dirección','Motivo','Resolución',
                 'Completado Por','Fecha Completado','Recibido Por','Fecha Recibido',
                 'Detalles Técnicos','Notas','Cliente']
            ];
     
            const claimsData = claims.map(claim => [
                claim.id, claim.status, claim.name, claim.phone, claim.address,
                claim.reason, claim.resolution, claim.completedBy,
                claim.completedAt ? new Date(claim.completedAt).toLocaleString('es-AR') : '',
                claim.receivedBy, claim.receivedAt, claim.technicalDetails,
                claim.notes, claim.customer
            ]);
     
            const workbook = XLSX.utils.book_new();
            const worksheet = XLSX.utils.aoa_to_sheet([...header, ...claimsData]);
     
            // Aplicar estilos
            for (let i = 0; i < header.length + claimsData.length; i++) {
                for (let j = 0; j < 14; j++) {
                    const cell = XLSX.utils.encode_cell({ r: i, c: j });
                    
                    if (i === 0) {
                        worksheet[cell].s = styles.headerTitle;
                    } else if (i === 4) {
                        worksheet[cell].s = styles.tableHeader;
                    } else if (i > 4) {
                        worksheet[cell].s = styles.completedRow;
                    }
                }
            }
     
            // Configurar columnas y fusiones
            worksheet['!cols'] = Array(14).fill({ wch: 20 });
            worksheet['!merges'] = [
                { s: { r: 0, c: 0 }, e: { r: 0, c: 13 } },
                { s: { r: 1, c: 0 }, e: { r: 1, c: 13 } },
                { s: { r: 2, c: 0 }, e: { r: 2, c: 13 } }
            ];
     
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Reclamos Completados');
            XLSX.writeFile(workbook, `reclamos_completados_${new Date().toISOString().split('T')[0]}.xlsx`);
     
        } catch (error) {
            console.error('[AdminService] Export error:', error);
            throw error;
        }
     } }