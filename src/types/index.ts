export type ProductBadge = 'sale' | 'drop' | 'new' | null;
export type ProductSize = 'S' | 'M' | 'L' | 'XL' | 'XXL';
export type ProductColor = string;

export interface ProductSpecs {
  fabric_type?: string;
  fit_style?: string;
  neckline?: string;
  sleeve_length?: string;
  pattern?: string;
  finish?: string;
  care_instructions?: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  long_description: string | null;
  price: number;
  discount_price: number | null;
  stock: number;
  category: 'man' | 'woman' | string;
  badge: ProductBadge;
  images: string[];
  sizes: ProductSize[];
  colors: ProductColor[];
  specs: ProductSpecs;
  rating: number;
  review_count: number;
  is_featured: boolean;
  is_spotlight: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'packed'
  | 'shipped'
  | 'arrived'
  | 'delivered'
  | 'cancelled'
  | 'return_requested'
  | 'returned';

export type PaymentMethod = 'razorpay' | 'cashfree_upi' | 'cashfree_card' | 'cod';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type CouponType = 'percentage' | 'flat' | 'free_shipping';

export interface CartItem {
  productId: string;
  name: string;
  image: string;
  price: number;
  originalPrice: number;
  size: ProductSize;
  color: ProductColor;
  quantity: number;
  maxStock: number;
}

export interface StatusHistoryEntry {
  status: OrderStatus;
  timestamp: string;
  note: string | null;
  updated_by: string | null;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  product_image: string;
  size: ProductSize;
  color: ProductColor;
  quantity: number;
  unit_price: number;
  total_price: number;
  // Custom design fields
  is_custom_design?: boolean;
  custom_design_id?: string | null;
  custom_design_front?: string | null;
  custom_design_back?: string | null;
  apparel_type?: 'hoodie' | 'tshirt' | null;
  print_location?: 'front' | 'back' | 'both' | null;
  custom_notes?: string | null;
}

export interface Order {
  id: string;
  display_id: string;
  user_id: string;
  status: OrderStatus;
  status_history: StatusHistoryEntry[];
  subtotal: number;
  discount_amount: number;
  total: number;
  coupon_code: string | null;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  payment_id: string | null;
  shipping_name: string;
  shipping_phone: string;
  shipping_address: string;
  shipping_city: string;
  shipping_state: string;
  shipping_pincode: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Coupon {
  id: string;
  code: string;
  type: CouponType;
  value: number;
  minimum_order: number;
  max_discount: number | null;
  expiry: string;
  usage_limit: number;
  used_count: number;
  is_active: boolean;
}

export interface Profile {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: 'order' | 'promo' | 'system';
  title: string;
  message: string;
  order_id: string | null;
  is_read: boolean;
  created_at: string;
}

export interface GiveawayEntry {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  college: string | null;
  instagram: string | null;
  twitter: string | null;
  image_url: string | null;
  is_winner: boolean;
  created_at: string;
}

export interface ReturnRequest {
  id: string;
  order_id: string;
  user_id: string;
  reason: string;
  description: string | null;
  images: string[];
  resolution: 'refund' | 'replacement';
  status: 'requested' | 'approved' | 'rejected' | 'completed';
  admin_note: string | null;
  created_at: string;
  updated_at: string;
}

export interface Campaign {
  id: string;
  name: string;
  description: string | null;
  slug: string;
  badge: string | null;
  combo_price: number;
  original_total: number;
  starts_at: string;
  ends_at: string;
  is_active: boolean;
  max_uses: number | null;
  current_uses: number;
  requires_custom_design: boolean;
  custom_design_label: string | null;
  created_at: string;
  updated_at: string;
}

export interface CampaignProduct {
  id: string;
  campaign_id: string;
  product_id: string;
  min_quantity: number;
  is_custom_design_slot: boolean;
  sort_order: number;
  product?: Product;
}

export interface CustomDesign {
  id: string;
  order_item_id: string | null;
  cart_item_id: string | null;
  campaign_id: string;
  user_id: string;
  image_url: string;
  preview_url: string | null;
  status: 'pending' | 'approved' | 'rejected';
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}
