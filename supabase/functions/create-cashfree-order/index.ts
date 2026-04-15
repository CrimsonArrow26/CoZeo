// Supabase Edge Function for Cashfree order creation
// Deploy with: supabase functions deploy create-cashfree-order
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
      }
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
    const cashfreeAppId = Deno.env.get("CASHFREE_APP_ID")!;
    const cashfreeSecretKey = Deno.env.get("CASHFREE_SECRET_KEY")!;
    const environment = Deno.env.get("CASHFREE_ENVIRONMENT") || "sandbox";

    if (!cashfreeAppId || !cashfreeSecretKey) {
      console.error("Missing Cashfree credentials");
      return new Response(JSON.stringify({ error: "Cashfree credentials not configured" }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    // Get request body
    const { amount, orderId, userEmail, userName } = await req.json();

    if (!amount || !orderId) {
      return new Response(JSON.stringify({ error: "Missing required fields: amount, orderId" }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    console.log("Creating Cashfree order:", { amount, orderId, userEmail, userName });

    // Determine API base URL based on environment
    const baseUrl = environment === "production" 
      ? "https://api.cashfree.com/pg"
      : "https://sandbox.cashfree.com/pg";

    // Create Cashfree order
    const cashfreeRes = await fetch(`${baseUrl}/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-version": "2023-08-01",
        "x-client-id": cashfreeAppId,
        "x-client-secret": cashfreeSecretKey,
      },
      body: JSON.stringify({
        order_id: orderId,
        order_amount: amount,
        order_currency: "INR",
        customer_details: {
          customer_id: orderId.slice(0, 50),
          customer_name: userName || "Customer",
          customer_email: userEmail || "",
          customer_phone: "9999999999", // Required field, will be updated during checkout
        },
        order_meta: {
          return_url: null, // Using modal checkout
          notify_url: null, // Webhook will be configured separately
          payment_methods: null, // All available
        },
      }),
    });

    const order = await cashfreeRes.json();

    if (!cashfreeRes.ok) {
      console.error("Cashfree API error:", order);
      return new Response(JSON.stringify({ error: "Failed to create Cashfree order", details: order }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    console.log("Cashfree order created:", order.order_id);

    return new Response(
      JSON.stringify({
        order_id: order.order_id,
        payment_session_id: order.payment_session_id,
        order_amount: order.order_amount,
        order_currency: order.order_currency,
        order_expiry_time: order.order_expiry_time,
      }),
      {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch (err) {
    console.error("create-cashfree-order error:", err);
    return new Response(JSON.stringify({ error: "Internal server error", message: err.message }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }
});
