import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../integrations/supabase/client';
import type { Product, ProductSize, ProductColor } from '../types';

// Supabase credentials for direct fetch
const SUPABASE_URL = 'https://rbjivulozgubrenzwcjx.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJiaml2dWxvemd1YnJlbnp3Y2p4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzNjM2MzYsImV4cCI6MjA4ODkzOTYzNn0.5-CPtlAuIUxzBgLLVl0AOKepGOfVmunGwMy3e9lWsRw';

// Helper for direct Supabase fetch
async function supabaseFetch(table: string, options?: { 
  select?: string; 
  filters?: Record<string, string>; 
  order?: { column: string; ascending: boolean };
  limit?: number;
  single?: boolean;
}) {
  let url = `${SUPABASE_URL}/rest/v1/${table}`;
  const params = new URLSearchParams();
  
  if (options?.select) {
    params.append('select', options.select);
  }
  if (options?.limit) {
    params.append('limit', options.limit.toString());
  }
  if (options?.order) {
    params.append('order', `${options.order.column}.${options.order.ascending ? 'asc' : 'desc'}`);
  }
  if (options?.single) {
    params.append('limit', '1');
  }
  
  // Add filters to URL path for eq filters
  if (options?.filters) {
    Object.entries(options.filters).forEach(([key, value]) => {
      params.append(key, `eq.${value}`);
    });
  }
  
  if (params.toString()) {
    url += '?' + params.toString();
  }
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  const data = await response.json();
  return options?.single ? data[0] : data;
}

// Query keys
export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (filters: object) => [...productKeys.lists(), filters] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (slug: string) => [...productKeys.details(), slug] as const,
  featured: () => [...productKeys.all, 'featured'] as const,
  spotlight: () => [...productKeys.all, 'spotlight'] as const,
  newDrops: () => [...productKeys.all, 'newDrops'] as const,
};

// Fetch all products
export function useProducts(filters?: { category?: string; badge?: string; minPrice?: number; maxPrice?: number }) {
  return useQuery({
    queryKey: productKeys.list(filters || {}),
    queryFn: async () => {
      console.log('Fetching products with filters:', filters);
      try {
        const filtersObj: Record<string, string> = {};
        if (filters?.category) {
          filtersObj.category = filters.category;
        }
        if (filters?.badge) {
          filtersObj.badge = filters.badge;
        }
        
        const data = await supabaseFetch('products', {
          select: '*,id',
          filters: Object.keys(filtersObj).length > 0 ? filtersObj : undefined,
          order: { column: 'created_at', ascending: false }
        });
        
        console.log('Products fetch result:', { count: data?.length });
        return data as Product[];
      } catch (err) {
        console.error('Products fetch failed:', err);
        throw err;
      }
    },
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}

// Fetch single product by slug
export function useProduct(slug: string) {
  return useQuery({
    queryKey: productKeys.detail(slug),
    queryFn: async () => {
      try {
        const data = await supabaseFetch('products', {
          select: '*,id',
          filters: { slug },
          single: true
        });
        if (!data) {
          throw new Error('Product not found');
        }
        return data as Product;
      } catch (err) {
        throw err;
      }
    },
    enabled: !!slug,
    retry: 1,
    staleTime: 1000 * 60 * 5,
    refetchOnMount: 'always',
    refetchOnWindowFocus: false,
  });
}

// Fetch featured products
export function useFeaturedProducts() {
  return useQuery({
    queryKey: productKeys.featured(),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_featured', true)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(6);
      if (error) throw error;
      return data as Product[];
    },
  });
}

// Fetch spotlight product
export function useSpotlightProduct() {
  return useQuery({
    queryKey: productKeys.spotlight(),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_spotlight', true)
        .eq('is_active', true)
        .single();
      if (error) throw error;
      return data as Product;
    },
  });
}

// Fetch new drops (latest 3 products)
export function useNewDrops() {
  return useQuery({
    queryKey: productKeys.newDrops(),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(3);
      if (error) throw error;
      return data as Product[];
    },
  });
}

// Admin: Create product
export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (product: Partial<Product>) => {
      const { data, error } = await supabase.from('products').insert(product).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
    },
  });
}

// Admin: Update product
export function useUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<Product>) => {
      const { data, error } = await supabase.from('products').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
      queryClient.invalidateQueries({ queryKey: productKeys.detail(variables.id) });
    },
  });
}

// Admin: Delete product
export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
    },
  });
}
