import { useParams, Link } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import Header from '../components/Header';
import { Footer } from '../components/SubscribeFooter';
import { useOrder, useOrderItems } from '../hooks/useOrders';
import { formatPrice, formatDateTime } from '../lib/utils';
import { CheckCircle, Package, Truck, Home, Download } from 'lucide-react';
import { sendOrderConfirmationEmails } from '../services/email.service';
import { toast } from 'sonner';

export default function OrderConfirmationPage() {
  const { id } = useParams();
  const { data: order, isLoading } = useOrder(id || '');
  const { data: orderItems } = useOrderItems(id || '');
  const emailSentRef = useRef(false);

  // Send order confirmation emails when order data is loaded
  useEffect(() => {
    if (order && orderItems && !emailSentRef.current && !isLoading) {
      const sendEmails = async () => {
        try {
          const items = orderItems.map(item => ({
            name: item.product_name,
            quantity: item.quantity,
            price: item.total_price || item.price || 0,
          }));

          const shippingAddress = `${order.shipping_name}\n${order.shipping_address}\n${order.shipping_city}, ${order.shipping_state} ${order.shipping_pincode}\nPhone: ${order.shipping_phone}`;

          await sendOrderConfirmationEmails({
            customerEmail: order.shipping_email,
            customerName: order.shipping_name,
            orderId: order.display_id || order.id.slice(-8).toUpperCase(),
            orderDate: formatDateTime(order.created_at),
            items: items,
            total: order.total,
            shippingAddress: shippingAddress,
            paymentMethod: order.payment_method,
            invoiceUrl: `${window.location.origin}/orders/${order.id}/invoice`,
          });

          emailSentRef.current = true;
          toast.success('Order confirmation email sent!');
        } catch (error) {
          // Don't show error to user, order is still confirmed
        }
      };

      sendEmails();
    }
  }, [order, orderItems, isLoading]);

  if (isLoading) {
    return (
      <div className="page-wrapper">
        <Header />
        <div className="section _100px">
          <div className="container">
            <div className="loading">Loading order details...</div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="page-wrapper">
        <Header />
        <div className="section _100px">
          <div className="container">
            <div className="error-message">
              <h2>Order not found</h2>
              <Link to="/shop" className="primary-button">Continue Shopping</Link>
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
          <div className="order-confirmation">
            {/* Success Header */}
            <div className="confirmation-header">
              <div className="success-icon">
                <CheckCircle size={64} />
              </div>
              <h1>Order Placed!</h1>
              <p className="order-id">Order #{order.display_id || order.id.slice(-8).toUpperCase()}</p>
              <p className="confirmation-date">
                Placed on {formatDateTime(order.created_at)}
              </p>
            </div>

            {/* Order Status */}
            <div className="order-status-track">
              <div className={`status-step ${order.status === 'confirmed' || order.status === 'packed' || order.status === 'shipped' || order.status === 'arrived' || order.status === 'delivered' ? 'completed' : 'active'}`}>
                <div className="status-icon"><CheckCircle size={20} /></div>
                <span>Confirmed</span>
              </div>
              <div className={`status-step ${order.status === 'packed' || order.status === 'shipped' || order.status === 'arrived' || order.status === 'delivered' ? 'completed' : order.status === 'confirmed' ? 'active' : ''}`}>
                <div className="status-icon"><Package size={20} /></div>
                <span>Packed</span>
              </div>
              <div className={`status-step ${order.status === 'shipped' || order.status === 'arrived' || order.status === 'delivered' ? 'completed' : order.status === 'packed' ? 'active' : ''}`}>
                <div className="status-icon"><Truck size={20} /></div>
                <span>Shipped</span>
              </div>
              <div className={`status-step ${order.status === 'delivered' ? 'completed' : order.status === 'arrived' ? 'active' : ''}`}>
                <div className="status-icon"><Home size={20} /></div>
                <span>Delivered</span>
              </div>
            </div>

            <div className="confirmation-grid">
              {/* Order Items */}
              <div className="confirmation-section">
                <h3>Order Items</h3>
                <div className="confirmation-items">
                  {orderItems?.map(item => (
                    <div key={item.id} className="confirmation-item">
                      <img src={item.product_image} alt={item.product_name} />
                      <div className="item-details">
                        <p className="item-name">{item.product_name}</p>
                        <p className="item-meta">Size: {item.size} | Qty: {item.quantity}</p>
                      </div>
                      <span className="item-price">{formatPrice(item.total_price)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shipping Address */}
              <div className="confirmation-section">
                <h3>Shipping Address</h3>
                <div className="address-card">
                  <p className="address-name">{order.shipping_name}</p>
                  <p>{order.shipping_address}</p>
                  <p>{order.shipping_city}, {order.shipping_state} {order.shipping_pincode}</p>
                  <p>Phone: {order.shipping_phone}</p>
                </div>
              </div>

              {/* Payment Info */}
              <div className="confirmation-section">
                <h3>Payment</h3>
                <div className="payment-info">
                  <p>Method: <strong>{order.payment_method.toUpperCase()}</strong></p>
                  <p>Status: <strong>{order.payment_status}</strong></p>
                  <div className="payment-total">
                    <span>Total Paid:</span>
                    <span className="total-amount">{formatPrice(order.total)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="confirmation-actions">
              <Link 
                to={`/orders/${order.id}/invoice`}
                className="primary-button"
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <Download size={18} />
                Download Invoice
              </Link>
              <Link to={`/orders/${order.id}/track`} className="primary-button">
                Track Order
              </Link>
              <Link to="/shop" className="secondary-button">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
