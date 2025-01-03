import { useState, useEffect, useRef, useCallback } from 'react';
import { Claim, PendingUser, Technician } from '../lib/types/admin';
import { AdminService } from '../config/services/adminService';
import { collection, onSnapshot, doc, deleteDoc, setDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../config/firebase';
import { toast } from 'react-toastify';

export interface UseAdminReturn {
    pendingUsers: PendingUser[];
    claims: Claim[];
    technicians: Technician[];
    newClaim: Omit<Claim, "id">;
    selectedClaim: Claim | null;
    showModal: boolean;
    handleSignOut: () => void;
    addNewClaim: (claim: Omit<Claim, "id">) => Promise<void>;
    setShowModal: (show: boolean) => void;
    setSelectedClaim: (claim: Claim | null) => void;
    setNewClaim: (claim: Omit<Claim, "id">) => void;
    deleteClaim: (id: string) => Promise<void>;
    totalAdmins: number;
    loading: boolean;
}

const initialClaimState: Omit<Claim, "id"> = {
    name: '',
    phone: '',
    address: '',
    reason: '',
    technicianId: '',
    receivedBy: '',
    receivedAt: new Date().toLocaleString('es-AR'),
    status: 'pending',
    title: '',
    customer: '',
    date: new Date().toLocaleString('es-AR'),
    resolution: '',
    technicalDetails: '',
    notes: '',
    notificationSent: false,
    createdAt: new Date().toISOString(),
};

export const useAdmin = (): UseAdminReturn => {
    const [state, setState] = useState({
        pendingUsers: [] as PendingUser[],
        claims: [] as Claim[],
        technicians: [] as Technician[],
        loading: true,
        totalAdmins: 0
    });

    const [newClaim, setNewClaim] = useState<Omit<Claim, "id">>(initialClaimState);
    const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
    const [showModal, setShowModal] = useState<boolean>(false);

    const adminService = useRef(new AdminService()).current;
    const claimsListener = useRef<(() => void) | null>(null);
    const isMounted = useRef(true);

    useEffect(() => {
        return () => {
            isMounted.current = false;
            if (claimsListener.current) {
                claimsListener.current();
            }
        };
    }, []);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const [users, techs, adminsSnapshot] = await Promise.all([
                    adminService.fetchPendingUsers(),
                    adminService.fetchTechnicians(),
                    getDocs(query(collection(db, 'users'), where('role', '==', 'admin')))
                ]);

                setState(prev => ({
                    ...prev,
                    pendingUsers: users,
                    technicians: techs,
                    totalAdmins: adminsSnapshot.size,
                    loading: false
                }));
            } catch (error) {
                console.error('Error fetching initial data:', error);
                toast.error('Error al cargar datos iniciales');
                setState(prev => ({ ...prev, loading: false }));
            }
        };

        fetchInitialData();
    }, []);

    useEffect(() => {
        try {
            const unsubscribe = onSnapshot(
                query(collection(db, 'claims'), where('status', '==', 'completed')),
                async (snapshot) => {
                    if (snapshot.empty) return;

                    const claims = snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    } as Claim));

                    setState(prev => ({
                        ...prev,
                        claims
                    }));
                }
            );

            return () => unsubscribe();
        } catch (error) {
            console.error('Error en listener:', error);
            toast.error('Error al cargar reclamos');
        }
    }, []);

    const handleSignOut = useCallback(() => {
        // Implementar lógica de cierre de sesión
    }, []);

    const addNewClaim = useCallback(async (claim: Omit<Claim, "id">) => {
        try {
            const claimRef = doc(collection(db, 'claims'));
            const newClaimWithId = {
                ...claim,
                id: claimRef.id,
                createdAt: new Date().toISOString(),
                lastUpdate: new Date().toISOString()
            };

            await setDoc(claimRef, newClaimWithId);
            setNewClaim(initialClaimState);
            toast.success('Reclamo creado exitosamente');
        } catch (error) {
            console.error('Error adding claim:', error);
            toast.error('Error al crear el reclamo');
            throw error;
        }
    }, []);

    const deleteClaim = useCallback(async (claimId: string) => {
        try {
            await deleteDoc(doc(db, 'claims', claimId));
            toast.success('Reclamo eliminado exitosamente');
        } catch (error) {
            console.error('Error deleting claim:', error);
            toast.error('Error al eliminar el reclamo');
            throw error;
        }
    }, []);

    return {
        ...state,
        newClaim,
        selectedClaim,
        showModal,
        handleSignOut,
        addNewClaim,
        deleteClaim,
        setNewClaim,
        setShowModal,
        setSelectedClaim
    };
};