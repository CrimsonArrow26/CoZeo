// Supabase Edge Function for Razorpay Receipt Generation (Post-Payment)
// Deploy with: supabase functions deploy create-razorpay-invoice
// Set secrets:
//   supabase secrets set RAZORPAY_KEY_ID=your_key
//   supabase secrets set RAZORPAY_KEY_SECRET=your_secret

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
    const razorpayKeyId = Deno.env.get("RAZORPAY_KEY_ID")!;
    const razorpayKeySecret = Deno.env.get("RAZORPAY_KEY_SECRET")!;

    if (!razorpayKeyId || !razorpayKeySecret) {
      console.error("Missing Razorpay credentials");
      return new Response(
        JSON.stringify({ error: "Razorpay credentials not configured" }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    // Get request body
    const {
      orderId,
      razorpayPaymentId,
      customerEmail,
      customerName,
      items,
      total,
    } = await req.json();

    if (!orderId || !razorpayPaymentId || !customerEmail) {
      return new Response(
        JSON.stringify({
          error: "Missing required fields: orderId, razorpayPaymentId, customerEmail",
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

    console.log("Fetching Razorpay payment receipt for:", {
      orderId,
      razorpayPaymentId,
    });

    // Fetch payment details from Razorpay
    const paymentRes = await fetch(
      `https://api.razorpay.com/v1/payments/${razorpayPaymentId}`,
      {
        method: "GET",
        headers: {
          Authorization: "Basic " + btoa(`${razorpayKeyId}:${razorpayKeySecret}`),
        },
      }
    );

    const payment = await paymentRes.json();

    if (!paymentRes.ok) {
      console.error("Razorpay API error fetching payment:", payment);
      return new Response(
        JSON.stringify({
          error: "Failed to fetch payment details",
          details: payment,
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

    console.log("Payment details fetched:", {
      paymentId: payment.id,
      status: payment.status,
    });

    // Send receipt notification via Razorpay
    console.log("Sending receipt notification to customer...");
    try {
      const notifyRes = await fetch(
        `https://api.razorpay.com/v1/payments/${razorpayPaymentId}/receipt`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Basic " + btoa(`${razorpayKeyId}:${razorpayKeySecret}`),
          },
          body: JSON.stringify({
            email: true,
            sms: true,
          }),
        }
      );

      if (notifyRes.ok) {
        console.log("Receipt notification sent successfully");
      } else {
        const notifyError = await notifyRes.text();
        console.log("Receipt notification response:", notifyRes.status, notifyError);
      }
    } catch (notifyErr) {
      console.error("Failed to send receipt notification:", notifyErr);
      // Don't fail the whole request if notification fails
    }

    // Construct receipt URL for customer
    // Razorpay hosted receipt URL
    const receiptUrl = `https://dashboard.razorpay.com/payments/${razorpayPaymentId}/receipt`;

    // Return receipt details
    return new Response(
      JSON.stringify({
        success: true,
        receipt_id: payment.id,
        receipt_url: receiptUrl,
        status: payment.status,
        amount: payment.amount,
        currency: payment.currency,
        method: payment.method,
        captured: payment.captured,
        order_id: orderId,
        customer_email: customerEmail,
        customer_name: customerName,
        items: items,
        total: total,
        created_at: payment.created_at,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch (err) {
    console.error("create-receipt error:", err);
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
