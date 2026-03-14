import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../CartContext';
import { useAuth } from '../contexts/AuthContext';
import { formatPrice } from '../lib/utils';
import { toast } from 'sonner';

function CartSidebar({ onClose }) {
  const { cartItems, removeFromCart, updateQty, subtotal } = useCart();
  return (
    <div className="w-commerce-commercecartcontainerwrapper w-commerce-commercecartcontainerwrapper--cartType-rightSidebar" style={{ display: 'flex' }}>
      <div className="w-commerce-commercecartcontainer" role="dialog">
        <div className="w-commerce-commercecartheader">
          <h3 className="w-commerce-commercecartheading cart-title">Your Cart</h3>
          <a className="w-commerce-commercecartcloselink close-button w-inline-block" role="button" onClick={onClose}>
            <svg width="16px" height="16px" viewBox="0 0 16 16"><g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd"><g fillRule="nonzero" fill="#333333"><polygon points="6.23223305 8 0.616116524 13.6161165 2.38388348 15.3838835 8 9.76776695 13.6161165 15.3838835 15.3838835 13.6161165 9.76776695 8 15.3838835 2.38388348 13.6161165 0.616116524 8 6.23223305 2.38388348 0.616116524 0.616116524 2.38388348 6.23223305 8"></polygon></g></g></svg>
          </a>
        </div>
        <div className="w-commerce-commercecartformwrapper">
          {cartItems.length === 0 ? (
            <div className="w-commerce-commercecartemptystate cart-empty-state">
              <div>No items found.</div>
            </div>
          ) : (
            <form className="w-commerce-commercecartform" style={{ display: 'block' }}>
              <div className="w-commerce-commercecartlist">
                {cartItems.map(item => (
                  <div key={`${item.id}-${item.size}`} className="w-commerce-commercecartitem cart-item">
                    <img src={item.images?.[0] || '/images/placeholder.jpg'} alt={item.name} className="w-commerce-commercecartitemimage" />
                    <div className="w-commerce-commercecartiteminfo">
                      <div className="w-commerce-commercecartproductname cart-product-title">{item.name}</div>
                      <div className="cart-price">{formatPrice(item.price * item.qty)}</div>
                      <ul className="w-commerce-commercecartoptionlist">
                        <li className="cart-size"><span>Size: {item.size}</span></li>
                      </ul>
                      <a href="#" className="cart-product-remove w-inline-block" onClick={e => { e.preventDefault(); removeFromCart(item.id, item.size); }}>
                        <div className="cart-remove">Remove</div>
                      </a>
                    </div>
                    <div className="cart-quantity-wrapper">
                      <div className="quantity-stepper">
                        <button 
                          type="button" 
                          className="qty-btn minus"
                          onClick={() => updateQty(item.id, item.size, Math.max(1, item.qty - 1))}
                        >−</button>
                        <span className="qty-value">{item.qty}</span>
                        <button 
                          type="button" 
                          className="qty-btn plus"
                          onClick={() => updateQty(item.id, item.size, item.qty + 1)}
                        >+</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="w-commerce-commercecartfooter cart-footer">
                <div className="w-commerce-commercecartlineitem">
                  <div className="cart-product-text">Subtotal</div>
                  <div className="w-commerce-commercecartordervalue cart-total-price">{formatPrice(subtotal)}</div>
                </div>
                <div>
                  <Link to="/checkout" className="w-commerce-commercecartcheckoutbutton checkout-button" onClick={onClose}>
                    Continue to Checkout
                  </Link>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function LoginSidebar({ isSignup, onClose, onToggle, onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    
    setIsLoading(true);
    
    const result = isSignup 
      ? await onLogin.signUp(email, password, name)
      : await onLogin.signIn(email, password);
    
    if (result.error) {
      toast.error(result.error.message);
    } else {
      toast.success(isSignup ? 'Account created! Please check your email.' : 'Welcome back!');
      if (!isSignup) onClose();
    }
    
    setIsLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    const result = await onLogin.signInWithGoogle();
    if (result.error) {
      toast.error(result.error.message);
      setIsLoading(false);
    }
    // OAuth will redirect, so no need to close modal
  };

  return (
    <div className={isSignup ? "account-signup-sidebar open" : "account-login-sidebar open"}>
      <div className="account-sidebar-header">
        <p className="account-sidebar-header-text">{isSignup ? 'Create Account' : 'Sign in'}</p>
        <div className="account-sidebar-close-btn" onClick={onClose}>
          <img src="/images/close.png" alt="" className="account-sidebar-close-icon" />
          <p className="account-sidebar-close-text">Close</p>
        </div>
      </div>
      <div className="account-sidebar-form-box">
        <div className="account-login-form-block w-form">
          <form className="account-login-form" onSubmit={handleSubmit}>
            {isSignup && (
              <div className="account-login-form-group">
                <label className="account-login-label">Full Name *</label>
                <input 
                  className="account-login-input w-input" 
                  type="text" 
                  required 
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Enter your full name"
                />
              </div>
            )}
            <div className="account-login-form-group">
              <label className="account-login-label">Email address *</label>
              <input 
                className="account-login-input w-input" 
                type="email" 
                required 
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Enter your email"
              />
            </div>
            <div className="account-login-form-group">
              <label className="account-login-label">Password *</label>
              <input 
                className="account-login-input w-input" 
                type="password" 
                required 
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter your password"
                minLength={6}
              />
            </div>
            <input 
              type="submit" 
              className="account-login-btn w-button" 
              value={isLoading ? 'Please wait...' : (isSignup ? 'Sign Up' : 'Log in')}
              disabled={isLoading}
            />
            {!isSignup && (
              <div className="account-login-form-footer">
                <label className="w-checkbox account-login-checkbox-field">
                  <input type="checkbox" className="w-checkbox-input account-login-checkbox" />
                  <span className="account-login-checkbox-label w-form-label">Remember me</span>
                </label>
                <a href="#" className="account-login-forget-pass-link w-inline-block" onClick={e => { e.preventDefault(); toast.info('Password reset coming soon'); }}>
                  <p className="account-login-forget-pass-text">Lost your password?</p>
                </a>
              </div>
            )}
            <div className="account-login-dvider-box">
              <div className="account-login-dvider"></div>
              <p className="account-login-dvider-text">Or {isSignup ? 'Signup' : 'login'} with</p>
              <div className="account-login-dvider"></div>
            </div>
            <div className="account-login-social-box">
              <a href="#" className="account-login-social-button facebook w-inline-block" onClick={e => { e.preventDefault(); toast.info('Facebook login coming soon'); }}>
                <img src="/images/facebook.png" alt="" className="account-login-social-button-icon" />
                <div className="account-login-social-button-text">Facebook</div>
              </a>
              <a href="#" className="account-login-social-button google w-inline-block" onClick={e => { e.preventDefault(); handleGoogleSignIn(); }}>
                <img src="/images/google.avif" alt="" className="account-login-social-button-icon" />
                <div className="account-login-social-button-text">Google</div>
              </a>
            </div>
          </form>
        </div>
      </div>
      <div className="account-sidebar-footer">
        <img src="/images/user-20-2--1.avif" alt="" className="account-sidebar-footer-icon" />
        <p className="account-sidebar-footer-text">{isSignup ? 'Already have an account?' : 'No account yet?'}</p>
        <p className="account-sidebar-footer-link-text" onClick={onToggle}>
          {isSignup ? 'Login Account' : 'Create an Account'}
        </p>
      </div>
    </div>
  );
}

function UserDropdown({ user, profile, isAdmin, onSignOut }) {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  console.log('UserDropdown render:', { email: user?.email, isAdmin, profileName: profile?.name });

  return (
    <div className="user-dropdown">
      <div className="account-login-button" onClick={() => setIsOpen(!isOpen)}>
        <img src="/images/user-20-2-.avif" alt="" className="account-login-icon" />
      </div>
      {isOpen && (
        <div className="user-dropdown-menu">
          <div className="dropdown-header">
            <p className="dropdown-name">{profile?.name || 'User'}</p>
            <p className="dropdown-email">{user.email}</p>
          </div>
          <div className="dropdown-links">
            <Link to="/dashboard" className="dropdown-link" onClick={() => setIsOpen(false)}>Dashboard</Link>
            <Link to="/dashboard?tab=orders" className="dropdown-link" onClick={() => setIsOpen(false)}>My Orders</Link>
            {isAdmin && (
              <Link to="/admin" className="dropdown-link admin-link" onClick={() => setIsOpen(false)}>Admin Panel</Link>
            )}
            <button className="dropdown-link sign-out" onClick={() => { onSignOut(); setIsOpen(false); }}>
              Sign Out
            </button>
          </div>
        </div>
      )}
      {isOpen && <div className="dropdown-overlay" onClick={() => setIsOpen(false)}></div>}
    </div>
  );
}

export default function Header() {
  const { totalItems, cartOpen, setCartOpen } = useCart();
  const { user, profile, isAdmin, signIn, signUp, signInWithGoogle, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (e, id) => {
    e.preventDefault();
    setMobileOpen(false);
    if (location.pathname !== '/') {
      window.location.href = `/#${id}`;
      return;
    }
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    document.body.style.overflow = (cartOpen || loginOpen || mobileOpen) ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [cartOpen, loginOpen, mobileOpen]);

  const scrollItems = [
    { id: 'Hero-Section', label: 'Home' },
    { id: 'About-Section', label: 'About Us' },
    { id: 'Featured-Section', label: 'Collection' },
    { id: 'Category-Section', label: 'Category' },
  ];

  const routeItems = [
    { to: '/shop', label: 'Shop' },
  ];

  return (
    <>
      <div className="header-top">
        <p className="header-top-text">CoZeo - Streetwear for the Bold, Built for the Movement</p>
      </div>
      <header className={`main-header${scrolled ? " scrolled" : ""}`}>
        <div className="w-layout-blockcontainer container w-container">
          <div className="header-main-box">
            <Link to="/" className="header-logo-link w-inline-block">
              <p className="header-logo-text">CoZeo</p>
            </Link>
            <div className="header-menu-box">
              {scrollItems.map((item) => (
                <a key={item.id} className="header-menu-link w-inline-block" onClick={(e) => scrollTo(e, item.id)} href="#" style={{ cursor: 'pointer' }}>
                  <p className="header-menu-text">{item.label}</p>
                </a>
              ))}
              {routeItems.map((item) => (
                <Link key={item.to} to={item.to} className="header-menu-link w-inline-block">
                  <p className="header-menu-text">{item.label}</p>
                </Link>
              ))}
            </div>
            <div className="header-btn-box">
              <div className="w-commerce-commercecartwrapper shopping-cart">
                <a className="w-commerce-commercecartopenlink shopping-cart-btn w-inline-block" role="button" onClick={() => setCartOpen(true)} href="#">
                  <img src="/images/shopping-cart-20-1-.avif" alt="" className="shopping-cart-icon" />
                  <div className="w-commerce-commercecartopenlinkcount shopping-cart-quantity">{totalItems}</div>
                </a>
                {cartOpen && <CartSidebar onClose={() => setCartOpen(false)} />}
              </div>
              {user ? (
                <UserDropdown user={user} profile={profile} isAdmin={isAdmin} onSignOut={signOut} />
              ) : (
                <div className="account-login-button" onClick={() => { setLoginOpen(true); setIsSignup(false); }}>
                  <img src="/images/user-20-2-.avif" alt="" className="account-login-icon" />
                </div>
              )}
              <div className="mobile-menu-open-btn" onClick={() => { console.log('Mobile menu clicked'); setMobileOpen(true); }}>
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="3" y1="12" x2="21" y2="12"></line>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <line x1="3" y1="18" x2="21" y2="18"></line>
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Menu - Redesigned */}
        <div className={`mobile-menu-container ${mobileOpen ? 'active' : ''}`}>
          <div className="mobile-menu-backdrop" onClick={() => setMobileOpen(false)}></div>
          <div className="mobile-menu-panel">
            <div className="mobile-menu-header">
              <Link to="/" className="mobile-menu-logo" onClick={() => setMobileOpen(false)}>
                CoZeo
              </Link>
              <button className="mobile-menu-close" onClick={() => setMobileOpen(false)} aria-label="Close menu">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            
            <div className="mobile-menu-content">
              <nav className="mobile-menu-nav">
                <Link to="/" className="mobile-nav-link" onClick={() => setMobileOpen(false)}>
                  <span>Home</span>
                </Link>
                <Link to="/shop" className="mobile-nav-link" onClick={() => setMobileOpen(false)}>
                  <span>Shop</span>
                </Link>
                <a href="#About-Section" className="mobile-nav-link" onClick={(e) => scrollTo(e, 'About-Section')}>
                  <span>About Us</span>
                </a>
                <a href="#Featured-Section" className="mobile-nav-link" onClick={(e) => scrollTo(e, 'Featured-Section')}>
                  <span>Collection</span>
                </a>
                <a href="#Category-Section" className="mobile-nav-link" onClick={(e) => scrollTo(e, 'Category-Section')}>
                  <span>Categories</span>
                </a>
              </nav>
            </div>

            <div className="mobile-menu-footer">
              {user ? (
                <div className="mobile-user-info">
                  <div className="mobile-user-avatar">
                    {profile?.name?.charAt(0) || user.email?.charAt(0) || 'U'}
                  </div>
                  <div className="mobile-user-details">
                    <p className="mobile-user-name">{profile?.name || 'User'}</p>
                    <p className="mobile-user-email">{user.email}</p>
                  </div>
                </div>
              ) : (
                <button className="mobile-menu-btn" onClick={() => { setMobileOpen(false); setLoginOpen(true); }}>
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Login/Signup Sidebar */}
        {loginOpen && (
          <>
            <LoginSidebar
              isSignup={isSignup}
              onClose={() => setLoginOpen(false)}
              onToggle={() => setIsSignup(p => !p)}
              onLogin={{ signIn, signUp, signInWithGoogle }}
            />
            <div className="bg account-sidebar-overlay" onClick={() => setLoginOpen(false)}></div>
          </>
        )}
      </header>
      <div style={{ marginBottom: '40px' }}></div>
    </>
  );
}
