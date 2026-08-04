import { useMemo } from 'react';
import { ngos, type NGO } from '@/data/ngoData';

export function useNGOs() {
  return {
    ngos,
    isLoading: false,
    error: null,
  };
}

export function useFilteredNGOs(selectedRegion: string) {
  const { ngos, isLoading, error } = useNGOs();
  
  const filteredNGOs = useMemo(() => {
    if (selectedRegion === 'all') {
      return ngos;
    }
    return ngos.filter((ngo: NGO) => 
      ngo.region === selectedRegion || ngo.region === 'All Regions'
    );
  }, [ngos, selectedRegion]);
  
  return {
    ngos: filteredNGOs,
    isLoading,
    error,
  };
}

export function useNGO(id: string | undefined) {
  const ngo = useMemo(() => {
    if (!id) return null;
    return ngos.find((n) => n.id === id);
  }, [id]);
  
  return {
    ngo,
    isLoading: false,
    error: ngo ? null : new Error('NGO not found'),
  };
}
