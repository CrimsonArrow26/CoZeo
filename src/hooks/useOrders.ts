import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../integrations/supabase/client';
import type { Order, OrderItem, OrderStatus } from '../types';

// Supabase credentials for direct fetch
const SUPABASE_URL = 'https://rbjivulozgubrenzwcjx.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJiaml2dWxvemd1YnJlbnp3Y2p4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzNjM2MzYsImV4cCI6MjA4ODkzOTYzNn0.5-CPtlAuIUxzBgLLVl0AOKepGOfVmunGwMy3e9lWsRw';

// Helper for direct Supabase fetch with authenticated user token
async function supabaseFetch(table: string, options?: { 
  select?: string; 
  filters?: Record<string, string>; 
  order?: { column: string; ascending?: boolean };
  limit?: number;
  single?: boolean;
}) {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token || SUPABASE_ANON_KEY;
  
  let url = `${SUPABASE_URL}/rest/v1/${table}`;
  const params = new URLSearchParams();
  
  if (options?.select) {
    params.append('select', options.select);
  }
  if (options?.limit) {
    params.append('limit', options.limit.toString());
  }
  if (options?.order) {
    const direction = options.order.ascending === false ? 'desc' : 'asc';
    params.append('order', `${options.order.column}.${direction}`);
  }
  if (options?.single) {
    params.append('limit', '1');
  }
  
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
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  const data = await response.json();
  return options?.single ? data[0] : data;
}

const orderKeys = {
  all: ['orders'] as const,
  lists: () => [...orderKeys.all, 'list'] as const,
  list: (filters: object) => [...orderKeys.lists(), filters] as const,
  details: () => [...orderKeys.all, 'detail'] as const,
  detail: (id: string) => [...orderKeys.details(), id] as const,
  tracking: (id: string) => [...orderKeys.all, 'tracking', id] as const,
};

// Fetch user's orders
export function useOrders() {
  return useQuery({
    queryKey: orderKeys.lists(),
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      
      const data = await supabaseFetch('orders', {
        select: '*',
        filters: { user_id: user.id },
        order: { column: 'created_at', ascending: false }
      });
      return data as Order[];
    },
  });
}

// Fetch single order
export function useOrder(id: string) {
  return useQuery({
    queryKey: orderKeys.detail(id),
    queryFn: async () => {
      const data = await supabaseFetch('orders', {
        select: '*',
        filters: { id },
        single: true
      });
      if (!data) throw new Error('Order not found');
      return data as Order;
    },
    enabled: !!id,
  });
}

// Fetch order items
export function useOrderItems(orderId: string) {
  return useQuery({
    queryKey: ['orderItems', orderId],
    queryFn: async () => {
      const data = await supabaseFetch('order_items', {
        select: '*',
        filters: { order_id: orderId }
      });
      return data as OrderItem[];
    },
    enabled: !!orderId,
  });
}

// Create order
export function useCreateOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      order,
      items,
    }: {
      order: Partial<Order>;
      items: Partial<OrderItem>[];
    }) => {
      // Create order
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert(order)
        .select()
        .single();
      if (orderError) throw orderError;

      // Create order items
      const orderItems = items.map((item) => ({
        ...item,
        order_id: orderData.id,
      }));
      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);
      if (itemsError) throw itemsError;

      return orderData as Order;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
    },
  });
}

// Update order status (admin)
export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      status,
      note,
    }: {
      id: string;
      status: OrderStatus;
      note?: string;
    }) => {
      // Get current order to append to history
      const { data: currentOrder } = await supabase
        .from('orders')
        .select('status_history')
        .eq('id', id)
        .single();

      const newEntry = {
        status,
        timestamp: new Date().toISOString(),
        note: note || null,
        updated_by: (await supabase.auth.getUser()).data.user?.id || null,
      };

      const statusHistory = [
        ...(currentOrder?.status_history || []),
        newEntry,
      ];

      const { data, error } = await supabase
        .from('orders')
        .update({ status, status_history: statusHistory })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(variables.id) });
    },
  });
}
