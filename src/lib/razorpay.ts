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
  
  const response = await fetch(`${supabaseUrl}/functions/v1/create-razorpay-order`, {
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
    const error = await response.text();
    throw new Error('Failed to create Razorpay order: ' + error);
  }
  
  return response.json();
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
    
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID || '',
      amount: amount * 100, // Razorpay expects amount in paise
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
          // Verify payment signature before proceeding
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
