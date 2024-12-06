// src/components/Admin/Header.tsx (Ejemplo)
export interface HeaderProps {
    onSignOut: () => Promise<void>;
    onExport: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onSignOut, onExport }) => {
    return (
        <div>
            {/* Implementación del header */}
            <button onClick={onSignOut}>Sign Out</button>
            <button onClick={onExport}>Export Claims</button>
        </div>
    );
}

export default Header;