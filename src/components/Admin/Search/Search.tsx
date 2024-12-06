import React, { useState, useCallback } from 'react';
import { Search as SearchIcon, X, Users, FileText, Wrench } from 'lucide-react';
import '@/components/Admin/Search/Search.css';


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

    const handleSearch = useCallback((term: string) => {
        if (!term || term.length < 2) {
            setResults([]);
            return;
        }

        setIsSearching(true);
        const searchTerm = term.toLowerCase().trim();
        const searchResults: SearchResult[] = [];

        // Buscar en usuarios pendientes
        if (Array.isArray(pendingUsers)) {
            pendingUsers.forEach(user => {
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
        }

        // Buscar en reclamos
        if (Array.isArray(claims)) {
            claims.forEach(claim => {
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
        }

        // Buscar en técnicos
        if (Array.isArray(technicians)) {
            technicians.forEach(tech => {
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
        }

        console.log('Resultados de búsqueda:', searchResults);
        setResults(searchResults);
        setIsSearching(false);
    }, [pendingUsers, claims, technicians]);

    const handleResultClick = (result: SearchResult) => {
        setActiveSection(result.section);
        onResultClick(result);
        setSearchTerm('');
        setResults([]);
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
        <div className="admin-search-container">
            <div className="search-input-wrapper">
                <SearchIcon className="search-icon" />
                <input
                    type="text"
                    className="search-input"
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
                        className="clear-search"
                    >
                        <X size={16} />
                    </button>
                )}
            </div>

            {results.length > 0 && !isSearching && (
                <div className="search-results">
                    {results.map((result) => (
                        <button
                            key={`${result.type}-${result.id}`}
                            className="search-result-item"
                            onClick={() => handleResultClick(result)}
                        >
                            <span className="result-icon">
                                {getResultIcon(result.type)}
                            </span>
                            <div className="result-content">
                                <span className="result-title">{result.title}</span>
                                {result.subtitle && (
                                    <span className="result-subtitle">{result.subtitle}</span>
                                )}
                            </div>
                            <span className="result-type">
                                {result.type === 'user' ? 'Usuario' :
                                 result.type === 'claim' ? 'Reclamo' : 'Técnico'}
                            </span>
                        </button>
                    ))}
                </div>
            )}

            {searchTerm && results.length === 0 && !isSearching && (
                <div className="search-no-results">
                    No se encontraron resultados para "{searchTerm}"
                </div>
            )}
        </div>
    );
};

export default AdminSearch;