// Cashfree integration for payments

// Cashfree configuration
const CASHFREE_ENV = import.meta.env.VITE_CASHFREE_ENV || 'sandbox';
// Cashfree SDK - use UAT for sandbox, prod for production
const CASHFREE_SCRIPT_URL = CASHFREE_ENV === 'production' 
  ? 'https://sdk.cashfree.com/js/v3/cashfree.js'
  : 'https://sdk.cashfree.com/js/v3/cashfree.uat.js';
console.log('[Cashfree] Environment:', CASHFREE_ENV);
console.log('[Cashfree] Script URL:', CASHFREE_SCRIPT_URL);

// Load Cashfree checkout script
export function loadCashfreeScript() {
  return new Promise((resolve, reject) => {
    console.log('[Cashfree] Checking if SDK already loaded...');
    
    if ((window as any).Cashfree) {
      console.log('[Cashfree] SDK already loaded');
      resolve(true);
      return;
    }
    
    const existingScript = document.getElementById('cashfree-script');
    if (existingScript) {
      console.log('[Cashfree] Script tag exists, waiting for SDK...');
      // Script exists but SDK not ready, wait for it
      const checkInterval = setInterval(() => {
        if ((window as any).Cashfree) {
          console.log('[Cashfree] SDK became available');
          clearInterval(checkInterval);
          resolve(true);
        }
      }, 100);
      setTimeout(() => {
        clearInterval(checkInterval);
        if (!(window as any).Cashfree) {
          reject(new Error('Cashfree SDK failed to load (timeout)'));
        }
      }, 5000);
      return;
    }
    
    console.log('[Cashfree] Creating script tag...');
    const script = document.createElement('script');
    script.id = 'cashfree-script';
    script.src = CASHFREE_SCRIPT_URL;
    script.defer = true;
    script.type = 'text/javascript';
    
    script.onload = () => {
      console.log('[Cashfree] Script loaded, checking for SDK...');
      // Wait a moment for SDK to initialize
      let attempts = 0;
      const checkSDK = setInterval(() => {
        attempts++;
        if ((window as any).Cashfree) {
          console.log('[Cashfree] SDK initialized after', attempts, 'attempts');
          clearInterval(checkSDK);
          resolve(true);
        } else if (attempts > 20) { // 2 seconds max
          clearInterval(checkSDK);
          console.error('[Cashfree] SDK not available after script load');
          reject(new Error('Cashfree SDK not available after script load'));
        }
      }, 100);
    };
    
    script.onerror = (e) => {
      console.error('[Cashfree] Script failed to load:', e);
      reject(new Error('Failed to load Cashfree script - check network/console'));
    };
    
    // Append to body instead of head for better CORS handling
    document.body.appendChild(script);
    console.log('[Cashfree] Script appended to body');
  });
}

// Create Cashfree order via Supabase Edge Function
async function createCashfreeOrder(amount: number, orderId: string, userEmail: string, userName: string) {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
  
  const edgeFunctionUrl = `${supabaseUrl}/functions/v1/create-cashfree-order`;
  
  try {
    const response = await fetch(edgeFunctionUrl, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`,
      },
      body: JSON.stringify({
        amount,
        orderId,
        userEmail,
        userName,
      }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error('Failed to create Cashfree order: ' + errorText);
    }
    
    const data = await response.json();
    return data;
  } catch (fetchError) {
    throw fetchError;
  }
}

// Verify Cashfree payment
async function verifyCashfreePayment(
  orderId: string, 
  paymentSessionId: string
) {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
  
  const response = await fetch(`${supabaseUrl}/functions/v1/verify-cashfree-payment`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${supabaseKey}`,
    },
    body: JSON.stringify({
      order_id: orderId,
      payment_session_id: paymentSessionId,
    }),
  });
  
  if (!response.ok) {
    throw new Error('Payment verification failed');
  }
  
  return response.json();
}

// Get Cashfree payment status
async function getCashfreePaymentStatus(orderId: string) {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
  
  const response = await fetch(`${supabaseUrl}/functions/v1/get-cashfree-payment-status`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${supabaseKey}`,
    },
    body: JSON.stringify({
      order_id: orderId,
    }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to get payment status');
  }
  
  return response.json();
}

// Open Cashfree checkout
export async function openCashfreeCheckout({
  amount,
  orderId,
  userEmail,
  userName,
  userPhone,
  onSuccess,
  onError,
}: {
  amount: number;
  orderId: string;
  userEmail: string;
  userName: string;
  userPhone?: string;
  onSuccess: (paymentId: string, orderId: string) => Promise<void> | void;
  onError: (error: Error) => void;
}) {
  try {
    await loadCashfreeScript();
    
    const cashfreeOrder = await createCashfreeOrder(amount, orderId, userEmail, userName);
    
    if (!cashfreeOrder.payment_session_id) {
      throw new Error('Failed to get payment session ID from Cashfree');
    }
    
    // Initialize Cashfree SDK
    const CashfreeSDK = (window as any).Cashfree;
    if (!CashfreeSDK) {
      throw new Error('Cashfree SDK not loaded. Please refresh the page.');
    }
    
    const cashfree = new CashfreeSDK({
      mode: CASHFREE_ENV,
    });
    
    const checkoutOptions = {
      paymentSessionId: cashfreeOrder.payment_session_id,
      redirectTarget: '_modal',
      appearance: {
        theme: 'dark',
        width: '400px',
        height: '600px',
      },
    };
    
    cashfree.checkout(checkoutOptions).then(async (result: any) => {
      if (result.error) {
        onError(new Error(result.error.message || 'Payment failed'));
        return;
      }
      
      if (result.paymentDetails) {
        // Payment completed - verify it
        try {
          const verification = await verifyCashfreePayment(
            cashfreeOrder.order_id,
            cashfreeOrder.payment_session_id
          );
          
          if (verification.verified) {
            await onSuccess(
              result.paymentDetails.paymentMessage?.paymentId || result.paymentDetails.transactionId,
              cashfreeOrder.order_id
            );
          } else {
            onError(new Error('Payment verification failed'));
          }
        } catch (error) {
          onError(error as Error);
        }
      } else if (result.redirect) {
        // User was redirected - check status
        try {
          const status = await getCashfreePaymentStatus(cashfreeOrder.order_id);
          if (status.payment_status === 'SUCCESS') {
            await onSuccess(status.payment_id, cashfreeOrder.order_id);
          } else if (status.payment_status === 'FAILED') {
            onError(new Error('Payment failed'));
          } else {
            // Pending or other status
            onError(new Error('Payment status uncertain. Please check your order history.'));
          }
        } catch (error) {
          onError(error as Error);
        }
      }
    }).catch((error: any) => {
      onError(new Error(error.message || 'Payment checkout failed'));
    });
    
  } catch (error) {
    onError(error as Error);
  }
}

// Cashfree receipt generation result type
export interface CashfreeReceiptResult {
  success: boolean;
  receipt_id?: string;
  receipt_number?: string;
  receipt_url?: string;
  status?: string;
  error?: string;
}

// Cashfree order item type
export interface CashfreeReceiptItem {
  product_name: string;
  unit_price: number;
  quantity: number;
  size: string;
  color?: string;
}

// Cashfree shipping address type
export interface CashfreeShippingAddress {
  address: string;
  city: string;
  state: string;
  pincode: string;
}

// Create Cashfree receipt via Supabase Edge Function
export async function createCashfreeReceipt(
  orderId: string,
  cashfreeOrderId: string,
  customerEmail: string,
  customerName: string,
  customerPhone: string,
  items: CashfreeReceiptItem[],
  subtotal: number,
  discountAmount: number,
  total: number,
  shippingAddress: CashfreeShippingAddress
): Promise<CashfreeReceiptResult> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
  
  const edgeFunctionUrl = `${supabaseUrl}/functions/v1/create-cashfree-receipt`;
  
  try {
    const response = await fetch(edgeFunctionUrl, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`,
      },
      body: JSON.stringify({
        orderId,
        cashfreeOrderId,
        customerEmail,
        customerName,
        customerPhone,
        items,
        subtotal,
        discountAmount,
        total,
        shippingAddress,
      }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      return { success: false, error: 'Failed to create receipt: ' + errorText };
    }
    
    const data = await response.json();
    
    return {
      success: true,
      receipt_id: data.receipt_id,
      receipt_number: data.receipt_number,
      receipt_url: data.receipt_url,
      status: data.status,
    };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
