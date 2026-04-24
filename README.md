# CoZeo - Streetwear E-commerce

**CoZeo** is a full-stack streetwear e-commerce platform built with React, Vite, and Supabase. It features custom apparel design uploads, campaign/combo deals, order management, and an admin dashboard.

**[Live Site →](https://cozeo.vercel.app)**

## Features

- **Custom Apparel Design** — Upload your own artwork on hoodies & t-shirts with front/back print options
- **Campaign Combo Deals** — Bundle products at discounted combo prices with required custom design uploads
- **Authentication** — Email/password & Google OAuth via Supabase Auth
- **Product Catalog** — Products with sizes, colors, badges (Sale/Drop/New), and specs
- **Shopping Cart** — Slide-out cart drawer with real-time updates
- **Checkout** — Multi-step checkout with Cashfree payment integration
- **Order Tracking** — Public order tracking with status timeline
- **User Dashboard** — Profile management, order history, notifications
- **Admin Panel** — Order management, campaign management, coupon management, dashboard analytics
- **Responsive Design** — Mobile-first, preserves Velora's original styling

## Tech Stack

- **Frontend**: React 18, Vite
- **Backend**: Supabase (PostgreSQL + Auth + Storage + Edge Functions)
- **State Management**: TanStack Query v5, React Context
- **Payment**: Cashfree Payments
- **Icons**: Lucide React
- **Notifications**: React Hot Toast
- **Deployment**: Vercel

## Project Structure

```
src/
├── api/                  # API functions (cart)
├── components/           # React components
│   ├── Header.jsx        # Navigation with cart sidebar & auth
│   ├── CampaignCard.jsx  # Campaign product cards
│   ├── CustomDesignUploader.jsx
│   └── ...
├── pages/                # Route pages
│   ├── HomePage.jsx
│   ├── ShopPage.jsx
│   ├── ProductPage.jsx   # Product detail with custom design
│   ├── CampaignPage.jsx  # Campaign combo deals
│   ├── CheckoutPage.jsx
│   ├── OrderTrackingPage.jsx
│   ├── DashboardPage.jsx
│   └── admin/            # Admin pages
│       ├── AdminDashboardPage.jsx
│       ├── AdminOrdersPage.jsx
│       ├── AdminOrderDetailsPage.jsx
│       ├── AdminCampaignsPage.jsx
│       └── AdminCouponsPage.jsx
├── hooks/                # Custom React hooks
│   ├── useProducts.ts
│   ├── useOrders.ts
│   ├── useCampaigns.js
│   └── useCartCampaign.js
├── CartContext.jsx       # Cart state management
├── integrations/supabase/
│   └── client.ts        # Supabase client setup
├── types/index.ts        # TypeScript types
└── lib/utils.ts          # Utility functions
```

## Key Routes

| Route | Description |
|-------|-------------|
| `/` | Home page |
| `/shop` | Product catalog with filters |
| `/product/:slug` | Product detail with custom design upload |
| `/campaign/:slug` | Campaign combo deal page |
| `/checkout` | Multi-step checkout |
| `/order-confirmation/:id` | Order success |
| `/orders/:id/track` | Order tracking (public) |
| `/dashboard` | User dashboard |
| `/admin` | Admin panel |

## Setup

1. Clone and install: `npm install`
2. Create a Supabase project and run migrations
3. Copy `.env.example` to `.env.local` and add credentials
4. Run: `npm run dev`

## Commands

```bash
npm run dev       # Development server
npm run build     # Production build
npm run preview   # Preview production build
npm run lint      # Lint
```
