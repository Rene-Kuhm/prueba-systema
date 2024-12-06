// src/components/Admin/Header/types.ts
export interface HeaderProps {
    onSignOut: () => Promise<void>;
    onExport: () => void;
}

export type { HeaderProps };