import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import Header from '../components/Header';
import { SubscribeSection, Footer } from '../components/SubscribeFooter';
import { useCart } from '../CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useCreateOrder } from '../hooks/useOrders';
import { useValidateCoupon } from '../hooks/useCoupons';
import { formatPrice } from '../lib/utils';
import { openRazorpayCheckout, createRazorpayInvoice } from '../lib/razorpay';
import { supabase } from '../integrations/supabase/client';
import { toast } from 'sonner';

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
];

export default function CheckoutPage() {
  const { cartItems, subtotal, clearCart } = useCart();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const createOrder = useCreateOrder();
  
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: profile?.name || '',
    email: user?.email || '',
    phone: profile?.phone || '',
    address: profile?.address || '',
    city: profile?.city || '',
    state: profile?.state || '',
    pincode: profile?.pincode || '',
    notes: '',
  });
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const validateCoupon = useValidateCoupon();

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error('Please enter a coupon code');
      return;
    }
    
    try {
      const result = await validateCoupon.mutateAsync(couponCode.trim().toUpperCase());
      if (result.valid) {
        setAppliedCoupon(result.coupon);
        toast.success(`Coupon applied! ${result.coupon.discount_percentage}% discount`);
      } else {
        toast.error(result.message || 'Invalid coupon code');
      }
    } catch (error) {
      toast.error('Failed to validate coupon');
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    toast.info('Coupon removed');
  };

  const discountAmount = appliedCoupon ? Math.round(subtotal * (appliedCoupon.discount_percentage / 100)) : 0;
  const finalTotal = subtotal - discountAmount;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePlaceOrder = async () => {
    if (!user) {
      toast.error('Please login to place an order');
      return;
    }

    // Helper function to save shipping address to profile
    const saveShippingAddressToProfile = async () => {
      try {
        const { error } = await supabase
          .from('profiles')
          .update({
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            address: formData.address,
            city: formData.city,
            state: formData.state,
            pincode: formData.pincode,
          })
          .eq('id', user.id);
        
        if (error) {
          console.error('Failed to save address to profile:', error);
        } else {
          console.log('Shipping address saved to profile');
        }
      } catch (err) {
        console.error('Error saving address:', err);
      }
    };

    // Handle Razorpay payment (includes UPI and Card payments)
    if (paymentMethod === 'razorpay' || paymentMethod === 'upi') {
      try {
        // First create the order in pending state
        const orderItems = cartItems.map(item => ({
          product_id: item.id,
          product_name: item.name,
          product_image: item.images?.[0] || '/images/placeholder.jpg',
          size: item.size,
          color: item.color || 'Black',
          quantity: item.qty,
          unit_price: item.price,
          total_price: item.price * item.qty,
        }));

        const order = await createOrder.mutateAsync({
          order: {
            user_id: user.id,
            subtotal,
            discount_amount: discountAmount,
            coupon_code: appliedCoupon?.code || null,
            total: finalTotal,
            payment_method: 'razorpay',
            payment_status: 'pending',
            shipping_name: formData.name,
            shipping_phone: formData.phone,
            shipping_address: formData.address,
            shipping_city: formData.city,
            shipping_state: formData.state,
            shipping_pincode: formData.pincode,
            notes: formData.notes,
          },
          items: orderItems,
        });

        console.log('Order created, opening Razorpay checkout:', order);

        // Open Razorpay checkout
        openRazorpayCheckout({
          amount: finalTotal,
          orderId: order.id,
          userEmail: user.email || '',
          userName: profile?.name || formData.name || '',
          onSuccess: async (paymentId, razorpayOrderId) => {
            console.log('Razorpay payment success:', { paymentId, razorpayOrderId });
            
            // Update order status to paid
            const { error: updateError } = await supabase
              .from('orders')
              .update({ 
                payment_status: 'paid',
                status: 'confirmed',
                razorpay_payment_id: paymentId,
                razorpay_order_id: razorpayOrderId
              })
              .eq('id', order.id);
            
            if (updateError) {
              console.error('Failed to update order status:', updateError);
              toast.error('Payment succeeded but order update failed. Contact support.');
            } else {
              console.log('Order status updated to paid');
              toast.success('Payment successful!');
              
              // Generate Razorpay Invoice after successful payment
              try {
                console.log('[Invoice] Starting invoice generation...');
                const invoiceResult = await createRazorpayInvoice(
                  order.id,
                  paymentId,
                  user.email || '',
                  profile?.name || formData.name || '',
                  formData.phone || '',
                  orderItems.map(item => ({
                    product_name: item.product_name,
                    unit_price: item.unit_price,
                    quantity: item.quantity,
                    size: item.size,
                    color: item.color,
                  })),
                  subtotal,
                  discountAmount,
                  finalTotal,
                  {
                    address: formData.address,
                    city: formData.city,
                    state: formData.state,
                    pincode: formData.pincode,
                  }
                );
                
                if (invoiceResult.success) {
                  console.log('[Invoice] Invoice generated successfully:', invoiceResult);
                  // Store invoice details in the order
                  await supabase
                    .from('orders')
                    .update({
                      razorpay_invoice_id: invoiceResult.invoice_id,
                      razorpay_invoice_number: invoiceResult.invoice_number,
                      razorpay_invoice_url: invoiceResult.invoice_url,
                    })
                    .eq('id', order.id);
                  toast.success('Invoice generated successfully!');
                } else {
                  console.error('[Invoice] Failed to generate invoice:', invoiceResult.error);
                  // Don't block the flow if invoice generation fails
                }
              } catch (invoiceError) {
                console.error('[Invoice] Error generating invoice:', invoiceError);
                // Don't block the flow if invoice generation fails
              }
              
              // Save shipping address to profile for future orders
              await saveShippingAddressToProfile();
              
              // Fetch fresh data to confirm update
              const { data: updatedOrder } = await supabase
                .from('orders')
                .select('id, status, payment_status, display_id')
                .eq('id', order.id)
                .single();
              console.log('Verified updated order:', updatedOrder);
              
              // Update cache immediately with new status
              queryClient.setQueryData(['orders', 'detail', order.id], (oldData) => {
                if (oldData) {
                  return { ...oldData, payment_status: 'paid', status: 'confirmed' };
                }
                return oldData;
              });
              // Also update this order in the list cache
              queryClient.setQueryData(['orders', 'list'], (oldData) => {
                if (oldData && Array.isArray(oldData)) {
                  return oldData.map(o => 
                    o.id === order.id 
                      ? { ...o, payment_status: 'paid', status: 'confirmed' }
                      : o
                  );
                }
                return oldData;
              });
            }
            
            clearCart();
            navigate(`/order-confirmation/${order.id}`);
          },
          onError: (error) => {
            console.error('Razorpay payment error:', error);
            toast.error('Payment failed: ' + error.message);
          },
        });
      } catch (error) {
        console.error('Razorpay order creation error:', error);
        toast.error('Failed to initiate payment. Please try again.');
      }
      return;
    }

    // Handle COD and UPI (existing logic)
    const orderItems = cartItems.map(item => ({
      product_id: item.id,
      product_name: item.name,
      product_image: item.images?.[0] || '/images/placeholder.jpg',
      size: item.size,
      color: item.color || 'Black',
      quantity: item.qty,
      unit_price: item.price,
      total_price: item.price * item.qty,
    }));

    try {
      const order = await createOrder.mutateAsync({
        order: {
          user_id: user.id,
          subtotal,
          discount_amount: discountAmount,
          coupon_code: appliedCoupon?.code || null,
          total: finalTotal,
          payment_method: paymentMethod,
          shipping_name: formData.name,
          shipping_phone: formData.phone,
          shipping_address: formData.address,
          shipping_city: formData.city,
          shipping_state: formData.state,
          shipping_pincode: formData.pincode,
          notes: formData.notes,
        },
        items: orderItems,
      });

      // Save shipping address to profile for future orders
      await saveShippingAddressToProfile();

      clearCart();
      toast.success('Order placed successfully!');
      navigate(`/order-confirmation/${order.id}`);
    } catch (error) {
      toast.error('Failed to place order. Please try again.');
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="page-wrapper">
        <Header />
        <div className="section _100px">
          <div className="container">
            <div className="empty-cart">
              <h2>Your cart is empty</h2>
              <p>Add some items to your cart to proceed with checkout.</p>
              <Link to="/shop" className="primary-button">
                Start Shopping
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <Header />
      
      <div className="section _100px">
        <div className="container">
          <div className="breadcrumb-link-block">
            <Link to="/" className="breadcrumb-link">Home</Link>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-current">Checkout</span>
          </div>
          
          <h1 className="page-title">Checkout</h1>

          <div className="checkout-layout">
            {/* Main Content */}
            <div className="checkout-main">
              {/* Step 1: Shipping */}
              {step === 1 && (
                <div className="checkout-step">
                  <h2>Shipping Information</h2>
                  <form className="checkout-form">
                    <div className="form-row">
                      <div className="form-group">
                        <label>Full Name *</label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Phone *</label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Email *</label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="form-group">
                      <label>Address *</label>
                      <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        rows={3}
                        required
                      />
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>City *</label>
                        <input
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Pincode *</label>
                        <input
                          type="text"
                          name="pincode"
                          value={formData.pincode}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>State *</label>
                      <select
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Select State</option>
                        {INDIAN_STATES.map(state => (
                          <option key={state} value={state}>{state}</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Order Notes (optional)</label>
                      <textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleInputChange}
                        rows={2}
                        placeholder="Special instructions for delivery..."
                      />
                    </div>
                  </form>
                </div>
              )}

              {/* Step 2: Payment */}
              {step === 2 && (
                <div className="checkout-step">
                  <h2>Payment Method</h2>
                  
                  <div className="payment-methods">
                    <label className={`payment-method ${paymentMethod === 'cod' ? 'selected' : ''}`}>
                      <input
                        type="radio"
                        name="payment"
                        value="cod"
                        checked={paymentMethod === 'cod'}
                        onChange={() => setPaymentMethod('cod')}
                      />
                      <div className="payment-icon cod">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="2" y="6" width="20" height="12" rx="2"/>
                          <circle cx="12" cy="12" r="3"/>
                          <path d="M7 12h.01M17 12h.01"/>
                        </svg>
                      </div>
                      <div className="payment-info">
                        <strong>Cash on Delivery</strong>
                        <span>Pay when your order arrives</span>
                      </div>
                    </label>

                    <label className={`payment-method ${paymentMethod === 'upi' ? 'selected' : ''}`}>
                      <input
                        type="radio"
                        name="payment"
                        value="upi"
                        checked={paymentMethod === 'upi'}
                        onChange={() => setPaymentMethod('upi')}
                      />
                      <div className="payment-icon upi">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="4" width="18" height="16" rx="2"/>
                          <path d="M12 8v8M8 12h8"/>
                        </svg>
                      </div>
                      <div className="payment-info">
                        <strong>UPI Payment</strong>
                        <span>Google Pay, PhonePe, Paytm</span>
                      </div>
                    </label>

                    <label className={`payment-method ${paymentMethod === 'razorpay' ? 'selected' : ''}`}>
                      <input
                        type="radio"
                        name="payment"
                        value="razorpay"
                        checked={paymentMethod === 'razorpay'}
                        onChange={() => setPaymentMethod('razorpay')}
                      />
                      <div className="payment-icon card">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="2" y="5" width="20" height="14" rx="2"/>
                          <line x1="2" y1="10" x2="22" y2="10"/>
                        </svg>
                      </div>
                      <div className="payment-info">
                        <strong>Credit / Debit Card</strong>
                        <span>Visa, Mastercard, RuPay</span>
                      </div>
                    </label>
                  </div>

                  <div className="checkout-actions">
                    <button 
                      type="button"
                      className="secondary-button"
                      onClick={() => setStep(1)}
                    >
                      Back to Shipping
                    </button>
                    <button 
                      type="button"
                      className="primary-button"
                      onClick={handlePlaceOrder}
                      disabled={createOrder.isPending}
                    >
                      {createOrder.isPending ? 'Placing Order...' : 'Place Order'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Order Summary Sidebar */}
            <div className="checkout-sidebar">
              <h3>Order Summary</h3>
              <div className="order-items">
                {cartItems.map(item => (
                  <div key={`${item.id}-${item.size}`} className="order-item">
                    <img src={item.images?.[0] || '/images/placeholder.jpg'} alt={item.name} />
                    <div className="order-item-info">
                      <p className="order-item-name">{item.name}</p>
                      <p className="order-item-meta">Size: {item.size} × {item.qty}</p>
                    </div>
                    <span className="order-item-price">{formatPrice(item.price * item.qty)}</span>
                  </div>
                ))}
              </div>
              
              <div className="order-totals">
                {appliedCoupon && (
                  <div className="applied-coupon">
                    <div className="coupon-badge">
                      <span className="coupon-code">{appliedCoupon.code}</span>
                      <span className="coupon-discount">{appliedCoupon.discount_percentage}% OFF</span>
                      <button 
                        type="button" 
                        className="remove-coupon-btn"
                        onClick={handleRemoveCoupon}
                        title="Remove coupon"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                )}
                
                {!appliedCoupon && (
                  <div className="coupon-section">
                    <div className="coupon-input-row">
                      <input
                        type="text"
                        placeholder="Enter coupon code"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        className="coupon-input"
                        onKeyPress={(e) => e.key === 'Enter' && handleApplyCoupon()}
                      />
                      <button 
                        type="button"
                        className="apply-coupon-btn"
                        onClick={handleApplyCoupon}
                        disabled={validateCoupon.isPending || !couponCode.trim()}
                      >
                        {validateCoupon.isPending ? '...' : 'Apply'}
                      </button>
                    </div>
                  </div>
                )}
                
                <div className="order-row">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                
                {appliedCoupon && (
                  <div className="order-row discount">
                    <span>Discount ({appliedCoupon.discount_percentage}%)</span>
                    <span className="discount-amount">-{formatPrice(discountAmount)}</span>
                  </div>
                )}
                
                <div className="order-row">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                <div className="order-row total">
                  <span>Total</span>
                  <span>{formatPrice(finalTotal)}</span>
                </div>
                
                {step === 1 && (
                  <button 
                    type="button"
                    className="checkout-continue-btn"
                    onClick={() => {
                      // Validate required fields
                      if (!formData.name.trim()) {
                        toast.error('Please enter your full name');
                        return;
                      }
                      if (!formData.email.trim()) {
                        toast.error('Please enter your email');
                        return;
                      }
                      if (!formData.phone.trim()) {
                        toast.error('Please enter your phone number');
                        return;
                      }
                      if (!formData.address.trim()) {
                        toast.error('Please enter your address');
                        return;
                      }
                      if (!formData.city.trim()) {
                        toast.error('Please enter your city');
                        return;
                      }
                      if (!formData.state) {
                        toast.error('Please select your state');
                        return;
                      }
                      if (!formData.pincode.trim()) {
                        toast.error('Please enter your pincode');
                        return;
                      }
                      setStep(2);
                    }}
                  >
                    Continue to Payment →
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
