import { useActiveCampaigns } from "./useCampaigns";

export function useCartCampaign(cartItems) {
  const { data: campaigns, isLoading } = useActiveCampaigns();

  const applicableCampaign = (() => {
    if (
      !campaigns ||
      campaigns.length === 0 ||
      !cartItems ||
      cartItems.length === 0
    ) {
      return null;
    }

    // Find a campaign where all required products are in the cart
    for (const campaign of campaigns) {
      const campaignProducts = campaign.campaign_products || [];
      const regularProducts = campaignProducts.filter(
        (cp) => !cp.is_custom_design_slot,
      );
      const customDesignSlots = campaignProducts.filter(
        (cp) => cp.is_custom_design_slot,
      );

      // Check if all required products are in cart with minimum quantities
      // Use String() on both sides to avoid UUID vs number type mismatches
      const allRequiredPresent = regularProducts.every((cp) => {
        const cartItem = cartItems.find(
          (item) => String(item.id) === String(cp.product_id),
        );
        return cartItem && cartItem.qty >= cp.min_quantity;
      });

      if (!allRequiredPresent) continue;

      // Check if custom design is required and present.
      // Cart items carry is_custom_design + custom_design_front/back, NOT custom_design.image_url
      if (customDesignSlots.length > 0) {
        const hasCustomDesign = cartItems.some(
          (item) =>
            item.is_custom_design &&
            (item.custom_design_front || item.custom_design_back),
        );
        if (!hasCustomDesign) continue;
      }

      // ── Identify ALL cart items that belong to this campaign ───────────
      // An item belongs if its id matches any campaign product_id (regular
      // or custom-design slot) OR it was explicitly tagged campaign_id.
      const allCampaignProductIds = campaignProducts.map((cp) =>
        String(cp.product_id),
      );

      const allCampaignCartItems = cartItems.filter(
        (item) =>
          allCampaignProductIds.includes(String(item.id)) ||
          String(item.campaign_id) === String(campaign.id),
      );

      // ── True savings = what the customer would have paid at retail - combo_price
      // Sum ALL campaign cart items (regular + custom slot) at their cart prices.
      const allCampaignItemsRetailTotal = allCampaignCartItems.reduce(
        (sum, item) => sum + (item.price || 0) * (item.qty || 1),
        0,
      );
      const campaignDiscount = Math.max(
        0,
        allCampaignItemsRetailTotal - campaign.combo_price,
      );

      // combo_price is the fixed price for the WHOLE bundle set in admin.
      // All campaign items are covered by it; only truly external cart items
      // (different products not in this campaign) are added on top.
      return {
        ...campaign,
        applicable: true,
        retailTotal: allCampaignItemsRetailTotal,
        campaignDiscount,
        finalPrice: campaign.combo_price,
        // ALL campaign item ids — none gets added on top of combo_price
        relevantItems: allCampaignCartItems.map((item) => item.id),
      };
    }

    return null;
  })();

  const campaignSavings = applicableCampaign?.campaignDiscount || 0;
  const campaignTotal = applicableCampaign
    ? applicableCampaign.combo_price +
      cartItems
        .filter((item) => !applicableCampaign.relevantItems.includes(item.id))
        .reduce((sum, item) => sum + item.price * item.qty, 0)
    : null;

  return {
    campaign: applicableCampaign,
    isLoading,
    campaignSavings,
    campaignTotal,
  };
}
