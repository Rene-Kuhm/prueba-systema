// hook para el componente Admin

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { auth } from '@/lib/firebase'
import { signOut } from 'firebase/auth'
import { adminService } from '@/services/adminService'
import type { AdminState, Claim } from '@/lib/types/admin'

export function useAdmin() {
    const navigate = useNavigate()
    const { userProfile, setUserProfile } = useAuthStore()
    const [state, setState] = useState<AdminState>({
        pendingUsers: [],
        claims: [],
        loading: true,
        error: null,
        showModal: false,
        selectedClaim: null,
        newClaim: {
            title: '',
            customer: '',
            date: new Date().toLocaleString(),
            phone: '',
            name: '',
            address: '',
            reason: '',
            technicianId: '',
            status: 'pending',
            resolution: '',
            receivedBy: userProfile?.displayName || '',
            receivedAt: new Date().toLocaleString(),
        }
    })

    const technicians = ['René', 'Roman', 'Oscar', 'Dalmiro']

    const fetchData = async () => {
        try {
            const [users, claims] = await Promise.all([
                adminService.fetchPendingUsers(),
                adminService.fetchClaims()
            ])
            setState(prev => ({ ...prev, pendingUsers: users, claims, loading: false }))
        } catch (err) {
            setState(prev => ({ ...prev, error: 'Error al cargar datos', loading: false }))
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    const handleSignOut = async () => {
        try {
            await signOut(auth)
            setUserProfile(null)
            navigate('/')
        } catch (err) {
            console.error('Error al cerrar sesión:', err)
            alert('Error al cerrar sesión. Intenta de nuevo.')
        }
    }

    const approveUser = async (userId: string) => {
        try {
            await adminService.approveUser(userId)
            setState(prev => ({
                ...prev,
                pendingUsers: prev.pendingUsers.filter(user => user.id !== userId)
            }))
        } catch (err) {
            alert('Error al aprobar usuario')
        }
    }

    const addNewClaim = async () => {
        try {
            await adminService.addClaim(state.newClaim)
            await fetchData()
            setState(prev => ({
                ...prev,
                newClaim: {
                    title: '',
                    customer: '',
                    date: new Date().toLocaleString(),
                    phone: '',
                    name: '',
                    address: '',
                    reason: '',
                    technician: '',
                    status: 'pending',
                    resolution: '',
                    receivedBy: userProfile?.displayName || '',
                    receivedAt: new Date().toLocaleString(),
                }
            }))
        } catch (err) {
            alert('Error al agregar un nuevo reclamo.')
        }
    }

    const deleteClaim = async (claimId: string) => {
        try {
            await adminService.deleteClaim(claimId)
            await fetchData()
        } catch (err) {
            alert('Error al eliminar el reclamo.')
        }
    }

    return {
        ...state,
        technicians,
        handleSignOut,
        approveUser,
        addNewClaim,
        deleteClaim,
        exportClaimsToExcel: () => adminService.exportClaimsToExcel(state.claims),
        setShowModal: (showModal: boolean) => setState(prev => ({ ...prev, showModal })),
        setSelectedClaim: (selectedClaim: Claim | null) => setState(prev => ({ ...prev, selectedClaim })),
        setNewClaim: (newClaim: Omit<Claim, 'id'>) => setState(prev => ({ ...prev, newClaim }))
    }
}