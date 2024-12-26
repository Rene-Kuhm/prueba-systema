import React, { useState, useCallback, useEffect } from 'react';
import { Search as SearchIcon, X, Users, FileText, Wrench } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { PendingUser, Claim, Technician } from '@/lib/types/admin';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { getApp } from 'firebase/app';

// Obtener la instancia de Firebase existente
const app = getApp();
const db = getFirestore(app);

interface AdminSearchProps {
    pendingUsers: PendingUser[];
    claims: Claim[];
    technicians: { 
        id: string; 
        name: string; 
    }[];
    onResultClick: (result: SearchResult) => void;
    setActiveSection: (section: string) => void;
}

export interface SearchResult {
    id: string;
    type: 'user' | 'claim' | 'technician';
    title: string;
    subtitle?: string;
    section: 'users' | 'claims' | 'dashboard';
    data: PendingUser | Claim | Technician;
}

export const AdminSearch: React.FC<AdminSearchProps> = ({
    pendingUsers,
    claims,
    technicians,
    onResultClick,
    setActiveSection: setActiveSectionProp
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSearch = useCallback(async (term: string) => {
        if (!term || term.length < 2) {
            setSearchResults([]);
            return;
        }

        setIsLoading(true);
        const searchResults: SearchResult[] = [];

        try {
            // Buscar usuarios
            const usersQuery = query(
                collection(db, 'users'), 
                where('fullName', '>=', term), 
                where('fullName', '<=', term + '\uf8ff')
            );
            const usersSnapshot = await getDocs(usersQuery);
            usersSnapshot.forEach(doc => {
                const userData = doc.data() as PendingUser;
                searchResults.push({
                    id: doc.id,
                    type: 'user',
                    title: userData.fullName || userData.displayName || 'Usuario sin nombre',
                    subtitle: userData.email,
                    section: 'users',
                    data: userData
                });
            });

            // Buscar reclamos
            const claimsQuery = query(
                collection(db, 'claims'), 
                where('name', '>=', term), 
                where('name', '<=', term + '\uf8ff')
            );
            const claimsSnapshot = await getDocs(claimsQuery);
            claimsSnapshot.forEach(doc => {
                const claimData = doc.data() as Claim;
                searchResults.push({
                    id: doc.id,
                    type: 'claim',
                    title: `${claimData.name || 'Sin nombre'} - ${claimData.phone || 'Sin teléfono'}`,
                    subtitle: claimData.address || 'Sin dirección',
                    section: 'claims',
                    data: claimData
                });
            });

            // Buscar técnicos
            const techniciansQuery = query(
                collection(db, 'technicians'), 
                where('name', '>=', term), 
                where('name', '<=', term + '\uf8ff')
            );
            const techniciansSnapshot = await getDocs(techniciansQuery);
            techniciansSnapshot.forEach(doc => {
                const techData = doc.data() as Technician;
                searchResults.push({
                    id: doc.id,
                    type: 'technician',
                    title: techData.name || 'Técnico sin nombre',
                    subtitle: `Teléfono: ${techData.phone}`,
                    section: 'dashboard',
                    data: techData
                });
            });

            setSearchResults(searchResults);
        } catch (error) {
            console.error('Error searching:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            handleSearch(searchTerm);
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [searchTerm, handleSearch]);

    const handleResultClick = (result: SearchResult) => {
        onResultClick(result);
        setActiveSectionProp(result.section);
        setSearchTerm('');
        setSearchResults([]);
        setIsSearchOpen(false);
    };

    const getResultIcon = (type: string) => {
        switch (type) {
            case 'user': return <Users className="w-5 h-5" />;
            case 'claim': return <FileText className="w-5 h-5" />;
            case 'technician': return <Wrench className="w-5 h-5" />;
            default: return null;
        }
    };

    return (
        <div className="relative w-full">
            {/* Desktop Search Bar */}
            <div className="hidden md:flex items-center relative w-full">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                <input
                    type="text"
                    className="w-full pl-10 pr-10 py-2 h-10 bg-background border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Buscar usuarios, reclamos, técnicos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    aria-label="Buscar usuarios, reclamos, técnicos"
                />
                {searchTerm && (
                    <button 
                        onClick={() => {
                            setSearchTerm('');
                            setSearchResults([]);
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 hover:bg-secondary rounded-full p-1"
                    >
                        <X size={16} />
                    </button>
                )}
            </div>

            {/* Mobile Search Button */}
            <div className="md:hidden flex justify-center">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsSearchOpen(!isSearchOpen)}
                    className="w-10 h-10 p-2"
                >
                    <SearchIcon className="w-5 h-5" />
                </Button>
            </div>

            {/* Mobile Search Modal */}
            {isSearchOpen && (
                <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 md:hidden">
                    <div className="fixed inset-x-0 top-0 p-4 bg-background shadow-lg">
                        <div className="relative">
                            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                            <input
                                type="text"
                                className="w-full pl-10 pr-10 py-2 h-10 bg-background border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="Buscar..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                autoFocus
                            />
                            <button 
                                onClick={() => setIsSearchOpen(false)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 hover:bg-secondary rounded-full p-1"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Search Results */}
            {isLoading && (
                <div className="absolute top-full left-0 right-0 mt-1 p-4 bg-background border rounded-md shadow-lg text-center text-muted-foreground z-50">
                    Buscando...
                </div>
            )}

            {!isLoading && searchResults.length > 0 && searchTerm && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-md shadow-lg max-h-[60vh] overflow-y-auto z-50">
                    {searchResults.map((result) => (
                        <button
                            key={`${result.type}-${result.id}`}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-secondary transition-colors"
                            onClick={() => handleResultClick(result)}
                        >
                            <span className="text-muted-foreground">
                                {getResultIcon(result.type)}
                            </span>
                            <div className="flex-1 text-left">
                                <div className="font-medium">{result.title}</div>
                                {result.subtitle && (
                                    <div className="text-sm text-muted-foreground">{result.subtitle}</div>
                                )}
                            </div>
                            <span className="text-sm text-muted-foreground">
                                {result.type === 'user' ? 'Usuario' :
                                 result.type === 'claim' ? 'Reclamo' : 'Técnico'}
                            </span>
                        </button>
                    ))}
                </div>
            )}

            {!isLoading && searchTerm && searchResults.length === 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 p-4 bg-background border rounded-md shadow-lg text-center text-muted-foreground z-50">
                    No se encontraron resultados para "{searchTerm}"
                </div>
            )}
        </div>
    );
};