// Cashfree Payment Verification - PRODUCTION
// Deploy with: supabase functions deploy verify-cashfree-payment
// Set secrets: supabase secrets set CASHFREE_SECRET_KEY=your_secret

const CASHFREE_SECRET_KEY = Deno.env.get('CASHFREE_SECRET_KEY');
const CASHFREE_APP_ID = Deno.env.get('CASHFREE_APP_ID');

interface VerifyRequest {
  order_id: string;
  payment_session_id: string;
}

Deno.serve(async (req: Request) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };

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

    const body: VerifyRequest = await req.json();
    const { order_id, payment_session_id } = body;

    if (!order_id || !payment_session_id) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: order_id, payment_session_id' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const environment = Deno.env.get("CASHFREE_ENVIRONMENT") || "sandbox";
    const baseUrl = environment === "production" 
      ? "https://api.cashfree.com/pg"
      : "https://sandbox.cashfree.com/pg";

    // Fetch order details from Cashfree
    const orderResponse = await fetch(`${baseUrl}/orders/${order_id}`, {
      method: "GET",
      headers: {
        "x-api-version": "2023-08-01",
        "x-client-id": CASHFREE_APP_ID,
        "x-client-secret": CASHFREE_SECRET_KEY,
      },
    });

    if (!orderResponse.ok) {
      const errorData = await orderResponse.json();
      console.error('Cashfree API error:', errorData);
      return new Response(
        JSON.stringify({ verified: false, error: 'Failed to fetch order details' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const orderData = await orderResponse.json();
    
    // Check if payment was successful
    const isPaid = orderData.order_status === 'PAID';
    const paymentDetails = orderData.payment_details?.[0] || null;

    if (isPaid && paymentDetails) {
      return new Response(
        JSON.stringify({ 
          verified: true, 
          payment_id: paymentDetails.cf_payment_id,
          payment_method: paymentDetails.payment_method,
          payment_time: paymentDetails.payment_time,
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ 
        verified: false, 
        error: 'Payment not completed',
        order_status: orderData.order_status,
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
