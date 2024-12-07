import React from 'react';
import { useAuthStore } from '@/stores/authStore';
import { LogOut as LogOutIcon } from 'lucide-react';

export const Logout: React.FC = () => {
    const { signOut } = useAuthStore();

    const handleLogout = async () => {
        try {
            await signOut();
            // Redirect or perform other actions after logout
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };

    return (
        <button className="text-red-400 nav-item hover:text-red-300" onClick={handleLogout}>
            <LogOutIcon className="nav-icon" />
            <span>Logout</span>
        </button>
    );
};

export default Logout;