import React, { createContext, useContext, useState, useCallback } from 'react';
import type { PhoneAdvice, DiscoveryResult, DiscoveredVariant } from '@ui/types';
import type { ProductCategory } from '@ui/constants';
import { getDefaultBrands, getRamOptions, getStorageOptions } from '@ui/constants';

const RECENT_KEY = 'shopsense-recent-searches';
const MAX_RECENT = 25;

export type RecentSearch = {
  id: string;
  label: string;
  brand: string;
  model: string;
  ram: string;
  storage: string;
  category?: ProductCategory;
  at: number;
};

export type ProductDraft = {
  category: ProductCategory;
  brand: string;
  model: string;
  ram: string;
  storage: string;
  directUrl: string;
};

function createDefaultDraft(category: ProductCategory = 'phone'): ProductDraft {
  return {
    category,
    brand: getDefaultBrands(category)[0],
    model: '',
    ram: getRamOptions(category)[0] || 'Unknown',
    storage: getStorageOptions(category)[0] || 'Unknown',
    directUrl: '',
  };
}

function loadRecent(): RecentSearch[] {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as RecentSearch[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

interface SearchContextType {
  phoneAdvice: PhoneAdvice | null;
  setPhoneAdvice: (data: PhoneAdvice | null) => void;
  draft: ProductDraft;
  updateDraft: (patch: Partial<ProductDraft>) => void;
  resetDraft: (category?: ProductCategory) => void;
  discovery: DiscoveryResult | null;
  setDiscovery: (data: DiscoveryResult | null) => void;
  selectedVariant: DiscoveredVariant | null;
  setSelectedVariant: (data: DiscoveredVariant | null) => void;
  recentSearches: RecentSearch[];
  addRecentSearch: (entry: Omit<RecentSearch, 'id' | 'at'> & { id?: string; at?: number }) => void;
  clearRecentSearches: () => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export function SearchProvider({ children }: { children: React.ReactNode }) {
  const [phoneAdvice, setPhoneAdvice] = useState<PhoneAdvice | null>(null);
  const [draft, setDraft] = useState<ProductDraft>(() => createDefaultDraft());
  const [discovery, setDiscovery] = useState<DiscoveryResult | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<DiscoveredVariant | null>(null);
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>(() =>
    typeof localStorage === 'undefined' ? [] : loadRecent(),
  );

  const updateDraft = useCallback((patch: Partial<ProductDraft>) => {
    setDraft((prev) => ({ ...prev, ...patch }));
  }, []);

  const resetDraft = useCallback((category: ProductCategory = 'phone') => {
    setDraft(createDefaultDraft(category));
    setDiscovery(null);
    setSelectedVariant(null);
    setPhoneAdvice(null);
  }, []);

  const addRecentSearch = useCallback(
    (entry: Omit<RecentSearch, 'id' | 'at'> & { id?: string; at?: number }) => {
      const row: RecentSearch = {
        id: entry.id ?? `${Date.now()}-${entry.brand}-${entry.model}`,
        label: entry.label,
        brand: entry.brand,
        model: entry.model,
        ram: entry.ram,
        storage: entry.storage,
        category: entry.category,
        at: entry.at ?? Date.now(),
      };
      setRecentSearches((prev) => {
        const withoutDup = prev.filter(
          (p) =>
            !(
              p.brand === row.brand &&
              p.model === row.model &&
              p.ram === row.ram &&
              p.storage === row.storage &&
              (p.category || 'phone') === (row.category || 'phone')
            ),
        );
        const next = [row, ...withoutDup].slice(0, MAX_RECENT);
        try {
          localStorage.setItem(RECENT_KEY, JSON.stringify(next));
        } catch {
          /* ignore */
        }
        return next;
      });
    },
    [],
  );

  const clearRecentSearches = useCallback(() => {
    setRecentSearches([]);
    try {
      localStorage.removeItem(RECENT_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  return (
    <SearchContext.Provider
      value={{
        phoneAdvice,
        setPhoneAdvice,
        draft,
        updateDraft,
        resetDraft,
        discovery,
        setDiscovery,
        selectedVariant,
        setSelectedVariant,
        recentSearches,
        addRecentSearch,
        clearRecentSearches,
      }}
    >
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
