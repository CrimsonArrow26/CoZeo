import { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/Header';
import { Footer } from '../../components/SubscribeFooter';
import { useOrders } from '../../hooks/useOrders';
import { ArrowLeft, Package, Search } from 'lucide-react';
import { formatPrice, formatDate } from '../../lib/utils';

export default function AdminOrdersPage() {
  const { data: orders, isLoading } = useOrders();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredOrders = orders?.filter(order => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.shipping_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusOptions = ['all', 'pending', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled'];

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
                <div key={order.id} className="admin-order-card">
                  <div className="order-header">
                    <div>
                      <p className="order-id">#{order.id.slice(-8).toUpperCase()}</p>
                      <p className="order-date">{formatDate(order.created_at)}</p>
                    </div>
                    <span className={`order-status ${order.status}`}>
                      {order.status}
                    </span>
                  </div>
                  
                  <div className="order-customer">
                    <p><strong>{order.shipping_name}</strong></p>
                    <p>{order.shipping_phone}</p>
                    <p className="order-address">{order.shipping_address}, {order.shipping_city}</p>
                  </div>
                  
                  <div className="order-footer">
                    <span className="order-total">{formatPrice(order.total)}</span>
                    <Link to={`/orders/${order.id}/track`} className="track-link">
                      View Details
                    </Link>
                  </div>
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
