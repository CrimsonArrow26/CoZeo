// Razorpay Payment Verification - PRODUCTION
// Deploy with: supabase functions deploy verify-razorpay-payment
// Set secrets: supabase secrets set RAZORPAY_KEY_SECRET=your_secret

const RAZORPAY_KEY_SECRET = Deno.env.get('RAZORPAY_KEY_SECRET');

interface VerifyRequest {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

function verifySignature(orderId: string, paymentId: string, signature: string, secret: string): boolean {
  const body = `${orderId}|${paymentId}`;
  const expected = createHmac('sha256', secret).update(body).digest('hex');
  return expected === signature;
}

// Simple HMAC implementation for Deno
function createHmac(algorithm: string, key: string) {
  const encoder = new TextEncoder();
  const cryptoKey = crypto.subtle.importKey(
    'raw',
    encoder.encode(key),
    { name: 'HMAC', hash: algorithm },
    false,
    ['sign']
  );
  
  return {
    update: (data: string) => ({
      digest: async () => {
        const key = await cryptoKey;
        const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
        return Array.from(new Uint8Array(signature))
          .map(b => b.toString(16).padStart(2, '0'))
          .join('');
      }
    })
  };
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
    if (!RAZORPAY_KEY_SECRET) {
      return new Response(
        JSON.stringify({ error: 'Razorpay key secret not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body: VerifyRequest = await req.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify signature
    const hmac = createHmac('SHA-256', RAZORPAY_KEY_SECRET);
    const expected = await hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`).digest();
    const isValid = expected === razorpay_signature;

    if (!isValid) {
      return new Response(
        JSON.stringify({ verified: false, error: 'Invalid signature' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ verified: true }),
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
