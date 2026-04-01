import React, { createContext, useContext, useState } from 'react';

interface SearchContextType {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    productData: any;
    setProductData: (data: any) => void;
    isLoading: boolean;
    setIsLoading: (loading: boolean) => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export function SearchProvider({ children }: { children: React.ReactNode }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [productData, setProductData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);

    return (
        <SearchContext.Provider value={{ searchQuery, setSearchQuery, productData, setProductData, isLoading, setIsLoading }}>
            {children}
        </SearchContext.Provider>
    );
}

export function useSearch() {
    const context = useContext(SearchContext);
    if (context === undefined) {
        throw new Error('useSearch must be used within a SearchProvider');
    }
    return context;
}
