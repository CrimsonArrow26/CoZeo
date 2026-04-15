/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_CASHFREE_ENV: string;  // 'sandbox' or 'production'
  readonly VITE_APP_URL: string;
  readonly VITE_APP_NAME: string;
  readonly VITE_UPI_ID: string;
  // Deprecated - kept for backward compatibility
  readonly VITE_RAZORPAY_KEY_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
