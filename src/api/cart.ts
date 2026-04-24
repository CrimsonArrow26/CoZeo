// Cart API functions for database sync
import { supabase } from '../integrations/supabase/client';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export interface CartItemDB {
  id: string;
  user_id: string;
  product_id: string;
  size: string;
  color: string | null;
  quantity: number;
  is_custom_design?: boolean;
  custom_design_front?: string | null;
  custom_design_back?: string | null;
  apparel_type?: 'hoodie' | 'tshirt' | null;
  print_location?: 'front' | 'back' | 'both' | null;
  custom_notes?: string | null;
  created_at: string;
  updated_at: string;
  product?: {
    id: string;
    name: string;
    slug: string;
    price: number;
    discount_price: number | null;
    images: string[];
    stock: number;
  };
}

// Fetch user's cart items with product details
export async function fetchUserCart(): Promise<CartItemDB[]> {
  const { data, error } = await supabase
    .from('cart_items')
    .select('*, product:products(id, name, slug, price, discount_price, images, stock)');
  
  if (error) {
    throw error;
  }
  
  return data || [];
}

// Add item to cart
export async function addCartItem(
  productId: string, 
  size: string, 
  quantity: number = 1,
  color?: string,
  customDesignFields?: {
    is_custom_design?: boolean;
    custom_design_front?: string | null;
    custom_design_back?: string | null;
    apparel_type?: 'hoodie' | 'tshirt' | null;
    print_location?: 'front' | 'back' | 'both' | null;
    custom_notes?: string | null;
  }
): Promise<CartItemDB> {
  const { data, error } = await supabase
    .from('cart_items')
    .insert({
      product_id: productId,
      size,
      quantity,
      color: color || null,
      ...customDesignFields,
    })
    .select('*, product:products(id, name, slug, price, discount_price, images, stock)')
    .single();
  
  if (error) {
    throw error;
  }
  
  return data;
}

// Update cart item quantity
export async function updateCartItem(
  cartItemId: string, 
  quantity: number
): Promise<CartItemDB> {
  const { data, error } = await supabase
    .from('cart_items')
    .update({ quantity })
    .eq('id', cartItemId)
    .select('*, product:products(id, name, slug, price, discount_price, images, stock)')
    .single();
  
  if (error) {
    throw error;
  }
  
  return data;
}

// Remove item from cart
export async function removeCartItem(cartItemId: string): Promise<void> {
  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('id', cartItemId);
  
  if (error) {
    throw error;
  }
}

// Clear entire cart
export async function clearUserCart(): Promise<void> {
  const { error } = await supabase
    .from('cart_items')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
  
  if (error) {
    throw error;
  }
}

// Merge guest cart with user cart on login
export async function mergeGuestCart(
  guestItems: Array<{
    productId: string;
    size: string;
    color?: string;
    quantity: number;
  }>
): Promise<void> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return;
  
  // Don't call if no guest items to merge
  if (!guestItems || guestItems.length === 0) {
    return;
  }
  
  // Transform guest items to match database function parameter names
  const transformedItems = guestItems.map(item => ({
    product_id: item.productId,
    size: item.size,
    color: item.color || null,
    quantity: item.quantity,
  }));
  
  // Call the database function to merge carts
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/merge_cart_on_login`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      p_user_id: session.user.id,
      p_guest_items: transformedItems,
    }),
  });
  
  if (!response.ok) {
    // Silently fail - don't block login on cart merge failure
    return;
  }
}
