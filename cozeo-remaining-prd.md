# CoZeo — Missing Details Supplement
**Fills 5 gaps in Build Plan v3.1**
**Date:** March 2026

> This file completes the areas that were too shallow in the main build plan.
> Read alongside CoZeo-Build-Plan-v3.1.md. These sections replace the shallow versions.

---

## Gap 1 — All TanStack Query Hooks

Every piece of server state in CoZeo goes through TanStack Query v5.
No direct `supabase` calls inside components — always go through a hook.

### Setup

```ts
// src/lib/queryClient.ts
import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime:        1000 * 60 * 5,   // 5 min default
      gcTime:           1000 * 60 * 10,  // 10 min garbage collect
      retry:            1,
      refetchOnWindowFocus: false,
    },
  },
})
```

---

### Product Hooks

```ts
// src/hooks/useProducts.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import type { Product } from '@/types'

// ─── Query Keys ───────────────────────────────────────
export const productKeys = {
  all:       ()                  => ['products']                  as const,
  lists:     ()                  => ['products', 'list']          as const,
  list:      (f: ProductFilters) => ['products', 'list', f]       as const,
  featured:  ()                  => ['products', 'featured']      as const,
  spotlight: ()                  => ['products', 'spotlight']     as const,
  detail:    (slug: string)      => ['products', 'detail', slug]  as const,
  category:  (cat: string)       => ['products', 'category', cat] as const,
}

export interface ProductFilters {
  category?:  string
  badge?:     string[]
  sizes?:     string[]
  minPrice?:  number
  maxPrice?:  number
  inStock?:   boolean
  sort?:      'newest' | 'price_asc' | 'price_desc' | 'rating'
  search?:    string
  page?:      number
  limit?:     number
}

// ─── Fetch: all products with filters (shop page) ────
export function useProducts(filters: ProductFilters = {}) {
  return useQuery({
    queryKey: productKeys.list(filters),
    queryFn: async () => {
      const {
        category, badge, sizes, minPrice, maxPrice,
        inStock, sort = 'newest', search, page = 1, limit = 12
      } = filters

      let q = supabase
        .from('products')
        .select('*', { count: 'exact' })
        .eq('is_active', true)

      if (category)            q = q.eq('category', category)
      if (badge?.length)       q = q.in('badge', badge)
      if (inStock)             q = q.gt('stock', 0)
      if (minPrice != null)    q = q.gte('price', minPrice)
      if (maxPrice != null)    q = q.lte('price', maxPrice)
      if (search)              q = q.ilike('name', `%${search}%`)
      if (sizes?.length) {
        // products where ANY of the selected sizes is in the sizes array
        q = q.overlaps('sizes', sizes)
      }

      const sortMap = {
        newest:     { col: 'created_at', asc: false },
        price_asc:  { col: 'price',      asc: true  },
        price_desc: { col: 'price',      asc: false },
        rating:     { col: 'rating',     asc: false },
      }
      const { col, asc } = sortMap[sort]
      q = q.order(col, { ascending: asc })

      const from = (page - 1) * limit
      q = q.range(from, from + limit - 1)

      const { data, error, count } = await q
      if (error) throw error
      return { products: data as Product[], total: count ?? 0 }
    },
    staleTime: 1000 * 60 * 3,   // 3 min — shop data changes moderately
  })
}

// ─── Fetch: featured products (home carousel) ────────
export function useFeaturedProducts() {
  return useQuery({
    queryKey: productKeys.featured(),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_featured', true)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(6)
      if (error) throw error
      return data as Product[]
    },
    staleTime: 1000 * 60 * 10,   // 10 min — featured rarely changes
  })
}

// ─── Fetch: spotlight product (home spotlight section) ───
export function useSpotlightProduct() {
  return useQuery({
    queryKey: productKeys.spotlight(),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_spotlight', true)
        .eq('is_active', true)
        .single()
      if (error) throw error
      return data as Product
    },
    staleTime: 1000 * 60 * 10,
  })
}

// ─── Fetch: single product by slug (product detail) ──
export function useProduct(slug: string) {
  return useQuery({
    queryKey: productKeys.detail(slug),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .single()
      if (error) throw error
      return data as Product
    },
    enabled: !!slug,
  })
}

// ─── Fetch: products by category ─────────────────────
export function useCategoryProducts(category: string) {
  return useQuery({
    queryKey: productKeys.category(category),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('category', category)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data as Product[]
    },
    enabled: !!category,
    staleTime: 1000 * 60 * 5,
  })
}

// ─── Fetch: new drops (home new drops section) ───────
export function useNewDrops(limit = 3) {
  return useQuery({
    queryKey: ['products', 'new-drops', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(limit)
      if (error) throw error
      return data as Product[]
    },
    staleTime: 1000 * 60 * 5,
  })
}

// ─── Mutation: create product (admin) ────────────────
export function useCreateProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('products')
        .insert(payload)
        .select()
        .single()
      if (error) throw error
      return data as Product
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: productKeys.all() })
    },
  })
}

// ─── Mutation: update product (admin) ────────────────
export function useUpdateProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...payload }: Partial<Product> & { id: string }) => {
      // If is_spotlight is being set to true, clear it on all others first
      if (payload.is_spotlight) {
        await supabase
          .from('products')
          .update({ is_spotlight: false })
          .neq('id', id)
      }
      const { data, error } = await supabase
        .from('products')
        .update({ ...payload, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data as Product
    },
    onSuccess: (updated) => {
      qc.invalidateQueries({ queryKey: productKeys.all() })
      qc.setQueryData(productKeys.detail(updated.slug), updated)
    },
  })
}

// ─── Mutation: delete product (admin) ────────────────
export function useDeleteProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: productKeys.all() })
    },
  })
}

// ─── Mutation: quick stock update (admin) ────────────
export function useUpdateStock() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, stock }: { id: string; stock: number }) => {
      const { error } = await supabase
        .from('products')
        .update({ stock, updated_at: new Date().toISOString() })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: productKeys.all() })
      qc.invalidateQueries({ queryKey: ['admin', 'products'] })
    },
  })
}
```

---

### Order Hooks

```ts
// src/hooks/useOrders.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import type { Order, OrderStatus } from '@/types'

export const orderKeys = {
  all:        ()                 => ['orders']                   as const,
  mine:       (uid: string)      => ['orders', 'user', uid]      as const,
  detail:     (id: string)       => ['orders', 'detail', id]     as const,
  tracking:   (id: string)       => ['orders', 'tracking', id]   as const,
  admin:      (f?: AdminFilters) => ['admin', 'orders', f ?? {}] as const,
}

export interface AdminFilters {
  status?:    OrderStatus
  search?:    string
  dateFrom?:  string
  dateTo?:    string
  page?:      number
  limit?:     number
}

// ─── Fetch: current user's orders (dashboard) ────────
export function useMyOrders() {
  const { user } = useAuth()
  return useQuery({
    queryKey: orderKeys.mine(user?.id ?? ''),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id, status, status_history, subtotal, discount_amount,
          total, payment_method, payment_status, created_at,
          order_items (
            id, product_name, product_image, quantity, size, color, unit_price
          )
        `)
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data as Order[]
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 1,   // 1 min — orders page should be fresh
  })
}

// ─── Fetch: single order with full detail (dashboard) ────
export function useOrder(orderId: string) {
  return useQuery({
    queryKey: orderKeys.detail(orderId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .eq('id', orderId)
        .single()
      if (error) throw error
      return data as Order
    },
    enabled: !!orderId,
  })
}

// ─── Fetch: public tracking (no auth, safe fields only) ──
export function useOrderTracking(orderId: string) {
  return useQuery({
    queryKey: orderKeys.tracking(orderId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id, status, status_history, created_at, total, payment_method,
          shipping_name, shipping_city, shipping_pincode,
          order_items (
            product_name, product_image, quantity, size, color, unit_price
          )
        `)
        .eq('id', orderId)
        .single()
      if (error) throw error
      return data
    },
    enabled: !!orderId,
    staleTime: 1000 * 30,    // 30s — tracking page should feel live
    refetchInterval: 1000 * 60, // poll every 60s automatically
  })
}

// ─── Fetch: all orders for admin ─────────────────────
export function useAdminOrders(filters: AdminFilters = {}) {
  return useQuery({
    queryKey: orderKeys.admin(filters),
    queryFn: async () => {
      const { status, search, dateFrom, dateTo, page = 1, limit = 25 } = filters

      let q = supabase
        .from('orders')
        .select(`
          id, status, status_history, total, payment_method, payment_status,
          created_at, shipping_name, shipping_phone, coupon_code,
          order_items ( product_name, quantity )
        `, { count: 'exact' })
        .order('created_at', { ascending: false })

      if (status)   q = q.eq('status', status)
      if (dateFrom) q = q.gte('created_at', dateFrom)
      if (dateTo)   q = q.lte('created_at', dateTo)
      if (search) {
        // search by order id prefix or customer name
        q = q.or(`id.ilike.%${search}%,shipping_name.ilike.%${search}%`)
      }

      const from = (page - 1) * limit
      q = q.range(from, from + limit - 1)

      const { data, error, count } = await q
      if (error) throw error
      return { orders: data as Order[], total: count ?? 0 }
    },
    staleTime: 1000 * 30,
  })
}

// ─── Fetch: order status counts for admin dashboard ──
export function useOrderStatusCounts() {
  return useQuery({
    queryKey: ['admin', 'orders', 'counts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('get_order_status_counts')
      if (error) throw error
      // Returns: [{ status: 'confirmed', count: 4 }, ...]
      return data as { status: OrderStatus; count: number }[]
    },
    staleTime: 1000 * 30,
    refetchInterval: 1000 * 60,
  })
}

// Supabase RPC function for counts (add to migrations):
// create or replace function get_order_status_counts()
// returns table (status text, count bigint) language sql as $$
//   select status::text, count(*) from public.orders group by status;
// $$;

// ─── Mutation: create order (checkout) ───────────────
export function useCreateOrder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: CreateOrderPayload) => {
      // 1. Validate stock before inserting
      const stockErrors = await validateCartStock(payload.items)
      if (stockErrors.length) throw new Error(stockErrors.join('\n'))

      // 2. Insert order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id:          payload.userId,
          status:           'pending',
          status_history:   [],
          subtotal:         payload.subtotal,
          discount_amount:  payload.discountAmount,
          total:            payload.total,
          coupon_code:      payload.couponCode,
          payment_method:   payload.paymentMethod,
          payment_status:   'pending',
          shipping_name:    payload.shipping.name,
          shipping_phone:   payload.shipping.phone,
          shipping_address: payload.shipping.address,
          shipping_city:    payload.shipping.city,
          shipping_state:   payload.shipping.state,
          shipping_pincode: payload.shipping.pincode,
          notes:            payload.notes,
        })
        .select()
        .single()
      if (orderError) throw orderError

      // 3. Insert order items
      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(payload.items.map(item => ({
          order_id:      order.id,
          product_id:    item.productId,
          product_name:  item.name,
          product_image: item.image,
          quantity:      item.quantity,
          size:          item.size,
          color:         item.color,
          unit_price:    item.price,
          total_price:   item.price * item.quantity,
        })))
      if (itemsError) throw itemsError

      // 4. Decrement stock for each item
      for (const item of payload.items) {
        const { data: success } = await supabase
          .rpc('decrement_stock', { p_product_id: item.productId, p_qty: item.quantity })
        if (!success) throw new Error(`Stock insufficient for ${item.name}`)
      }

      // 5. Increment coupon used_count if applied
      if (payload.couponCode) {
        await supabase
          .from('coupons')
          .update({ used_count: supabase.raw('used_count + 1') })
          .eq('code', payload.couponCode)
      }

      return order as Order
    },
    onSuccess: (order) => {
      qc.invalidateQueries({ queryKey: orderKeys.mine(order.user_id) })
      qc.invalidateQueries({ queryKey: productKeys.all() })  // stock changed
    },
  })
}

// ─── Mutation: update order status (admin) ───────────
export function useUpdateOrderStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({
      orderId, newStatus, note, adminId
    }: {
      orderId: string
      newStatus: OrderStatus
      note?: string
      adminId: string
    }) => {
      const historyEntry = {
        status:     newStatus,
        timestamp:  new Date().toISOString(),
        note:       note ?? null,
        updated_by: adminId,
      }

      const { data, error } = await supabase
        .from('orders')
        .update({
          status:         newStatus,
          status_history: supabase.raw(
            `status_history || ARRAY[$1::jsonb]`,
            [JSON.stringify(historyEntry)]
          ),
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId)
        .select('*, order_items(*)')
        .single()

      if (error) throw error
      return data as Order
    },
    onSuccess: (order) => {
      qc.invalidateQueries({ queryKey: orderKeys.admin() })
      qc.invalidateQueries({ queryKey: orderKeys.tracking(order.id) })
      qc.setQueryData(orderKeys.detail(order.id), order)
      qc.invalidateQueries({ queryKey: ['admin', 'orders', 'counts'] })
    },
  })
}

// ─── Mutation: cancel order (customer) ───────────────
export function useCancelOrder() {
  const qc = useQueryClient()
  const { user } = useAuth()
  return useMutation({
    mutationFn: async (orderId: string) => {
      const historyEntry = {
        status:     'cancelled',
        timestamp:  new Date().toISOString(),
        note:       'Cancelled by customer',
        updated_by: user!.id,
      }
      const { error } = await supabase
        .from('orders')
        .update({
          status:         'cancelled',
          status_history: supabase.raw(
            `status_history || ARRAY[$1::jsonb]`,
            [JSON.stringify(historyEntry)]
          ),
        })
        .eq('id', orderId)
        .eq('user_id', user!.id)  // RLS double-check
      if (error) throw error
    },
    onSuccess: (_, orderId) => {
      qc.invalidateQueries({ queryKey: orderKeys.mine(user!.id) })
      qc.invalidateQueries({ queryKey: orderKeys.tracking(orderId) })
    },
  })
}
```

---

### Coupon Hook

```ts
// src/hooks/useCoupon.ts
export function useValidateCoupon() {
  return useMutation({
    mutationFn: async ({ code, cartTotal }: { code: string; cartTotal: number }) => {
      const { data, error } = await supabase
        .rpc('validate_coupon', { p_code: code, p_cart_total: cartTotal })
      if (error) throw error
      const result = data?.[0]
      if (!result?.valid) throw new Error(result?.error_message ?? 'Invalid coupon')
      return result   // { valid, coupon_id, coupon_type, coupon_value, discount }
    },
  })
}
```

---

### Admin Stats Hook

```ts
// src/hooks/useAdminStats.ts
export function useAdminStats() {
  return useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: async () => {
      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
      const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString()
      const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0).toISOString()

      const [
        { data: allRevenue },
        { data: monthRevenue },
        { data: lastMonthRevenue },
        { count: totalOrders },
        { count: activeProducts },
        { count: totalUsers },
        { data: revenueChart },
        { data: topProducts },
        { data: lowStock },
      ] = await Promise.all([
        // All-time revenue
        supabase.from('orders').select('total').eq('payment_status', 'paid'),
        // This month revenue
        supabase.from('orders').select('total')
          .eq('payment_status', 'paid').gte('created_at', startOfMonth),
        // Last month revenue
        supabase.from('orders').select('total')
          .eq('payment_status', 'paid')
          .gte('created_at', startOfLastMonth)
          .lte('created_at', endOfLastMonth),
        // Total orders
        supabase.from('orders').select('*', { count: 'exact', head: true }),
        // Active products
        supabase.from('products').select('*', { count: 'exact', head: true })
          .eq('is_active', true),
        // Total users
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        // Revenue per day last 30 days (via RPC)
        supabase.rpc('get_revenue_chart', { days: 30 }),
        // Top 5 products by units sold
        supabase.rpc('get_top_products', { limit_count: 5 }),
        // Low stock
        supabase.from('products').select('id,name,category,stock')
          .lte('stock', 10).order('stock', { ascending: true }),
      ])

      const sum = (rows: { total: number }[] | null) =>
        (rows ?? []).reduce((acc, r) => acc + r.total, 0)

      const totalRevenue     = sum(allRevenue)
      const thisMonthRevenue = sum(monthRevenue)
      const lastMonthRev     = sum(lastMonthRevenue)
      const monthChange      = lastMonthRev === 0 ? 100
        : ((thisMonthRevenue - lastMonthRev) / lastMonthRev) * 100

      return {
        totalRevenue,
        thisMonthRevenue,
        monthChangePercent: monthChange,
        totalOrders:    totalOrders ?? 0,
        activeProducts: activeProducts ?? 0,
        totalUsers:     totalUsers ?? 0,
        revenueChart:   revenueChart ?? [],   // [{ date, revenue }]
        topProducts:    topProducts ?? [],    // [{ name, units_sold, revenue }]
        lowStock:       lowStock ?? [],
      }
    },
    staleTime: 1000 * 60 * 2,
  })
}
```

Required RPC functions for stats (run in Supabase SQL Editor):

```sql
-- Daily revenue for last N days
create or replace function get_revenue_chart(days integer)
returns table (date text, revenue numeric) language sql as $$
  select
    to_char(gs.day::date, 'YYYY-MM-DD') as date,
    coalesce(sum(o.total), 0) as revenue
  from generate_series(
    current_date - (days - 1) * interval '1 day',
    current_date,
    interval '1 day'
  ) as gs(day)
  left join public.orders o
    on o.created_at::date = gs.day::date
    and o.payment_status = 'paid'
  group by gs.day
  order by gs.day;
$$;

-- Top products by units sold
create or replace function get_top_products(limit_count integer)
returns table (name text, units_sold bigint, revenue numeric) language sql as $$
  select
    oi.product_name as name,
    sum(oi.quantity) as units_sold,
    sum(oi.total_price) as revenue
  from public.order_items oi
  join public.orders o on o.id = oi.order_id
  where o.payment_status = 'paid'
  group by oi.product_name
  order by units_sold desc
  limit limit_count;
$$;
```

---

### Notification Hooks

```ts
// src/hooks/useNotifications.ts
export function useNotifications() {
  const { user } = useAuth()
  const qc = useQueryClient()

  const query = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })
        .limit(50)
      if (error) throw error
      return data as Notification[]
    },
    enabled: !!user,
    staleTime: 1000 * 30,
  })

  // Realtime subscription
  useEffect(() => {
    if (!user) return
    const channel = supabase
      .channel(`notifications-${user.id}`)
      .on('postgres_changes', {
        event:  'INSERT',
        schema: 'public',
        table:  'notifications',
        filter: `user_id=eq.${user.id}`,
      }, (payload) => {
        qc.invalidateQueries({ queryKey: ['notifications', user.id] })
        toast(payload.new.title, { description: payload.new.message })
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [user?.id])

  const markRead = useMutation({
    mutationFn: async (id: string) => {
      await supabase.from('notifications').update({ is_read: true }).eq('id', id)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications', user?.id] }),
  })

  const markAllRead = useMutation({
    mutationFn: async () => {
      await supabase.from('notifications')
        .update({ is_read: true })
        .eq('user_id', user!.id)
        .eq('is_read', false)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications', user?.id] }),
  })

  const unreadCount = query.data?.filter(n => !n.is_read).length ?? 0

  return { ...query, unreadCount, markRead, markAllRead }
}
```

---

### Giveaway Hooks

```ts
// src/hooks/useGiveaway.ts
export function useSubmitGiveaway() {
  return useMutation({
    mutationFn: async (payload: GiveawayPayload) => {
      // Check duplicate email first
      const { count } = await supabase
        .from('giveaway_entries')
        .select('*', { count: 'exact', head: true })
        .eq('email', payload.email)
      if (count && count > 0) throw new Error('already_entered')

      const { error } = await supabase
        .from('giveaway_entries')
        .insert(payload)
      if (error) throw error
    },
  })
}

export function useAdminGiveaway(search?: string, winnersOnly?: boolean) {
  return useQuery({
    queryKey: ['admin', 'giveaway', { search, winnersOnly }],
    queryFn: async () => {
      let q = supabase
        .from('giveaway_entries')
        .select('*')
        .order('created_at', { ascending: false })
      if (winnersOnly) q = q.eq('is_winner', true)
      if (search)      q = q.or(`name.ilike.%${search}%,email.ilike.%${search}%`)
      const { data, error } = await q
      if (error) throw error
      return data
    },
    staleTime: 1000 * 60,
  })
}

export function useToggleWinner() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, isWinner }: { id: string; isWinner: boolean }) => {
      const { error } = await supabase
        .from('giveaway_entries')
        .update({ is_winner: isWinner })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'giveaway'] }),
  })
}
```

---

## Gap 2 — Full Admin Product Edit / Delete

### Admin Products Page — Complete Implementation

```tsx
// src/pages/admin/AdminProducts.tsx

// State:
//   - drawerOpen: boolean
//   - editingProduct: Product | null   (null = create mode)
//   - deleteTarget: Product | null     (for confirm dialog)
//   - search: string
//   - categoryFilter: string | 'all'
//   - sortBy: 'newest' | 'name_asc' | 'stock_asc'

// Layout:
//   Toolbar row:
//     Left: search input + category select + sort select
//     Right: "Add Product" button (primary)
//   Table (desktop) | Card stack (mobile)
//   Drawer (right side, 560px wide) for create/edit form
//   Delete confirm dialog

// Table columns:
//   [ ] checkbox | Thumbnail | Name | Slug | Category | Badge |
//   Price | Discount | Stock (inline-editable) |
//   Featured (toggle) | Active (toggle) | ⋮ actions menu

// Actions menu per row (shadcn DropdownMenu):
//   ✏️  Edit          → opens drawer pre-filled with product data
//   📦  Restock       → opens small inline stock update popover
//   🗑️  Delete        → opens confirm dialog

// Inline stock editing:
//   Stock cell: shows number. Click → becomes an input[type=number]
//   Press Enter or blur → calls useUpdateStock mutation
//   Shows loading spinner inside cell while saving
//   Green flash animation on success

// Featured / Active toggles:
//   shadcn Switch component directly in table cell
//   onChange immediately calls useUpdateProduct({ id, is_featured })
//   Optimistic update: flip switch immediately, revert on error
```

### ProductDrawer — Full Form

```tsx
// src/components/admin/ProductDrawer.tsx
// Props: open, onClose, product (Product | null — null = create mode)

// Title: "Add Product" or "Edit Product"
// Form uses React Hook Form + Zod

const productSchema = z.object({
  name:             z.string().min(2, 'Name required'),
  slug:             z.string().min(2).regex(/^[a-z0-9-]+$/, 'Lowercase letters, numbers, hyphens only'),
  category:         z.enum(['man', 'woman']),
  badge:            z.enum(['sale', 'drop', 'new']).nullable(),
  price:            z.number().min(1, 'Price must be positive'),
  discount_price:   z.number().nullable(),
  stock:            z.number().int().min(0),
  description:      z.string().min(10, 'Short description required'),
  long_description: z.string().nullable(),
  sizes:            z.array(z.string()).min(1, 'Select at least one size'),
  colors:           z.array(z.string()).min(1, 'Add at least one color'),
  specs: z.object({
    fabric_type:        z.string().nullable(),
    fit_style:          z.string().nullable(),
    neckline:           z.string().nullable(),
    sleeve_length:      z.string().nullable(),
    pattern:            z.string().nullable(),
    finish:             z.string().nullable(),
    care_instructions:  z.string().nullable(),
  }),
  is_featured:  z.boolean(),
  is_spotlight: z.boolean(),
  is_active:    z.boolean(),
})

// Auto-slug generation:
//   watch('name') → useEffect → if create mode, auto-set slug
//   slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

// Form sections (use shadcn Accordion or just dividers):

// Section 1 — Basic Info
//   Name *  |  Slug *
//   Category: [Man] [Woman] (tab-style toggle buttons)
//   Badge: [None] [Sale] [Drop] [New] (tab-style)

// Section 2 — Pricing & Stock
//   Price (₹) *  |  Discount Price (₹)
//   Stock *
//   Note: "Discount price must be less than price" — shown below if violated

// Section 3 — Description
//   Short Description * (textarea, 2 rows, max 150 chars, char counter)
//   Long Description (textarea, 6 rows)

// Section 4 — Variants
//   Sizes — checkboxes in a row: S  M  L  XL  XXL
//   Colors — tag input component:
//     Input field + "Add" button
//     Existing colors shown as pills with × to remove
//     Common suggestions as clickable chips: Black White Grey Navy Red

// Section 5 — Specs
//   2-column grid of text inputs:
//   Fabric Type     | Fit Style
//   Neckline        | Sleeve Length
//   Pattern         | Finish
//   Care Instructions (full width)

// Section 6 — Images
//   Drag-drop zone:
//     accepts image/*, max 5 files, max 5MB each
//     Shows: "Drop images here or click to upload"
//   Preview grid (3-col):
//     Each preview: image thumbnail, file name, × delete button
//     First image has "Primary" badge
//     Drag to reorder (react-beautiful-dnd or @dnd-kit/core)
//   Upload to Supabase Storage 'product-images' bucket on form submit
//   Existing images (edit mode): shown as previews with same delete/reorder

// Section 7 — Visibility
//   Three toggles in a card:
//   [Featured]   Show in Featured Drops carousel on homepage
//   [Spotlight]  Show in homepage spotlight section (only 1 at a time)
//   [Active]     Visible in shop

// Footer (sticky at bottom of drawer):
//   [Cancel]  [Save Product (loading spinner)]

// On Submit:
//   1. Validate with Zod
//   2. Upload any new images to Storage, get URLs
//   3. Merge image URLs with existing ones
//   4. Call useCreateProduct or useUpdateProduct
//   5. Close drawer on success, show toast
//   6. invalidateQueries handles table refresh
```

### Delete Confirm Dialog

```tsx
// src/components/admin/DeleteProductDialog.tsx
// shadcn AlertDialog
// Title: "Delete Product"
// Body: "Are you sure you want to delete [product name]?
//        This cannot be undone. Orders containing this product will not be affected."
// Buttons: [Cancel] [Delete] (destructive)
// On confirm: useDeleteProduct mutation
//   - Show loading state on Delete button
//   - On success: close dialog, show toast "Product deleted"
//   - On error: show error toast, keep dialog open
```

---

## Gap 3 — Complete Product Detail with Specs Tabs

```tsx
// src/pages/ProductDetail.tsx

// FULL COMPONENT BREAKDOWN:

// 1. Route: /product/:slug
//    const { slug } = useParams()
//    const { data: product, isLoading, isError } = useProduct(slug)

// 2. Loading state:
//    <ProductDetailSkeleton />  — skeleton matching the 2-col layout

// 3. Error / not found:
//    <EmptyState icon="🔍" title="Product not found" action={{ label:"Browse Shop", ... }} />

// ─── LEFT COLUMN: Gallery ─────────────────────────────
// State: selectedImage (index, default 0), isLightboxOpen

// Main image:
//   <div> aspect-square rounded-2xl overflow-hidden bg-secondary
//   <img> src={product.images[selectedImage]}
//         className="w-full h-full object-cover transition-opacity duration-300"
//         alt={product.name}
//         loading="eager"  ← above fold, eager load

// Thumbnails row (below main image):
//   flex gap-2 mt-3
//   max 4 thumbnails visible (scroll if more)
//   Each thumbnail:
//     <button> w-20 h-20 rounded-xl overflow-hidden border-2
//              border-transparent (inactive) or border-primary (active)
//              onClick → setSelectedImage(index)
//     <img> object-cover

// Lightbox:
//   Click main image → opens shadcn Dialog (full screen on mobile, 90vw on desktop)
//   Shows large image with prev/next arrows
//   Close on backdrop click or Escape key

// ─── RIGHT COLUMN: Product Info ───────────────────────
// Category badge:
//   <span> font-mono text-xs uppercase tracking-widest
//          bg-secondary text-muted-foreground px-3 py-1 rounded-full

// Product name:
//   <h1> font-heading font-bold text-3xl text-foreground

// Rating row:
//   Star icons (5 total, filled/empty based on product.rating)
//   "(12 reviews)" link → scrolls to reviews tab
//   If review_count === 0: "No reviews yet" in muted text

// Price display:
//   if discount_price exists:
//     <span className="text-2xl font-mono font-bold text-success">
//       {formatPrice(discount_price)}
//     </span>
//     <span className="text-base font-mono text-muted-foreground line-through ml-2">
//       {formatPrice(price)}
//     </span>
//     <span className="text-xs font-mono bg-success/10 text-success px-2 py-0.5 rounded ml-2">
//       {Math.round((1 - discount_price/price) * 100)}% off
//     </span>
//   else:
//     <span className="text-2xl font-mono font-bold">{formatPrice(price)}</span>

// Short description:
//   <p className="text-muted-foreground leading-relaxed mt-3">{product.description}</p>

// Divider <hr className="border-border my-5" />

// Size selector:
//   <p className="font-heading font-semibold mb-2">Size</p>
//   {product.sizes.map(size => (
//     <button
//       key={size}
//       onClick={() => setSelectedSize(size)}
//       disabled={product.stock === 0}
//       className={cn(
//         "w-12 h-12 rounded-lg border text-sm font-mono font-medium transition-colors",
//         selectedSize === size
//           ? "bg-primary text-primary-foreground border-primary"
//           : "bg-secondary text-foreground border-border hover:border-primary"
//       )}
//     >{size}</button>
//   ))}
//   {sizeError && <p className="text-destructive text-xs mt-1">Please select a size</p>}

// Color selector:
//   <p className="font-heading font-semibold mb-2 mt-4">Color</p>
//   {product.colors.map(color => (
//     <button
//       key={color}
//       onClick={() => setSelectedColor(color)}
//       title={color}
//       className={cn(
//         "w-8 h-8 rounded-full border-2 transition-all",
//         selectedColor === color ? "border-primary scale-110" : "border-border"
//       )}
//       style={{ backgroundColor: COLOR_MAP[color] ?? '#888' }}
//     />
//   ))}
//   <span className="text-sm text-muted-foreground ml-2">{selectedColor}</span>

// COLOR_MAP (hardcoded reasonable defaults):
const COLOR_MAP: Record<string, string> = {
  White:  '#FFFFFF',
  Black:  '#1a1a1a',
  Grey:   '#9CA3AF',
  Navy:   '#1e3a5f',
  Red:    '#EF4444',
  Green:  '#22C55E',
  Brown:  '#92400E',
  Beige:  '#D4C5A9',
}

// Quantity stepper:
//   <p className="font-heading font-semibold mb-2 mt-4">Quantity</p>
//   <div className="flex items-center gap-0 border border-border rounded-lg overflow-hidden w-fit">
//     <button onClick={decrement} className="px-4 py-2 hover:bg-secondary">−</button>
//     <span className="px-5 py-2 font-mono font-medium min-w-[48px] text-center">{qty}</span>
//     <button onClick={increment} className="px-4 py-2 hover:bg-secondary">+</button>
//   </div>
//   min = 1, max = Math.min(product.stock, 10)

// Stock indicator:
//   if stock > 10:  <span className="text-success text-xs">✓ In stock</span>
//   if stock 1-10:  <span className="text-warning text-xs">Only {stock} left</span>
//   if stock === 0: <span className="text-destructive text-xs">Out of stock</span>

// Action buttons (full width, stacked):
//   [Buy Now]       bg-primary text-primary-foreground
//                   onClick → set cart to just this item + navigate to /checkout
//   [Add to Cart]   bg-transparent border border-primary text-primary hover:bg-secondary
//                   onClick → validate size+color selected, then addItem, openCart

// Out of stock overlay on buttons:
//   Both buttons disabled, opacity-50, cursor-not-allowed
//   Text changes to "Out of Stock"

// ─── BELOW FOLD: Tabs ─────────────────────────────────
// shadcn Tabs component

// Tab 1 — Product Info (default tab)
//   Specs table:
//   <table className="w-full text-sm">
//     <tbody>
//       {Object.entries(SPEC_LABELS).map(([key, label]) => {
//         const value = product.specs[key]
//         if (!value) return null   // skip empty specs
//         return (
//           <tr key={key} className="border-b border-border">
//             <td className="py-3 pr-4 text-muted-foreground font-medium w-40">{label}</td>
//             <td className="py-3 text-foreground">{value}</td>
//           </tr>
//         )
//       })}
//     </tbody>
//   </table>

const SPEC_LABELS: Record<string, string> = {
  fabric_type:        'Fabric Type',
  fit_style:          'Fit Style',
  neckline:           'Neckline',
  sleeve_length:      'Sleeve Length',
  pattern:            'Pattern',
  finish:             'Finish',
  care_instructions:  'Care Instructions',
}

// Tab 2 — Description
//   <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed">
//     {product.long_description ?? 'No description available.'}
//   </div>

// Tab 3 — Reviews
//   if product.review_count === 0:
//     <EmptyState icon="⭐" title="No reviews yet" description="Be the first to review this product" />
//   else:
//     Rating breakdown bar chart (5★ → 1★, percentage bars)
//     Review list: avatar + name + date + star row + comment text
//     Reviews fetched from 'reviews' table (Phase: post-launch)
//     For v1: show static reviews seeded in DB (from Velora's sample reviews)
```

---

## Gap 4 — Category Page Grid

### Category Page — Complete Implementation

```tsx
// src/pages/CategoryPage.tsx
// Route: /category/:slug  (slug = 'man' | 'woman')

// const { slug } = useParams()
// const { data: products, isLoading } = useCategoryProducts(slug)

// PAGE STRUCTURE:

// 1. Category hero banner:
//    Full-width, 200px tall, background image (man.jpeg or woman.jpeg)
//    Dark overlay bg-black/50
//    Centered: category label + breadcrumb
//    <div className="relative h-48 overflow-hidden">
//      <img src={CATEGORY_IMAGES[slug]} className="absolute inset-0 w-full h-full object-cover" />
//      <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center">
//        <p className="text-white/60 text-sm font-mono mb-1">Category</p>
//        <h1 className="text-white font-heading font-bold text-4xl capitalize">{slug}</h1>
//      </div>
//    </div>

const CATEGORY_IMAGES = {
  man:   '/assets/categories/man.jpeg',
  woman: '/assets/categories/woman.jpeg',
}

// 2. Breadcrumb:
//    <nav> Home > Category > Man
//    Use shadcn Breadcrumb or custom:
//    <div className="flex items-center gap-2 text-sm text-muted-foreground py-4 px-6">
//      <Link to="/">Home</Link>
//      <span>›</span>
//      <span>Category</span>
//      <span>›</span>
//      <span className="text-foreground capitalize">{slug}</span>
//    </div>

// 3. Product count + sort:
//    <div className="flex items-center justify-between px-6 mb-4">
//      <span className="text-sm text-muted-foreground">{products?.length} products</span>
//      <select> Sort: Newest / Price Low-High / Price High-Low
//    </div>

// 4. Product grid:
//    Matching Velora exactly — 2 columns:
//    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 px-6 pb-12">
//      {products.map(p => <ProductCard key={p.id} product={p} />)}
//    </div>

// 5. Loading state:
//    Same grid but with 4 skeleton cards:
//    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 px-6">
//      {Array(4).fill(null).map((_, i) => <ProductCardSkeleton key={i} />)}
//    </div>

// 6. Empty state:
//    <EmptyState icon="👗" title="No products in this category yet" />

// ProductCard in category page context:
//   Exactly matches Velora's category page cards:
//   - Image: aspect-ratio 3/4 (taller than square — fashion style)
//   - Badge top-left if exists
//   - Name (h2 on this page, not h3)
//   - Short description (2 lines)
//   - Price: sale price + crossed original
//   Clicking → navigate to /product/:slug
```

### ProductCardSkeleton

```tsx
// src/components/ProductCardSkeleton.tsx
export function ProductCardSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden border border-border animate-pulse">
      <div className="aspect-[3/4] bg-secondary" />
      <div className="p-4 space-y-2">
        <div className="h-5 bg-secondary rounded w-3/4" />
        <div className="h-4 bg-secondary rounded w-full" />
        <div className="h-4 bg-secondary rounded w-1/2" />
        <div className="h-5 bg-secondary rounded w-1/3 mt-2" />
      </div>
    </div>
  )
}
```

---

## Gap 5 — Storage Buckets — Complete Setup

### Step 1 — Create Buckets in Supabase Dashboard

Go to Storage → New Bucket for each:

| Bucket name | Public | File size limit | Allowed MIME types |
|-------------|--------|-----------------|--------------------|
| `product-images` | ✅ Yes | 5 MB | `image/jpeg, image/png, image/webp, image/avif` |
| `avatars` | ✅ Yes | 2 MB | `image/jpeg, image/png, image/webp` |
| `giveaway-entries` | ❌ No | 10 MB | `image/jpeg, image/png, image/webp` |
| `return-images` | ❌ No | 10 MB | `image/jpeg, image/png, image/webp` |

---

### Step 2 — Storage RLS Policies (Run in SQL Editor)

```sql
-- ── product-images ──────────────────────────────────────
-- Anyone can read (public bucket, but RLS must still exist)
create policy "Public read product images"
  on storage.objects for select
  using ( bucket_id = 'product-images' );

-- Only admins can upload/delete
create policy "Admins upload product images"
  on storage.objects for insert
  with check (
    bucket_id = 'product-images'
    and exists (
      select 1 from public.user_roles
      where user_id = auth.uid() and role = 'admin'
    )
  );

create policy "Admins delete product images"
  on storage.objects for delete
  using (
    bucket_id = 'product-images'
    and exists (
      select 1 from public.user_roles
      where user_id = auth.uid() and role = 'admin'
    )
  );

-- ── avatars ─────────────────────────────────────────────
create policy "Public read avatars"
  on storage.objects for select
  using ( bucket_id = 'avatars' );

-- Users upload only to their own folder: avatars/{user_id}/filename
create policy "Users upload own avatar"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users delete own avatar"
  on storage.objects for delete
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ── giveaway-entries ────────────────────────────────────
-- Anyone can insert (public contest) but cannot read others' files
create policy "Anyone can upload giveaway photo"
  on storage.objects for insert
  with check ( bucket_id = 'giveaway-entries' );

-- Admins can read all giveaway photos
create policy "Admins read giveaway photos"
  on storage.objects for select
  using (
    bucket_id = 'giveaway-entries'
    and exists (
      select 1 from public.user_roles
      where user_id = auth.uid() and role = 'admin'
    )
  );

create policy "Admins delete giveaway photos"
  on storage.objects for delete
  using (
    bucket_id = 'giveaway-entries'
    and exists (
      select 1 from public.user_roles
      where user_id = auth.uid() and role = 'admin'
    )
  );

-- ── return-images ───────────────────────────────────────
-- Users can only access their own folder: return-images/{user_id}/filename
create policy "Users upload own return images"
  on storage.objects for insert
  with check (
    bucket_id = 'return-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users read own return images"
  on storage.objects for select
  using (
    bucket_id = 'return-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Admins read all return images
create policy "Admins read all return images"
  on storage.objects for select
  using (
    bucket_id = 'return-images'
    and exists (
      select 1 from public.user_roles
      where user_id = auth.uid() and role = 'admin'
    )
  );

create policy "Admins delete return images"
  on storage.objects for delete
  using (
    bucket_id = 'return-images'
    and exists (
      select 1 from public.user_roles
      where user_id = auth.uid() and role = 'admin'
    )
  );
```

---

### Step 3 — Upload Helper (Complete Implementation)

```ts
// src/lib/uploadImage.ts
import { supabase } from '@/integrations/supabase/client'

type Bucket = 'product-images' | 'avatars' | 'giveaway-entries' | 'return-images'

interface UploadOptions {
  bucket:  Bucket
  folder?: string        // subfolder e.g. user ID for avatars
  file:    File
  onProgress?: (pct: number) => void
}

export async function uploadImage({ bucket, folder, file }: UploadOptions): Promise<string> {
  // Validate type
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/avif']
  if (!allowed.includes(file.type)) {
    throw new Error('Only JPG, PNG, WebP, and AVIF images are allowed')
  }

  // Validate size (per bucket)
  const maxSizes: Record<Bucket, number> = {
    'product-images':   5 * 1024 * 1024,
    'avatars':          2 * 1024 * 1024,
    'giveaway-entries': 10 * 1024 * 1024,
    'return-images':    10 * 1024 * 1024,
  }
  if (file.size > maxSizes[bucket]) {
    const mb = maxSizes[bucket] / 1024 / 1024
    throw new Error(`File too large. Maximum size is ${mb}MB`)
  }

  // Build path
  const ext      = file.name.split('.').pop() ?? 'jpg'
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const path     = folder ? `${folder}/${filename}` : filename

  // Upload
  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      contentType: file.type,
      upsert:      false,
    })
  if (error) throw error

  // Return public URL
  if (bucket === 'product-images' || bucket === 'avatars') {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path)
    return data.publicUrl
  }

  // For private buckets return the path (admin uses signed URLs to view)
  return path
}

// Get a signed URL for private bucket files (used in admin panel)
export async function getSignedUrl(bucket: Bucket, path: string, expiresIn = 3600): Promise<string> {
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresIn)
  if (error) throw error
  return data.signedUrl
}

// Upload multiple images and return all URLs
export async function uploadImages(
  files: File[],
  bucket: Bucket,
  folder?: string
): Promise<string[]> {
  const results = await Promise.allSettled(
    files.map(file => uploadImage({ bucket, folder, file }))
  )
  const urls: string[] = []
  const errors: string[] = []
  results.forEach((r, i) => {
    if (r.status === 'fulfilled') urls.push(r.value)
    else errors.push(`${files[i].name}: ${r.reason.message}`)
  })
  if (errors.length) throw new Error(errors.join('\n'))
  return urls
}

// Delete an image from storage
export async function deleteImage(bucket: Bucket, url: string): Promise<void> {
  // Extract path from URL for public buckets
  // URL looks like: https://xxx.supabase.co/storage/v1/object/public/bucket-name/path
  const urlObj    = new URL(url)
  const pathParts = urlObj.pathname.split(`/${bucket}/`)
  const path      = pathParts[1]
  if (!path) return

  const { error } = await supabase.storage.from(bucket).remove([path])
  if (error) throw error
}
```

### Step 4 — ImageUploadZone Component (Used in Product Form + Giveaway + Returns)

```tsx
// src/components/ui/ImageUploadZone.tsx
interface ImageUploadZoneProps {
  bucket:     'product-images' | 'avatars' | 'giveaway-entries' | 'return-images'
  folder?:    string
  multiple?:  boolean
  maxFiles?:  number
  value:      string[]           // current image URLs
  onChange:   (urls: string[]) => void
  onError?:   (msg: string) => void
}

// Layout:
// <div> border-2 border-dashed border-border rounded-2xl p-8 text-center
//       hover:border-primary hover:bg-secondary/50 transition-colors
//       cursor-pointer (drag active: border-primary bg-primary/5)
//   <input type="file" hidden multiple={multiple} accept="image/*" ref={inputRef} />
//   <CloudUpload icon />
//   <p>"Drop images here or click to upload"</p>
//   <p className="text-muted-foreground text-xs">JPG, PNG, WebP • Max 5MB each</p>

// Preview grid below zone:
// <div className="grid grid-cols-3 gap-3 mt-4">
//   {previews.map((url, i) => (
//     <div key={i} className="relative aspect-square rounded-xl overflow-hidden group">
//       <img src={url} className="w-full h-full object-cover" />
//       {i === 0 && (
//         <span className="absolute top-1 left-1 text-[10px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded font-mono">
//           Primary
//         </span>
//       )}
//       <button
//         onClick={() => removeImage(i)}
//         className="absolute top-1 right-1 bg-destructive text-white rounded-full w-5 h-5
//                    opacity-0 group-hover:opacity-100 transition-opacity text-xs"
//       >×</button>
//       {uploading[i] && (
//         <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
//           <LoadingSpinner size="sm" />
//         </div>
//       )}
//     </div>
//   ))}
// </div>

// Drag and drop:
//   onDragOver → e.preventDefault(), setDragActive(true)
//   onDragLeave → setDragActive(false)
//   onDrop → read e.dataTransfer.files, call handleFiles()

// handleFiles():
//   1. Filter to maxFiles remaining slots
//   2. For each file: uploadImage() → get URL
//   3. Append URLs to value array
//   4. Call onChange(newUrls)
//   5. Show per-file upload progress (uploading state array)
```

---

## Summary of What Each Gap Adds

| Gap | What was missing | Now added |
|-----|-----------------|-----------|
| TanStack Query hooks | Mentioned "create hooks" with no code | Full implementation: all query keys, filter types, mutations, optimistic updates, realtime, admin stats with SQL RPCs |
| Admin edit/delete | "Edit and Delete buttons exist" | Complete ProductDrawer form with Zod schema, inline stock editing, optimistic toggle updates, DeleteConfirmDialog |
| Product detail tabs | "3 tabs: Info, Description, Reviews" | Full JSX spec: gallery with lightbox, size selector logic, color map, quantity stepper, stock indicator, specs table with SPEC_LABELS, tab content |
| Category page | "2-col grid" | Complete page with category hero banner, breadcrumb, skeleton loading, sort control, ProductCardSkeleton |
| Storage buckets | "Create 4 buckets" | Exact RLS SQL for all 4 buckets with folder-scoped policies, complete uploadImage/deleteImage/getSignedUrl helpers, ImageUploadZone component |

---

*CoZeo Missing Details Supplement — March 2026*