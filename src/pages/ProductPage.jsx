import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '../components/Header';
import { Footer } from '../components/SubscribeFooter';
import { useCart } from '../CartContext';
import { useProduct } from '../hooks/useProducts';
import { formatPrice } from '../lib/utils';
import ChatWidget from '../components/ChatWidget';
import { Star } from 'lucide-react';

export default function ProductPage() {
  console.log('ProductPage COMPONENT MOUNTED');
  const { slug } = useParams();
  console.log('ProductPage slug:', slug);
  const { data: product, isLoading, error } = useProduct(slug || '');
  const { addToCart } = useCart();
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedColor, setSelectedColor] = useState('');
  const [added, setAdded] = useState(false);
  const [activeTab, setActiveTab] = useState('info');
  
  // Get cached product from localStorage
  const [cachedProduct, setCachedProduct] = useState(() => {
    if (typeof window !== 'undefined' && slug) {
      const saved = localStorage.getItem(`product_${slug}`);
      return saved ? JSON.parse(saved) : null;
    }
    return null;
  });

  // Save product to localStorage when loaded
  useEffect(() => {
    if (product && slug) {
      localStorage.setItem(`product_${slug}`, JSON.stringify(product));
      setCachedProduct(product);
    }
  }, [product, slug]);

  const displayProduct = product || cachedProduct;
  const isReallyLoading = isLoading && !displayProduct;

  console.log('ProductPage render:', { slug, isLoading, isReallyLoading, hasData: !!displayProduct, hasError: !!error, productName: displayProduct?.name });

  if (isReallyLoading) {
    return (
      <div className="page-wrapper">
        <Header />
        <div className="w-layout-blockcontainer container w-container" style={{ padding: '100px 20px', textAlign: 'center' }}>
          <h2>Loading product...</h2>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-wrapper">
        <Header />
        <div className="w-layout-blockcontainer container w-container" style={{ padding: '100px 20px', textAlign: 'center' }}>
          <h2>Error loading product</h2>
          <p style={{ color: '#666', marginTop: 10 }}>{error.message}</p>
          <Link to="/shop" className="theme-button w-inline-block" style={{ display: 'inline-flex', marginTop: 20 }}>
            <div className="theme-btn-bg"></div>
            <div className="theme-btn-text-box">
              <div className="theme-btn-text">Browse Shop</div>
              <div className="theme-btn-hover-text">Browse Shop</div>
            </div>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  if (!displayProduct) return (
    <div className="page-wrapper">
      <Header />
      <div className="w-layout-blockcontainer container w-container" style={{ padding: '100px 20px', textAlign: 'center' }}>
        <h2>Product not found</h2>
        <Link to="/" className="theme-button w-inline-block" style={{ display: 'inline-flex', marginTop: 20 }}>
          <div className="theme-btn-bg"></div>
          <div className="theme-btn-text-box">
            <div className="theme-btn-text">Back to Home</div>
            <div className="theme-btn-hover-text">Back to Home</div>
          </div>
        </Link>
      </div>
      <Footer />
    </div>
  );

  const handleAddToCart = () => {
    addToCart(displayProduct, selectedSize);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    addToCart(displayProduct, selectedSize);
    window.location.href = '/checkout';
  };

  const displayPrice = displayProduct.discount_price || displayProduct.price;
  const originalPrice = displayProduct.discount_price ? displayProduct.price : null;

  return (
    <div className="page-wrapper">
      <Header />
      <section style={{ padding: '60px 0 80px', minHeight: '70vh' }}>
        <div className="w-layout-blockcontainer container w-container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'start' }}>
            {/* Image Gallery */}
            <div>
              <div style={{ background: '#f5f5f5', borderRadius: 8, overflow: 'hidden', marginBottom: 16, aspectRatio: '3/4' }}>
                <img
                  src={displayProduct.images?.[selectedImage] || '/images/placeholder.jpg'}
                  alt={displayProduct.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'opacity 0.3s ease' }}
                />
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                {displayProduct.images?.map((img, i) => (
                  <div
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    style={{
                      width: 80, height: 80, borderRadius: 6, overflow: 'hidden', cursor: 'pointer',
                      border: i === selectedImage ? '2px solid #000' : '2px solid transparent',
                      transition: 'border 0.2s ease'
                    }}
                  >
                    <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ))}
              </div>
            </div>

            {/* Product Info */}
            <div>
              <p style={{ color: '#999', fontSize: 14, marginBottom: 8, fontFamily: 'Poppins, sans-serif' }}>
                <Link to="/" style={{ color: '#999', textDecoration: 'none' }}>Home</Link> / {displayProduct.name}
              </p>
              {displayProduct.badge && (
                <div style={{ display: 'inline-block', background: '#000', color: '#fff', padding: '2px 10px', fontSize: 11, fontWeight: 600, borderRadius: 3, marginBottom: 16, fontFamily: 'Poppins, sans-serif', textTransform: 'uppercase' }}>
                  {displayProduct.badge}
                </div>
              )}
              <h1 style={{ fontFamily: '"Big Shoulders", sans-serif', fontSize: 48, fontWeight: 800, textTransform: 'uppercase', margin: '0 0 16px' }}>
                {displayProduct.name}
              </h1>
              
              {/* Rating */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <div style={{ display: 'flex', gap: 2 }}>
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} fill={i < Math.floor(displayProduct.rating) ? '#000' : 'none'} stroke="#000" />
                  ))}
                </div>
                <span style={{ fontSize: 14, color: '#666' }}>({displayProduct.review_count} reviews)</span>
              </div>

              <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 28 }}>
                <span style={{ fontFamily: '"Big Shoulders", sans-serif', fontSize: 36, fontWeight: 700 }}>{formatPrice(displayPrice)}</span>
                {originalPrice && (
                  <span style={{ fontFamily: '"Big Shoulders", sans-serif', fontSize: 24, fontWeight: 500, textDecoration: 'line-through', color: '#999' }}>
                    {formatPrice(originalPrice)}
                  </span>
                )}
              </div>
              
              <p style={{ fontFamily: 'Poppins, sans-serif', color: '#555', lineHeight: 1.7, marginBottom: 28 }}>
                {displayProduct.description}
              </p>

              {/* Color Selector */}
              {displayProduct.colors && displayProduct.colors.length > 0 && (
                <div style={{ marginBottom: 24 }}>
                  <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, marginBottom: 12, fontSize: 14 }}>
                    COLOR: {selectedColor || displayProduct.colors[0]}
                  </p>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {displayProduct.colors.map(color => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        style={{
                          width: 32, height: 32, borderRadius: '50%', 
                          background: color.toLowerCase() === 'white' ? '#fff' : color.toLowerCase() === 'black' ? '#000' : '#666',
                          border: selectedColor === color ? '3px solid #000' : '1px solid #ddd',
                          cursor: 'pointer',
                          boxShadow: selectedColor === color ? '0 0 0 2px #fff inset' : 'none'
                        }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Size Selector */}
              <div style={{ marginBottom: 32 }}>
                <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, marginBottom: 12, fontSize: 14 }}>SIZE: {selectedSize}</p>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {displayProduct.sizes?.map(size => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      style={{
                        padding: '8px 16px', border: selectedSize === size ? '2px solid #000' : '1px solid #ddd',
                        background: selectedSize === size ? '#000' : '#fff',
                        color: selectedSize === size ? '#fff' : '#000',
                        cursor: 'pointer', fontFamily: 'Poppins, sans-serif', fontSize: 13, fontWeight: 500,
                        borderRadius: 4, transition: 'all 0.2s ease'
                      }}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Out of Stock Warning */}
              {displayProduct.stock === 0 && (
                <div style={{ color: '#e74c3c', marginBottom: 16, fontWeight: 600 }}>
                  ⚠ Out of stock
                </div>
              )}

              {/* Action Buttons */}
              <div className="product-actions">
                <button
                  onClick={handleBuyNow}
                  disabled={displayProduct.stock === 0}
                  className="product-btn buy-now"
                  style={{ opacity: displayProduct.stock === 0 ? 0.5 : 1, cursor: displayProduct.stock === 0 ? 'not-allowed' : 'pointer' }}
                >
                  Buy Now
                </button>

                <button
                  onClick={handleAddToCart}
                  disabled={displayProduct.stock === 0}
                  className={`product-btn add-to-cart ${added ? 'added' : ''}`}
                  style={{ opacity: displayProduct.stock === 0 ? 0.5 : 1, cursor: displayProduct.stock === 0 ? 'not-allowed' : 'pointer' }}
                >
                  {added ? 'Added ✓' : 'Add to Cart'}
                </button>
              </div>

              <div style={{ marginTop: 40, padding: 24, background: '#f9f9f9', borderRadius: 8 }}>
                <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: 13, color: '#777', margin: 0, lineHeight: 2 }}>
                  ✓ Free shipping on orders over ₹1500<br />
                  ✓ 30-day hassle-free returns<br />
                  ✓ 100% secure checkout
                </p>
              </div>
            </div>
          </div>

          {/* Product Tabs */}
          <div style={{ marginTop: 60 }}>
            <div style={{ display: 'flex', gap: 32, borderBottom: '1px solid #eee', marginBottom: 24 }}>
              {['info', 'description', 'reviews'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    padding: '12px 0',
                    border: 'none',
                    background: 'none',
                    fontFamily: 'Poppins, sans-serif',
                    fontSize: 14,
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    borderBottom: activeTab === tab ? '2px solid #000' : '2px solid transparent',
                    color: activeTab === tab ? '#000' : '#999'
                  }}
                >
                  {tab === 'info' ? 'Product Info' : tab === 'description' ? 'Description' : 'Reviews'}
                </button>
              ))}
            </div>

            {activeTab === 'info' && (
              <div>
                <h3 style={{ fontFamily: '"Big Shoulders", sans-serif', marginBottom: 16 }}>Product Specifications</h3>
                <table style={{ width: '100%', maxWidth: 500, fontFamily: 'Poppins, sans-serif', fontSize: 14 }}>
                  <tbody>
                    {Object.entries(displayProduct.specs || {}).map(([key, value]) => value && (
                      <tr key={key} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '12px 0', color: '#666', textTransform: 'capitalize' }}>{key.replace(/_/g, ' ')}</td>
                        <td style={{ padding: '12px 0', fontWeight: 500 }}>{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'description' && (
              <div>
                <h3 style={{ fontFamily: '"Big Shoulders", sans-serif', marginBottom: 16 }}>Description</h3>
                <p style={{ fontFamily: 'Poppins, sans-serif', lineHeight: 1.8, color: '#555' }}>
                  {displayProduct.long_description || displayProduct.description}
                </p>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div>
                <h3 style={{ fontFamily: '"Big Shoulders", sans-serif', marginBottom: 16 }}>Reviews</h3>
                <p style={{ fontFamily: 'Poppins, sans-serif', color: '#666' }}>
                  No reviews yet. Be the first to review this product!
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
      <Footer />
      <ChatWidget />
    </div>
  );
}
