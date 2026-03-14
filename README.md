# CoZeo - Velora Streetwear E-commerce

A full-stack e-commerce application built with React, Vite, and Supabase. Based on the Velora Webflow template design with added backend functionality.

## Features

- **Authentication**: Email/password login with Supabase Auth (modal-based like Velora)
- **Product Management**: Products with sizes, colors, badges (Sale/Drop/New), and specs
- **Shopping Cart**: Slide-out cart drawer with add/remove functionality
- **Checkout Flow**: Multi-step checkout with shipping and payment
- **Order Tracking**: Track orders with status updates
- **User Dashboard**: Profile management, order history, notifications
- **Giveaway System**: Entry form with image upload
- **Responsive Design**: Mobile-first, preserves Velora's original styling

## Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **State Management**: TanStack Query v5, React Context
- **Forms**: React Hook Form with Zod validation
- **UI Components**: shadcn/ui components
- **Icons**: Lucide React
- **Notifications**: Sonner toast

## Setup Instructions

### 1. Clone and Install

```bash
cd velora-react
npm install
```

### 2. Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to the SQL Editor and run the schema from `supabase/schema.sql`
3. Enable Storage buckets: `product-images`, `avatars`, `giveaway-entries`, `return-images`
4. Get your project URL and anon key from Settings > API

### 3. Environment Variables

Copy `.env.example` to `.env.local` and fill in your Supabase credentials:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxx
VITE_APP_URL=http://localhost:5173
VITE_APP_NAME=CoZeo
VITE_UPI_ID=cozeo@upi
```

### 4. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:5173`

## Database Schema

The schema includes:

- **profiles**: User profiles linked to auth.users
- **user_roles**: Admin/customer role management
- **products**: Full product catalog with specs, sizes, colors
- **orders**: Order management with status history
- **order_items**: Line items for each order
- **coupons**: Discount codes
- **giveaway_entries**: Contest entries
- **returns**: Return request management
- **notifications**: User notifications

See `supabase/schema.sql` for complete schema with RLS policies.

## Project Structure

```
src/
├── components/          # React components
│   ├── Header.jsx      # Navigation with auth modal
│   ├── ProductSection.jsx
│   ├── FeaturedSection.jsx
│   ├── DealSection.jsx
│   └── ...
├── pages/              # Route pages
│   ├── HomePage.jsx
│   ├── ShopPage.jsx
│   ├── ProductPage.jsx
│   ├── CategoryPage.jsx
│   ├── CheckoutPage.jsx
│   ├── DashboardPage.jsx
│   ├── GiveawayPage.jsx
│   └── OrderTrackingPage.jsx
├── hooks/              # Custom React hooks
│   ├── useProducts.ts  # Product data fetching
│   └── useOrders.ts    # Order management
├── contexts/           # React contexts
│   └── AuthContext.tsx # Authentication state
├── integrations/
│   └── supabase/
│       └── client.ts   # Supabase client setup
├── types/              # TypeScript types
│   └── index.ts
├── lib/                # Utilities
│   └── utils.ts        # formatPrice, formatDate
└── providers/
    └── QueryProvider.tsx # TanStack Query setup
```

## Pages

| Route | Description |
|-------|-------------|
| `/` | Home page with all sections |
| `/shop` | Full product catalog with filters |
| `/product/:slug` | Product detail with tabs |
| `/category/:slug` | Category filtered products |
| `/checkout` | Multi-step checkout |
| `/order-confirmation/:id` | Order success page |
| `/orders/:id/track` | Order tracking (public) |
| `/dashboard` | User dashboard |
| `/giveaway` | Giveaway entry form |

## Key Features Implemented

- ✅ Supabase client with environment variables
- ✅ TypeScript types for all entities
- ✅ Utility functions (formatPrice, formatDate)
- ✅ TanStack Query provider setup
- ✅ Complete schema with RLS policies
- ✅ Seed data with 6 sample products
- ✅ AuthContext with Supabase integration
- ✅ Login/Signup modal in Header
- ✅ User dropdown with Dashboard/Sign Out
- ✅ Shop page with filters
- ✅ Product detail with size/color selection
- ✅ Category pages
- ✅ Checkout with 2-step flow
- ✅ Order confirmation
- ✅ Order tracking
- ✅ Dashboard with profile/orders/notifications tabs
- ✅ Giveaway page with form
- ✅ Cart drawer integration
- ✅ ProductSection uses Supabase (new drops)
- ✅ FeaturedSection uses Supabase (featured products)
- ✅ DealSection uses Supabase (spotlight product)

## Styling Notes

The project preserves Velora's original CSS:
- Uses `velora.css` for main styles
- Custom animations in `index.css`
- No Tailwind classes were added to existing components (except new pages)
- Fonts remain unchanged as requested

## Commands

```bash
# Development
npm run dev

# Build
npm run build

# Preview production build
npm run preview

# Lint
npm run lint
```
