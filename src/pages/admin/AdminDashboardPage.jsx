import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/Header';
import { Footer } from '../../components/SubscribeFooter';
import { useAuth } from '../../contexts/AuthContext';
import { useOrders } from '../../hooks/useOrders';
import { useProducts } from '../../hooks/useProducts';
import { useCustomDesignApparelTypes, useAppSettings, useApparelBasePrices, useApparelPrintPrices } from '../../hooks/useAppSettings';
import { formatPrice } from '../../lib/utils';
import { Package, Users, ShoppingBag, DollarSign, Tag, Megaphone, Settings, Check } from 'lucide-react';
import { supabase } from '../../integrations/supabase/client';
import { toast } from 'react-hot-toast';

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const { data: orders } = useOrders();
  const { data: products } = useProducts();
  const { data: apparelTypes = ['hoodie', 'tshirt'] } = useCustomDesignApparelTypes();
  const { data: basePrices = { hoodie: 999, tshirt: 499 } } = useApparelBasePrices();
  const { data: printPrices = { single: 299, both: 598 } } = useApparelPrintPrices();
  const { refetch: refetchSettings } = useAppSettings();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedApparelTypes, setSelectedApparelTypes] = useState(apparelTypes);
  const [editedBasePrices, setEditedBasePrices] = useState(basePrices);
  const [editedPrintPrices, setEditedPrintPrices] = useState(printPrices);
  const [isSaving, setIsSaving] = useState(false);

  // Sync selected types with fetched data
  useEffect(() => {
    setSelectedApparelTypes(apparelTypes);
  }, [apparelTypes]);

  // Sync pricing with fetched data
  useEffect(() => {
    setEditedBasePrices(basePrices);
  }, [basePrices]);

  useEffect(() => {
    setEditedPrintPrices(printPrices);
  }, [printPrices]);

  const handleSaveApparelTypes = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase.rpc('update_custom_design_apparel_types', {
        types: selectedApparelTypes
      });
      if (error) throw error;
      toast.success('Apparel types updated successfully!');
      refetchSettings();
    } catch (err) {
      toast.error('Failed to update apparel types');
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleApparelType = (type) => {
    if (selectedApparelTypes.includes(type)) {
      if (selectedApparelTypes.length > 1) {
        setSelectedApparelTypes(selectedApparelTypes.filter(t => t !== type));
      } else {
        toast.error('At least one apparel type must be selected');
      }
    } else {
      setSelectedApparelTypes([...selectedApparelTypes, type]);
    }
  };

  const handleSaveBasePrices = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase.rpc('update_apparel_base_prices', {
        prices: editedBasePrices
      });
      if (error) throw error;
      toast.success('Base prices updated successfully!');
      refetchSettings();
    } catch (err) {
      toast.error('Failed to update base prices');
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSavePrintPrices = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase.rpc('update_apparel_print_prices', {
        prices: editedPrintPrices
      });
      if (error) throw error;
      toast.success('Print prices updated successfully!');
      refetchSettings();
    } catch (err) {
      toast.error('Failed to update print prices');
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const activeOrders = orders?.filter(o => o.status !== 'cancelled') || [];
  const stats = {
    // Only count non-cancelled orders
    totalOrders: activeOrders.length,
    totalProducts: products?.length || 0,
    // Only sum revenue from paid orders
    totalRevenue: activeOrders
      .filter(o => o.payment_status === 'paid')
      .reduce((sum, o) => sum + (o.total || 0), 0),
    // Pending = awaiting payment confirmation or delivery
    pendingOrders: activeOrders.filter(o => o.status === 'pending').length,
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
                <Link to="/admin/campaigns" className="nav-item">
                  <Megaphone size={18} />
                  Campaigns
                </Link>
                <button
                  className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
                  onClick={() => setActiveTab('settings')}
                >
                  <Settings size={18} />
                  Settings
                </button>
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

              {activeTab === 'settings' && (
                <div className="admin-section">
                  <h2 className="animated-title">Custom Apparel Settings</h2>
                  
                  <div style={{ display: 'grid', gap: '40px' }}>
                    
                    {/* Apparel Types */}
                    <div>
                      <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '12px' }}>
                        Available Apparel Types
                      </h3>
                      <p style={{ color: '#666', marginBottom: '20px', fontSize: '14px' }}>
                        Select which apparel types are available for custom design uploads.
                      </p>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                        {['hoodie', 'tshirt'].map((type) => (
                          <label
                            key={type}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '12px',
                              padding: '16px',
                              border: '2px solid #e5e7eb',
                              borderRadius: '12px',
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                              background: selectedApparelTypes.includes(type) ? '#f3f4f6' : '#fff',
                              borderColor: selectedApparelTypes.includes(type) ? '#1a1a1a' : '#e5e7eb',
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={selectedApparelTypes.includes(type)}
                              onChange={() => toggleApparelType(type)}
                              style={{ width: '18px', height: '18px' }}
                            />
                            <span style={{ fontSize: '16px', fontWeight: 500, textTransform: 'capitalize' }}>
                              {type === 'hoodie' ? 'Hoodie' : 'T-Shirt'}
                            </span>
                            {selectedApparelTypes.includes(type) && (
                              <Check size={18} style={{ marginLeft: 'auto', color: '#22c55e' }} />
                            )}
                          </label>
                        ))}
                      </div>

                      <button
                        onClick={handleSaveApparelTypes}
                        disabled={isSaving}
                        style={{
                          padding: '10px 20px',
                          background: '#1a1a1a',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '14px',
                          fontWeight: 600,
                          cursor: isSaving ? 'not-allowed' : 'pointer',
                          opacity: isSaving ? 0.6 : 1,
                        }}
                      >
                        {isSaving ? 'Saving...' : 'Save Types'}
                      </button>
                    </div>

                    {/* Base Prices */}
                    <div>
                      <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '12px' }}>
                        Base Prices
                      </h3>
                      <p style={{ color: '#666', marginBottom: '20px', fontSize: '14px' }}>
                        Set the base price for each apparel type (shown on product page).
                      </p>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '20px' }}>
                        {['hoodie', 'tshirt'].map((type) => (
                          <div key={type} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <label style={{ fontSize: '15px', fontWeight: 500, minWidth: '100px', textTransform: 'capitalize' }}>
                              {type === 'hoodie' ? 'Hoodie' : 'T-Shirt'}
                            </label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontSize: '16px', color: '#666' }}>₹</span>
                              <input
                                type="number"
                                value={editedBasePrices[type] || ''}
                                onChange={(e) => setEditedBasePrices({
                                  ...editedBasePrices,
                                  [type]: parseInt(e.target.value) || 0
                                })}
                                style={{
                                  width: '120px',
                                  padding: '10px 12px',
                                  border: '2px solid #e5e7eb',
                                  borderRadius: '8px',
                                  fontSize: '15px',
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>

                      <button
                        onClick={handleSaveBasePrices}
                        disabled={isSaving}
                        style={{
                          padding: '10px 20px',
                          background: '#1a1a1a',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '14px',
                          fontWeight: 600,
                          cursor: isSaving ? 'not-allowed' : 'pointer',
                          opacity: isSaving ? 0.6 : 1,
                        }}
                      >
                        {isSaving ? 'Saving...' : 'Save Base Prices'}
                      </button>
                    </div>

                    {/* Print Prices */}
                    <div>
                      <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '12px' }}>
                        Print Location Prices
                      </h3>
                      <p style={{ color: '#666', marginBottom: '20px', fontSize: '14px' }}>
                        Set pricing for print locations (single = front or back, both = front + back).
                      </p>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <label style={{ fontSize: '15px', fontWeight: 500, minWidth: '150px' }}>
                            Single Location
                          </label>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '16px', color: '#666' }}>₹</span>
                            <input
                              type="number"
                              value={editedPrintPrices.single || ''}
                              onChange={(e) => setEditedPrintPrices({
                                ...editedPrintPrices,
                                single: parseInt(e.target.value) || 0
                              })}
                              style={{
                                width: '120px',
                                padding: '10px 12px',
                                border: '2px solid #e5e7eb',
                                borderRadius: '8px',
                                fontSize: '15px',
                              }}
                            />
                          </div>
                          <span style={{ fontSize: '13px', color: '#888' }}>(Front or Back)</span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <label style={{ fontSize: '15px', fontWeight: 500, minWidth: '150px' }}>
                            Both Locations
                          </label>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '16px', color: '#666' }}>₹</span>
                            <input
                              type="number"
                              value={editedPrintPrices.both || ''}
                              onChange={(e) => setEditedPrintPrices({
                                ...editedPrintPrices,
                                both: parseInt(e.target.value) || 0
                              })}
                              style={{
                                width: '120px',
                                padding: '10px 12px',
                                border: '2px solid #e5e7eb',
                                borderRadius: '8px',
                                fontSize: '15px',
                              }}
                            />
                          </div>
                          <span style={{ fontSize: '13px', color: '#888' }}>(Front + Back)</span>
                        </div>
                      </div>

                      <button
                        onClick={handleSavePrintPrices}
                        disabled={isSaving}
                        style={{
                          padding: '10px 20px',
                          background: '#1a1a1a',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '14px',
                          fontWeight: 600,
                          cursor: isSaving ? 'not-allowed' : 'pointer',
                          opacity: isSaving ? 0.6 : 1,
                        }}
                      >
                        {isSaving ? 'Saving...' : 'Save Print Prices'}
                      </button>
                    </div>

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
