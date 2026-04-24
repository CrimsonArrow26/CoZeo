import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useActiveCampaigns } from '../hooks/useCampaigns';
import { useSpotlightProduct } from '../hooks/useProducts';
import { formatPrice } from '../lib/utils';
import { Package, Clock, Star } from 'lucide-react';

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

const SLIDE_DURATION = 5000;

export default function DealSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const leftRef = useSideReveal('left', 0);
  const rightRef = useSideReveal('right', 150);
  const timerRef = useRef(null);
  const { data: campaigns, isLoading: campaignsLoading } = useActiveCampaigns();
  const { data: spotlightProduct, isLoading: productLoading } = useSpotlightProduct();

  // Combine spotlight product and campaigns into a single slides array
  const slides = [];
  
  // Add spotlight product as first slide if exists
  if (spotlightProduct) {
    slides.push({ type: 'product', data: spotlightProduct });
  }
  
  // Add all campaigns
  if (campaigns && campaigns.length > 0) {
    campaigns.forEach(campaign => {
      slides.push({ type: 'campaign', data: campaign });
    });
  }

  const currentSlide = slides[currentIndex];
  const totalSlides = slides.length;

  const nextSlide = useCallback(() => {
    if (totalSlides > 1) {
      setCurrentIndex((prev) => (prev + 1) % totalSlides);
    }
  }, [totalSlides]);

  const prevSlide = () => {
    if (totalSlides > 1) {
      setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
    }
  };

  const goToSlide = (index) => {
    clearInterval(timerRef.current);
    setCurrentIndex(index);
    timerRef.current = setInterval(nextSlide, SLIDE_DURATION);
  };

  useEffect(() => {
    if (totalSlides > 1) {
      timerRef.current = setInterval(nextSlide, SLIDE_DURATION);
      return () => clearInterval(timerRef.current);
    }
  }, [totalSlides, nextSlide]);

  // Reset index when slides change
  useEffect(() => {
    setCurrentIndex(0);
  }, [spotlightProduct?.id, campaigns?.length]);

  if (campaignsLoading || productLoading) {
    return (
      <section className="deal-section">
        <div className="container">
          <div className="loading">Loading deals...</div>
        </div>
      </section>
    );
  }

  if (!currentSlide) {
    return (
      <section className="deal-section">
        <div className="container">
          <div className="loading">
            <p style={{ marginBottom: 12 }}>No deals available</p>
            <p style={{ fontSize: 14, color: '#666' }}>
              Check back soon for exclusive offers!
            </p>
          </div>
        </div>
      </section>
    );
  }

  const isProduct = currentSlide.type === 'product';
  const item = currentSlide.data;

  // Product-specific data
  const productImages = isProduct ? item.images?.slice(0, 4) || [] : [];
  const productPrice = isProduct ? (item.discount_price || item.price) : 0;
  const productOriginalPrice = isProduct && item.discount_price ? item.price : null;

  // Campaign-specific data
  const campaignProducts = !isProduct ? item.campaign_products || [] : [];
  const regularProducts = !isProduct ? campaignProducts.filter(p => !p.is_custom_design_slot) : [];
  const hasCustomDesign = !isProduct ? campaignProducts.some(p => p.is_custom_design_slot) : false;
  const savings = !isProduct ? item.original_total - item.combo_price : 0;
  const discountPercentage = !isProduct && item.original_total > 0 
    ? Math.round((savings / item.original_total) * 100) 
    : 0;

  // Calculate days remaining for campaign
  const daysRemaining = !isProduct 
    ? Math.ceil((new Date(item.ends_at) - new Date()) / (1000 * 60 * 60 * 24))
    : 0;

  // Get display image
  const displayImage = isProduct 
    ? item.images?.[0] 
    : item.image_url || regularProducts[0]?.product?.images?.[0] || '/images/hoodie-placeholder.png';

  return (
    <section className="deal-section">
      <div className="w-layout-blockcontainer container w-container">
        <div className="w-layout-grid deal-grid">
          <div ref={leftRef} className="deal-left-box">
            {isProduct ? (
              // Product Content
              <>
                <div className="section-title-box three mb-zero">
                  {item.badge && (
                    <span className="spotlight-badge">{item.badge}</span>
                  )}
                  <span className="combo-deal-label">Spotlight</span>
                  <h2 className="section-title deal-sectitle">{item.name}</h2>
                  <p className="section-text light">{item.description}</p>
                </div>

                <div className="deal-price-box">
                  <div className="deal-price-row">
                    <h3 className="deal-price">{formatPrice(productPrice)}</h3>
                    {productOriginalPrice && (
                      <h3 className="deal-discount">{formatPrice(productOriginalPrice)}</h3>
                    )}
                  </div>
                  {item.rating > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                      <div style={{ display: 'flex', gap: 2 }}>
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={14} fill={i < Math.floor(item.rating) ? '#fbbf24' : 'none'} stroke="#fbbf24" />
                        ))}
                      </div>
                      <span style={{ fontSize: 13, color: '#666' }}>({item.review_count} reviews)</span>
                    </div>
                  )}
                </div>

                <div className="deal-btn-box">
                  <Link to={`/product/${item.slug}`} className="theme-button w-inline-block">
                    <div className="theme-btn-bg"></div>
                    <div className="theme-btn-icon-box">
                      <img src="/images/svgviewer-output.svg" alt="" className="theme-btn-icon" />
                      <img src="/images/svgviewer-output.svg" alt="" className="theme-btn-hover-icon" />
                    </div>
                    <div className="theme-btn-text-box">
                      <div className="theme-btn-text">Shop Now</div>
                      <div className="theme-btn-hover-text">Shop Now</div>
                    </div>
                  </Link>
                </div>
              </>
            ) : (
              // Campaign Content
              <>
                <div className="section-title-box three mb-zero">
                  {item.badge && (
                    <span className="spotlight-badge">{item.badge}</span>
                  )}
                  <span className="combo-deal-label">Combo Deal</span>
                  <h2 className="section-title deal-sectitle">{item.name}</h2>
                  <p className="section-text light">{item.description}</p>

                  {/* Products included */}
                  <div className="deal-products-list">
                    {regularProducts.slice(0, 2).map((cp) => (
                      <div key={cp.id} className="deal-product-item">
                        {cp.product?.images?.[0] ? (
                          <img src={cp.product.images[0]} alt={cp.product.name} className="deal-product-thumb" />
                        ) : (
                          <div className="deal-product-placeholder">
                            <Package size={16} />
                          </div>
                        )}
                        <span className="deal-product-name">{cp.product?.name}</span>
                        {cp.min_quantity > 1 && <span className="deal-product-qty">x{cp.min_quantity}</span>}
                      </div>
                    ))}
                    {hasCustomDesign && (
                      <div className="deal-product-item custom">
                        <div className="deal-product-placeholder custom">
                          <span>+</span>
                        </div>
                        <span className="deal-product-name">
                          {item.custom_design_label || 'Custom Design'}
                        </span>
                        <span className="deal-product-note">Upload your design</span>
                      </div>
                    )}
                    {regularProducts.length > 2 && (
                      <div className="deal-more-items">+{regularProducts.length - 2} more items</div>
                    )}
                  </div>
                </div>

                <div className="deal-price-box">
                  <div className="deal-price-row">
                    <h3 className="deal-price">{formatPrice(item.combo_price)}</h3>
                    <h3 className="deal-discount">{formatPrice(item.original_total)}</h3>
                  </div>
                  <div className="deal-savings">
                    Save {formatPrice(savings)} ({discountPercentage}% OFF)
                  </div>
                  {daysRemaining > 0 && daysRemaining <= 7 && (
                    <div className="deal-urgency">
                      <Clock size={14} />
                      <span>Ends in {daysRemaining} days</span>
                    </div>
                  )}
                </div>

                <div className="deal-btn-box">
                  <Link to={`/campaign/${item.slug}`} className="theme-button w-inline-block">
                    <div className="theme-btn-bg"></div>
                    <div className="theme-btn-icon-box">
                      <img src="/images/svgviewer-output.svg" alt="" className="theme-btn-icon" />
                      <img src="/images/svgviewer-output.svg" alt="" className="theme-btn-hover-icon" />
                    </div>
                    <div className="theme-btn-text-box">
                      <div className="theme-btn-text">View Deal</div>
                      <div className="theme-btn-hover-text">View Deal</div>
                    </div>
                  </Link>
                </div>
              </>
            )}

            {/* Pagination dots */}
            {totalSlides > 1 && (
              <div className="deal-pagination">
                {slides.map((_, idx) => (
                  <button
                    key={idx}
                    className={`deal-dot${idx === currentIndex ? ' active' : ''}`}
                    onClick={() => goToSlide(idx)}
                  />
                ))}
              </div>
            )}
          </div>

          <div ref={rightRef} className="deal-right-box">
            <div className="deal-carousel">
              {/* Fade transition images */}
              {slides.map((slide, idx) => {
                const img = slide.type === 'product'
                  ? slide.data.images?.[0]
                  : slide.data.image_url || slide.data.campaign_products?.[0]?.product?.images?.[0] || '/images/hoodie-placeholder.png';
                
                return (
                  <div
                    key={slide.type === 'product' ? slide.data.id : slide.data.id}
                    className={`deal-carousel-slide${idx === currentIndex ? ' active' : ''}`}
                  >
                    <div className={`deal-image-box ${slide.type === 'campaign' ? 'campaign-image-box' : ''}`}>
                      <img
                        src={img}
                        alt={slide.data.name}
                        className="deal-image"
                        loading="lazy"
                      />
                    </div>
                  </div>
                );
              })}

            </div>

            {/* Progress bar - covers entire section */}
            {totalSlides > 1 && (
              <div className="deal-section-progress-bar">
                <div
                  key={`progress-${currentIndex}`}
                  className="deal-section-progress-fill"
                  style={{ animation: `progressLine ${SLIDE_DURATION}ms linear forwards` }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
