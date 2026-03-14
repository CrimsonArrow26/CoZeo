// Razorpay Webhook - PRODUCTION
// Deploy with: supabase functions deploy razorpay-webhook
// Set secrets: supabase secrets set RAZORPAY_KEY_SECRET=your_secret RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createHmac } from 'https://deno.land/std@0.168.0/crypto/mod.ts';

const RAZORPAY_WEBHOOK_SECRET = Deno.env.get('RAZORPAY_WEBHOOK_SECRET');
const SB_URL = Deno.env.get('SB_URL');
const SB_SERVICE_ROLE_KEY = Deno.env.get('SB_SERVICE_ROLE_KEY');

function verifySignature(body: string, signature: string, secret: string): boolean {
  const expected = createHmac('sha256', secret).update(body).digest('hex');
  return expected === signature;
}

serve(async (req: Request) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'content-type, x-razorpay-signature',
  };

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // Always return 200 to Razorpay to prevent retries
  try {
    const signature = req.headers.get('x-razorpay-signature');
    const body = await req.text();

    if (!signature || !RAZORPAY_WEBHOOK_SECRET) {
      console.error('Missing signature or webhook secret');
      return new Response('ok', { status: 200 });
    }

    // Verify signature
    if (!verifySignature(body, signature, RAZORPAY_WEBHOOK_SECRET)) {
      console.error('Invalid webhook signature');
      return new Response('ok', { status: 200 });
    }

    const event = JSON.parse(body);
    const eventType = event.event;
    const payload = event.payload;

    console.log('Razorpay webhook received:', eventType);

    // Handle payment captured (success)
    if (eventType === 'payment.captured') {
      const payment = payload.payment.entity;
      const razorpayOrderId = payment.order_id;
      const razorpayPaymentId = payment.id;
      const receipt = payment.receipt; // This is our CoZeo order ID

      if (!receipt) {
        console.error('No receipt found in payment');
        return new Response('ok', { status: 200 });
      }

      // Update order in Supabase
      const updateResponse = await fetch(`${SB_URL}/rest/v1/orders?id=eq.${receipt}`, {
        method: 'PATCH',
        headers: {
          'apikey': SB_SERVICE_ROLE_KEY!,
          'Authorization': `Bearer ${SB_SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify({
          payment_status: 'paid',
          status: 'confirmed',
          payment_id: razorpayPaymentId,
          razorpay_order_id: razorpayOrderId,
          updated_at: new Date().toISOString(),
        }),
      });

      if (!updateResponse.ok) {
        console.error('Failed to update order:', await updateResponse.text());
      } else {
        console.log('Order updated successfully:', receipt);
        
        // Add status history entry
        await fetch(`${SB_URL}/rest/v1/status_history`, {
          method: 'POST',
          headers: {
            'apikey': SB_SERVICE_ROLE_KEY!,
            'Authorization': `Bearer ${SB_SERVICE_ROLE_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal',
          },
          body: JSON.stringify({
            order_id: receipt,
            status: 'confirmed',
            notes: 'Payment confirmed via Razorpay webhook',
          }),
        });
      }
    }

    // Handle payment failed
    if (eventType === 'payment.failed') {
      const payment = payload.payment.entity;
      const receipt = payment.receipt;

      if (receipt) {
        await fetch(`${SB_URL}/rest/v1/orders?id=eq.${receipt}`, {
          method: 'PATCH',
          headers: {
            'apikey': SB_SERVICE_ROLE_KEY!,
            'Authorization': `Bearer ${SB_SERVICE_ROLE_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal',
          },
          body: JSON.stringify({
            payment_status: 'failed',
            updated_at: new Date().toISOString(),
          }),
        });
        console.log('Order marked as payment failed:', receipt);
      }
    }

    return new Response('ok', { status: 200 });
  } catch (error) {
    console.error('Webhook error:', error);
    // Always return 200 to prevent Razorpay retries
    return new Response('ok', { status: 200 });
  }
});
