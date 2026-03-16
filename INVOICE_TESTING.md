# Razorpay Invoice Testing Guide

## Prerequisites
1. Razorpay Test Account (signup at razorpay.com)
2. Supabase CLI installed

## Step 1: Get Razorpay Test Credentials
1. Go to https://dashboard.razorpay.com
2. Switch to "Test Mode" (toggle at top right)
3. Go to Settings → API Keys
4. Generate new test keys (Key ID starts with `rzp_test_`)

## Step 2: Deploy the Edge Function

```bash
# Deploy to Supabase
supabase functions deploy create-razorpay-invoice

# Set your test credentials
supabase secrets set RAZORPAY_KEY_ID=rzp_test_your_test_key_id
supabase secrets set RAZORPAY_KEY_SECRET=your_test_key_secret
```

## Step 3: Test via Checkout Flow

1. Add items to cart
2. Go to checkout
3. Use Razorpay test payment method:
   - **Card**: 5267 3181 8797 5449, any future expiry, any CVV
   - **UPI**: success@razorpay
4. After successful payment, check browser console for `[Invoice]` logs
5. Check Supabase orders table for `razorpay_invoice_url`

## Step 4: Verify Invoice in Razorpay Dashboard

1. Go to Razorpay Dashboard → Invoices
2. You should see the newly created invoice
3. Click to view/download the PDF

## Testing via cURL (Direct API Test)

```bash
curl -X POST https://your-project.supabase.co/functions/v1/create-razorpay-invoice \
  -H "Authorization: Bearer YOUR_SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "test-order-123",
    "razorpayPaymentId": "pay_test_123456",
    "customerEmail": "test@example.com",
    "customerName": "Test User",
    "customerPhone": "9876543210",
    "items": [
      {
        "product_name": "Test T-Shirt",
        "unit_price": 499,
        "quantity": 2,
        "size": "M",
        "color": "Black"
      }
    ],
    "subtotal": 998,
    "discountAmount": 0,
    "total": 998,
    "shippingAddress": {
      "address": "123 Test Street",
      "city": "Mumbai",
      "state": "Maharashtra",
      "pincode": "400001"
    }
  }'
```

## Expected Response

```json
{
  "success": true,
  "invoice_id": "inv_test_abc123",
  "invoice_number": "INV-123456",
  "status": "issued",
  "invoice_url": "https://rzp.io/i/shorturl",
  "receipt_url": "https://api.razorpay.com/v1/invoices/inv_test_abc123/receipt",
  "date": 1678901234,
  "amount": 99800,
  "currency": "INR"
}
```

## Troubleshooting

- **Error 500**: Check if secrets are set correctly
- **Error 400**: Check if all required fields are provided
- **No email received**: Test mode doesn't send real emails, check dashboard instead
