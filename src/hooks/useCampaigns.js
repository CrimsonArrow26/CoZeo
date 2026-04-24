import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../integrations/supabase/client';
import { toast } from 'sonner';

const campaignKeys = {
  all: ['campaigns'],
  lists: () => [...campaignKeys.all, 'list'],
  list: (filters) => [...campaignKeys.lists(), filters],
  details: () => [...campaignKeys.all, 'detail'],
  detail: (id) => [...campaignKeys.details(), id],
  active: () => [...campaignKeys.all, 'active'],
};

// Get all campaigns (admin only)
export function useCampaigns() {
  return useQuery({
    queryKey: campaignKeys.lists(),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('campaigns')
        .select(`
          *,
          campaign_products:campaign_products(
            *,
            product:products(*)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });
}

// Get active campaigns (public)
export function useActiveCampaigns() {
  return useQuery({
    queryKey: campaignKeys.active(),
    queryFn: async () => {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from('campaigns')
        .select(`
          *,
          campaign_products:campaign_products(
            *,
            product:products(*)
          )
        `)
        .eq('is_active', true)
        .lte('starts_at', now)
        .gte('ends_at', now)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });
}

// Get single campaign by slug
export function useCampaign(slug) {
  return useQuery({
    queryKey: campaignKeys.detail(slug),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('campaigns')
        .select(`
          *,
          campaign_products:campaign_products(
            *,
            product:products(*)
          )
        `)
        .eq('slug', slug)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });
}

// Create a new campaign (admin only)
export function useCreateCampaign() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ campaign, products }) => {
      // First create the campaign
      const { data: newCampaign, error: campaignError } = await supabase
        .from('campaigns')
        .insert([campaign])
        .select()
        .single();

      if (campaignError) throw campaignError;

      // Then create campaign products
      if (products && products.length > 0) {
        const campaignProducts = products.map((p, index) => ({
          campaign_id: newCampaign.id,
          product_id: p.product_id,
          min_quantity: p.min_quantity || 1,
          is_custom_design_slot: p.is_custom_design_slot || false,
          sort_order: index,
        }));

        const { error: productsError } = await supabase
          .from('campaign_products')
          .insert(campaignProducts);

        if (productsError) throw productsError;
      }

      return newCampaign;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: campaignKeys.all });
      toast.success('Campaign created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create campaign: ' + error.message);
    },
  });
}

// Update a campaign (admin only)
export function useUpdateCampaign() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, campaign, products }) => {
      // Update campaign
      const { data: updatedCampaign, error: campaignError } = await supabase
        .from('campaigns')
        .update(campaign)
        .eq('id', id)
        .select()
        .single();

      if (campaignError) throw campaignError;

      // If products are provided, update them
      if (products) {
        // Delete existing campaign products
        const { error: deleteError } = await supabase
          .from('campaign_products')
          .delete()
          .eq('campaign_id', id);

        if (deleteError) throw deleteError;

        // Insert new campaign products
        if (products.length > 0) {
          const campaignProducts = products.map((p, index) => ({
            campaign_id: id,
            product_id: p.product_id,
            min_quantity: p.min_quantity || 1,
            is_custom_design_slot: p.is_custom_design_slot || false,
            sort_order: index,
          }));

          const { error: productsError } = await supabase
            .from('campaign_products')
            .insert(campaignProducts);

          if (productsError) throw productsError;
        }
      }

      return updatedCampaign;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: campaignKeys.all });
      queryClient.invalidateQueries({ queryKey: campaignKeys.detail(variables.id) });
      toast.success('Campaign updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update campaign: ' + error.message);
    },
  });
}

// Delete a campaign (admin only)
export function useDeleteCampaign() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      // Campaign products will be deleted automatically via CASCADE
      const { error } = await supabase
        .from('campaigns')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: campaignKeys.all });
      toast.success('Campaign deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete campaign: ' + error.message);
    },
  });
}

// Validate if cart items match a campaign
export function useValidateCampaign() {
  return useMutation({
    mutationFn: async ({ cartItems, campaignId }) => {
      // Get campaign details
      const { data: campaign, error } = await supabase
        .from('campaigns')
        .select(`
          *,
          campaign_products:campaign_products(*)
        `)
        .eq('id', campaignId)
        .single();

      if (error || !campaign) {
        return { valid: false, message: 'Campaign not found' };
      }

      // Check if campaign is active
      if (!campaign.is_active) {
        return { valid: false, message: 'Campaign is not active' };
      }

      // Check dates
      const now = new Date();
      if (new Date(campaign.starts_at) > now) {
        return { valid: false, message: 'Campaign has not started yet' };
      }
      if (new Date(campaign.ends_at) < now) {
        return { valid: false, message: 'Campaign has ended' };
      }

      // Check usage limit
      if (campaign.max_uses && campaign.current_uses >= campaign.max_uses) {
        return { valid: false, message: 'Campaign usage limit reached' };
      }

      // Validate cart items match campaign requirements
      const campaignProducts = campaign.campaign_products || [];
      const requiredProducts = campaignProducts.filter(p => !p.is_custom_design_slot);
      const customDesignSlot = campaignProducts.find(p => p.is_custom_design_slot);

      // Check if all required products are in cart with minimum quantities
      for (const reqProduct of requiredProducts) {
        const cartItem = cartItems.find(item => item.id === reqProduct.product_id);
        if (!cartItem || cartItem.qty < reqProduct.min_quantity) {
          return { 
            valid: false, 
            message: `Required product missing or below minimum quantity` 
          };
        }
      }

      // Check custom design if required
      if (customDesignSlot && campaign.requires_custom_design) {
        const hasCustomDesign = cartItems.some(item => 
          item.custom_design && item.custom_design.image_url
        );
        if (!hasCustomDesign) {
          return { valid: false, message: 'Custom design is required for this campaign' };
        }
      }

      return { valid: true, campaign };
    },
  });
}

// Upload custom design
export function useUploadCustomDesign() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ file, campaignId, userId }) => {
      // Upload file to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${campaignId}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('custom-designs')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('custom-designs')
        .getPublicUrl(fileName);

      return { url: publicUrl, path: fileName };
    },
    onError: (error) => {
      toast.error('Failed to upload design: ' + error.message);
    },
  });
}

// Save custom design record
export function useSaveCustomDesign() {
  return useMutation({
    mutationFn: async (designData) => {
      const { data, error } = await supabase
        .from('custom_designs')
        .insert([designData])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Custom design saved');
    },
    onError: (error) => {
      toast.error('Failed to save design: ' + error.message);
    },
  });
}
