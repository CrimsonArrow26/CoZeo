// Supabase Edge Function for Cashfree Receipt Generation (Post-Payment)
// Deploy with: supabase functions deploy create-cashfree-receipt
// Set secrets:
//   supabase secrets set CASHFREE_APP_ID=your_app_id
//   supabase secrets set CASHFREE_SECRET_KEY=your_secret_key

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }

  try {
    const environment = Deno.env.get("CASHFREE_ENVIRONMENT") || "sandbox";
    const baseUrl = environment === "production" 
      ? "https://api.cashfree.com/pg"
      : "https://sandbox.cashfree.com/pg";

    // Get request body
    const {
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
    } = await req.json();

    if (!orderId || !cashfreeOrderId) {
      return new Response(
        JSON.stringify({
          error: "Missing required fields: orderId, cashfreeOrderId",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    console.log("Generating receipt for Cashfree order:", {
      orderId,
      cashfreeOrderId,
    });

    // Construct receipt URL for customer
    // Cashfree dashboard URL for viewing order details
    const receiptUrl = environment === "production"
      ? `https://dashboard.cashfree.com/merchants/pg/transactions/${cashfreeOrderId}`
      : `https://test.cashfree.com/merchants/pg/transactions/${cashfreeOrderId}`;

    // Generate a local receipt ID (since Cashfree doesn't have a built-in receipt API like Razorpay)
    const receiptId = `CF-${cashfreeOrderId}`;

    // Return receipt details
    return new Response(
      JSON.stringify({
        success: true,
        receipt_id: receiptId,
        receipt_number: receiptId,
        receipt_url: receiptUrl,
        status: "PAID",
        order_id: orderId,
        cashfree_order_id: cashfreeOrderId,
        customer_email: customerEmail,
        customer_name: customerName,
        customer_phone: customerPhone,
        items: items,
        subtotal: subtotal,
        discount_amount: discountAmount,
        total: total,
        shipping_address: shippingAddress,
        created_at: new Date().toISOString(),
        // Note: For a more sophisticated receipt system, you might want to:
        // 1. Store receipt data in Supabase
        // 2. Generate a PDF receipt
        // 3. Send email with receipt details
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch (err: any) {
    console.error("create-cashfree-receipt error:", err);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: err.message,
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }
});
