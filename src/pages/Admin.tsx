import React, { useState, useEffect } from "react";
import { ErrorState } from "@/components/Admin/States/ErrorState";
import { LoadingState } from "@/components/Admin/States/LoadingState";
import { Users, FileText, Wrench, Calendar } from "lucide-react";
import { AdminLayout } from "@/components/Admin/Layout/AdminLayout";
import { DashboardCard } from "@/components/Admin/Dashboard/DashboardCard";
import { Header } from "@/components/Admin/Header";
import { collection, getDocs, deleteDoc, doc, onSnapshot } from "firebase/firestore";
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

    // Nuevo estado para las métricas del dashboard
    const [dashboardStats, setDashboardStats] = useState({
        totalTechnicians: 0,
        totalClaims: 0,
        totalAdmins: 0,
        monthClaims: 0,
        yearClaims: 0
    });

    // Efecto para sincronizar datos con Firebase
    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Obtener conteos de cada colección
                const techsSnapshot = await getDocs(collection(db, "technicians"));
                const claimsSnapshot = await getDocs(collection(db, "claims"));
                const usersSnapshot = await getDocs(collection(db, "users"));

                const now = new Date();
                const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
                const firstDayOfYear = new Date(now.getFullYear(), 0, 1);

                // Filtrar reclamos por fecha
                const claimDocs = claimsSnapshot.docs.map(doc => ({
                    ...doc.data(),
                    receivedAt: doc.data().receivedAt ? new Date(doc.data().receivedAt) : null
                }));

                const monthClaims = claimDocs.filter(claim => 
                    claim.receivedAt && claim.receivedAt >= firstDayOfMonth
                ).length;

                const yearClaims = claimDocs.filter(claim => 
                    claim.receivedAt && claim.receivedAt >= firstDayOfYear
                ).length;

                const adminUsers = usersSnapshot.docs.filter(doc => 
                    doc.data().role === 'admin'
                ).length;

                setDashboardStats({
                    totalTechnicians: techsSnapshot.size,
                    totalClaims: claimsSnapshot.size,
                    totalAdmins: adminUsers,
                    monthClaims,
                    yearClaims
                });
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
                toast.error("Error al cargar datos del dashboard");
            }
        };

        fetchDashboardData();

        // Configurar listener para actualizaciones en tiempo real
        const unsubscribeClaims = onSnapshot(collection(db, "claims"), (snapshot) => {
            fetchDashboardData();
        });

        const unsubscribeTechs = onSnapshot(collection(db, "technicians"), (snapshot) => {
            fetchDashboardData();
        });

        return () => {
            unsubscribeClaims();
            unsubscribeTechs();
        };
    }, []);

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
            const receivedDate = typeof claim.receivedAt === 'string'
                ? new Date(claim.receivedAt)
                : claim.receivedAt;
            return receivedDate.getMonth() === currentMonth &&
                receivedDate.getFullYear() === currentYear;
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

    // Modificar renderDashboard para usar dashboardStats
    const renderDashboard = () => {
        return (
            <div className="space-y-8 p-6">
                <h2 className="text-3xl font-bold">Dashboard</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <DashboardCard
                        title="Total Técnicos"
                        value={dashboardStats.totalTechnicians}
                        icon={<Wrench size={24} />}
                        variant="techs"
                    />
                    <DashboardCard
                        title="Total Reclamos"
                        value={dashboardStats.totalClaims}
                        icon={<FileText size={24} />}
                        variant="claims"
                    />
                    <DashboardCard
                        title="Total Administradores"
                        value={dashboardStats.totalAdmins}
                        icon={<Users size={24} />}
                        variant="users"
                    />
                    <DashboardCard
                        title="Reclamos del Mes"
                        value={dashboardStats.monthClaims}
                        icon={<Calendar size={24} />}
                        variant="claims"
                    />
                    <DashboardCard
                        title="Reclamos del Año"
                        value={dashboardStats.yearClaims}
                        icon={<Calendar size={24} />}
                        variant="claims"
                    />
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