import React, { useState, useEffect } from "react";
import { ErrorState } from "@/components/Admin/States/ErrorState";
import { LoadingState } from "@/components/Admin/States/LoadingState";
import { Users, FileText, Wrench, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { AdminLayout } from "@/components/Admin/Layout/AdminLayout";
import { DashboardCard } from "@/components/Admin/Dashboard/DashboardCard";
import { Header } from "@/components/Admin/Header";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "react-toastify";
import { PendingUsers } from "@/components/Admin/PendingUsers";
import ClaimForm from "@/components/Admin/ClaimForm/ClaimForm";
import ClaimTable from "@/components/Admin/ClainTable/ClaimTable";
import ClaimDetailsModal from "@/components/Admin/ClaimDetailsModal";
import { Notification } from '@/lib/types/notifications';
import { AdminState, Claim, PendingUser, Technician } from '@/lib/types/admin';
import { useAdmin, UseAdminReturn } from "@/hooks/useAdmin";

// Definición de tipos
interface ExtendedClaim extends Claim {
    description: string;
    claimType: string;
    claimAmount: number;
    updatedAt: string;
    technicianName?: string;
}

const initialClaim: Claim = {
    id: '',
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
    notificationSent: false
};

const Admin = () => {
    const {
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
        setSelectedClaim,
    }: UseAdminReturn = useAdmin();

    const [activeSection, setActiveSection] = useState("dashboard");
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const handleMarkAsRead = (id: string) => {
        setNotifications(prev =>
            prev.map(notif => notif.id === id ? { ...notif, read: true } : notif)
        );
    };

    const handleNewClaimChange = (claim: Partial<Claim>) => {
        setNewClaim(claim as Omit<Claim, "id">);
    };

    const handleClearAllNotifications = () => {
        setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
    };

    const handleSubmitNewClaim = async () => {
        const claimWithId = { ...newClaim, id: crypto.randomUUID() };
        await addNewClaim(claimWithId);
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteDoc(doc(db, 'claims', id));
            toast.success('Reclamo eliminado exitosamente');
            // Actualizar la lista de reclamos después de eliminar
            await getData();
        } catch (error) {
            console.error('Error al eliminar el reclamo:', error);
            toast.error('Error al eliminar el reclamo');
        }
    };

    const handleShowDetails = (claim: ExtendedClaim) => {
        setSelectedClaim(claim);
        setShowModal(true);
    };

    const handleEdit = (claim: ExtendedClaim) => {
        setSelectedClaim(claim);
        setShowModal(true);
    };

    if (loading) {
        return <LoadingState />;
    }

    if (error) {
        return <ErrorState message={error} />;
    }

    const getData = async (): Promise<any[]> => {
        try {
            const querySnapshot = await getDocs(collection(db, "claims"));
            const fetchedData = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            return fetchedData;
        } catch (error) {
            console.error("Error fetching data:", error);
            toast.error("Error fetching data");
            return [];
        }
    };

    const calculateStatistics = () => {
        const totalClaims = claims.length;
        const activeClaims = claims.filter(claim =>
            claim.status === 'pending' || claim.status === 'in_progress'
        ).length;
        const totalTechnicians = technicians.length;

        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const claimsThisMonth = claims.filter(claim => {
            if (!claim.receivedAt) return false;
            const claimDate = typeof claim.receivedAt === 'string' 
                ? new Date(claim.receivedAt) 
                : claim.receivedAt;
            return claimDate.getMonth() === currentMonth && 
                   claimDate.getFullYear() === currentYear;
        }).length;

        const pendingClaims = claims.filter(claim => claim.status === 'pending').length;
        const inProgressClaims = claims.filter(claim => claim.status === 'in_progress').length;
        const completedClaims = claims.filter(claim => claim.status === 'completed').length;

        const activeTechnicians = new Set(claims
            .filter(claim => claim.status !== 'completed')
            .map(claim => claim.technicianId)
        ).size;

        return {
            totalClaims,
            activeClaims,
            totalTechnicians,
            claimsThisMonth,
            pendingClaims,
            inProgressClaims,
            completedClaims,
            activeTechnicians
        };
    };

    const renderDashboard = () => {
        const stats = calculateStatistics();

        return (
            <div className="space-y-8 p-6">
                <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>

                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <DashboardCard
                            title="Total Claims"
                            value={stats.totalClaims}
                            icon={<FileText size={24} />}
                            variant="claims"
                        />
                        <DashboardCard
                            title="Active Claims"
                            value={stats.activeClaims}
                            icon={<AlertCircle size={24} />}
                            variant="users"
                        />
                        <DashboardCard
                            title="Total Technicians"
                            value={stats.totalTechnicians}
                            icon={<Wrench size={24} />}
                            variant="techs"
                        />
                        <DashboardCard
                            title="Active Technicians"
                            value={stats.activeTechnicians}
                            icon={<Users size={24} />}
                            variant="techs"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <DashboardCard
                            title="Pending Claims"
                            value={stats.pendingClaims}
                            icon={<Clock size={24} />}
                            variant="claims"
                        />
                        <DashboardCard
                            title="In Progress Claims"
                            value={stats.inProgressClaims}
                            icon={<AlertCircle size={24} />}
                            variant="users"
                        />
                        <DashboardCard
                            title="Completed Claims"
                            value={stats.completedClaims}
                            icon={<CheckCircle size={24} />}
                            variant="techs"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <DashboardCard
                            title="Claims This Month"
                            value={stats.claimsThisMonth}
                            icon={<FileText size={24} />}
                            variant="claims"
                        />
                        <DashboardCard
                            title="Monthly Efficiency"
                            value={Math.round((stats.completedClaims / stats.totalClaims) * 100)}
                            icon={<CheckCircle size={24} />}
                            variant="techs"
                        />
                    </div>
                </div>
            </div>
        );
    };

    const transformClaims = (claims: Claim[]): ExtendedClaim[] => {
        return claims.map(claim => ({
            ...claim,
            description: claim.reason || '',
            claimType: '',
            claimAmount: 0,
            updatedAt: new Date().toISOString(),
            technicianName: technicians.find(t => t.id === claim.technicianId)?.name
        }));
    };

    const renderContent = () => {
        switch (activeSection) {
            case "users":
                return <PendingUsers />;
            case "claims":
                return (
                    <div className="claims-section">
                        <ClaimForm
                            claim={newClaim || initialClaim}
                            technicians={technicians}
                            onSubmit={handleSubmitNewClaim}
                            onChange={handleNewClaimChange}
                        />
                        <ClaimTable
                            claims={transformClaims(claims)}
                            onDelete={handleDelete}
                            onShowDetails={handleShowDetails}
                            onEdit={handleEdit}
                        />
                    </div>
                );
            default:
                return renderDashboard();
        }
    };

    return (
        <AdminLayout
            activeSection={activeSection}
            setActiveSection={setActiveSection}
            pendingUsers={pendingUsers}
            claims={claims}
            technicians={technicians.map(tech => ({ id: tech.id, name: tech.name }))}
            onSelectClaim={(claim) => {
                setSelectedClaim(claim);
                setShowModal(true);
            }}
            notifications={notifications}
            onMarkAsRead={handleMarkAsRead}
            onClearAllNotifications={handleClearAllNotifications}
        >
            <Header onSignOut={handleSignOut} onExport={getData} />
            <main className="main-content">{renderContent()}</main>
            <ClaimDetailsModal
                claim={selectedClaim}
                isOpen={showModal}
                onClose={() => setShowModal(false)}
            />
        </AdminLayout>
    );
};

export default Admin;