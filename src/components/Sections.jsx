import { useEffect, useRef } from 'react';

function useSideReveal(direction = 'left', delay = 0) {
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

const ShopBtn = ({ dark, text, href }) => {
  const scrollTo = (e) => {
    e.preventDefault();
    document.getElementById(href.replace('#', ''))?.scrollIntoView({ behavior: 'smooth' });
  };
  return (
    <a href={href} onClick={scrollTo} className={`theme-button${dark ? ' dark' : ''} w-inline-block`}>
      <div className={`theme-btn-bg${dark ? ' light' : ''}`}></div>
      <div className="theme-btn-icon-box">
        <img src={dark ? '/images/svgviewer-output-20-4-.svg' : '/images/svgviewer-output.svg'} alt="" className="theme-btn-icon" />
        <img src={dark ? '/images/svgviewer-output-20-4-.svg' : '/images/svgviewer-output.svg'} alt="" className="theme-btn-hover-icon" />
      </div>
      <div className="theme-btn-text-box">
        <div className="theme-btn-text">{text}</div>
        <div className="theme-btn-hover-text">{text}</div>
      </div>
    </a>
  );
};

export function ApproachSection() {
  // Grid 1: image slides from left, text from right
  const img1 = useSideReveal('left', 0);
  const txt1 = useSideReveal('right', 100);
  // Grid 2: text slides from left, image from right
  const txt2 = useSideReveal('left', 0);
  const img2 = useSideReveal('right', 100);

  return (
    <section className="approach-section pb-zero">
      <div className="w-layout-blockcontainer container w-container">
        <div className="section-title-box two">
          <h2 className="section-title">Fresh Drops. Bold Style. Zero Compromise.</h2>
          <p className="section-text">Discover streetwear that speaks your language. From exclusive limited editions to everyday essentials, find pieces that match your attitude.</p>
        </div>
        <div className="w-layout-grid approach-grid">
          <div ref={img1} className="approach-big-block">
            <div className="bg approach-image"></div>
          </div>
          <div ref={txt1} className="approach-block">
            <div className="approach-content-box">
              <h3 className="approach-title">Built by the Streets, Made for You</h3>
              <p className="approach-text">From the streets to your style—our journey is all about self-expression and rebellion. Join the movement.</p>
              <ShopBtn text="Shop now" href="#Product-Section" />
            </div>
          </div>
        </div>
        <div className="w-layout-grid approach-grid two">
          <div ref={txt2} className="approach-block two">
            <div className="approach-content-box">
              <h3 className="approach-title dark">Elevate Your Street Game</h3>
              <p className="approach-text">From bold graphics to everyday essentials, explore our latest drops and signature pieces designed for the culture.</p>
              <ShopBtn dark text="Shop collections" href="#Category-Section" />
            </div>
          </div>
          <div ref={img2} className="approach-big-block">
            <div className="bg approach-image two"></div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function AboutSection() {
  const leftRef = useSideReveal('left', 0);
  const rightRef = useSideReveal('right', 150);

  return (
    <section id="About-Section" className="about-section pb-zero">
      <div className="w-layout-blockcontainer container w-container">
        <div className="w-layout-grid about-grid visible">
          <div ref={leftRef} className="about-left-box visible">
            <p className="about-subtitle">Streetwear with a Story</p>
            <h2 className="about-title">Wear the Movement, Break the Mold.</h2>
          </div>
          <div ref={rightRef} className="about-right-box visible">
            <p className="about-text">Born from the pulse of the streets, our brand is a tribute to the rebels, the dreamers, and the rule-breakers who shape the culture. Inspired by the raw energy of city life—graffiti-covered alleys, underground music scenes, and late-night skate sessions—we craft streetwear that speaks to individuality and self-expression.</p>
            <p className="about-text">Born from the pulse of the streets, our brand is a tribute to the rebels, the dreamers, and the rule-breakers who shape the culture. Inspired by the raw energy of city life—graffiti-covered alleys, underground music scenes, and late-night skate sessions—we craft streetwear that speaks to individuality and self-expression.</p>
            <ShopBtn dark text="Get it now" href="#Category-Section" />
          </div>
        </div>
      </div>
    </section>
  );
}

export function CTASection() {
  const ref = useSideReveal('up', 0);
  const scrollToShop = (e) => {
    e.preventDefault();
    document.getElementById('Product-Section')?.scrollIntoView({ behavior: 'smooth' });
  };
  return (
    <section className="call-to-action" style={{ overflow: 'visible', position: 'relative', height: 'auto' }}>
      <div className="cta-wrapper" style={{ overflow: 'visible', position: 'relative' }}>
        <div className="bg cta-bg"></div>
        <div className="bg cta-overlay"></div>
        <div className="w-layout-blockcontainer container w-container">
          <div ref={ref} className="cta-content-box visible">
            <h2 className="cta-title">Join the Movement. Wear the Future.</h2>
            <p className="cta-text">Streetwear designed for those who break the mold. Limited drops, bold designs, and premium quality—don't miss out.</p>
            <div className="cta-btn-box">
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
    </section>
  );
}
