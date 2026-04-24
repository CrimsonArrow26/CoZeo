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

export const orderKeys = {
  all: ['orders'] as const,
  lists: () => [...orderKeys.all, 'list'] as const,
  list: (filters: object) => [...orderKeys.lists(), filters] as const,
  details: () => [...orderKeys.all, 'detail'] as const,
  detail: (id: string) => [...orderKeys.details(), id] as const,
  tracking: (id: string) => [...orderKeys.all, 'tracking', id] as const,
};

// Extended Order with items
export interface OrderWithItems extends Order {
  items: OrderItem[];
}

// Fetch user's orders with their items
export function useOrders() {
  return useQuery({
    queryKey: orderKeys.lists(),
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      
      // Fetch orders — exclude ghost orders (payment failed AND order cancelled)
      // These are abandoned Cashfree payment attempts that should not show in history
      const { data: ordersRaw, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .not('payment_status', 'eq', 'failed')  // hide payment-failed orders
        .order('created_at', { ascending: false });
      
      if (ordersError) throw ordersError;
      const orders = (ordersRaw || []) as Order[];
      
      // Fetch order items for all orders
      if (orders.length > 0) {
        const orderIds = orders.map(o => o.id);
        const { data: items, error: itemsError } = await supabase
          .from('order_items')
          .select('*')
          .in('order_id', orderIds);
        
        if (itemsError) {
          // Silently handle items fetch error
        }
        
        // Group items by order
        const itemsByOrder = (items || []).reduce((acc, item) => {
          if (!acc[item.order_id]) acc[item.order_id] = [];
          acc[item.order_id].push(item);
          return acc;
        }, {} as Record<string, OrderItem[]>);
        
        // Add items to each order
        return orders.map(order => ({
          ...order,
          items: itemsByOrder[order.id] || []
        })) as OrderWithItems[];
      }
      
      return orders as OrderWithItems[];
    },
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
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
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
}

// Fetch order items
export function useOrderItems(orderId: string) {
  return useQuery({
    queryKey: ['orderItems', orderId],
    queryFn: async () => {
      const data = await supabaseFetch('order_items', {
        select: '*, custom_design_id, custom_notes',
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
      // Generate display_id using Supabase function
      const { data: displayIdData, error: displayIdError } = await supabase
        .rpc('generate_order_display_id');
      
      if (displayIdError) {
        // Fallback: generate locally
        const timestamp = Date.now();
        order.display_id = `CO${timestamp.toString().slice(-6)}`;
      } else {
        order.display_id = displayIdData;
      }

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
        custom_notes: item.custom_notes || null,
      }));
      console.log('Creating order items:', orderItems.map(i => ({ name: i.product_name, custom_notes: i.custom_notes })));
      const { data: createdItems, error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems)
        .select();
      if (itemsError) {
        console.error('Order items insert error:', itemsError);
        throw itemsError;
      }

      // Handle custom designs - create custom_designs rows and link them
      const customDesignItems = items.filter(item => item.is_custom_design && (item.custom_design_front || item.custom_design_back));
      if (customDesignItems.length > 0 && createdItems) {
        for (const item of customDesignItems) {
          const createdItem = createdItems.find((ci: { product_id: string; size: string; }) => ci.product_id === item.product_id && ci.size === item.size);
          if (createdItem && item.custom_design_front) {
            // Create custom_design row
            const { data: customDesign, error: customDesignError } = await supabase
              .from('custom_designs')
              .insert({
                order_item_id: createdItem.id,
                cart_item_id: null,
                campaign_id: null,
                user_id: order.user_id,
                image_url: item.custom_design_front,
                preview_url: item.custom_design_back || null,
                status: 'pending',
                admin_notes: null,
              })
              .select()
              .single();
            
            if (customDesignError) {
              console.error('Failed to create custom_design:', customDesignError);
            } else if (customDesign) {
              // Update order_item with custom_design_id
              const { error: updateError } = await supabase
                .from('order_items')
                .update({ custom_design_id: customDesign.id })
                .eq('id', createdItem.id);
              
              if (updateError) {
                console.error('Failed to update order_item with custom_design_id:', updateError);
              }
            }
          }
        }
      }

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

// Update payment status (admin)
export function useUpdatePaymentStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      paymentStatus,
    }: {
      id: string;
      paymentStatus: 'pending' | 'paid' | 'failed';
    }) => {
      const { data, error } = await supabase
        .from('orders')
        .update({ payment_status: paymentStatus })
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

// Delete order (admin)
export function useDeleteOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      // First delete order items (due to foreign key constraint)
      const { data: itemsData, error: itemsError } = await supabase
        .from('order_items')
        .delete()
        .eq('order_id', id)
        .select('*');
      if (itemsError) {
        throw itemsError;
      }

      // Then delete the order
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .delete()
        .eq('id', id)
        .select('*');
      if (orderError) {
        throw orderError;
      }

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
    },
    onError: (error) => {
      console.error('Failed to delete order:', error);
    }
  });
}
