import { useParams, Link, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { X, ZoomIn, Download } from 'lucide-react';
import Header from '../../components/Header';
import { Footer } from '../../components/SubscribeFooter';
import { useOrder, useOrderItems, useUpdateOrderStatus, useUpdatePaymentStatus, useDeleteOrder, orderKeys } from '../../hooks/useOrders';
import { formatPrice, formatDate } from '../../lib/utils';
import { CheckCircle, Package, Truck, Home, MapPin, ClipboardCheck, Clock, Palette, ArrowLeft, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../integrations/supabase/client';

const ORDER_STATUSES = ['confirmed', 'packed', 'shipped', 'arrived', 'delivered', 'cancelled'];

// Custom Design Modal Component
function CustomDesignModal({ selectedCustomItem, onClose }) {
  const modalRef = useRef(null);

  // Prevent scroll events from bubbling to body (same pattern as CartSidebar)
  useEffect(() => {
    const container = modalRef.current;
    if (!container) return;

    const preventScroll = (e) => {
      e.stopPropagation();
    };

    container.addEventListener('wheel', preventScroll, { passive: false });
    container.addEventListener('touchmove', preventScroll, { passive: false });

    return () => {
      container.removeEventListener('wheel', preventScroll);
      container.removeEventListener('touchmove', preventScroll);
    };
  }, []);

  const handleDownload = async (url, label) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `${label.replace(/\s+/g, '_')}_${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error('Download failed:', err);
      window.open(url, '_blank');
    }
  };

  return (
    <div className="custom-design-modal-overlay" onClick={onClose}>
      <div ref={modalRef} className="custom-design-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Custom Design Details</h3>
          <button className="modal-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>
        <div className="modal-content">
          <div className="item-details">
            <p className="item-name">{selectedCustomItem.product_name}</p>
            <p className="item-meta">
              Size: {selectedCustomItem.size} | Color: {selectedCustomItem.color} × {selectedCustomItem.quantity}
            </p>
            <p className="item-price">{formatPrice(selectedCustomItem.total_price)}</p>
          </div>

          {/* Custom Notes Section */}
          <div style={{
            background: '#f9fafb',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '24px',
            border: '1px solid #e5e7eb'
          }}>
            <h4 style={{
              margin: '0 0 12px 0',
              fontSize: '16px',
              fontWeight: 600,
              color: '#111'
            }}>
              Design Instructions
            </h4>
            <p style={{
              margin: 0,
              fontSize: '14px',
              color: '#374151',
              lineHeight: '1.6',
              whiteSpace: 'pre-wrap'
            }}>
              {selectedCustomItem.custom_notes || 'No instructions provided'}
            </p>
          </div>

          <div className="modal-designs">
            {selectedCustomItem.custom_design_front && (
              <div className="modal-design-card">
                <span className="design-label">Front Design</span>
                <img
                  src={selectedCustomItem.custom_design_front}
                  alt="Front custom design"
                  className="modal-design-image"
                />
                <button
                  onClick={() => handleDownload(selectedCustomItem.custom_design_front, 'front_design')}
                  className="download-btn"
                >
                  <Download size={16} />
                  Download
                </button>
              </div>
            )}
            {selectedCustomItem.custom_design_back && (
              <div className="modal-design-card">
                <span className="design-label">Back Design</span>
                <img
                  src={selectedCustomItem.custom_design_back}
                  alt="Back custom design"
                  className="modal-design-image"
                />
                <button
                  onClick={() => handleDownload(selectedCustomItem.custom_design_back, 'back_design')}
                  className="download-btn"
                >
                  <Download size={16} />
                  Download
                </button>
              </div>
            )}
            {!selectedCustomItem.custom_design_front && !selectedCustomItem.custom_design_back && (
              <div className="no-design-message">
                <p>No custom design images found.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminOrderDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [editingStatus, setEditingStatus] = useState(false);
  const [selectedCustomItem, setSelectedCustomItem] = useState(null);

  const { data: order, isLoading: orderLoading } = useOrder(id || '');
  const { data: orderItems, isLoading: itemsLoading } = useOrderItems(id || '');
  const updateOrderStatus = useUpdateOrderStatus();
  const updatePaymentStatus = useUpdatePaymentStatus();
  const deleteOrder = useDeleteOrder();

  // Control body scroll when modal is open (same pattern as Header.jsx cart)
  useEffect(() => {
    document.body.style.overflow = selectedCustomItem ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [selectedCustomItem]);

  if (orderLoading || itemsLoading) {
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
            <div className="error">Order not found</div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const handleStatusChange = (newStatus) => {
    updateOrderStatus.mutate(
      { id: order.id, status: newStatus },
      {
        onSuccess: () => {
          toast.success(`Order status updated to ${newStatus}`);
          queryClient.invalidateQueries({ queryKey: orderKeys.all });
          setEditingStatus(false);
        },
        onError: (error) => {
          toast.error(`Failed to update status: ${error.message}`);
        },
      }
    );
  };

  const handleConfirmPayment = () => {
    if (confirm(`Confirm payment received for order ${order.display_id || order.id.slice(0, 8)}?`)) {
      updatePaymentStatus.mutate(
        { id: order.id, paymentStatus: 'paid' },
        {
          onSuccess: () => {
            toast.success('Payment confirmed');
            queryClient.invalidateQueries({ queryKey: orderKeys.all });
          },
          onError: (error) => {
            toast.error(`Failed to confirm payment: ${error.message}`);
          },
        }
      );
    }
  };

  const handleDeleteOrder = () => {
    if (confirm(`Are you sure you want to DELETE order ${order.display_id || order.id.slice(0, 8)}? This action cannot be undone.`)) {
      deleteOrder.mutate(order.id, {
        onSuccess: () => {
          toast.success('Order deleted successfully');
          queryClient.invalidateQueries({ queryKey: orderKeys.all });
          navigate('/admin/orders');
        },
        onError: (error) => {
          toast.error(`Failed to delete order: ${error.message}`);
        },
      });
    }
  };

  return (
    <div className="page-wrapper">
      <Header />
      <div className="section _100px">
        <div className="container">
          {/* Back Link */}
          <Link to="/admin/orders" className="admin-back-link">
            <ArrowLeft size={18} />
            Back to Orders
          </Link>

          {/* Header */}
          <div className="admin-order-header">
            <h1>Order #{order.display_id || order.id.slice(0, 8).toUpperCase()}</h1>
            <p>Placed on {formatDate(order.created_at)}</p>
          </div>

          {/* Admin Actions Bar */}
          <div className="admin-actions-bar">
            <div className="status-section">
              <span className="status-label">Status:</span>
              {editingStatus ? (
                <div className="status-editor">
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    disabled={updateOrderStatus.isPending}
                  >
                    {ORDER_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </option>
                    ))}
                  </select>
                  <button className="btn-cancel" onClick={() => setEditingStatus(false)}>
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="status-display">
                  <span className={`status-badge ${order.status}`}>{order.status}</span>
                  <button className="btn-edit" onClick={() => setEditingStatus(true)}>
                    Update Status
                  </button>
                </div>
              )}
            </div>

            <div className="payment-section">
              <span className="status-label">Payment:</span>
              <span className={`status-badge ${order.payment_status}`}>{order.payment_status}</span>
              {order.payment_method === 'cod' && order.payment_status === 'pending' && (
                <button className="btn-confirm" onClick={handleConfirmPayment} disabled={updatePaymentStatus.isPending}>
                  <CreditCard size={16} />
                  Confirm Payment
                </button>
              )}
            </div>

            <button className="btn-delete" onClick={handleDeleteOrder} disabled={deleteOrder.isPending}>
            Delete Order
            </button>
          </div>

          {/* Progress Timeline */}
          <div className="tracking-timeline">
            {ORDER_STATUSES.slice(0, 5).map((status, idx) => {
              const isCompleted = ORDER_STATUSES.indexOf(order.status) >= idx;
              const isCurrent = order.status === status;
              const icons = [ClipboardCheck, Package, Truck, MapPin, Home];
              const Icon = icons[idx];

              return (
                <div key={status} className={`timeline-step ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}>
                  <div className="step-icon">
                    <Icon size={24} />
                  </div>
                  <p className="step-label">{status.charAt(0).toUpperCase() + status.slice(1)}</p>
                </div>
              );
            })}
          </div>

          <div className="admin-order-content">
            {/* Left Column - Items */}
            <div className="order-main">
              <div className="tracking-section">
                <h3>Order Items</h3>
                <div className="tracking-items">
                  {orderItems?.map((item) => (
                    <div
                      key={item.id}
                      className={`tracking-item ${item.custom_design_id ? 'custom-design-item' : ''}`}
                      onClick={() => item.custom_design_id && setSelectedCustomItem(item)}
                      style={{ cursor: item.custom_design_id ? 'pointer' : 'default' }}
                    >
                      <img src={item.product_image} alt={item.product_name} />
                      <div className="item-info">
                        <p className="item-name">{item.product_name}</p>
                        <p className="item-meta">
                          Size: {item.size} | Color: {item.color} × {item.quantity}
                        </p>
                        {(item.custom_design_id || item.custom_design_front || item.custom_design_back) && (
                          <>
                            <div className="custom-design-badge">
                              <Palette size={14} />
                              Custom Design
                            </div>
                            <button
                              className="view-design-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedCustomItem(item);
                              }}
                            >
                              <ZoomIn size={14} />
                              View Custom Design
                            </button>
                          </>
                        )}
                      </div>
                      <span className="item-price">{formatPrice(item.total_price)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shipping Address */}
              <div className="tracking-section">
                <h3>Shipping Address</h3>
                <div className="address-card">
                  <p className="address-name">{order.shipping_name}</p>
                  <p>{order.shipping_address}</p>
                  <p>{order.shipping_city} · {order.shipping_pincode}</p>
                  <p>Phone: {order.shipping_phone}</p>
                </div>
              </div>

              {/* Payment Info */}
              <div className="tracking-section">
                <h3>Payment Information</h3>
                <div className="payment-info">
                  <p>Method: <strong>{order.payment_method?.toUpperCase()}</strong></p>
                  <p>Status: <strong className={order.payment_status}>{order.payment_status}</strong></p>
                  <p className="total">Order Total: <strong>{formatPrice(order.total)}</strong></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Custom Design Modal */}
      {selectedCustomItem && (
        <CustomDesignModal
          selectedCustomItem={selectedCustomItem}
          onClose={() => setSelectedCustomItem(null)}
        />
      )}

      <Footer />
    </div>
  );
}
