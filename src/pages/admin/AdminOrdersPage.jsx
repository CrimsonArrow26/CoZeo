import { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/Header';
import { Footer } from '../../components/SubscribeFooter';
import { useOrders, useUpdateOrderStatus } from '../../hooks/useOrders';
import { ArrowLeft, Package, Search, CreditCard, Truck } from 'lucide-react';
import { formatPrice, formatDateTime } from '../../lib/utils';
import { toast } from 'sonner';

export default function AdminOrdersPage() {
  const { data: orders, isLoading } = useOrders();
  const updateOrderStatus = useUpdateOrderStatus();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editingOrder, setEditingOrder] = useState(null);
  const [expandedOrder, setExpandedOrder] = useState(null);

  const filteredOrders = orders?.filter(order => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.shipping_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.display_id?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusOptions = ['all', 'pending', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled'];
  const availableStatuses = ['pending', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled'];

  const handleStatusChange = async (orderId, newStatus, currentStatus) => {
    if (newStatus === currentStatus) return;
    
    try {
      await updateOrderStatus.mutateAsync({ 
        id: orderId, 
        status: newStatus,
        note: `Status updated by admin from ${currentStatus} to ${newStatus}`
      });
      toast.success(`Order status updated to ${newStatus}`);
      setEditingOrder(null);
    } catch (error) {
      toast.error('Failed to update order status');
      console.error(error);
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'payment-paid';
      case 'pending': return 'payment-pending';
      case 'failed': return 'payment-failed';
      default: return '';
    }
  };

  const canChangeStatus = (order) => {
    // Only allow status changes if payment is confirmed for online payments
    if (order.payment_method !== 'cod' && order.payment_status !== 'paid') {
      return false;
    }
    return true;
  };

  const toggleExpand = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
    if (editingOrder && editingOrder !== orderId) {
      setEditingOrder(null);
    }
  };

  if (isLoading) {
    return (
      <div className="page-wrapper">
        <Header />
        <div className="section _100px">
          <div className="container">
            <div className="loading">Loading orders...</div>
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
          <div className="admin-header">
            <Link to="/admin" className="back-link">
              <ArrowLeft size={18} />
              Back to Dashboard
            </Link>
            <h1>Manage Orders</h1>
          </div>

          <div className="admin-filters">
            <div className="search-box">
              <Search size={18} />
              <input
                type="text"
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="filter-select"
            >
              {statusOptions.map(status => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="admin-orders-list">
            {filteredOrders?.length === 0 ? (
              <div className="empty-state">
                <Package size={48} />
                <p>No orders found</p>
              </div>
            ) : (
              filteredOrders?.map(order => (
                <div 
                  key={order.id} 
                  className={`admin-order-card ${expandedOrder === order.id ? 'expanded' : ''}`}
                  onClick={() => toggleExpand(order.id)}
                >
                  {/* Compact Horizontal Row - Always Visible */}
                  <div className="order-compact-row">
                    <div className="order-compact-info">
                      <div className="order-compact-main">
                        <p className="order-id">#{order.display_id || order.id.slice(-8).toUpperCase()}</p>
                        <p className="order-date">{formatDateTime(order.created_at)}</p>
                      </div>
                      <div className="order-compact-customer">
                        <p className="customer-name">{order.shipping_name}</p>
                        <p className="customer-phone">{order.shipping_phone}</p>
                      </div>
                    </div>
                    <div className="order-compact-status">
                      <span className={`order-status ${order.status}`}>
                        {order.status}
                      </span>
                      <span className={`payment-status ${getPaymentStatusColor(order.payment_status)}`}>
                        <CreditCard size={10} />
                        {order.payment_status}
                      </span>
                    </div>
                    <div className="order-compact-total">
                      <span className="order-total">{formatPrice(order.total)}</span>
                      <span className="expand-hint">{expandedOrder === order.id ? '▲' : '▼'}</span>
                    </div>
                  </div>

                  {/* Expanded Details - Only when clicked */}
                  {expandedOrder === order.id && (
                    <div className="order-expanded-content" onClick={(e) => e.stopPropagation()}>
                      <div className="order-customer">
                        <p><strong>{order.shipping_name}</strong></p>
                        <p>{order.shipping_phone}</p>
                        <p className="order-address">{order.shipping_address}, {order.shipping_city}</p>
                      </div>

                      <div className="order-payment-info">
                        <div className="payment-detail">
                          <span className="label">Payment:</span>
                          <span className="value">{order.payment_method?.toUpperCase()}</span>
                        </div>
                        <div className="payment-detail">
                          <span className="label">Status:</span>
                          <span className={`value ${order.payment_status}`}>{order.payment_status}</span>
                        </div>
                      </div>
                      
                      <div className="order-actions">
                        {editingOrder === order.id ? (
                          <div className="status-editor">
                            <select 
                              value={order.status}
                              onChange={(e) => handleStatusChange(order.id, e.target.value, order.status)}
                              disabled={updateOrderStatus.isPending || !canChangeStatus(order)}
                            >
                              {availableStatuses.map(status => (
                                <option key={status} value={status}>
                                  {status.charAt(0).toUpperCase() + status.slice(1)}
                                </option>
                              ))}
                            </select>
                            <button 
                              className="btn-cancel"
                              onClick={() => setEditingOrder(null)}
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="action-buttons">
                            <button 
                              className="btn-edit-status"
                              onClick={() => setEditingOrder(order.id)}
                              disabled={!canChangeStatus(order)}
                              title={!canChangeStatus(order) ? 'Payment must be completed first' : 'Change order status'}
                            >
                              <Truck size={16} />
                              Update Status
                            </button>
                            <Link 
                              to={`/orders/${order.id}/track`} 
                              state={{ from: 'admin' }}
                              className="track-link"
                            >
                              View Details
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
