import { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/Header';
import { Footer } from '../../components/SubscribeFooter';
import { useAuth } from '../../contexts/AuthContext';
import { useOrders } from '../../hooks/useOrders';
import { useProducts } from '../../hooks/useProducts';
import { formatPrice } from '../../lib/utils';
import { Package, Users, ShoppingBag, DollarSign, Tag } from 'lucide-react';

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const { data: orders } = useOrders();
  const { data: products } = useProducts();
  
  const [activeTab, setActiveTab] = useState('overview');

  const stats = {
    totalOrders: orders?.length || 0,
    totalProducts: products?.length || 0,
    totalRevenue: orders?.reduce((sum, o) => sum + (o.total || 0), 0) || 0,
    pendingOrders: orders?.filter(o => o.status === 'pending').length || 0,
  };

  return (
    <div className="page-wrapper">
      <Header />
      
      <div className="section _100px">
        <div className="container">
          <div className="admin-layout">
            {/* Sidebar */}
            <aside className="admin-sidebar">
              <div className="admin-user">
                <div className="user-avatar admin">A</div>
                <div className="user-info">
                  <p className="user-name">Admin</p>
                  <p className="user-email">{user?.email}</p>
                </div>
              </div>

              <nav className="admin-nav">
                <button
                  className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
                  onClick={() => setActiveTab('overview')}
                >
                  <DollarSign size={18} />
                  Overview
                </button>
                <Link to="/admin/products" className="nav-item">
                  <ShoppingBag size={18} />
                  Products
                </Link>
                <Link to="/admin/orders" className="nav-item">
                  <Package size={18} />
                  Orders
                </Link>
                <Link to="/admin/coupons" className="nav-item">
                  <Tag size={18} />
                  Coupons
                </Link>
              </nav>
            </aside>

            {/* Main Content */}
            <div className="admin-content">
              {activeTab === 'overview' && (
                <div className="admin-section">
                  <h2 className="animated-title">Admin Dashboard</h2>
                  
                  <div className="stats-grid" style={{ marginBottom: '60px' }}>
                    <div className="stat-card">
                      <div className="stat-icon">
                        <Package size={24} />
                      </div>
                      <div className="stat-info">
                        <p className="stat-value">{stats.totalOrders}</p>
                        <p className="stat-label">Total Orders</p>
                      </div>
                    </div>
                    
                    <div className="stat-card">
                      <div className="stat-icon">
                        <ShoppingBag size={24} />
                      </div>
                      <div className="stat-info">
                        <p className="stat-value">{stats.totalProducts}</p>
                        <p className="stat-label">Products</p>
                      </div>
                    </div>
                    
                    <div className="stat-card">
                      <div className="stat-icon">
                        <DollarSign size={24} />
                      </div>
                      <div className="stat-info">
                        <p className="stat-value">{formatPrice(stats.totalRevenue)}</p>
                        <p className="stat-label">Revenue</p>
                      </div>
                    </div>
                    
                    <div className="stat-card warning">
                      <div className="stat-icon">
                        <Users size={24} />
                      </div>
                      <div className="stat-info">
                        <p className="stat-value">{stats.pendingOrders}</p>
                        <p className="stat-label">Pending Orders</p>
                      </div>
                    </div>
                  </div>

                  <div className="admin-actions">
                    <Link to="/admin/products" className="admin-action-card">
                      <ShoppingBag size={32} />
                      <h3>Manage Products</h3>
                      <p>Add, edit, or remove products from your store</p>
                    </Link>
                    
                    <Link to="/admin/orders" className="admin-action-card">
                      <Package size={32} />
                      <h3>Manage Orders</h3>
                      <p>View and update order statuses</p>
                    </Link>
                    
                    <Link to="/admin/coupons" className="admin-action-card">
                      <Tag size={32} />
                      <h3>Manage Coupons</h3>
                      <p>Create and manage discount coupons</p>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
