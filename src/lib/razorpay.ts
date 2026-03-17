// Razorpay integration for payments

// Load Razorpay checkout script
export function loadRazorpayScript() {
  return new Promise((resolve, reject) => {
    if (document.getElementById('razorpay-script')) {
      resolve(true);
      return;
    }
    
    const script = document.createElement('script');
    script.id = 'razorpay-script';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => reject(new Error('Failed to load Razorpay script'));
    document.body.appendChild(script);
  });
}

// Create Razorpay order via Supabase Edge Function
async function createRazorpayOrder(amount: number, orderId: string, userEmail: string, userName: string) {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://rbjivulozgubrenzwcjx.supabase.co';
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
  
  const edgeFunctionUrl = `${supabaseUrl}/functions/v1/create-razorpay-order`;
  
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
      throw new Error('Failed to create Razorpay order: ' + errorText);
    }
    
    const data = await response.json();
    return data;
  } catch (fetchError) {
    throw fetchError;
  }
}

// Verify Razorpay payment signature
async function verifyRazorpayPayment(
  razorpayOrderId: string, 
  razorpayPaymentId: string, 
  razorpaySignature: string
) {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://rbjivulozgubrenzwcjx.supabase.co';
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
  
  const response = await fetch(`${supabaseUrl}/functions/v1/verify-razorpay-payment`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${supabaseKey}`,
    },
    body: JSON.stringify({
      razorpay_order_id: razorpayOrderId,
      razorpay_payment_id: razorpayPaymentId,
      razorpay_signature: razorpaySignature,
    }),
  });
  
  if (!response.ok) {
    throw new Error('Payment verification failed');
  }
  
  return response.json();
}

// Open Razorpay checkout
export async function openRazorpayCheckout({
  amount,
  orderId,
  userEmail,
  userName,
  onSuccess,
  onError,
}: {
  amount: number;
  orderId: string;
  userEmail: string;
  userName: string;
  onSuccess: (paymentId: string, orderId: string) => Promise<void> | void;
  onError: (error: Error) => void;
}) {
  try {
    await loadRazorpayScript();
    
    const razorpayOrder = await createRazorpayOrder(amount, orderId, userEmail, userName);
    
    // Use key_id from Edge Function response
    const razorpayKey = razorpayOrder.key_id || import.meta.env.VITE_RAZORPAY_KEY_ID || '';
    
    const options = {
      key: razorpayKey,
      amount: amount * 100,
      currency: 'INR',
      name: 'CoZeo',
      description: 'Order Payment',
      order_id: razorpayOrder.id,
      prefill: {
        name: userName,
        email: userEmail,
      },
      theme: {
        color: '#121212',
      },
      handler: async function (response: any) {
        try {
          const verification = await verifyRazorpayPayment(
            response.razorpay_order_id,
            response.razorpay_payment_id,
            response.razorpay_signature
          );
          
          if (verification.verified) {
            await onSuccess(response.razorpay_payment_id, response.razorpay_order_id);
          } else {
            onError(new Error('Payment verification failed'));
          }
        } catch (error) {
          onError(error as Error);
        }
      },
    };
    
    const razorpay = new (window as any).Razorpay(options);
    
    razorpay.on('payment.failed', function (response: any) {
      onError(new Error(response.error.description));
    });
    
    razorpay.open();
  } catch (error) {
    onError(error as Error);
  }
}

// Razorpay invoice generation result type
export interface RazorpayInvoiceResult {
  success: boolean;
  invoice_id?: string;
  invoice_number?: string;
  invoice_url?: string;
  status?: string;
  error?: string;
}

// Razorpay order item type
export interface RazorpayInvoiceItem {
  product_name: string;
  unit_price: number;
  quantity: number;
  size: string;
  color?: string;
}

// Razorpay shipping address type
export interface RazorpayShippingAddress {
  address: string;
  city: string;
  state: string;
  pincode: string;
}

// Create Razorpay invoice via Supabase Edge Function
export async function createRazorpayInvoice(
  orderId: string,
  razorpayPaymentId: string,
  customerEmail: string,
  customerName: string,
  customerPhone: string,
  items: RazorpayInvoiceItem[],
  subtotal: number,
  discountAmount: number,
  total: number,
  shippingAddress: RazorpayShippingAddress
): Promise<RazorpayInvoiceResult> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://rbjivulozgubrenzwcjx.supabase.co';
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
  
  const edgeFunctionUrl = `${supabaseUrl}/functions/v1/create-razorpay-invoice`;
  
  try {
    const response = await fetch(edgeFunctionUrl, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`,
      },
      body: JSON.stringify({
        orderId,
        razorpayPaymentId,
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
      return { success: false, error: 'Failed to create invoice: ' + errorText };
    }
    
    const data = await response.json();
    
    return {
      success: true,
      invoice_id: data.receipt_id,
      invoice_number: data.receipt_id,
      invoice_url: data.receipt_url,
      status: data.status,
    };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
