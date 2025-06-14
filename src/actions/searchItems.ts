import { useState } from 'react';
import { apiRequest } from '@/lib/queryClient';

/**
 * Frontend action for: Search
 * Category: Search Operations
 */
export interface SearchItemsParams {
  searchTerm: string;
}

export interface SearchItemsResponse {
  success: boolean;
  message: string;
  data?: {
    items: any[];
    totalCount: number;
    searchTerm: string;
  };
}

export async function searchItems(params: SearchItemsParams): Promise<SearchItemsResponse> {
  try {
    // Standard REST API call
    const response = await apiRequest('POST', '/api/searchItems', params);
    return response;
  } catch (error) {
    console.error('searchItems failed:', error);
    throw new Error(`Search failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// React hook for this action
export function useSearchItems() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const execute = async (params: SearchItemsParams) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await searchItems(params);
      
      // Handle success UI
      // Success handling
      
      return result;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Operation failed';
      setError(errorMsg);
      
      // Handle error UI
      // Error handling
      
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  return { execute, loading, error };
}