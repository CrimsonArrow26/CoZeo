# CoZeo — Phased Build Guide (Velora Reference)
**Version:** 3.1.0 | **Date:** March 2026 | **Base Reference:** https://velora99.webflow.io/

> You are converting and extending the Velora Webflow site into a full React + Supabase app called CoZeo.
> The Velora site is your visual and structural reference for every UI decision.
> Build phases in strict order. Do not skip ahead.

---

## What Velora Already Has (Your UI Reference)

Study the live site before writing any component. Here is exactly what exists:

### Pages on Velora
| Page | URL | Notes |
|------|-----|-------|
| Home | `/` | Announcement bar, hero slider, new drops, about, featured carousel, spotlight product, why us, category cards, newsletter |
| Product Detail | `/product/shadow-drip` | Gallery, size+color selectors, specs table, tabs (Info / Description / Reviews) |
| Category | `/category/man`, `/category/woman` | Product grid with badges |
| Checkout | `/checkout` | Webflow native |

### Velora UI Patterns to Replicate Exactly
- **Announcement bar** — thin strip at very top: `"Exclusive Gift on Orders Over ₹1500"` (adapt to INR)
- **Header** — Logo left, nav center (Home / Shop / About Us / Collection / Category), cart icon + user icon right
- **Cart** — slide-out **drawer** from the right (NOT a separate page). Shows items, subtotal, checkout button
- **Auth** — **modal popups** (not separate pages). Login modal + Signup modal, toggleable. Social login buttons (Google, Facebook — UI only for v1)
- **Hero** — full-screen **auto-playing slider** with 4 slides. Each slide: background image, heading, "Shop now" CTA arrow button
- **New Drops section** — heading "new drops", 3-col product grid. Badges: `Sale` / `Drop` / `New`
- **About section** — two sub-sections: "Built by the Streets" (left text + right CTA) and brand story paragraph
- **Featured Drops carousel** — horizontal slider of 6 products with left/right arrows
- **Spotlight product** — dedicated full-width section for one featured product. Image gallery (4 thumbnails) + name, price, "Shop now" CTA
- **"Join the Movement" CTA** — dark full-width banner, text + shop button
- **Why Shop With Us** — 4 icon cards: Free delivery, 100% secure payment, 30 days return, 24/7 support
- **Category cards** — 2 cards side by side: `Man` and `Woman` (large images, label overlay)
- **Newsletter** — email input + subscribe button, centered
- **Footer** — 4 columns: Brand (logo + tagline), Menu, Pages, Social icons

### Product Detail Structure (Replicate This)
```
Breadcrumb: Home > Product Detail

Left:  Main image + 3 thumbnail images below
Right:
  - Product name (h2)
  - Star rating (5 stars) + review count
  - Price (sale price + original crossed out if discounted)
  - Description paragraph
  - Size selector: Small / Standard / Large / Extra Large
  - Color selector: White / Black (color dot buttons)
  - Quantity stepper
  - [Buy Now] button  ← goes to /checkout directly
  - [Add to Cart] button  ← adds to drawer cart
  - Out of stock state

Below fold (tabbed):
  Tab 1 — Product Info: specs table (Fabric, Fit, Neckline, Sleeve, Pattern, Finish, Care)
  Tab 2 — Description: full long-form text
  Tab 3 — Reviews: avatar + name + date + stars + comment
```

### Category Page Structure
```
Breadcrumb: Home > Category > Man

Product grid (2-col):
  Each card: image, badge (Sale/New/Drop), name, description, price + original price
```

---

## CoZeo Additions (Not in Velora — Build These Extra)

These pages/features are CoZeo-specific additions on top of the Velora design:

| Addition | Where |
|----------|-------|
| Giveaway page (`/giveaway`) | New page, linked in header nav |
| User Dashboard (`/dashboard`) | Protected, after login |
| Order Tracking (`/orders/:id/track`) | Public, shareable |
| Return Request (`/orders/:id/return`) | Protected |
| Admin Panel (`/admin/*`) | Protected, admin-only |
| Email notifications | Backend only |

---

## Constraints & Rules

### Technology
- React 18 + TypeScript + Vite
- Tailwind CSS — no inline `style={{}}` except for truly dynamic values (e.g. slider position)
- shadcn-ui for base components
- Supabase for everything backend
- TanStack Query v5 for all server state
- Framer Motion for the hero slider, modal transitions, cart drawer
- Zod + React Hook Form for all forms

### Brand & Design Rules
- CoZeo is a **streetwear brand** — bold, urban, dark aesthetic
- The Velora site uses dark photography, high-contrast typography, minimal color
- Replicate Velora's visual language exactly — don't use the previous generic e-commerce PRD's design
- CoZeo color tokens (below) replace Webflow's hardcoded colors
- Currency: always ₹ (INR), not $ USD
- Product sizes: `S / M / L / XL / XXL` (use these, not "Small/Standard")
- Product categories: primary = **Man** and **Woman**; sub-categories added later

### Product Data Model Changes vs Previous PRD
- Products have **both** `sizes[]` AND `colors[]`
- Products have a `badge` field: `null | 'sale' | 'drop' | 'new'`
- Products have a `specs` JSONB field for the specs table
- Products have an `is_spotlight` boolean (for the spotlight section on home)

---

## Design System

### Typography
```html
<!-- index.html -->
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Inter:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet"/>
```

| Role | Font | Used For |
|------|------|----------|
| Headings | Space Grotesk | h1–h4, product names, section titles, brand logo |
| Body | Inter | Descriptions, labels, form fields, paragraphs |
| Mono | JetBrains Mono | Prices, badges, order IDs, code |

### CSS Variables — Complete Token Set

```css
/* src/index.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {

  /* ══════════════════════════════════════
     LIGHT MODE
     ══════════════════════════════════════ */
  :root {
    /* Page */
    --background:           79 57% 95%;    /* #f7f9f0  warm off-white page bg   */
    --foreground:           202 52% 17%;   /* #1a2e3d  dark navy primary text   */

    /* Primary (dark navy — the main brand colour) */
    --primary:              202 52% 17%;   /* #1a2e3d                           */
    --primary-foreground:   79 57% 95%;    /* #f7f9f0                           */

    /* Accent (teal-blue) */
    --accent:               204 42% 27%;   /* #2a4a5c                           */
    --accent-glow:          204 50% 35%;   /* #3d6478                           */
    --accent-foreground:    79 57% 95%;    /* #f7f9f0                           */

    /* Secondary (light sage — chips, pills, tags) */
    --secondary:            84 14% 93%;    /* #eef0ed                           */
    --secondary-foreground: 202 52% 17%;   /* #1a2e3d                           */

    /* Muted */
    --muted:                84 14% 93%;    /* #eef0ed                           */
    --muted-foreground:     202 20% 38%;   /* #6b7d8a  subdued text             */

    /* Borders / Inputs */
    --border:               84 10% 88%;    /* #e4e6e2                           */
    --input:                84 10% 88%;    /* #e4e6e2                           */
    --ring:                 202 52% 17%;   /* #1a2e3d  focus rings              */

    /* Semantic */
    --success:              152 60% 42%;   /* #22a05e  delivered, in stock      */
    --destructive:          0 84% 60%;     /* #ef4444  errors, cancelled        */
    --destructive-foreground: 0 0% 98%;
    --warning:              38 92% 50%;    /* #f59e0b  pending, partial         */

    /* Cards */
    --card:                 0 0% 100%;     /* #ffffff  white cards              */
    --card-foreground:      202 52% 17%;

    /* Popover / Dropdown */
    --popover:              0 0% 100%;
    --popover-foreground:   202 52% 17%;

    /* Border radius */
    --radius:               0.625rem;      /* 10px                              */

    /* Gradients */
    --gradient-hero:   linear-gradient(135deg, hsl(202,52%,17%) 0%, hsl(204,42%,27%) 100%);
    --gradient-accent: linear-gradient(135deg, hsl(204,42%,27%) 0%, hsl(204,50%,35%) 100%);
    --gradient-subtle: linear-gradient(180deg, hsl(79,57%,95%) 0%, hsl(84,14%,93%) 100%);
    --gradient-dark:   linear-gradient(135deg, hsl(202,52%,8%) 0%, hsl(204,42%,14%) 100%);
  }

  /* ══════════════════════════════════════
     DARK MODE
     ══════════════════════════════════════ */
  .dark {
    --background:           202 52% 8%;    /* #0f1a22  deep dark navy           */
    --foreground:           79 57% 95%;    /* #f7f9f0  cream white text         */

    --primary:              79 57% 92%;    /* #eef2e5  cream on dark            */
    --primary-foreground:   202 52% 10%;   /* #111d26                           */

    --accent:               204 42% 38%;   /* #4a7a94                           */
    --accent-glow:          204 50% 48%;   /* #5a96b0                           */
    --accent-foreground:    79 57% 95%;

    --secondary:            202 40% 15%;   /* #1e2d38                           */
    --secondary-foreground: 79 57% 88%;

    --muted:                202 35% 13%;   /* #192530                           */
    --muted-foreground:     202 20% 58%;   /* #8fa4b2                           */

    --border:               202 35% 20%;   /* #263542                           */
    --input:                202 35% 20%;
    --ring:                 204 42% 38%;

    --success:              152 50% 48%;   /* #35a869                           */
    --destructive:          0 72% 58%;     /* #e05050                           */
    --destructive-foreground: 0 0% 98%;
    --warning:              38 85% 56%;    /* #f5a822                           */

    --card:                 202 45% 11%;   /* #141f2a  dark card bg             */
    --card-foreground:      79 57% 95%;
    --popover:              202 45% 11%;
    --popover-foreground:   79 57% 95%;

    --gradient-hero:   linear-gradient(135deg, hsl(202,52%,10%) 0%, hsl(204,42%,20%) 100%);
    --gradient-accent: linear-gradient(135deg, hsl(204,42%,20%) 0%, hsl(204,50%,28%) 100%);
    --gradient-subtle: linear-gradient(180deg, hsl(202,52%,8%) 0%, hsl(202,40%,11%) 100%);
    --gradient-dark:   linear-gradient(135deg, hsl(202,52%,5%) 0%, hsl(204,42%,10%) 100%);
  }

  /* ══════════════════════════════════════
     BASE RESETS
     ══════════════════════════════════════ */
  * { @apply border-border; box-sizing: border-box; }
  html { scroll-behavior: smooth; }
  body {
    @apply bg-background text-foreground font-body antialiased;
    font-feature-settings: "rlig" 1, "calt" 1;
  }
  h1, h2, h3, h4, h5, h6 { @apply font-heading; }
  ::selection {
    background: hsl(var(--accent) / 0.2);
    color: hsl(var(--foreground));
  }
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: hsl(var(--background)); }
  ::-webkit-scrollbar-thumb { background: hsl(var(--border)); border-radius: 3px; }
  ::-webkit-scrollbar-thumb:hover { background: hsl(var(--muted-foreground)); }
}

@layer components {
  .gradient-hero   { background: var(--gradient-hero); }
  .gradient-accent { background: var(--gradient-accent); }
  .gradient-dark   { background: var(--gradient-dark); }
  .text-gradient {
    background: var(--gradient-accent);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .card-hover { @apply transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5; }
}
```

### Color Cheat Sheet

| Goal | Class to Use | Light Hex |
|------|-------------|-----------|
| Page background | `bg-background` | `#f7f9f0` |
| Main text | `text-foreground` | `#1a2e3d` |
| Primary button | `bg-primary text-primary-foreground` | `#1a2e3d` / `#f7f9f0` |
| Hover / active | `hover:bg-accent` | `#2a4a5c` |
| Subtle glow | `bg-accent-glow` | `#3d6478` |
| Card bg | `bg-card` | `#ffffff` |
| Chip / tag bg | `bg-secondary text-secondary-foreground` | `#eef0ed` |
| Placeholder text | `text-muted-foreground` | `#6b7d8a` |
| Dividers | `border-border` | `#e4e6e2` |
| Success | `text-success bg-success/10` | `#22a05e` |
| Error / cancel | `text-destructive bg-destructive/10` | `#ef4444` |
| Warning | `text-warning bg-warning/10` | `#f59e0b` |
| Hero gradient | `gradient-hero` (custom class) | dark navy→teal |
| Dark CTA banner | `gradient-dark` | very dark navy |
| Product badge Sale | `bg-destructive text-white` | red |
| Product badge Drop | `bg-primary text-primary-foreground` | dark navy |
| Product badge New | `bg-success text-white` | green |

### Product Badge Classes
```tsx
const badgeStyles = {
  sale: 'bg-destructive text-white',
  drop: 'bg-primary text-primary-foreground',
  new:  'bg-success text-white',
}
// Font: font-mono text-xs uppercase tracking-widest px-2 py-0.5 rounded
```

---

## Phase 0 — Project Scaffold

**Goal:** Running dev server, all deps installed, Supabase client ready, dark mode toggle works.

### Task 0.1 — Scaffold & Install
```bash
npm create vite@latest cozeo -- --template react-ts && cd cozeo && npm install

npm install react-router-dom @tanstack/react-query @tanstack/react-query-devtools \
  framer-motion react-hook-form @hookform/resolvers zod recharts \
  @supabase/supabase-js clsx tailwind-merge lucide-react date-fns sonner

npm install -D tailwindcss postcss autoprefixer @types/node

npx tailwindcss init -p
```

### Task 0.2 — Tailwind Config
```js
// tailwind.config.js
module.exports = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        heading: ['"Space Grotesk"', 'sans-serif'],
        body:    ['"Inter"', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        background:   'hsl(var(--background) / <alpha-value>)',
        foreground:   'hsl(var(--foreground) / <alpha-value>)',
        primary:    { DEFAULT: 'hsl(var(--primary) / <alpha-value>)', foreground: 'hsl(var(--primary-foreground) / <alpha-value>)' },
        secondary:  { DEFAULT: 'hsl(var(--secondary) / <alpha-value>)', foreground: 'hsl(var(--secondary-foreground) / <alpha-value>)' },
        accent:     { DEFAULT: 'hsl(var(--accent) / <alpha-value>)', glow: 'hsl(var(--accent-glow) / <alpha-value>)' },
        muted:      { DEFAULT: 'hsl(var(--muted) / <alpha-value>)', foreground: 'hsl(var(--muted-foreground) / <alpha-value>)' },
        border:     'hsl(var(--border) / <alpha-value>)',
        input:      'hsl(var(--input) / <alpha-value>)',
        ring:       'hsl(var(--ring) / <alpha-value>)',
        card:       { DEFAULT: 'hsl(var(--card) / <alpha-value>)', foreground: 'hsl(var(--card-foreground) / <alpha-value>)' },
        success:    'hsl(var(--success) / <alpha-value>)',
        destructive:'hsl(var(--destructive) / <alpha-value>)',
        warning:    'hsl(var(--warning) / <alpha-value>)',
      },
      borderRadius: { lg: 'var(--radius)', md: 'calc(var(--radius) - 2px)', sm: 'calc(var(--radius) - 4px)' },
    },
  },
  plugins: [],
}
```

### Task 0.3 — shadcn-ui Init + Components
```bash
npx shadcn-ui@latest init
npx shadcn-ui@latest add button card input label select textarea badge
npx shadcn-ui@latest add dialog sheet drawer popover tooltip tabs
npx shadcn-ui@latest add table form checkbox radio-group switch
npx shadcn-ui@latest add dropdown-menu separator avatar skeleton toast
npx shadcn-ui@latest add alert accordion
```

### Task 0.4 — Vite Config with Path Alias
```ts
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
export default defineConfig({
  plugins: [react()],
  resolve: { alias: { '@': path.resolve(__dirname, './src') } }
})
```
Add to `tsconfig.json`: `"baseUrl": ".", "paths": { "@/*": ["./src/*"] }`

### Task 0.5 — Environment Variables
```bash
# .env.local
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxx
VITE_APP_URL=http://localhost:5173
VITE_APP_NAME=CoZeo
VITE_UPI_ID=cozeo@upi
```

### Task 0.6 — Supabase Client
```ts
// src/integrations/supabase/client.ts
import { createClient } from '@supabase/supabase-js'
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)
```

### Task 0.7 — Global Types
```ts
// src/types/index.ts
export type ProductBadge = 'sale' | 'drop' | 'new' | null
export type ProductSize = 'S' | 'M' | 'L' | 'XL' | 'XXL'
export type ProductColor = string   // e.g. "White", "Black", "Grey"

export interface ProductSpecs {
  fabric_type?:       string  // "100% Cotton"
  fit_style?:         string  // "Regular Fit" | "Oversized"
  neckline?:          string  // "Crew Neck" | "Hoodie"
  sleeve_length?:     string  // "Half Sleeve" | "Full Sleeve"
  pattern?:           string  // "Solid Color" | "Graphic Print"
  finish?:            string  // "Soft-touch Fabric"
  care_instructions?: string  // "Machine Wash Cold"
}

export interface Product {
  id: string
  name: string
  slug: string             // URL-friendly name e.g. "shadow-drip"
  description: string | null
  long_description: string | null
  price: number
  discount_price: number | null
  stock: number
  category: 'man' | 'woman' | string
  badge: ProductBadge
  images: string[]
  sizes: ProductSize[]
  colors: ProductColor[]
  specs: ProductSpecs
  rating: number
  review_count: number
  is_featured: boolean   // shows in Featured Drops carousel
  is_spotlight: boolean  // shows in the single Spotlight section on home
  is_active: boolean
  created_at: string
  updated_at: string
}

export type OrderStatus =
  | 'pending' | 'confirmed' | 'packed'
  | 'shipped' | 'arrived' | 'delivered'
  | 'cancelled' | 'return_requested' | 'returned'

export type PaymentMethod = 'upi' | 'razorpay' | 'cod'
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded'
export type CouponType = 'percentage' | 'flat' | 'free_shipping'

export interface CartItem {
  productId: string
  name: string
  image: string
  price: number
  originalPrice: number
  size: ProductSize
  color: ProductColor
  quantity: number
  maxStock: number
}

export interface StatusHistoryEntry {
  status: OrderStatus
  timestamp: string
  note: string | null
  updated_by: string | null
}

// ... (Order, OrderItem, Coupon, Notification, Profile, Return — same as before)
```

### Task 0.8 — Utility Helpers
```ts
// src/lib/utils.ts
export const cn = (...inputs) => twMerge(clsx(inputs))
export const formatPrice = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)
export const formatDate = (d: string | Date) =>
  new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(d))
```

### Task 0.9 — Dark Mode Hook
```ts
// src/hooks/useDarkMode.ts
// Reads from localStorage 'cozeo-theme', falls back to system preference
// Toggles .dark class on document.documentElement
// Persists to localStorage on change
```

**Phase 0 ✓** — `npm run dev` opens at localhost:5173 without errors.

---

## Phase 1 — Database Schema

**Goal:** All Supabase tables live, RLS on every table, Storage buckets ready.

### Task 1.1 — Products Table
```sql
create table public.products (
  id               uuid primary key default gen_random_uuid(),
  name             text not null,
  slug             text unique not null,        -- URL slug e.g. "shadow-drip"
  description      text,                        -- short (1-2 lines, shown on card)
  long_description text,                        -- full Description tab content
  price            numeric(10,2) not null check (price >= 0),
  discount_price   numeric(10,2) check (discount_price >= 0),
  stock            integer not null default 0 check (stock >= 0),
  category         text not null,               -- 'man' | 'woman'
  badge            text check (badge in ('sale','drop','new')),
  images           text[] default '{}',
  sizes            text[] default '{}',         -- ['S','M','L','XL','XXL']
  colors           text[] default '{}',         -- ['White','Black']
  specs            jsonb default '{}',          -- ProductSpecs shape
  rating           numeric(3,2) default 0,
  review_count     integer default 0,
  is_featured      boolean default false,       -- Featured Drops carousel
  is_spotlight     boolean default false,       -- Home spotlight section (only 1 at a time)
  is_active        boolean default true,
  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);
create index on public.products(category);
create index on public.products(is_featured) where is_featured = true;
create index on public.products(is_spotlight) where is_spotlight = true;
create index on public.products(badge);
create index on public.products(slug);

alter table public.products enable row level security;
create policy "Products readable by all"   on public.products for select using (true);
create policy "Admins manage products"     on public.products for all using (
  exists (select 1 from public.user_roles where user_id = auth.uid() and role = 'admin')
);
```

### Task 1.2 — Auth Tables (Profiles + Roles)
```sql
-- Same as previous PRD Phase 2 Task 2.1
-- profiles: id, name, email, phone, address, city, state, pincode, avatar_url
-- user_roles: user_id, role (enum: admin/customer)
-- Trigger: handle_new_user() → auto-create profile + assign customer role
-- RLS on both tables
```

### Task 1.3 — Orders + Order Items
```sql
-- order_status enum: pending, confirmed, packed, shipped, arrived,
--                    delivered, cancelled, return_requested, returned
-- orders: id, user_id, status, status_history (jsonb[]), subtotal,
--         discount_amount, total, coupon_code, payment_method,
--         payment_status, payment_id, shipping_*, notes, created_at
-- order_items: id, order_id, product_id, product_name, product_image,
--              size, color, quantity, unit_price, total_price
-- RLS: users read/insert own, admins manage all
```

### Task 1.4 — Coupons, Giveaway, Returns, Notifications
```sql
-- coupons: id, code (unique), type (percentage/flat/free_shipping),
--          value, minimum_order, max_discount, expiry, usage_limit, used_count, is_active
-- giveaway_entries: id, name, email, phone, college, instagram, twitter,
--                   image_url, is_winner, created_at
-- returns: id, order_id, user_id, reason, description, images[],
--          status (requested/approved/rejected/completed), resolution, admin_note
-- notifications: id, user_id, type, title, message, order_id, is_read, created_at
-- RLS on all — see previous build guide for full policies
```

### Task 1.5 — RPC Functions
```sql
-- decrement_stock(p_product_id uuid, p_qty integer) → boolean
--   Atomically decrements stock if sufficient, returns false if not enough stock

-- validate_coupon(p_code text, p_cart_total numeric) → table(valid, error_message, ...)
--   Full coupon validation: active check, expiry, usage limit, min order, discount calc
```

### Task 1.6 — Storage Buckets
| Bucket | Public | Used For |
|--------|--------|----------|
| `product-images` | Yes | Product photos |
| `avatars` | Yes | User profile pictures |
| `giveaway-entries` | No | Contest entry photos |
| `return-images` | No | Return request photos |

### Task 1.7 — Seed Products (Matching Velora Catalog)

Insert the 6 products from Velora as starting data:

```sql
insert into public.products (name, slug, description, price, discount_price, category, badge, sizes, colors, is_featured, is_spotlight)
values
  ('Shadow Drip',          'shadow-drip',    'Sleek minimalist hoodie, dark tones, reflective accents.',     6999, 5999, 'man',   'sale', ARRAY['S','M','L','XL'], ARRAY['White','Black'], false, true),
  ('Urban Phantom',        'urban-phantom',  'Oversized hoodie with graphics, stealthy city aesthetic.',    7999, null, 'man',   'drop', ARRAY['S','M','L','XL','XXL'], ARRAY['Black'], true, false),
  ('Neon Rebellion',       'neon-rebellion', 'Vibrant neon details, rebellious street art influences.',      6499, null, 'man',   'new',  ARRAY['S','M','L','XL'], ARRAY['White','Black'], true, false),
  ('Crop Top',             'crop-top',       'Sleek modern crop top for effortless layering.',               3499, null, 'woman', null,   ARRAY['S','M','L'],      ARRAY['White','Black'], true, false),
  ('Spring Jacket',        'spring-jacket',  'Lightweight versatile jacket, comfort and style.',             8999, null, 'woman', null,   ARRAY['S','M','L','XL'], ARRAY['Black'], true, false),
  ('Nightfall Hoodie',     'nightfall-hoodie','Heavyweight ultra-soft hoodie, faded wash, embroidered.',    6999, null, 'man',   null,   ARRAY['S','M','L','XL','XXL'], ARRAY['Black','Grey'], true, false);
```

**Phase 1 ✓** — All tables in Supabase, sample products visible in dashboard, storage buckets created.

---

## Phase 2 — Authentication (Modal-Based)

**Goal:** Login + Signup as **modal popups** (as in Velora), not separate pages. Session management via Supabase.

### Task 2.1 — AuthContext
```tsx
// src/contexts/AuthContext.tsx
// Provides: user, profile, role, isAdmin, isLoading
// Methods: signIn, signUp, signOut, resetPassword, updateProfile
// On mount: onAuthStateChange subscription
// Fetches profile + role from Supabase on user login
```

### Task 2.2 — AuthModal Component

```tsx
// src/components/AuthModal.tsx
// A single component with two states: 'login' | 'signup'
// Rendered as a shadcn Dialog (full-screen on mobile, centered card on desktop)
// Triggered by: header user icon, "Add to Cart" if not logged in, protected route access

// Login form:
//   Email, Password (with show/hide toggle)
//   "Remember me" checkbox
//   "Lost your password?" → triggers ForgotPasswordModal
//   [Sign In] button
//   "Or login with" → Google button (UI only, disabled in v1 with "Coming soon" tooltip)
//   Switch: "No account yet? Create an Account"

// Signup form:
//   Full Name, Email, Password
//   "Or Signup with" → Google button (UI only)
//   Switch: "Already have an account? Login"

// Transition between login/signup: smooth fade (Framer Motion AnimatePresence)
```

### Task 2.3 — ForgotPasswordModal

Separate small Dialog. Single email field. Sends Supabase reset email.
Shows "Check your email" success state in same modal.

### Task 2.4 — ResetPassword Page (`/reset-password`)

The only standalone auth page (must be a real page for the email redirect link to work).
Simple centered card with new password + confirm.

### Task 2.5 — ProtectedRoute & AdminRoute

```tsx
// ProtectedRoute: if not logged in → open AuthModal (don't navigate away)
// AdminRoute: if not admin → redirect to /dashboard
```

### Task 2.6 — useAuthModal Hook

```ts
// src/hooks/useAuthModal.ts
// Global state: isOpen, mode ('login'|'signup')
// Methods: openLogin(), openSignup(), close()
// Used by: Header user icon, ProductCard "Add to Cart", ProtectedRoute
```

**Phase 2 ✓** — Can register, login, logout via modal. Sessions persist on refresh.

---

## Phase 3 — Core Layout

**Goal:** Announcement bar, header with cart drawer, footer. Exact Velora structure.

### Task 3.1 — AnnouncementBar Component

```tsx
// src/components/layout/AnnouncementBar.tsx
// Thin strip: bg-primary text-primary-foreground
// Text: "Exclusive Gift on Orders Over ₹1500"  (centered)
// Dismissable: X button right side, hides for session on dismiss
// Mobile: font size smaller, text truncated if needed
```

### Task 3.2 — Header Component

```
[Announcement Bar]
──────────────────────────────────────────────────────────
CoZeo     Home  Shop  About Us  Collection  Category  Giveaway      🔔  🛒3  👤
──────────────────────────────────────────────────────────
```

Behaviour:
- `sticky top-0 z-50`
- **Transparent** on home page when scrolled to top (hero shows through)
- **White/card** with `backdrop-blur-md shadow-sm` after scrolling 50px
- Mobile: hamburger → slide-out Sheet (shadcn) from left
- Cart icon: shows item count badge (`bg-destructive text-white rounded-full`)
- User icon: if logged in → dropdown (Dashboard, Admin if admin, Logout). If not → opens AuthModal
- Dark mode toggle (sun/moon icon)
- Notification bell (Phase 8)

Nav links (desktop, horizontal): `Home Shop About\ Us Collection Category Giveaway`

### Task 3.3 — CartDrawer Component

```tsx
// src/components/CartDrawer.tsx
// shadcn Sheet, side="right", open state via CartContext
// Width: 400px desktop, full-width mobile

// Header: "Your Cart" + X close button + item count
// Body (scrollable):
//   Empty state: cart icon + "No items found." (matches Velora)
//   Item list: product image (60×60) | name + size + color | qty stepper | price | Remove link
// Footer (sticky):
//   Subtotal: ₹X
//   [Continue to Checkout] button (full width, primary)
//   "Pay with browser" option hint (optional)

// Framer Motion: slide in from right
```

### Task 3.4 — Footer Component

```
CoZeo                    Menu              Pages             Social
Streetwear for the       Home              Home              LinkedIn
Bold, Built for the      Shop              License           Instagram
Movement.                About Us          Changelog         Twitter
                         Collection        Style Guide       Facebook
                         Category          Support           TikTok

© Copyright CoZeo | Made in India
```

Background: `bg-primary text-primary-foreground`
Divider line above copyright.

### Task 3.5 — MainLayout Component

```tsx
// src/components/layout/MainLayout.tsx
// Renders: <AnnouncementBar /> + <Header /> + <Outlet /> + <Footer />
// + <CartDrawer /> (always mounted, controlled by open state)
// + <AuthModal /> (always mounted, controlled by useAuthModal)
```

### Task 3.6 — AdminLayout Component

Left sidebar (240px) + main content. Same specs as before.
Sidebar header: "CoZeo Admin" with back-to-store link.
Dark sidebar: `bg-primary text-primary-foreground`.

**Phase 3 ✓** — Header renders with cart drawer working, footer visible, auth modal opens from user icon.

---

## Phase 4 — Home Page

**Goal:** All 9 sections of the Velora homepage, pixel-faithful to the reference.

### Task 4.1 — HeroSlider Component

```tsx
// src/components/home/HeroSlider.tsx
// Full-viewport height slider (min-h-screen)
// 4 slides — each has:
//   - Full-bleed background image (from Velora CDN or local assets)
//   - Dark overlay (bg-black/40) for text legibility
//   - Content (bottom-left aligned, desktop): slide number (01/02...), heading (h1 60px Space Grotesk), CTA
//   - "Shop now →" button: outlined white, arrow SVG animates right on hover

// Behaviour:
//   - Auto-plays every 5s
//   - Slide counter dots (bottom-center)
//   - Previous/next arrows (sides, appear on hover)
//   - Framer Motion: slides fade + slide horizontally

// Slide content:
// Slide 1: "Limited Drops, Maximum Impact"
// Slide 2: "Future-Ready Fashion"
// Slide 3: "Art Meets Attitude"
// Slide 4: "Built for the Streets"
```

### Task 4.2 — NewDrops Section

```tsx
// Heading: "new drops" (lowercase, Space Grotesk, large)
// Sub: "Stand out with our latest collection—bold designs, premium fabrics..."
// 3-col product grid (ProductCard components)
// Fetches products ordered by created_at desc, limit 3
// "new drops" label style matches Velora: lowercase italic or decorative
```

### Task 4.3 — AboutMini Section

Two side-by-side sub-blocks (stacked on mobile):

**Left block:**
- Heading: "Built by the Streets, Made for You"
- Sub: "From the streets to your style—our journey is all about self-expression..."
- "Shop now →" CTA

**Right block:**
- Heading: "Elevate Your Street Game"
- Sub: "From bold graphics to everyday essentials, explore our latest drops..."
- "Shop collections →" CTA (links to `/shop`)

Background: `bg-secondary` (light sage / dark secondary).

### Task 4.4 — BrandStory Section

```
Streetwear with a Story

"Wear the Movement, Break the Mold."

Brand story paragraph (2×) describing the street culture roots...
[Get it now →]

Right side: large brand/product image
```

Layout: 2-col on desktop (text left, image right). Text col has decorative label "Streetwear with a Story" above headline.

### Task 4.5 — FeaturedCarousel Component

```tsx
// src/components/home/FeaturedCarousel.tsx
// Heading: "Featured Drops: Stand Out, Stay Ahead"
// Sub: "Exclusive designs, premium materials..."
// Horizontal scroll carousel with prev/next arrows
// Shows 4 cards desktop, 2 tablet, 1 mobile (peek next card)
// Each card: product image, product name, short description
// Cards are STATIC display (click → product detail) — no "add to cart" on this
// Fetches: is_featured = true, limit 6
// Framer Motion: drag-to-scroll on mobile
```

### Task 4.6 — SpotlightProduct Section

```tsx
// src/components/home/SpotlightProduct.tsx
// Full-width section, 2-col: left=text, right=image gallery

// Left:
//   Badge: small label (e.g. "New Drop")
//   Product name (h2, large)
//   Price
//   Description (2-3 lines)
//   "Shop now →" button

// Right:
//   Main large image
//   Row of 4 thumbnails (clicking changes main image)
//   Framer Motion: thumbnail click → fade-slide main image

// Fetches: is_spotlight = true, limit 1
```

### Task 4.7 — JoinMovement CTA Section

```
Full-width dark banner (gradient-dark background)
White text:
  "Join the Movement. Wear the Future."
  "Streetwear designed for those who break the mold..."
  [Shop now →] button (outlined white)
```

### Task 4.8 — WhyShopWithUs Section

4-column grid (2×2 on mobile):

| Icon | Title | Description |
|------|-------|-------------|
| Delivery truck SVG | Free delivery | No extra shipping costs |
| Lock SVG | 100% secure payment | Encrypted, trusted methods |
| Refresh SVG | 30 days return | Hassle-free return/exchange |
| Headset SVG | 24/7 support | Team available anytime |

Use the same SVG icons from Velora (or lucide-react equivalents: `Truck`, `Lock`, `RefreshCw`, `Headphones`).
Background: `bg-secondary`.

### Task 4.9 — CategoryCards Section

```tsx
// Two large cards side by side (stacked on mobile)
// Each card: full-bleed background image (man.jpeg / woman.jpeg)
//   Dark overlay gradient (bottom-up: transparent → black/60)
//   Category label: "Man" / "Woman" (h2, white, bottom-left)
//   Hover: scale image 1.05, darker overlay
// Click → /category/man or /category/woman
```

### Task 4.10 — NewsletterSection

Centered:
- Heading: "Subscribe to our newsletter now!"
- Sub: "Get exclusive drops, deals, and street style updates delivered weekly."
- Email input + "Subscribe" button (inline on desktop)
- Success / error states
- Inserts into `newsletter_subscribers` table (simple: email, created_at)

**Phase 4 ✓** — Full home page matches Velora layout section by section.

---

## Phase 5 — Shop & Category Pages

**Goal:** `/shop` listing page and `/category/:slug` pages with filtering.

### Task 5.1 — Shop Page (`/shop`)

This is the full product catalogue. Replicate Velora's category page layout but with filters added.

**Layout:**
- Page header section: "Shop" heading, breadcrumb
- Filters sidebar (left, 260px, sticky desktop) / bottom Sheet on mobile:
  - Category: `○ Man  ○ Woman  ○ All` (radio)
  - Badge: `☐ Sale  ☐ New  ☐ Drop` (checkbox)
  - Price range: dual slider ₹0 – ₹15000
  - Size: S / M / L / XL / XXL chips (toggle)
  - In stock only: toggle
  - [Clear All Filters] link
- Product grid: 3-col desktop, 2-col tablet, 1-col mobile
- Sort dropdown (top-right of grid): Newest, Price Low–High, Price High–Low, Best Rating
- Product count: "Showing X products"
- Load More button (append next 12)
- All filter state synced to URL params

### Task 5.2 — Category Page (`/category/:slug`)

Matches Velora's `/category/man` and `/category/woman` exactly:
- Breadcrumb: Home > Category > Man
- Heading: "Man" or "Woman" (large, Space Grotesk)
- 2-col product grid (matches Velora screenshot)
- Each card uses ProductCard component
- Same data as Shop but pre-filtered by category

### Task 5.3 — ProductCard Component

```tsx
// src/components/ProductCard.tsx
// Exactly matches Velora's category page card:

// Container: rounded-2xl overflow-hidden card-hover
// Image area: aspect-ratio 3/4, overflow-hidden
//   - img with hover scale (group-hover:scale-105 transition-transform duration-500)
//   - Badge: absolute top-left, pill (Sale/Drop/New per badgeStyles above)
// Content padding:
//   - Name: font-heading font-semibold text-lg line-clamp-2
//   - Description: text-muted-foreground text-sm line-clamp-2 (matches Velora cards)
//   - Price row: discount price (font-mono font-bold) + original crossed out

// Hover actions:
//   - Quick-add button slides up from bottom (group-hover:translate-y-0)
//   - Size selector inline popover (if product has sizes)
//   - Color selector dots

// Click anywhere (except quick-add) → /product/:slug
```

### Task 5.4 — Product Detail Page (`/product/:slug`)

**Replicate Velora's product page exactly:**

Breadcrumb: Home > Product Detail (match Velora)

**Left column:**
- Main image: large, square-ish, rounded-2xl
- 3 thumbnail images below (same image repeated in Velora — use actual product images)
- Clicking thumbnail swaps main image (Framer Motion crossfade)

**Right column:**
```
[Product Name]   ← h2, font-heading
★★★★★  (3 reviews)

₹5,999   ₹6,999  ← sale price + crossed original
                    (only if discount_price exists)

[Short description paragraph]

Size
[S] [M] [L] [XL]   ← toggle buttons
                      selected: bg-primary text-primary-foreground
                      unselected: bg-secondary border-border
                      Required before add to cart

Color
[●White] [●Black]   ← circular dot buttons, selected: ring-2 ring-primary

Quantity
[−] [1] [+]

[Buy Now]           ← full width, bg-primary, goes straight to /checkout with this item
[Add to Cart]       ← full width, outlined, adds to cart drawer

⚠ "Out of stock." if stock === 0
```

**Below fold — 3 tabs (match Velora):**

**Tab 1 — Product Info (default):**
Specs table:
```
Fabric Type         | 100% Cotton
Fit Style           | Regular Fit
Neckline            | Crew Neck
Sleeve Length       | Half Sleeve
Pattern             | Solid Color
Finish              | Soft-touch Fabric
Care Instructions   | Machine Wash Cold
```
Rendered from `product.specs` JSONB. Skip rows where value is null.

**Tab 2 — Description:**
Long form text from `product.long_description`.

**Tab 3 — Reviews:**
```
[Avatar] Steven Rich        Jan 14, 2025
         ★★★★★
         "I'm really impressed with this shirt!..."

[Avatar] Cobus Besten       Jan 14, 2025
         ★★★★★
         "This shirt exceeded my expectations..."
```
Fetched from `reviews` table. Empty state: "No reviews yet. Be the first!"
Reviews added in Phase 9 (Post-launch).

### Task 5.5 — Giveaway Page (`/giveaway`)

New page — CoZeo addition, not in Velora. Style it to match CoZeo brand:

**Hero banner:** `gradient-hero` bg, white text.
- Heading: "Win Free CoZeo Drops 🎁"
- Sub: "Enter our giveaway for a chance to win exclusive streetwear"
- Prize list: T-shirt + Hoodie + Cap

**Entry Form (card below hero):**
```
Full Name *
Email Address *
Phone
College / University
Instagram Handle (@)
Twitter / X Handle (@)
Upload Your Photo * (drag-drop zone, single image → giveaway-entries bucket)
☐ I agree to the terms and conditions *
[Submit My Entry →]
```

On submit:
- Check duplicate email → "You've already entered! Good luck 🤞"
- Success: confetti animation (Framer Motion), "You're in! 🎉 We'll announce the winner soon."
- Insert into `giveaway_entries` table

**Rules section** below form: collapsible accordion with eligibility, deadline, winner announcement.

**Phase 5 ✓** — Full storefront browsable, products linked from home page, product detail tabs work.

---

## Phase 6 — Cart & Checkout

### Task 6.1 — CartContext + CartDrawer Wire-Up

```ts
// CartContext provides:
//   items: CartItem[]  — persisted to localStorage 'cozeo-cart'
//   isOpen: boolean    — controls CartDrawer visibility
//   addItem(product, size, color, qty)
//   removeItem(productId, size, color)
//   updateQty(productId, size, color, newQty)
//   clearCart()
//   openCart() / closeCart()
//   subtotal, discountAmount, total, appliedCoupon
//   applyCoupon(code) / removeCoupon()
```

### Task 6.2 — Cart Page (`/cart`)

Separate page (also exists alongside the drawer — for fuller cart management):
- Same items as drawer but in full table layout
- Coupon code input + Apply button
- Order summary sidebar
- "Continue to Checkout" → `/checkout`
- Empty state: "Your cart is empty" + "Start Shopping" CTA

### Task 6.3 — Checkout Page (`/checkout`)

**Two-step wizard:**

Step 1 — Shipping:
```
Full Name *    Phone *
Address *
City *         Pincode *
State (Indian states dropdown) *
Order notes (optional)
[Use saved address] ← prefill from profile if logged in
[Continue →]
```

Step 2 — Payment (3 tabs):
- **UPI**: Show `VITE_UPI_ID`, amount, reference number. "I've paid" button → order pending manual verify
- **Razorpay**: Opens Razorpay modal (card/netbanking/UPI). Full integration Phase 10
- **COD**: "Place Order — Pay on Delivery" → auto-confirms

Order summary always visible (right column desktop, above on mobile).

On success:
1. Create `orders` row
2. Create `order_items` rows
3. Decrement stock via RPC
4. Increment coupon used_count if applied
5. Clear cart
6. → `/order-confirmation/:id`

### Task 6.4 — Stock Pre-validation

Re-check stock for all cart items before allowing payment step. Show per-item errors if out of stock.

### Task 6.5 — Order Confirmation Page (`/order-confirmation/:id`)

```
✅ (animated green checkmark, Framer Motion spring)
Order Placed!
Order #CZ-2026-00042

[Items table]
[Shipping address]
[Payment method + amount]

[Track My Order →]   [Continue Shopping]
```

**Phase 6 ✓** — Can add to cart from product page, complete checkout, see order in Supabase.

---

## Phase 7 — Order Tracking

### Task 7.1 — OrderTracker Component

```tsx
// src/components/OrderTracker.tsx
// 5-step horizontal tracker

const STAGES = [
  { key: 'confirmed', label: 'Confirmed', icon: '📋' },
  { key: 'packed',    label: 'Packed',    icon: '📦' },
  { key: 'shipped',   label: 'Shipped',   icon: '🚚' },
  { key: 'arrived',   label: 'Arrived',   icon: '📍' },
  { key: 'delivered', label: 'Delivered', icon: '✅' },
]

// For each step:
//   Completed (before current): bg-primary text-primary-foreground ✓
//   Active (current): bg-accent ring-4 ring-accent/30
//   Future: bg-secondary border-border text-muted-foreground
// Connector lines: bg-primary if completed, bg-border if future
// Below each step: timestamp from status_history (if available)
// Latest note shown below active step

// Exception states → show coloured banner instead of tracker:
//   cancelled: bg-destructive/10 border-destructive text-destructive "Order Cancelled"
//   return_requested: bg-warning/10 border-warning text-warning "Return in Progress"
```

### Task 7.2 — Tracking Page (`/orders/:id/track`)

**Public URL — no login required** (shareable link).

```
Order #CZ-2026-00042
Placed 12 March 2026

[OrderTracker]

─────────────────────
Items
  [img] Shadow Drip  Size: L  Color: Black  ×1  ₹5,999

─────────────────────
Delivering to
  Rahul S. · Pune · 411001

─────────────────────
[Login to manage]         ← if not logged in
[Cancel Order]            ← if logged in + status is pending/confirmed
[Request Return]          ← if logged in + delivered + within 7 days
```

### Task 7.3 — Admin Order Status Update

In AdminOrders, order row click → detail drawer with:
- Status update dropdown (valid next-status only — see transition rules below)
- Optional note textarea
- "Update Status" button

Valid transitions:
```
pending          → confirmed, cancelled
confirmed        → packed, cancelled
packed           → shipped, cancelled
shipped          → arrived
arrived          → delivered
delivered        → return_requested
return_requested → returned
cancelled        → (terminal — no updates)
returned         → (terminal)
```

On update:
- Write new status + append to `status_history` jsonb array
- Invalidate queries
- Trigger email + notification (Phase 9)

### Task 7.4 — Admin Orders Page

Tabs: All | Pending | Confirmed | Packed | Shipped | Arrived | Delivered | Cancelled | Returns

Each tab shows count badge. Full table with: Order ID, Customer, Date, Total, Payment, Status badge, Actions.
Bulk update: checkbox select + floating action bar.

**Phase 7 ✓** — Tracking page renders with correct stage, admin can update status.

---

## Phase 8 — User Dashboard

### Task 8.1 — Dashboard Shell (`/dashboard`)

URL-driven tabs: `/dashboard`, `/dashboard?tab=orders`, `/dashboard?tab=notifications`

Tabs: Profile | My Orders | Notifications

### Task 8.2 — Profile Tab

Form: Name, Phone, Address, City, State (dropdown), Pincode.
Avatar upload (drag-drop, Supabase `avatars` bucket).
"Save Changes" → update `profiles` table → success toast.
"Delete Account" link at bottom → confirmation dialog.

### Task 8.3 — My Orders Tab

Table (desktop) / card stack (mobile):
```
Order ID    Date        Items    Total    Status     Action
#CZ-00042   12 Mar      3 items  ₹16,497  Shipped    [Track]
#CZ-00038   8 Mar       1 item   ₹5,999   Delivered  [Track] [Return]
```

"Request Return" visible only if: `delivered` + within 7 days of delivery timestamp in `status_history`.

### Task 8.4 — Notifications Tab

Chronological list. Each item:
- Emoji icon (per type)
- Title + message
- Time ago (e.g. "2 hours ago")
- Unread dot (left side)
- Click → marks as read

"Mark all as read" button at top right.

### Task 8.5 — NotificationBell (Header)

Bell icon (lucide `Bell`). Unread count badge.
Popover: latest 5 notifications + "View all" link to `/dashboard?tab=notifications`.
Supabase Realtime subscription for live updates.

**Phase 8 ✓** — Dashboard tabs all functional, notifications bell shows real-time count.

---

## Phase 9 — Admin Panel

### Task 9.1 — Admin Dashboard (`/admin`)

Stats: Total Revenue, Total Orders, Active Products, Total Users.
Charts: Revenue last 30 days (Recharts line), Orders by status (Recharts pie/donut).
Tables: Recent 5 orders, Low-stock products (≤10 units).
Order status counts widget: `📋 Confirmed: 4  📦 Packed: 2  🚚 Shipped: 7`.
Realtime updates via Supabase Realtime on `orders` table.

### Task 9.2 — Admin Products (`/admin/products`)

Table: Thumbnail, Name, Category, Badge, Price, Discount, Stock, Featured, Spotlight, Active, Actions.
"Add Product" → drawer with full form.

Product form:
```
Name *            Slug * (auto-generated from name, editable)
Category:  ○ Man  ○ Woman
Badge:     ○ None  ○ Sale  ○ Drop  ○ New
Price ₹ *         Discount Price ₹
Stock *
Short Description (textarea, 1-2 lines, for cards)
Long Description (textarea, for Description tab)

Sizes (checkboxes): ☐ S  ☐ M  ☐ L  ☐ XL  ☐ XXL
Colors (tag input): type color name + Enter → pill badge with ×

Product Specs:
  Fabric Type     | [input]
  Fit Style       | [input]
  Neckline        | [input]
  Sleeve Length   | [input]
  Pattern         | [input]
  Finish          | [input]
  Care Instructions| [input]

Images (multi-upload, max 5, drag-reorder):
  [Drop images here or click to upload]
  [Preview thumbnails with × delete and drag handle]

☐ Featured (shows in Featured Drops carousel)
☐ Spotlight (shows in homepage spotlight — only 1 active at a time)
☐ Active
```

On save: if `is_spotlight = true`, automatically set all other products' `is_spotlight = false` first.

### Task 9.3 — Admin Orders (`/admin/orders`)

Full spec: Phase 7 Tasks 7.3, 7.4. Plus:
- Search by order ID, customer name/email
- Date range filter
- Export CSV

### Task 9.4 — Admin Coupons (`/admin/coupons`)

Table + create/edit form (spec unchanged from previous PRD).

### Task 9.5 — Admin Users (`/admin/users`)

Table + role toggle. View user's orders in modal.

### Task 9.6 — Admin Giveaway (`/admin/giveaway`)

Card grid of entries (photo, name, college, social handles).
Mark winner toggle, delete, search, filter, export CSV.

### Task 9.7 — Shared Admin Utilities
```ts
// src/lib/uploadImage.ts — upload to any Storage bucket, return public URL
// src/lib/exportCsv.ts — convert array of objects to downloadable CSV
// src/hooks/useAdmin.ts — TanStack Query hooks for all admin resources
//   staleTime: 30s (admin needs fresh data)
```

**Phase 9 ✓** — All 6 admin pages work. Full product CRUD with image upload tested.

---

## Phase 10 — Payments

### Task 10.1 — Razorpay Setup
```html
<!-- index.html -->
<script src="https://checkout.razorpay.com/v1/checkout.js"></script>
```
TypeScript declaration for `window.Razorpay`.

### Task 10.2 — Edge Function: create-razorpay-order
Creates Razorpay order server-side. Returns `razorpay_order_id`.

### Task 10.3 — Razorpay Frontend Flow
Opens Razorpay modal. On success: update order `payment_id`, `payment_status = 'paid'`.
Theme color: `#1a2e3d` (matches CoZeo primary).

### Task 10.4 — Razorpay Webhook
Edge function verifies signature. On `payment.captured`:
- `payment_status = 'paid'`, `status = 'confirmed'`
- Append to `status_history`
- Trigger order email (Phase 11)
- Create notification

### Task 10.5 — UPI Flow
Show UPI ID + reference number. Manual "I've paid" confirmation. Order stays `payment_status = 'pending'` until admin verifies.

### Task 10.6 — COD Flow
Auto-confirm. `payment_status = 'pending'`, `status = 'confirmed'`.

### Task 10.7 — Payment Failure
Show inline error. Retry button (re-opens modal). Don't clear cart. Order stays `payment_status = 'failed'`.

**Phase 10 ✓** — All three payment methods tested end-to-end.

---

## Phase 11 — Emails & Notifications

### Task 11.1 — Set Up Resend
```bash
supabase secrets set RESEND_API_KEY=re_xxxxxxxx
```

### Task 11.2 — Email Brand Colors (Inline CSS)
```
Header bg:   #1a2e3d   Header text: #f7f9f0
Body bg:     #f7f9f0   Body text:   #1a2e3d
Muted:       #6b7d8a   Border:      #e4e6e2
Success:     #22a05e   Font: Arial, Helvetica, sans-serif
```

### Task 11.3 — Edge Function: send-order-email
Triggered post-payment. Sends order confirmation with items table, total, tracking link.

### Task 11.4 — Edge Function: send-status-email
Triggered on every status change. Subject/body per status:

| Status | Subject |
|--------|---------|
| confirmed | "Your CoZeo order is confirmed! 🎉" |
| packed | "Your order is being packed 📦" |
| shipped | "Your order is on its way 🚚" |
| arrived | "Almost there! Your order is nearby 📍" |
| delivered | "Your order has been delivered ✅" |
| cancelled | "Your order has been cancelled" |
| return_requested | "Return request received ↩️" |

### Task 11.5 — In-App Notifications
```ts
// createOrderNotification(userId, orderId, status) → inserts into notifications table
// Called alongside every email trigger
```

### Task 11.6 — Realtime Notification Bell
Supabase Realtime INSERT on `notifications` filtered by `user_id`.
New notification → toast + bell count increments.

**Phase 11 ✓** — All emails confirmed received in Gmail, notifications appear in real time.

---

## Phase 12 — Returns & Refunds

### Task 12.1 — Return Request Page (`/orders/:id/return`)

Accessible only if: logged in + own order + `delivered` + within 7 days of delivered timestamp.

Form:
```
Reason * (select):
  ○ Item arrived damaged
  ○ Wrong item sent
  ○ Size doesn't fit
  ○ Not as described
  ○ Changed my mind
  ○ Other

Description (textarea, optional)
Photos (up to 3, return-images bucket)
Resolution:  ○ Refund   ○ Replacement

[Submit Return Request]
```

On submit: insert into `returns`, update order `status = 'return_requested'`, trigger email.

### Task 12.2 — Admin Returns Management

In AdminOrders — "Returns" tab.
Detail drawer: reason, photos, requested resolution.
Actions: Approve (Refund/Replacement) + note, Reject + reason.
All actions trigger email + notification.

### Task 12.3 — Return Display on Tracking Page

Yellow banner: "Return request in progress".
Mini timeline: Requested → Under Review → Resolved.

### Task 12.4 — Edge Cases

- Block double-submission (check existing `returns` row)
- Return window check via `status_history` delivered timestamp, not `updated_at`
- Admin cannot approve already-resolved returns

**Phase 12 ✓** — Full return flow tested from customer request to admin resolution.

---

## Phase 13 — Launch Prep

### Task 13.1 — Code Split All Routes
```tsx
const Index = lazy(() => import('@/pages/Index'))
// ... all pages
<Suspense fallback={<PageLoader />}><Routes>...</Routes></Suspense>
```

### Task 13.2 — Image Optimisation
- All product images: WebP, max 300KB
- `loading="lazy"` on all below-fold images
- Explicit `width` + `height` to prevent layout shift
- Hero images: `loading="eager"` + preload link in `<head>`

### Task 13.3 — Error Boundaries
Wrap Shop, Checkout, all Admin pages in React Error Boundary.
Fallback: "Something went wrong — [retry]" with brand styling.

### Task 13.4 — Accessibility
- All images have `alt` text (product name)
- All inputs have `<label>`
- Icon-only buttons have `aria-label`
- Focus visible on all interactive elements (`:focus-visible` ring)
- Colour contrast ≥ 4.5:1 for all text

### Task 13.5 — SEO
- `useSEO` hook: sets `document.title` + meta description per page
- OG tags on all public pages
- Product JSON-LD on `/product/:slug`
- `robots.txt` and `sitemap.xml`

### Task 13.6 — Performance Audit
Run Lighthouse on Home, Shop, Product Detail.
Target: Performance ≥ 85, Accessibility ≥ 90.
Fix render-blocking fonts (use `display=swap`, already set in Google Fonts URL).

### Task 13.7 — Privacy Policy Page (`/privacy`)
Required before launch. Covers: data collected, usage, Supabase/Razorpay/Resend third parties, deletion policy.

### Task 13.8 — Pre-Launch Cleanup
- [ ] Remove all `console.log`
- [ ] Remove ReactQueryDevtools in production build (`process.env.NODE_ENV !== 'production'`)
- [ ] Switch Razorpay to live key
- [ ] Update Supabase allowed URLs to production domain
- [ ] Test all Supabase auth redirect URLs

### Task 13.9 — Deploy
1. `npm run build` → test with `npm run preview`
2. Deploy to Vercel (recommended) or Netlify
3. Set all env vars in hosting dashboard
4. Update Supabase Auth → Site URL to production URL
5. Update Razorpay webhook URL to production Edge Function URL

### Task 13.10 — Final Smoke Test

| # | Critical Flow | Pass |
|---|---------------|------|
| 1 | Home page hero slider auto-plays | ☐ |
| 2 | Shop → filter → product detail → add to cart drawer | ☐ |
| 3 | Auth modal opens, signup, verify email, login | ☐ |
| 4 | Checkout → Razorpay payment → order confirmed | ☐ |
| 5 | Confirmation email received | ☐ |
| 6 | Track order on public URL (no login) | ☐ |
| 7 | Admin updates status → customer gets email + notification | ☐ |
| 8 | Giveaway form submits, admin sees entry | ☐ |
| 9 | Return requested → admin approves → customer email | ☐ |
| 10 | Dark mode works on every page | ☐ |

**All 10 must pass before going live.**

---

## What Changed From the Previous PRD

| Area | Old (Generic) | New (Velora-Accurate) |
|------|--------------|-----------------------|
| Auth | Separate pages (`/login`, `/signup`) | **Modal popups** triggered from header |
| Cart | Separate `/cart` page | **Slide-out drawer** in header (like Velora) |
| Hero | Static section | **Full-screen auto-playing slider** (4 slides) |
| Categories | Hoodies, T-Shirts, Caps... | **Man / Woman** (matches Velora) |
| Product sizes | S/M/L/XL | **S/M/L/XL + Colors** (White, Black, etc.) |
| Product model | No colors, no slug, no specs | Added `colors[]`, `slug`, `specs{}`, `badge`, `is_spotlight` |
| Home sections | Generic e-commerce | All 9 Velora sections replicated exactly |
| Product detail | Generic 2-col | Exact Velora layout: 3 tabs, specs table, color picker |
| Category page | Filter sidebar | Simple 2-col grid (matches Velora) |
| Brand language | Neutral | **Streetwear** — bold, urban, limited drops |
| Currency | INR (was already set) | INR, adapted from Velora's USD |
| Giveaway page | Generic form | CoZeo-specific addition styled to brand |

---

## Out of Scope

| Feature | Reason |
|---------|--------|
| Pan-India delivery (Shiprocket etc.) | v3 milestone |
| Google / Facebook OAuth | v2 — UI placeholder only |
| Live chat widget | v3 |
| Mobile app | v3 |
| Multi-vendor | never |
| Auto refunds | manual via Razorpay dashboard |
| i18n | v3 |

---

*CoZeo Build Guide v3.1 — Based on Velora reference: https://velora99.webflow.io/ — March 2026*
