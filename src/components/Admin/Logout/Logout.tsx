// components/Admin/Logout/Logout.tsx
import React from 'react';
import { LogOut as LogOutIcon } from 'lucide-react';

interface LogOutProps {
  onLogout: () => void;
}

const LogOut: React.FC<LogOutProps> = ({ onLogout }) => {
  return (
    <button 
      onClick={onLogout} 
      className="text-red-400 nav-item hover:text-red-300 w-full flex items-center gap-2"
    >
      <LogOutIcon className="w-5 h-5" />
      <span>Cerrar Sesión</span>
    </button>
  );
};

export default LogOut;