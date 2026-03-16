import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useNewDrops } from '../hooks/useProducts';
import { formatPrice } from '../lib/utils';

function ProductCard({ product, index }) {
  const ref = useRef();
  const direction = index % 2 === 0 ? 'left' : 'right';
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.classList.add(`reveal-${direction}`);
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setTimeout(() => el.classList.add('visible'), index * 120);
        observer.unobserve(el);
      }
    }, { threshold: 0.1 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [direction, index]);

  const displayPrice = product.discount_price || product.price;
  const originalPrice = product.discount_price ? product.price : null;

  return (
    <div role="listitem" className="w-dyn-item">
      <Link ref={ref} to={`/product/${product.slug}`} className="product-block w-inline-block">
        <div className="product-image-box">
          <img loading="lazy" src={product.images?.[0] || '/images/placeholder.jpg'} alt={product.name} className="product-image" />
          {product.badge && <p className={`product-tag ${product.badge}`}>{product.badge}</p>}
          {product.stock === 0 && (
            <div className="product-out-of-stock-overlay">
              <span className="out-of-stock-badge">Out of Stock</span>
            </div>
          )}
        </div>
        <div className="product-content-box">
          <h3 className="product-title">{product.name}</h3>
          <p className="product-text">{product.description}</p>
          <div className="product-price-box">
            <p className="product-price">{formatPrice(displayPrice)}</p>
            {originalPrice && <p className="product-discount">{formatPrice(originalPrice)}</p>}
          </div>
        </div>
      </Link>
    </div>
  );
}

export default function ProductSection() {
  const titleRef = useRef();
  const carouselRef = useRef();
  const { data: products, isLoading } = useNewDrops();

  return (
    <section id="Product-Section" className="product-section pb-zero">
      <div className="w-layout-blockcontainer container w-container">
        <div ref={titleRef} className="section-title-box four visible" style={{ textAlign: 'left', alignItems: 'flex-start' }}>
          <h2 className="section-title">new drops</h2>
          <p className="section-text">Stand out with our latest collection—bold designs, premium fabrics, and street-ready fits. Once they're gone, they're gone. Don't miss out!</p>
        </div>
        <div className="view-all-bar">
          <Link to="/shop" className="view-all-link">
            <span>View all</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </Link>
        </div>
        <div className="product-carousel-wrapper" style={{ display: 'block' }}>
          <div className="w-dyn-list" ref={carouselRef} style={{ overflowX: 'auto' }}>
            {isLoading ? (
              <div className="loading-products">Loading products...</div>
            ) : (
              <div role="list" className="product-collection w-dyn-items">
                {products?.map((product, i) => (
                  <ProductCard key={product.id} product={product} index={i} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
