import { useState, useEffect, useCallback, useRef } from 'react';

const slides = [
  { image: '/images/2-1.avif', srcset: '/images/2-p-500.avif 500w, /images/2-p-800.avif 800w, /images/2-1.avif 1900w', title: 'Limited Drops, Maximum Impact', text: "We release exclusive, small-batch collections to keep your style fresh and unique—once it's gone, it's gone.", label: 'Community-Driven Culture', count: '01' },
  { image: '/images/2-2.avif', srcset: '/images/2-p-500-1.avif 500w, /images/2-p-800-1.avif 800w, /images/2-2.avif 1900w', title: 'Future-Ready Fashion', text: 'From oversized silhouettes to innovative materials, we push the boundaries of modern streetwear while staying true to the culture.', label: 'Future-Ready Fashion', count: '02' },
  { image: '/images/3.avif', srcset: '/images/3-p-500.avif 500w, /images/3-p-800.avif 800w, /images/3.avif 1900w', title: 'Art Meets Attitude', text: 'Bold graphics, edgy typography, and urban-inspired designs turn every outfit into a statement of self-expression.', label: 'Art Meets Attitude', count: '03' },
  { image: '/images/5.avif', srcset: '/images/5-p-500.avif 500w, /images/5-p-800.avif 800w, /images/5.avif 1900w', title: 'Built for the Streets', text: 'Durable, high-quality fabrics and expert craftsmanship ensure every piece can handle the city grind while keeping you comfortable.', label: 'Built for the Streets', count: '04' },
];

const SLIDE_DURATION = 5000;

export default function Hero() {
  const [current, setCurrent] = useState(0);
  const [animKey, setAnimKey] = useState(0);
  const timerRef = useRef(null);

  const advance = useCallback(() => {
    setCurrent(c => (c + 1) % slides.length);
    setAnimKey(k => k + 1);
  }, []);

  const goTo = useCallback((idx) => {
    clearInterval(timerRef.current);
    setCurrent(idx);
    setAnimKey(k => k + 1);
    timerRef.current = setInterval(advance, SLIDE_DURATION);
  }, [advance]);

  useEffect(() => {
    timerRef.current = setInterval(advance, SLIDE_DURATION);
    return () => clearInterval(timerRef.current);
  }, [advance]);

  const scrollToShop = (e) => {
    e.preventDefault();
    document.getElementById('Product-Section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="Hero-Section" className="hero-section">
      <div className="hero-wrapper">
        <div className="hero-slide-wrapper">
          {slides.map((slide, i) => (
            <div
              key={i}
              className="hero-slide-box"
              style={{ display: i === current ? 'block' : 'none', animation: i === current ? 'heroFadeIn 0.6s ease forwards' : 'none' }}
            >
              <div className="bg hero-image-wrap">
                <img
                  src={slide.image} srcSet={slide.srcset}
                  sizes="(max-width: 1900px) 100vw, 1900px"
                  alt="" className="hero-image"
                  loading={i === 0 ? 'eager' : 'lazy'}
                  style={{ transform: i === current ? 'scale(1.06)' : 'scale(1)', transition: 'transform 6s ease' }}
                />
                <div className="bg hero-overlay"></div>
              </div>
              <div className="w-layout-blockcontainer container w-container">
                <div className="hero-content-box">
                  <h1 key={`t-${animKey}`} className="hero-title hero-title-anim">{slide.title}</h1>
                  <p key={`p-${animKey}`} className="hero-text hero-text-anim">{slide.text}</p>
                  <div key={`b-${animKey}`} className="hero-btn-box hero-btn-anim">
                    <a href="#Product-Section" onClick={scrollToShop} className="theme-button w-inline-block">
                      <div className="theme-btn-bg"></div>
                      <div className="theme-btn-icon-box">
                        <img src="/images/svgviewer-output.svg" alt="" className="theme-btn-icon" />
                        <img src="/images/svgviewer-output.svg" alt="" className="theme-btn-hover-icon" />
                      </div>
                      <div className="theme-btn-text-box">
                        <div className="theme-btn-text">Shop now</div>
                        <div className="theme-btn-hover-text">Shop now</div>
                      </div>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Progress indicators */}
        <div className="hero-bottom-box">
          {slides.map((slide, i) => (
            <div key={i} className="hero-bottom-content" onClick={() => goTo(i)} style={{ cursor: 'pointer' }}>
              <div className="hero-line-wrap">
                <div className="hero-line"></div>
                {/* Only render the filling bar on the ACTIVE slide, using key to reset on change */}
                {i === current && (
                  <div
                    key={`line-${animKey}`}
                    className="hero-active-line"
                    style={{ animation: `progressLine ${SLIDE_DURATION}ms linear forwards` }}
                  />
                )}
              </div>
              <div className="hero-bottom-content-inner">
                <p className="hero-bottom-count" style={{ color: i === current ? '#fff' : 'rgba(255,255,255,0.45)', transition: 'color 0.4s ease' }}>{slide.count}</p>
                <p className="hero-bottom-text" style={{ color: i === current ? '#fff' : 'rgba(255,255,255,0.45)', transition: 'color 0.4s ease' }}>{slide.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
