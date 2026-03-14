import { useEffect, useRef, useState } from 'react';
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
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const { data: products, isLoading } = useNewDrops();

  const checkScroll = () => {
    const el = carouselRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  };

  useEffect(() => {
    const el = carouselRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener('scroll', checkScroll);
    return () => el.removeEventListener('scroll', checkScroll);
  }, [products]);

  const scroll = (direction) => {
    const el = carouselRef.current;
    if (!el) return;
    const cardWidth = el.querySelector('.w-dyn-item')?.offsetWidth || 300;
    const scrollAmount = direction === 'left' ? -cardWidth : cardWidth;
    el.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  return (
    <section id="Product-Section" className="product-section pb-zero">
      <div className="w-layout-blockcontainer container w-container">
        <div ref={titleRef} className="section-title-box four visible">
          <h2 className="section-title">new drops</h2>
          <p className="section-text">Stand out with our latest collection—bold designs, premium fabrics, and street-ready fits. Once they're gone, they're gone. Don't miss out!</p>
        </div>
        <div className="product-carousel-wrapper">
          <button 
            className={`carousel-arrow carousel-arrow-left ${!canScrollLeft ? 'disabled' : ''}`}
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            aria-label="Previous products"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>
          <div className="w-dyn-list" ref={carouselRef}>
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
          <button 
            className={`carousel-arrow carousel-arrow-right ${!canScrollRight ? 'disabled' : ''}`}
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            aria-label="Next products"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}
