// Cashfree Webhook - PRODUCTION
// Deploy with: supabase functions deploy cashfree-webhook
// Set secrets: supabase secrets set CASHFREE_WEBHOOK_SECRET=your_webhook_secret

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createHmac } from 'https://deno.land/std@0.168.0/crypto/mod.ts';

const CASHFREE_WEBHOOK_SECRET = Deno.env.get('CASHFREE_WEBHOOK_SECRET');
const SB_URL = Deno.env.get('SB_URL');
const SB_SERVICE_ROLE_KEY = Deno.env.get('SB_SERVICE_ROLE_KEY');

function verifySignature(payload: string, signature: string, secret: string): boolean {
  try {
    const expected = createHmac('sha256', secret).update(payload).digest('hex');
    return expected === signature;
  } catch {
    return false;
  }
}

serve(async (req: Request) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'content-type, x-webhook-signature',
  };

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // Always return 200 to Cashfree to prevent retries
  try {
    const signature = req.headers.get('x-webhook-signature');
    const body = await req.text();

    if (!signature || !CASHFREE_WEBHOOK_SECRET) {
      console.error('Missing signature or webhook secret');
      return new Response('ok', { status: 200 });
    }

    // Verify signature
    if (!verifySignature(body, signature, CASHFREE_WEBHOOK_SECRET)) {
      console.error('Invalid webhook signature');
      return new Response('ok', { status: 200 });
    }

    const event = JSON.parse(body);
    const eventType = event.type;
    const data = event.data || {};

    console.log('Cashfree webhook received:', eventType);

    // Handle payment success
    if (eventType === 'PAYMENT_SUCCESS' || eventType === 'PAYMENT_COMPLETED') {
      const orderId = data.order?.order_id;
      const paymentId = data.payment?.cf_payment_id;
      const paymentStatus = data.payment?.payment_status;
      const paymentAmount = data.payment?.payment_amount;

      if (!orderId) {
        console.error('No order_id found in webhook');
        return new Response('ok', { status: 200 });
      }

      // Update order in Supabase
      const updateResponse = await fetch(`${SB_URL}/rest/v1/orders?id=eq.${orderId}`, {
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
          payment_id: paymentId,
          cashfree_order_id: orderId,
          updated_at: new Date().toISOString(),
        }),
      });

      if (!updateResponse.ok) {
        console.error('Failed to update order:', await updateResponse.text());
      } else {
        console.log('Order updated successfully:', orderId);
        
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
            order_id: orderId,
            status: 'confirmed',
            notes: `Payment confirmed via Cashfree webhook. Payment ID: ${paymentId}, Amount: ${paymentAmount}`,
          }),
        });
      }
    }

    // Handle payment failed
    if (eventType === 'PAYMENT_FAILED' || eventType === 'PAYMENT_USER_DROPPED') {
      const orderId = data.order?.order_id;
      const paymentId = data.payment?.cf_payment_id;
      const failureReason = data.payment?.payment_message || 'Payment failed';

      if (orderId) {
        await fetch(`${SB_URL}/rest/v1/orders?id=eq.${orderId}`, {
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
            order_id: orderId,
            status: 'pending',
            notes: `Payment failed: ${failureReason}`,
          }),
        });
        
        console.log('Order marked as payment failed:', orderId);
      }
    }

    return new Response('ok', { status: 200 });
  } catch (error) {
    console.error('Webhook error:', error);
    // Always return 200 to prevent Cashfree retries
    return new Response('ok', { status: 200 });
  }
});
