import { useMemo } from 'react';
import { useActiveCampaigns } from './useCampaigns';

export function useCartCampaign(cartItems) {
  const { data: campaigns, isLoading } = useActiveCampaigns();

  const applicableCampaign = useMemo(() => {
    if (!campaigns || campaigns.length === 0 || !cartItems || cartItems.length === 0) {
      return null;
    }

    // Find a campaign where all required products are in the cart
    for (const campaign of campaigns) {
      const campaignProducts = campaign.campaign_products || [];
      const regularProducts = campaignProducts.filter(cp => !cp.is_custom_design_slot);
      const customDesignSlots = campaignProducts.filter(cp => cp.is_custom_design_slot);

      // Check if all required products are in cart with minimum quantities
      const allRequiredPresent = regularProducts.every(cp => {
        const cartItem = cartItems.find(item => item.id === cp.product_id);
        return cartItem && cartItem.qty >= cp.min_quantity;
      });

      if (!allRequiredPresent) continue;

      // Check if custom design is required and present
      if (customDesignSlots.length > 0) {
        const hasCustomDesign = cartItems.some(item => item.custom_design?.image_url);
        if (!hasCustomDesign) continue;
      }

      // Calculate if this campaign provides better value than current setup
      const relevantCartItems = cartItems.filter(item => 
        regularProducts.some(cp => cp.product_id === item.id)
      );

      const regularTotal = relevantCartItems.reduce((sum, item) => {
        const cp = regularProducts.find(p => p.product_id === item.id);
        const qty = Math.max(item.qty, cp?.min_quantity || 1);
        return sum + (item.price * qty);
      }, 0);

      const campaignDiscount = regularTotal - campaign.combo_price;

      return {
        ...campaign,
        applicable: true,
        regularTotal,
        campaignDiscount: Math.max(0, campaignDiscount),
        finalPrice: campaign.combo_price,
        relevantItems: relevantCartItems.map(item => item.id),
      };
    }

    return null;
  }, [campaigns, cartItems]);

  const campaignSavings = applicableCampaign?.campaignDiscount || 0;
  const campaignTotal = applicableCampaign 
    ? (applicableCampaign.combo_price + cartItems
        .filter(item => !applicableCampaign.relevantItems.includes(item.id))
        .reduce((sum, item) => sum + (item.price * item.qty), 0))
    : null;

  return {
    campaign: applicableCampaign,
    isLoading,
    campaignSavings,
    campaignTotal,
  };
}
