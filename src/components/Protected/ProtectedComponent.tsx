import { ReactNode, useEffect } from 'react';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

interface ProtectedComponentProps {
    children: ReactNode;
}

export const ProtectedComponent = ({ children }: ProtectedComponentProps) => {
    useEffect(() => {
        const checkUserRole = async () => {
            const user = auth.currentUser;
            if (!user) {
                window.location.href = '/login';
                return;
            }

            const userDoc = await getDoc(doc(db, 'users', user.uid));
            if (!userDoc.exists()) {
                window.location.href = '/acceso-denegado';
                return;
            }

            const userData = userDoc.data();
            if (userData.role !== 'admin' && userData.role !== 'technician') {
                window.location.href = '/acceso-denegado';
            }
        };

        checkUserRole();
    }, []);

    return <>{children}</>;
};

export const AccessDenied = () => (
    <div className="access-denied-container">
        <h1 className="access-denied-title">Acceso Denegado</h1>
        <p className="access-denied-text">
            No tienes los permisos necesarios para acceder a esta página.
        </p>
        <p className="access-denied-text">
            Si crees que esto es un error, por favor contacta al administrador.
        </p>
        <a href="/" className="access-denied-link">
            Volver a la página principal
        </a>
    </div>
);