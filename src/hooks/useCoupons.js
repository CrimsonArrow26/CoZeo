import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../integrations/supabase/client';
import { toast } from 'sonner';

// Validate a coupon code
export function useValidateCoupon() {
  return useMutation({
    mutationFn: async (code) => {
      const { data: coupon, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', code)
        .eq('is_active', true)
        .single();

      if (error || !coupon) {
        return { valid: false, message: 'Invalid or expired coupon code' };
      }

      // Check if coupon has expired
      if (coupon.expiry && new Date(coupon.expiry) < new Date()) {
        return { valid: false, message: 'This coupon has expired' };
      }

      // Check overall usage limit
      if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
        return { valid: false, message: 'This coupon has reached its usage limit' };
      }

      // Check per-customer usage limit
      if (coupon.per_customer_limit) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { count } = await supabase
            .from('coupon_uses')
            .select('*', { count: 'exact', head: true })
            .eq('coupon_id', coupon.id)
            .eq('user_id', user.id);
          
          if (count >= coupon.per_customer_limit) {
            return { valid: false, message: 'You have already used this coupon the maximum number of times' };
          }
        }
      }

      return { valid: true, coupon };
    },
  });
}

// Get all coupons (admin only)
export function useCoupons() {
  return useQuery({
    queryKey: ['coupons'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });
}

// Create a new coupon (admin only)
export function useCreateCoupon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (couponData) => {
      const { data, error } = await supabase
        .from('coupons')
        .insert([couponData])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
      toast.success('Coupon created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create coupon: ' + error.message);
    },
  });
}

// Update a coupon (admin only)
export function useUpdateCoupon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }) => {
      const { data, error } = await supabase
        .from('coupons')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
      toast.success('Coupon updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update coupon: ' + error.message);
    },
  });
}

// Delete a coupon (admin only)
export function useDeleteCoupon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase
        .from('coupons')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
      toast.success('Coupon deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete coupon: ' + error.message);
    },
  });
}

// Record coupon usage after order is placed
export async function recordCouponUsage(couponId, userId, orderId) {
  if (!couponId || !userId) return;

  // Insert into coupon_uses for per-customer tracking
  const { error: useError } = await supabase
    .from('coupon_uses')
    .insert({
      coupon_id: couponId,
      user_id: userId,
      order_id: orderId || null,
    });

  if (useError) {
    console.error('Failed to record coupon use:', useError);
  }

  // Increment used_count on the coupon atomically
  const { error: countError } = await supabase.rpc('increment_coupon_used_count', {
    coupon_id: couponId,
  });

  if (countError) {
    // Fallback: use atomic SQL via raw fetch to avoid read-then-update race
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      await fetch(`${supabaseUrl}/rest/v1/rpc/increment_coupon_used_count`, {
        method: 'POST',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${session?.access_token || supabaseKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ coupon_id: couponId }),
      });
    } catch (fallbackError) {
      console.error('Failed to increment coupon used_count:', fallbackError);
    }
  }
}
