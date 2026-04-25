import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useFeaturedProducts } from '../hooks/useProducts';
import { formatPrice } from '../lib/utils';

function FeaturedCard({ product, index, cardWidth, cardHeight, gap }) {
  const ref = useRef();
  const direction = index % 2 === 0 ? 'left' : 'right';
  const isMobile = cardHeight <= 420;
  
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.classList.add(`reveal-${direction}`);
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setTimeout(() => el.classList.add('visible'), index * 100);
        observer.unobserve(el);
      }
    }, { threshold: 0.1 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [direction, index]);

  return (
    <Link
      ref={ref}
      to={`/product/${product.slug}`}
      key={product.id}
      style={{
        flexShrink: 0,
        width: cardWidth - gap,
        borderRadius: 24,
        overflow: 'hidden',
        position: 'relative',
        cursor: 'pointer',
      }}
      className="featured-card-hover"
    >
      <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 24 }}>
        <img
          src={product.images?.[0] || '/images/placeholder.jpg'}
          alt={product.name}
          loading="lazy"
          style={{
            width: '100%', height: cardHeight, objectFit: 'cover', display: 'block',
            transition: 'transform 0.6s ease',
          }}
          className="featured-card-img"
        />
        {/* gradient overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(0deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.1) 50%, transparent 100%)',
          borderRadius: 24,
        }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, padding: isMobile ? '16px 18px' : '28px 30px' }}>
          {product.stock === 0 && (
            <span style={{
              display: 'inline-block',
              background: 'rgba(231, 76, 60, 0.9)',
              color: '#fff',
              padding: '4px 12px',
              fontSize: 12,
              fontWeight: 600,
              borderRadius: 4,
              marginBottom: isMobile ? 8 : 12,
              textTransform: 'uppercase',
            }}>Out of Stock</span>
          )}
          <h3 style={{
            fontFamily: '"Big Shoulders", sans-serif', color: '#fff',
            fontSize: isMobile ? 20 : 28, fontWeight: 800, textTransform: 'uppercase', margin: '0 0 6px',
            transform: 'translateY(0)', transition: 'transform 0.35s ease',
          }} className="featured-card-title">{product.name}</h3>
          <p style={{
            color: 'rgba(255,255,255,0.85)', fontSize: isMobile ? 12 : 14, margin: 0, lineHeight: 1.5,
            maxWidth: isMobile ? 220 : 320,
            display: isMobile ? '-webkit-box' : 'block',
            WebkitLineClamp: isMobile ? 2 : undefined,
            WebkitBoxOrient: isMobile ? 'vertical' : undefined,
            overflow: isMobile ? 'hidden' : undefined,
          }}>{product.description}</p>
          <p style={{
            color: '#fff', fontSize: isMobile ? 15 : 18, marginTop: isMobile ? 8 : 12, fontWeight: 600,
          }}>{formatPrice(product.discount_price || product.price)}</p>
        </div>
      </div>
    </Link>
  );
}

export default function FeaturedSection() {
  const [offset, setOffset] = useState(0);
  const trackRef = useRef();
  const sectionRef = useRef();
  const { data: featuredProducts, isLoading } = useFeaturedProducts();

  // Responsive card dimensions
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
  const cardWidth = isMobile ? 280 : 440;
  const cardHeight = isMobile ? 420 : 700;
  const gap = isMobile ? 12 : 16;
  const visibleCards = isMobile ? 1.3 : 3;
  const maxOffset = Math.max(0, ((featuredProducts?.length || 0) - visibleCards) * cardWidth);

  // Scroll reveal for title
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
        observer.unobserve(el);
      }
    }, { threshold: 0.05 });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const prev = () => setOffset(o => Math.max(0, o - cardWidth));
  const next = () => setOffset(o => Math.min(maxOffset, o + cardWidth));

  if (isLoading) {
    return (
      <section id="Featured-Section" className="featured-section">
        <div className="container">
          <div className="section-title-box two">
            <h2 className="section-title">Featured Drops: Stand Out, Stay Ahead</h2>
          </div>
          <div className="loading">Loading featured products...</div>
        </div>
      </section>
    );
  }

  return (
    <section id="Featured-Section" className="featured-section" style={{ overflow: 'hidden' }}>
      <div className="w-layout-blockcontainer container w-container">
        {/* Header row with arrows */}
        <div
          ref={sectionRef}
          style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
            marginBottom: isMobile ? 24 : 40, opacity: 1, transform: 'none',
            transition: 'opacity 0.7s ease, transform 0.7s ease',
            flexWrap: isMobile ? 'wrap' : 'nowrap',
            gap: isMobile ? 16 : 0
          }}
        >
          <div className="section-title-box two" style={{ marginBottom: 0 }}>
            <h2 className="section-title">Featured Drops: Stand Out, Stay Ahead</h2>
            <p className="section-text">Exclusive designs, premium materials, and street-ready vibes—these must-have pieces are setting the trend. Get yours before they're gone!</p>
          </div>
          <div style={{ display: 'flex', gap: 10, flexShrink: 0, paddingTop: isMobile ? 0 : 8 }}>
            <button
              onClick={prev}
              disabled={offset === 0}
              style={{
                width: isMobile ? 40 : 48, height: isMobile ? 40 : 48, borderRadius: '50%', border: 'none',
                background: offset === 0 ? '#e0e0e0' : '#121212',
                color: offset === 0 ? '#999' : '#fff',
                cursor: offset === 0 ? 'default' : 'pointer',
                fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background 0.3s ease, transform 0.2s ease',
                transform: offset === 0 ? 'none' : 'scale(1)',
              }}
              onMouseEnter={e => { if (offset > 0) e.currentTarget.style.transform = 'scale(1.1)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
            >←</button>
            <button
              onClick={next}
              disabled={offset >= maxOffset}
              style={{
                width: isMobile ? 40 : 48, height: isMobile ? 40 : 48, borderRadius: '50%', border: 'none',
                color: offset >= maxOffset ? '#999' : '#fff',
                cursor: offset >= maxOffset ? 'default' : 'pointer',
                fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background 0.3s ease, transform 0.2s ease',
              }}
              onMouseEnter={e => { if (offset < maxOffset) e.currentTarget.style.transform = 'scale(1.1)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
            >→</button>
          </div>
        </div>
      </div>

      {/* Full-width track (bleeds outside container) */}
      <div style={{ overflow: 'hidden', paddingLeft: isMobile ? '16px' : 'max(15px, calc((100vw - 1230px)/2 + 15px))' }}>
        <div
          ref={trackRef}
          style={{
            display: 'flex', gap: gap,
            transform: `translateX(-${offset}px)`,
            transition: 'transform 0.6s cubic-bezier(0.76, 0, 0.24, 1)',
            willChange: 'transform',
          }}
        >
          {featuredProducts?.map((product, i) => (
            <FeaturedCard 
              key={product.id} 
              product={product} 
              index={i} 
              cardWidth={cardWidth} 
              cardHeight={cardHeight}
              gap={gap} 
            />
          ))}
        </div>
      </div>
    </section>
  );
}
