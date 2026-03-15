import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useSpotlightProduct } from '../hooks/useProducts';
import { formatPrice } from '../lib/utils';

function useSideReveal(direction = 'up', delay = 0) {
  const ref = useRef();
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.classList.add(`reveal-${direction}`);
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setTimeout(() => el.classList.add('visible'), delay);
        observer.unobserve(el);
      }
    }, { threshold: 0.1 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [direction, delay]);
  return ref;
}

export default function DealSection() {
  const [activeTab, setActiveTab] = useState(0);
  const leftRef  = useSideReveal('left', 0);
  const rightRef = useSideReveal('right', 150);
  const { data: product, isLoading } = useSpotlightProduct();

  if (isLoading) {
    return (
      <section className="deal-section">
        <div className="container">
          <div className="loading">Loading spotlight product...</div>
        </div>
      </section>
    );
  }

  if (!product) {
    return (
      <section className="deal-section">
        <div className="container">
          <div className="loading">
            <p style={{ marginBottom: 12 }}>No spotlight product set</p>
            <p style={{ fontSize: 14, color: '#666' }}>
              Go to Admin → Products and set "Is Spotlight" on a product to display it here
            </p>
          </div>
        </div>
      </section>
    );
  }

  const images = product.images?.slice(0, 4) || [];
  const displayPrice = product.discount_price || product.price;
  const originalPrice = product.discount_price ? product.price : null;

  return (
    <section className="deal-section">
      <div className="w-layout-blockcontainer container w-container">
        <div className="w-layout-grid deal-grid">
          <div ref={leftRef} className="deal-left-box">
            <div className="section-title-box three mb-zero">
              {product.badge && <span className="spotlight-badge">{product.badge}</span>}
              <h2 className="section-title deal-sectitle">{product.name}</h2>
              <p className="section-text light">{product.description}</p>
            </div>
            <div className="deal-price-box">
              <h3 className="deal-price">{formatPrice(displayPrice)}</h3>
              {originalPrice && <h3 className="deal-discount">{formatPrice(originalPrice)}</h3>}
            </div>
            <div className="deal-btn-box">
              <Link to={`/product/${product.slug}`} className="theme-button w-inline-block">
                <div className="theme-btn-bg"></div>
                <div className="theme-btn-icon-box">
                  <img src="/images/svgviewer-output.svg" alt="" className="theme-btn-icon" />
                  <img src="/images/svgviewer-output.svg" alt="" className="theme-btn-hover-icon" />
                </div>
                <div className="theme-btn-text-box">
                  <div className="theme-btn-text">Shop now</div>
                  <div className="theme-btn-hover-text">Shop now</div>
                </div>
              </Link>
            </div>
          </div>

          <div ref={rightRef} className="deal-right-box">
            <div className="deal-tabs w-tabs">
              <div className="deal-tabs-content w-tab-content">
                {images.map((img, i) => (
                  <div key={i} className={`deal-tab-pane w-tab-pane${i === activeTab ? ' w--tab-active' : ''}`}>
                    <div className="deal-image-box">
                      <img
                        src={img} alt={product.name} className="deal-image" loading="lazy"
                        style={{ animation: i === activeTab ? 'fadeInScale 0.4s ease forwards' : 'none' }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="deal-tabs-menu w-tab-menu">
                {images.map((img, i) => (
                  <a
                    key={i}
                    href="#"
                    className={`deal-tab-link w-inline-block w-tab-link${i === activeTab ? ' w--current' : ''}`}
                    onClick={e => { e.preventDefault(); setActiveTab(i); }}
                  >
                    <img src={img} alt="" className="deal-tab-image" loading="lazy" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
