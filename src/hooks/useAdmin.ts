import { useState, useEffect } from 'react';
import { AdminState, Claim, PendingUser, Technician } from '../lib/types/admin';
import { adminService } from '../config/services/adminService';

export interface UseAdminReturn {
    loading: boolean;
    error: string | null;
    pendingUsers: PendingUser[];
    claims: Claim[];
    technicians: Technician[];
    newClaim: Omit<Claim, "id">;
    selectedClaim: Claim | null;
    showModal: boolean;
    handleSignOut: () => void;
    approveUser: (userId: string) => Promise<void>;
    addNewClaim: (claim: Claim) => Promise<void>;
    deleteClaim: (claimId: string) => Promise<void>;
    exportClaimsToExcel: () => void;
    setNewClaim: (claim: Omit<Claim, "id">) => void;
    setShowModal: (show: boolean) => void;
    setSelectedClaim: (claim: Claim | null) => void;
}

export const useAdmin = (): UseAdminReturn => {
    const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
    const [claims, setClaims] = useState<Claim[]>([]);
    const [technicians, setTechnicians] = useState<Technician[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [newClaim, setNewClaim] = useState<Omit<Claim, "id">>({} as Omit<Claim, "id">);
    const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
    const [showModal, setShowModal] = useState<boolean>(false);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [users, claimsData, techs] = await Promise.all([
                    adminService.fetchPendingUsers(),
                    adminService.fetchClaims(),
                    adminService.fetchTechnicians() // Aquí está la llamada corregida
                ]);
                setPendingUsers(users);
                setClaims(claimsData);
                setTechnicians(techs);
            } catch (error) {
                console.error('Error fetching admin data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleSignOut = () => {
        // Implement sign out logic
    };

    const approveUser = async (userId: string) => {
        try {
            await adminService.approveUser(userId);
            setPendingUsers(prev => prev.filter(user => user.id !== userId));
        } catch (error) {
            setError('Failed to approve user');
        }
    };

    const addNewClaim = async (claim: Claim) => {
        try {
            await adminService.addClaim(claim);
            setClaims(prev => [...prev, claim]);
        } catch (error) {
            setError('Failed to add claim');
        }
    };

    const deleteClaim = async (claimId: string) => {
        try {
            await adminService.deleteClaim(claimId);
            setClaims(prev => prev.filter(claim => claim.id !== claimId));
        } catch (error) {
            setError('Failed to delete claim');
        }
    };

    const exportClaimsToExcel = () => {
        // Implement export logic
    };

    return {
        loading,
        error,
        pendingUsers,
        claims,
        technicians,
        newClaim,
        selectedClaim,
        showModal,
        handleSignOut,
        approveUser,
        addNewClaim,
        deleteClaim,
        exportClaimsToExcel,
        setNewClaim,
        setShowModal,
        setSelectedClaim
    };
};
