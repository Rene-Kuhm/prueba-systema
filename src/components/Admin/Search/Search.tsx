import React, { useState, useCallback } from 'react';
import { Search as SearchIcon, X, Users, FileText, Wrench } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface SearchResult {
    id: string;
    type: 'user' | 'claim' | 'technician';
    title: string;
    subtitle?: string;
    section: 'users' | 'claims' | 'dashboard';
    data: any;
}

interface AdminSearchProps {
    pendingUsers?: any[];
    claims?: any[];
    technicians?: any[];
    onResultClick: (result: SearchResult) => void;
    setActiveSection: (section: string) => void;
}

export const AdminSearch: React.FC<AdminSearchProps> = ({
    pendingUsers = [],
    claims = [],
    technicians = [],
    onResultClick,
    setActiveSection
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    const handleSearch = useCallback((term: string) => {
        if (!term || term.length < 2) {
            setResults([]);
            return;
        }

        setIsSearching(true);
        const searchTerm = term.toLowerCase().trim();
        const searchResults: SearchResult[] = [];

        // Buscar en usuarios pendientes
        pendingUsers?.forEach(user => {
            if (!user) return;
            const matchesEmail = user.email?.toLowerCase()?.includes(searchTerm);
            const matchesName = user.displayName?.toLowerCase()?.includes(searchTerm);

            if (matchesEmail || matchesName) {
                searchResults.push({
                    id: user.id || String(Math.random()),
                    type: 'user',
                    title: user.displayName || 'Usuario sin nombre',
                    subtitle: user.email || '',
                    section: 'users',
                    data: user
                });
            }
        });

        // Buscar en reclamos
        claims?.forEach(claim => {
            if (!claim) return;
            const matchesName = claim.name?.toLowerCase()?.includes(searchTerm);
            const matchesPhone = claim.phone?.toLowerCase()?.includes(searchTerm);
            const matchesAddress = claim.address?.toLowerCase()?.includes(searchTerm);
            const matchesReason = claim.reason?.toLowerCase()?.includes(searchTerm);

            if (matchesName || matchesPhone || matchesAddress || matchesReason) {
                searchResults.push({
                    id: claim.id || String(Math.random()),
                    type: 'claim',
                    title: `${claim.name || 'Sin nombre'} - ${claim.phone || 'Sin teléfono'}`,
                    subtitle: claim.address || 'Sin dirección',
                    section: 'claims',
                    data: claim
                });
            }
        });

        // Buscar en técnicos
        technicians?.forEach(tech => {
            if (!tech) return;
            if (tech.name?.toLowerCase()?.includes(searchTerm)) {
                searchResults.push({
                    id: tech.id || String(Math.random()),
                    type: 'technician',
                    title: tech.name || 'Técnico sin nombre',
                    subtitle: `Técnico ID: ${tech.id || ''}`,
                    section: 'dashboard',
                    data: tech
                });
            }
        });

        setResults(searchResults);
        setIsSearching(false);
    }, [pendingUsers, claims, technicians]);

    const handleResultClick = (result: SearchResult) => {
        setActiveSection(result.section);
        onResultClick(result);
        setSearchTerm('');
        setResults([]);
        setIsSearchOpen(false);
    };

    const getResultIcon = (type: string) => {
        switch (type) {
            case 'user':
                return <Users className="w-5 h-5" />;
            case 'claim':
                return <FileText className="w-5 h-5" />;
            case 'technician':
                return <Wrench className="w-5 h-5" />;
            default:
                return null;
        }
    };

    return (
        <div className="relative">
            {/* Desktop Search Bar */}
            <div className="hidden md:flex items-center relative w-full max-w-2xl">
                <SearchIcon className="absolute left-3 w-5 h-5 text-muted-foreground pointer-events-none" />
                <input
                    type="text"
                    className="w-full pl-10 pr-10 py-2 h-10 bg-slate-700 border border-slate-500 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Buscar usuarios, reclamos, técnicos..."
                    value={searchTerm}
                    onChange={(e) => {
                        const value = e.target.value;
                        setSearchTerm(value);
                        handleSearch(value);
                    }}
                />
                {searchTerm && (
                    <button 
                        onClick={() => {
                            setSearchTerm('');
                            setResults([]);
                        }}
                        className="absolute right-3 hover:bg-secondary rounded-full p-1"
                    >
                        <X size={16} />
                    </button>
                )}
            </div>

            {/* Mobile Search Button and Expandable Search */}
            <div className="md:hidden">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsSearchOpen(!isSearchOpen)}
                    className="relative left-16"
                >
                    <SearchIcon className="w-5 h-5" />
                </Button>

                {isSearchOpen && (
                    <div className="absolute top-full right-0 mt-2 w-screen max-w-sm bg-background border rounded-md shadow-lg p-4 z-50 ">
                        <div className="relative">
                            <SearchIcon className="absolute left-3 w-5 h-5 text-muted-foreground pointer-events-none" />
                            <input
                                type="text"
                                className="w-full pl-10 pr-10 py-2 h-10 bg-background border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="Buscar..."
                                value={searchTerm}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setSearchTerm(value);
                                    handleSearch(value);
                                }}
                                autoFocus
                            />
                            {searchTerm && (
                                <button 
                                    onClick={() => {
                                        setSearchTerm('');
                                        setResults([]);
                                    }}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 hover:bg-secondary rounded-full p-1"
                                >
                                    <X size={16} />
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Search Results */}
            {results.length > 0 && !isSearching && searchTerm && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-md shadow-lg max-h-[60vh] overflow-y-auto z-50">
                    {results.map((result) => (
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

            {searchTerm && results.length === 0 && !isSearching && (
                <div className="absolute top-full left-0 right-0 mt-1 p-4 bg-background border rounded-md shadow-lg text-center text-muted-foreground">
                    No se encontraron resultados para "{searchTerm}"
                </div>
            )}
        </div>
    );
};

export default AdminSearch;