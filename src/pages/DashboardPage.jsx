import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { Footer } from '../components/SubscribeFooter';
import { useAuth } from '../contexts/AuthContext';
import { useOrders } from '../hooks/useOrders';
import { formatPrice, formatDate } from '../lib/utils';
import { User, Package, Bell, LogOut, Edit3 } from 'lucide-react';
import { toast } from 'sonner';

export default function DashboardPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const activeTab = searchParams.get('tab') || 'profile';
  const isEditMode = searchParams.get('edit') === 'true';
  const { user, profile, signOut, updateProfile, isLoading } = useAuth();
  const { data: orders } = useOrders();
  
  const [profileForm, setProfileForm] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
  });

  // Update form when profile loads
  useEffect(() => {
    if (profile) {
      setProfileForm({
        name: profile.name || '',
        phone: profile.phone || '',
        address: profile.address || '',
        city: profile.city || '',
        state: profile.state || '',
        pincode: profile.pincode || '',
      });
    }
  }, [profile]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    console.log('Updating profile with:', profileForm);
    console.log('Current user:', user?.id);
    const { error } = await updateProfile(profileForm);
    if (error) {
      console.error('Profile update error:', error);
      toast.error('Failed to update profile: ' + error.message);
    } else {
      toast.success('Profile updated successfully');
      setSearchParams({ tab: 'profile' }); // Exit edit mode
    }
  };

  const handleSignOut = async () => {
    try {
      console.log('Sign out clicked');
      await signOut();
      console.log('Sign out successful');
      toast.success('Signed out successfully');
      navigate('/');
    } catch (err) {
      console.error('Sign out error:', err);
      toast.error('Failed to sign out');
    }
  };

  if (!user) {
    return (
      <div className="page-wrapper">
        <Header />
        <div className="section _100px">
          <div className="container">
            <div className="auth-required">
              <h2>Please sign in</h2>
              <p>You need to be logged in to view your dashboard.</p>
              <button className="primary-button">Sign In</button>
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
          <div className="dashboard-layout">
            {/* Sidebar */}
            <aside className="dashboard-sidebar">
              <div className="dashboard-user">
                <div className="user-avatar">
                  {profile?.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
                </div>
                <div className="user-info">
                  <p className="user-name">{profile?.name || 'User'}</p>
                  <p className="user-email">{user.email}</p>
                </div>
              </div>

              <nav className="dashboard-nav">
                <button
                  className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
                  onClick={() => setSearchParams({ tab: 'profile' })}
                >
                  <User size={18} />
                  Profile
                </button>
                <button
                  className={`nav-item ${activeTab === 'orders' ? 'active' : ''}`}
                  onClick={() => setSearchParams({ tab: 'orders' })}
                >
                  <Package size={18} />
                  My Orders
                </button>
                <button
                  className={`nav-item ${activeTab === 'notifications' ? 'active' : ''}`}
                  onClick={() => setSearchParams({ tab: 'notifications' })}
                >
                  <Bell size={18} />
                  Notifications
                </button>
              </nav>

              <button 
                className="edit-profile-btn"
                onClick={() => setSearchParams({ tab: 'profile', edit: 'true' })}
              >
                <Edit3 size={18} />
                Edit Profile
              </button>

              <button 
                type="button" 
                className="sign-out-btn" 
                onClick={(e) => {
                  console.log('Button clicked!', e);
                  handleSignOut();
                }}
              >
                <LogOut size={18} />
                Sign Out
              </button>
            </aside>

            {/* Main Content */}
            <div className="dashboard-content">
              {/* Profile Tab - View Mode */}
              {activeTab === 'profile' && !isEditMode && (
                <div className="dashboard-section">
                  <h2 className="animated-title">Profile Information</h2>
                  <div className="profile-view">
                    <div className="profile-view-row">
                      <div className="profile-view-item">
                        <label>Full Name</label>
                        <p>{profile?.name || 'Not set'}</p>
                      </div>
                      <div className="profile-view-item">
                        <label>Phone</label>
                        <p>{profile?.phone || 'Not set'}</p>
                      </div>
                    </div>
                    <div className="profile-view-item full-width">
                      <label>Address</label>
                      <p>{profile?.address || 'Not set'}</p>
                    </div>
                    <div className="profile-view-row">
                      <div className="profile-view-item">
                        <label>City</label>
                        <p>{profile?.city || 'Not set'}</p>
                      </div>
                      <div className="profile-view-item">
                        <label>State</label>
                        <p>{profile?.state || 'Not set'}</p>
                      </div>
                      <div className="profile-view-item">
                        <label>Pincode</label>
                        <p>{profile?.pincode || 'Not set'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Profile Tab - Edit Mode */}
              {activeTab === 'profile' && isEditMode && (
                <div className="dashboard-section">
                  <h2 className="animated-title">Edit Profile</h2>
                  <form onSubmit={handleProfileUpdate} className="profile-form">
                    <div className="form-row">
                      <div className="form-group text-box-anim">
                        <label>Full Name</label>
                        <input
                          type="text"
                          value={profileForm.name}
                          onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                          className={profileForm.name ? 'filled' : ''}
                        />
                      </div>
                      <div className="form-group text-box-anim text-box-anim-delay-1">
                        <label>Phone</label>
                        <input
                          type="tel"
                          value={profileForm.phone}
                          onChange={(e) => setProfileForm(prev => ({ ...prev, phone: e.target.value }))}
                          className={profileForm.phone ? 'filled' : ''}
                        />
                      </div>
                    </div>

                    <div className="form-group text-box-anim text-box-anim-delay-2">
                      <label>Address</label>
                      <textarea
                        value={profileForm.address}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, address: e.target.value }))}
                        rows={3}
                        className={profileForm.address ? 'filled' : ''}
                      />
                    </div>

                    <div className="form-row three-col">
                      <div className="form-group text-box-anim text-box-anim-delay-3">
                        <label>City</label>
                        <input
                          type="text"
                          value={profileForm.city}
                          onChange={(e) => setProfileForm(prev => ({ ...prev, city: e.target.value }))}
                          className={profileForm.city ? 'filled' : ''}
                        />
                      </div>
                      <div className="form-group text-box-anim text-box-anim-delay-3">
                        <label>State</label>
                        <input
                          type="text"
                          value={profileForm.state}
                          onChange={(e) => setProfileForm(prev => ({ ...prev, state: e.target.value }))}
                          className={profileForm.state ? 'filled' : ''}
                        />
                      </div>
                      <div className="form-group text-box-anim text-box-anim-delay-3">
                        <label>Pincode</label>
                        <input
                          type="text"
                          value={profileForm.pincode}
                          onChange={(e) => setProfileForm(prev => ({ ...prev, pincode: e.target.value }))}
                          className={profileForm.pincode ? 'filled' : ''}
                        />
                      </div>
                    </div>

                    <div className="form-actions">
                      <button 
                        type="button"
                        className="secondary-button"
                        onClick={() => setSearchParams({ tab: 'profile' })}
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit" 
                        className={`primary-button submit-btn ${profileForm.name && profileForm.phone && profileForm.address && profileForm.city && profileForm.state && profileForm.pincode ? 'active' : ''}`}
                      >
                        Save Changes
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Orders Tab */}
              {activeTab === 'orders' && (
                <div className="dashboard-section" style={{ marginBottom: '60px' }}>
                  <h2>My Orders</h2>
                  {orders?.length === 0 ? (
                    <div className="empty-state">
                      <p>No orders yet</p>
                      <Link to="/shop" className="primary-button">Start Shopping</Link>
                    </div>
                  ) : (
                    <div className="orders-list">
                      {orders?.map(order => {
                        const firstItem = order.items?.[0];
                        return (
                          <div 
                            key={order.id} 
                            className="order-card-compact"
                            onClick={() => navigate(`/orders/${order.id}/track`)}
                          >
                            <div className="order-compact-main">
                              {firstItem && (
                                <div className="order-compact-thumb">
                                  <img 
                                    src={firstItem.product_image || '/placeholder-product.jpg'} 
                                    alt={firstItem.product_name}
                                  />
                                </div>
                              )}
                              <div className="order-compact-info">
                                <p className="order-id">#{order.display_id || order.id.slice(-8).toUpperCase()}</p>
                                <p className="order-date">{formatDate(order.created_at)}</p>
                                {firstItem && (
                                  <p className="item-name">{firstItem.product_name}</p>
                                )}
                              </div>
                              <div className="order-compact-status">
                                <span className={`order-status ${order.status}`}>
                                  {order.status}
                                </span>
                                <span className={`payment-status ${order.payment_status}`}>
                                  {order.payment_status}
                                </span>
                                <span className="order-compact-total">{formatPrice(order.total)}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <div className="dashboard-section">
                  <h2>Notifications</h2>
                  <div className="empty-state">
                    <p>No notifications yet</p>
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
