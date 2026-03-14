import { useMutation, useQuery } from '@tanstack/react-query';
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
      if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
        return { valid: false, message: 'This coupon has expired' };
      }

      // Check usage limit
      if (coupon.max_uses && coupon.current_uses >= coupon.max_uses) {
        return { valid: false, message: 'This coupon has reached its usage limit' };
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
      toast.success('Coupon created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create coupon: ' + error.message);
    },
  });
}

// Update a coupon (admin only)
export function useUpdateCoupon() {
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
      toast.success('Coupon updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update coupon: ' + error.message);
    },
  });
}

// Delete a coupon (admin only)
export function useDeleteCoupon() {
  return useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase
        .from('coupons')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Coupon deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete coupon: ' + error.message);
    },
  });
}
