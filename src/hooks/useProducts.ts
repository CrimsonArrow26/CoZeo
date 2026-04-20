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

// Statuses that should count against stock
// - 'pending' for COD orders (order placed, awaiting delivery)
// - 'confirmed', 'processing', 'shipped', 'delivered' for all order types
// Excludes: 'cancelled' and any order with payment_status = 'failed'
const STOCK_COUNTING_STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];

// Helper to calculate remaining stock for a list of products
// Only counts items from orders that are actually active (not cancelled/failed)
async function calculateStockForProducts(products: (Product & { id: string; stock?: number })[]): Promise<Product[]> {
  if (!products.length) return products;
  
  const productIds = products.map(p => p.id);

  // Join order_items with orders so we can filter by order status and payment_status
  const { data: orderItems, error } = await supabase
    .from('order_items')
    .select('product_id, quantity, orders!inner(status, payment_status)')
    .in('product_id', productIds)
    .in('orders.status', STOCK_COUNTING_STATUSES)
    .neq('orders.payment_status', 'failed');
  
  if (error) {
    // Silently handle order items fetch error
  }
  
  // Calculate ordered quantities per product (only from active orders)
  const orderedQuantities: Record<string, number> = {};
  if (orderItems) {
    orderItems.forEach((item: { product_id: string; quantity: number }) => {
      orderedQuantities[item.product_id] = (orderedQuantities[item.product_id] || 0) + (item.quantity || 0);
    });
  }
  
  // Calculate remaining stock for each product
  return products.map(product => {
    const totalStock = product.stock || 0;
    const ordered = orderedQuantities[product.id] || 0;
    const remainingStock = Math.max(0, totalStock - ordered);
    
    return {
      ...product,
      stock: remainingStock,
      total_stock: totalStock,
      ordered_quantity: ordered
    } as Product;
  });
}

// Helper to fetch products with calculated stock
async function fetchProductsWithStock(filters?: { category?: string; badge?: string }) {
  // Fetch products
  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false });
  
  if (productsError) throw productsError;
  if (!products) return [];
  
  // Calculate stock for all products
  const productsWithStock = await calculateStockForProducts(products);
  
  // Apply filters
  let filtered = productsWithStock;
  if (filters?.category) {
    filtered = filtered.filter((p: Product) => p.category === filters.category);
  }
  if (filters?.badge) {
    filtered = filtered.filter((p: Product) => p.badge === filters.badge);
  }
  
  return filtered;
}

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

// Fetch all products with calculated stock
export function useProducts(filters?: { category?: string; badge?: string; minPrice?: number; maxPrice?: number }) {
  return useQuery({
    queryKey: productKeys.list(filters || {}),
    queryFn: async () => {
      try {
        // Fetch products
        const { data: products, error: productsError } = await supabase
          .from('products')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false });
        
        if (productsError) throw productsError;
        if (!products) return [];
        
        // Calculate stock for all products
        const productsWithStock = await calculateStockForProducts(products);
        
        // Apply filters
        let filtered = productsWithStock;
        if (filters?.category) {
          filtered = filtered.filter((p: Product) => p.category === filters.category);
        }
        if (filters?.badge) {
          filtered = filtered.filter((p: Product) => p.badge === filters.badge);
        }
        if (filters?.minPrice !== undefined) {
          filtered = filtered.filter((p: Product) => (p.discount_price || p.price) >= filters.minPrice!);
        }
        if (filters?.maxPrice !== undefined) {
          filtered = filtered.filter((p: Product) => (p.discount_price || p.price) <= filters.maxPrice!);
        }
        
        return filtered as Product[];
      } catch (err) {
        throw err;
      }
    },
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}

// Fetch single product by slug with calculated stock
export function useProduct(slug: string) {
  return useQuery({
    queryKey: productKeys.detail(slug),
    queryFn: async () => {
      try {
        // Fetch the product
        const { data: product, error } = await supabase
          .from('products')
          .select('*')
          .eq('slug', slug)
          .single();
        
        if (error) throw error;
        if (!product) {
          throw new Error('Product not found');
        }
        
        // Fetch order items for this product from active orders only
        // (exclude cancelled orders and orders with failed payments)
        const { data: orderItems, error: orderError } = await supabase
          .from('order_items')
          .select('quantity, orders!inner(status, payment_status)')
          .eq('product_id', product.id)
          .in('orders.status', STOCK_COUNTING_STATUSES)
          .neq('orders.payment_status', 'failed');
        
        if (orderError) {
          // Silently handle order items fetch error
        }
        
        // Calculate ordered quantity from active orders only
        const orderedQuantity = orderItems?.reduce((sum: number, item: { quantity: number }) => sum + (item.quantity || 0), 0) || 0;
        const totalStock = product.stock || 0;
        const remainingStock = Math.max(0, totalStock - orderedQuantity);
        
        return {
          ...product,
          stock: remainingStock,
          total_stock: totalStock,
          ordered_quantity: orderedQuantity
        } as Product;
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

// Fetch featured products with calculated stock
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
      return calculateStockForProducts(data || []);
    },
  });
}

// Fetch spotlight product with calculated stock
export function useSpotlightProduct() {
  return useQuery({
    queryKey: productKeys.spotlight(),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_spotlight', true)
        .eq('is_active', true)
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      if (!data) return null;
      const productsWithStock = await calculateStockForProducts([data]);
      return productsWithStock[0] as Product | null;
    },
  });
}

// Fetch new drops (latest 3 products) with calculated stock
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
      return calculateStockForProducts(data || []);
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
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Product> }) => {
      // If setting this product as spotlight, clear spotlight from all others first
      if (updates.is_spotlight === true) {
        const { error: clearError } = await supabase
          .from('products')
          .update({ is_spotlight: false })
          .eq('is_spotlight', true);
        if (clearError) {
          // Silently handle clear error
        }
      }
      
      const { data, error } = await supabase.from('products').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data as Product;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
      queryClient.invalidateQueries({ queryKey: productKeys.detail(variables.id) });
    },
  });
}

// Admin: Delete product (soft delete - set is_active to false)
export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('products')
        .update({ is_active: false })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
    },
  });
}
