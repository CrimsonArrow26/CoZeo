import { useParams, Link, useLocation } from 'react-router-dom';
import Header from '../components/Header';
import { Footer } from '../components/SubscribeFooter';
import { useOrder, useOrderItems } from '../hooks/useOrders';
import { formatPrice, formatDate } from '../lib/utils';
import { CheckCircle, Package, Truck, Home, MapPin, ClipboardCheck, Clock } from 'lucide-react';

const STAGES = [
  { key: 'confirmed', label: 'Confirmed', icon: ClipboardCheck },
  { key: 'packed', label: 'Packed', icon: Package },
  { key: 'shipped', label: 'Shipped', icon: Truck },
  { key: 'arrived', label: 'Arrived', icon: MapPin },
  { key: 'delivered', label: 'Delivered', icon: Home },
];

export default function OrderTrackingPage() {
  const { id } = useParams();
  const location = useLocation();
  const { data: order, isLoading } = useOrder(id || '');
  const { data: orderItems } = useOrderItems(id || '');
  
  // Check if user came from admin orders
  const fromAdmin = location.state?.from === 'admin';

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

  // Get current stage index
  const getCurrentStageIndex = () => {
    const statusOrder = ['confirmed', 'packed', 'shipped', 'arrived', 'delivered'];
    const index = statusOrder.indexOf(order.status);
    return index >= 0 ? index : 0;
  };

  const currentStageIndex = getCurrentStageIndex();
  const isCancelled = order.status === 'cancelled';
  const isReturn = order.status === 'return_requested' || order.status === 'returned';

  return (
    <div className="page-wrapper">
      <Header />
      
      <div className="section _100px">
        <div className="container">
          <div className="order-tracking">
            {/* Header */}
            <div className="tracking-header">
              <h1>Order #{order.display_id || order.id.slice(-8).toUpperCase()}</h1>
              <p className="tracking-date">Placed on {formatDate(order.created_at)}</p>
            </div>

            {/* Exception States */}
            {isCancelled && (
              <div className="status-banner cancelled">
                <p>Order Cancelled</p>
              </div>
            )}
            {isReturn && (
              <div className="status-banner return">
                <p>Return in Progress</p>
              </div>
            )}

            {/* Tracking Progress */}
            {!isCancelled && !isReturn && (
              <div className="tracking-progress">
                <div className="progress-steps">
                  {STAGES.map((stage, index) => {
                    const Icon = stage.icon;
                    const isCompleted = index <= currentStageIndex;
                    const isActive = index === currentStageIndex;
                    
                    return (
                      <div key={stage.key} className={`progress-step ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}`}>
                        <div className="step-icon">
                          <Icon size={24} />
                        </div>
                        <span className="step-label">{stage.label}</span>
                        {isCompleted && order.status_history?.[index] && (
                          <span className="step-date">
                            {formatDate(order.status_history[index].timestamp)}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Order Details */}
            <div className="tracking-details">
              {/* Items */}
              <div className="tracking-section">
                <h3>Items</h3>
                <div className="tracking-items">
                  {orderItems?.map(item => (
                    <div key={item.id} className="tracking-item">
                      <img src={item.product_image} alt={item.product_name} />
                      <div className="item-info">
                        <p className="item-name">{item.product_name}</p>
                        <p className="item-meta">Size: {item.size} | Color: {item.color} × {item.quantity}</p>
                      </div>
                      <span className="item-price">{formatPrice(item.total_price)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shipping Address */}
              <div className="tracking-section">
                <h3>Delivering to</h3>
                <div className="address-card">
                  <p className="address-name">{order.shipping_name}</p>
                  <p>{order.shipping_address}</p>
                  <p>{order.shipping_city} · {order.shipping_pincode}</p>
                </div>
              </div>

              {/* Payment Info */}
              <div className="tracking-section">
                <h3>Payment</h3>
                <div className="payment-info">
                  <p>Method: <strong>{order.payment_method.toUpperCase()}</strong></p>
                  <p>Status: <strong>{order.payment_status}</strong></p>
                  <p className="total">Total: <strong>{formatPrice(order.total)}</strong></p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="tracking-actions">
              <Link 
                to={fromAdmin ? '/admin/orders' : '/dashboard?tab=orders'} 
                state={fromAdmin ? undefined : { from: 'tracking' }}
                className="secondary-button"
              >
                {fromAdmin ? '← Back to Manage Orders' : 'Back to Orders'}
              </Link>
              {order.status === 'delivered' && (
                <Link to={`/orders/${order.id}/return`} className="primary-button">
                  Request Return
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
