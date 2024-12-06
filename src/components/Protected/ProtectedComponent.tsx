// componente para el componente Protected

import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { auth, db } from '@/lib/firebase'
import { doc, getDoc } from 'firebase/firestore'

export const ProtectedComponent: React.FC = () => {
    const [userRole, setUserRole] = useState<string | null>(null)
    const navigate = useNavigate()

    useEffect(() => {
        const checkUserRole = async () => {
            const user = auth.currentUser
            if (user) {
                const userDoc = await getDoc(doc(db, 'users', user.uid))
                if (userDoc.exists()) {
                    const userData = userDoc.data()
                    setUserRole(userData.role)

                    if (userData.role !== 'admin' && userData.role !== 'technician') {
                        navigate('/acceso-denegado')
                    }
                } else {
                    navigate('/acceso-denegado')
                }
            } else {
                navigate('/login')
            }
        }

        checkUserRole()
    }, [navigate])

    if (!userRole) {
        return <div className="protected-loading">Cargando...</div>
    }

    return (
        <div>
            <h1>Bienvenido, {userRole}</h1>
        </div>
    )
}

// componente para el componente AccessDenied


export const AccessDenied: React.FC = () => (
    <div className="access-denied-container">
        <h1 className="access-denied-title">Acceso Denegado</h1>
        <p className="access-denied-text">
            No tienes los permisos necesarios para acceder a esta página.
        </p>
        <p className="access-denied-text">
            Si crees que esto es un error, por favor contacta al administrador.
        </p>
        <Link to="/" className="access-denied-link">
            Volver a la página principal
        </Link>
    </div>
)