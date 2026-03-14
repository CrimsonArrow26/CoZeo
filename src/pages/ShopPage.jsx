import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import { Footer } from '../components/SubscribeFooter';
import { useProducts } from '../hooks/useProducts';
import { formatPrice } from '../lib/utils';
import { useCart } from '../CartContext';
import { Filter, X } from 'lucide-react';
import { supabase } from '../integrations/supabase/client';

const SIZES = ['S', 'M', 'L', 'XL', 'XXL'];

// Size Selector Modal Component
function SizeSelectorModal({ product, isOpen, onClose, onAddToCart }) {
  const [selectedSize, setSelectedSize] = useState('M');
  
  if (!isOpen || !product) return null;
  
  return (
    <div className="size-modal-overlay" onClick={onClose}>
      <div className="size-modal" onClick={e => e.stopPropagation()}>
        <div className="size-modal-header">
          <img src={product.images[0]} alt={product.name} className="size-modal-image" />
          <div className="size-modal-info">
            <h3>{product.name}</h3>
            <p>{formatPrice(product.discount_price || product.price)}</p>
          </div>
        </div>
        
        <div className="size-modal-title">Select Size</div>
        <div className="size-options">
          {SIZES.map(size => (
            <button
              key={size}
              className={`size-option ${selectedSize === size ? 'selected' : ''}`}
              onClick={() => setSelectedSize(size)}
            >
              {size}
            </button>
          ))}
        </div>
        
        <div className="size-modal-actions">
          <button className="size-modal-cancel" onClick={onClose}>Cancel</button>
          <button 
            className="size-modal-add" 
            onClick={() => {
              onAddToCart(product, selectedSize);
              onClose();
            }}
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ShopPage() {
  const [filters, setFilters] = useState({
    category: '',
    badge: '',
    minPrice: 0,
    maxPrice: 15000,
  });
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [sizeModalProduct, setSizeModalProduct] = useState(null);
  const { data: products, isLoading, error } = useProducts(filters);
  const { addToCart } = useCart();

  console.log('ShopPage products:', { isLoading, error: error?.message, count: products?.length });

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({ category: '', badge: '', minPrice: 0, maxPrice: 15000 });
  };

  const handleAddToCart = (product, size) => {
    addToCart(product, size);
  };

  return (
    <div className="page-wrapper">
      <Header />
      
      {/* Page Header */}
      <div className="section _100px">
        <div className="container">
          <div className="page-title-wrapper">
            <div className="breadcrumb-link-block">
              <Link to="/" className="breadcrumb-link">Home</Link>
              <span className="breadcrumb-separator">/</span>
              <span className="breadcrumb-current">Shop</span>
            </div>
            <h1 className="page-title">Shop</h1>
          </div>
        </div>
      </div>

      {/* Shop Content */}
      <div className="section">
        <div className="container">
          <div className="shop-layout">
            {/* Mobile Filter Toggle */}
            <button 
              className="mobile-filter-toggle"
              onClick={() => setMobileFiltersOpen(true)}
            >
              <Filter size={20} />
              Filters
            </button>

            {/* Filters Sidebar */}
            <aside className={`filters-sidebar ${mobileFiltersOpen ? 'open' : ''}`}>
              <div className="filters-header">
                <h3>Filters</h3>
                <button 
                  className="close-filters"
                  onClick={() => setMobileFiltersOpen(false)}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Category Filter */}
              <div className="filter-group">
                <h4 className="filter-title">Category</h4>
                <div className="filter-options">
                  {['All', 'Man', 'Woman'].map(cat => (
                    <label key={cat} className="filter-radio">
                      <input
                        type="radio"
                        name="category"
                        checked={filters.category === (cat === 'All' ? '' : cat.toLowerCase())}
                        onChange={() => handleFilterChange('category', cat === 'All' ? '' : cat.toLowerCase())}
                      />
                      <span>{cat}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Badge Filter */}
              <div className="filter-group">
                <h4 className="filter-title">Badge</h4>
                <div className="filter-options">
                  {['Sale', 'New', 'Drop'].map(badge => (
                    <label key={badge} className="filter-checkbox">
                      <input
                        type="checkbox"
                        checked={filters.badge === badge.toLowerCase()}
                        onChange={() => handleFilterChange('badge', filters.badge === badge.toLowerCase() ? '' : badge.toLowerCase())}
                      />
                      <span>{badge}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="filter-group">
                <h4 className="filter-title">Price Range</h4>
                <div className="price-range">
                  <span>₹{filters.minPrice}</span>
                  <input
                    type="range"
                    min="0"
                    max="15000"
                    step="100"
                    value={filters.maxPrice}
                    onChange={(e) => handleFilterChange('maxPrice', parseInt(e.target.value))}
                  />
                  <span>₹{filters.maxPrice}</span>
                </div>
              </div>

              <button className="clear-filters" onClick={clearFilters}>
                Clear All Filters
              </button>
            </aside>

            {/* Products Grid */}
            <div className="products-content">
              <div className="products-header">
                <p className="products-count">
                  {isLoading ? 'Loading...' : `Showing ${products?.length || 0} products`}
                </p>
                <div className="sort-dropdown">
                  <span>Sort by:</span>
                  <select>
                    <option>Newest</option>
                    <option>Price: Low to High</option>
                    <option>Price: High to Low</option>
                  </select>
                </div>
              </div>

              {isLoading ? (
                <div className="products-grid">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="product-skeleton" />
                  ))}
                </div>
              ) : (
                <div className="products-grid shop-grid">
                  {products?.map(product => (
                    <div key={product.id} className="product-block">
                      <Link to={`/product/${product.slug}`} className="product-image-box">
                        <img 
                          src={product.images[0]} 
                          alt={product.name}
                          className="product-image"
                        />
                        {product.badge && (
                          <span className={`product-tag ${product.badge}`}>
                            {product.badge}
                          </span>
                        )}
                      </Link>
                      <div className="product-content">
                        <h3 className="product-title">{product.name}</h3>
                        <p className="product-description">{product.description}</p>
                        <div className="product-price-row">
                          <span className="product-price">
                            {formatPrice(product.discount_price || product.price)}
                          </span>
                          {product.discount_price && (
                            <span className="product-original-price">
                              {formatPrice(product.price)}
                            </span>
                          )}
                        </div>
                        <button 
                          className="add-to-cart-btn"
                          onClick={() => setSizeModalProduct(product)}
                        >
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <SizeSelectorModal 
        product={sizeModalProduct}
        isOpen={!!sizeModalProduct}
        onClose={() => setSizeModalProduct(null)}
        onAddToCart={handleAddToCart}
      />
      <Footer />
    </div>
  );
}
