// PendingUsers.tsx
import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';

interface PendingUser {
    id: string;
    email: string;
    fullName: string;
    role: string;
    createdAt: string;
}

export const PendingUsers = () => {
    const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);

    useEffect(() => {
        const fetchPendingUsers = async () => {
            try {
                const usersRef = collection(db, 'users');
                const q = query(usersRef, where('approved', '==', false));
                const querySnapshot = await getDocs(q);
                const users = querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                })) as PendingUser[];
                setPendingUsers(users);
            } catch (error) {
                console.error('Error al obtener usuarios pendientes:', error);
            }
        };

        fetchPendingUsers();
    }, []);

    const handleApprove = async (userId: string) => {
        try {
            const userRef = doc(db, 'users', userId);
            await updateDoc(userRef, { approved: true });
            setPendingUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
        } catch (error) {
            console.error('Error al aprobar usuario:', error);
        }
    };

    return (
        <div className="p-6 mb-8 bg-white rounded-lg shadow-sm dark:bg-gray-800">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Usuarios Pendientes
            </h2>
            {pendingUsers.length === 0 ? (
                <p>No hay usuarios pendientes de aprobación.</p>
            ) : (
                <ul className="mt-4 space-y-4">
                    {pendingUsers.map((user) => (
                        <li
                            key={user.id}
                            className="flex justify-between p-4 bg-gray-100 rounded-md dark:bg-gray-700"
                        >
                            <span>
                                {user.fullName} ({user.email})
                            </span>
                            <button
                                onClick={() => handleApprove(user.id)}
                                className="px-4 py-2 text-white bg-green-600 rounded-md hover:bg-green-700"
                            >
                                Aprobar
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};