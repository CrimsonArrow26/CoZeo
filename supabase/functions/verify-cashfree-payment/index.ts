// Cashfree Payment Verification
// Deploy with: supabase functions deploy verify-cashfree-payment

const CASHFREE_SECRET_KEY = Deno.env.get('CASHFREE_SECRET_KEY');
const CASHFREE_APP_ID = Deno.env.get('CASHFREE_APP_ID');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Retry helper — Cashfree may take a few seconds to update order status after modal close
async function pollOrderStatus(
  url: string,
  headers: Record<string, string>,
  retries = 3,
  delayMs = 2000
): Promise<any> {
  for (let i = 0; i < retries; i++) {
    const res = await fetch(url, { method: 'GET', headers });
    if (!res.ok) {
      const err = await res.json();
      console.error(`Order fetch failed (attempt ${i + 1}):`, err);
      throw new Error('Failed to fetch order from Cashfree');
    }
    const data = await res.json();
    console.log(`Attempt ${i + 1}: order_status = ${data.order_status}`);
    if (data.order_status === 'PAID') return data;
    if (i < retries - 1) {
      await new Promise(r => setTimeout(r, delayMs));
    } else {
      return data; // Return last known status after all retries
    }
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    if (!CASHFREE_SECRET_KEY || !CASHFREE_APP_ID) {
      return new Response(
        JSON.stringify({ error: 'Cashfree credentials not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.json();
    const { order_id } = body;

    if (!order_id) {
      return new Response(
        JSON.stringify({ error: 'Missing required field: order_id' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const environment = Deno.env.get('CASHFREE_ENVIRONMENT') || 'sandbox';
    const baseUrl = environment === 'production'
      ? 'https://api.cashfree.com/pg'
      : 'https://sandbox.cashfree.com/pg';

    const cfHeaders = {
      'x-api-version': '2023-08-01',
      'x-client-id': CASHFREE_APP_ID,
      'x-client-secret': CASHFREE_SECRET_KEY,
    };

    // Step 1: Poll order status (retry up to 3x with 2s delay for Cashfree to process)
    const orderData = await pollOrderStatus(
      `${baseUrl}/orders/${order_id}`,
      cfHeaders,
      3,
      2000
    );

    console.log('Final order status:', orderData.order_status);

    if (orderData.order_status !== 'PAID') {
      return new Response(
        JSON.stringify({
          verified: false,
          error: 'Payment not completed',
          order_status: orderData.order_status,
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Step 2: Order is PAID — fetch payment details from the correct endpoint
    // IMPORTANT: GET /orders/{id} does NOT return payment_details inline in v3 API
    // Payment details must be fetched from GET /orders/{id}/payments
    let paymentId = `cf_${order_id}`;
    let paymentMethod = 'unknown';
    let paymentTime = new Date().toISOString();

    try {
      const paymentsRes = await fetch(`${baseUrl}/orders/${order_id}/payments`, {
        method: 'GET',
        headers: cfHeaders,
      });

      if (paymentsRes.ok) {
        const paymentsData = await paymentsRes.json();
        console.log('Payments:', JSON.stringify(paymentsData));
        const success = Array.isArray(paymentsData)
          ? paymentsData.find((p: any) => p.payment_status === 'SUCCESS')
          : null;
        if (success) {
          paymentId = success.cf_payment_id?.toString() || paymentId;
          paymentMethod = success.payment_method
            ? Object.keys(success.payment_method)[0]
            : 'unknown';
          paymentTime = success.payment_time || paymentTime;
        }
      } else {
        console.warn('Could not fetch payment details, but order is PAID — still returning verified:true');
      }
    } catch (payErr) {
      console.warn('Payment detail fetch error (non-fatal):', payErr);
    }

    // Order status is PAID — verified regardless of payment detail fetch success
    return new Response(
      JSON.stringify({
        verified: true,
        payment_id: paymentId,
        payment_method: paymentMethod,
        payment_time: paymentTime,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Verification error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ verified: false, error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
