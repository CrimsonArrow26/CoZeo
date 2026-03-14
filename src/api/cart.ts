// Cart API functions for database sync
import { supabase } from '../integrations/supabase/client';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Helper for direct fetch
async function supabaseFetch(endpoint: string, options: RequestInit = {}) {
  const url = `${SUPABASE_URL}/rest/v1/${endpoint}`;
  const { data: { session } } = await supabase.auth.getSession();
  const authToken = session?.access_token || SUPABASE_ANON_KEY;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return response;
}

export interface CartItemDB {
  id: string;
  user_id: string;
  product_id: string;
  size: string;
  color: string | null;
  quantity: number;
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
  const response = await supabaseFetch(
    'cart_items?select=*,product:products(id,name,slug,price,discount_price,images,stock)'
  );
  return response.json();
}

// Add item to cart
export async function addCartItem(
  productId: string, 
  size: string, 
  quantity: number = 1,
  color?: string
): Promise<CartItemDB> {
  const response = await supabaseFetch('cart_items', {
    method: 'POST',
    headers: {
      'Prefer': 'return=representation',
    },
    body: JSON.stringify({
      product_id: productId,
      size,
      quantity,
      color: color || null,
    }),
  });
  return response.json();
}

// Update cart item quantity
export async function updateCartItem(
  cartItemId: string, 
  quantity: number
): Promise<CartItemDB> {
  const response = await supabaseFetch(`cart_items?id=eq.${cartItemId}`, {
    method: 'PATCH',
    headers: {
      'Prefer': 'return=representation',
    },
    body: JSON.stringify({ quantity }),
  });
  const data = await response.json();
  return data[0];
}

// Remove item from cart
export async function removeCartItem(cartItemId: string): Promise<void> {
  await supabaseFetch(`cart_items?id=eq.${cartItemId}`, {
    method: 'DELETE',
  });
}

// Clear entire cart
export async function clearUserCart(): Promise<void> {
  await supabaseFetch('cart_items', {
    method: 'DELETE',
  });
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
      p_guest_items: guestItems,
    }),
  });
  
  if (!response.ok) {
    throw new Error(`Failed to merge cart: ${response.status}`);
  }
}
