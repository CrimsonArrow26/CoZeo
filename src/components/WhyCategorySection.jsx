import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

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

const whyUsItems = [
  { icon: '/images/svgviewer-output-1.svg', title: 'Free delivery', text: 'Get your streetwear fast and free, with no extra shipping costs on all orders.' },
  { icon: '/images/svgviewer-output-20-1-.svg', title: '100% secure payment', text: 'Shop with confidence using encrypted, safe, and trusted payment methods.' },
  { icon: '/images/svgviewer-output-20-2-.svg', title: '30 days return', text: 'Not the perfect fit? No worries. Return or exchange hassle-free within 30 days.' },
  { icon: '/images/svgviewer-output-20-3-.svg', title: '24/7 support', text: 'Got questions? Our team is here for you anytime, anywhere.' },
];

export function WhyChooseUs() {
  const leftRef  = useSideReveal('left', 0);
  const itemRefs = [useSideReveal('up', 0), useSideReveal('up', 100), useSideReveal('up', 200), useSideReveal('up', 300)];

  return (
    <section className="why-choose-us pb-zero">
      <div className="w-layout-blockcontainer container w-container">
        <div className="w-layout-grid why-us-grid">
          <div ref={leftRef} className="why-us-left-box">
            <div className="section-title-box three mb-zero">
              <h2 className="section-title">Why Shop With Us?</h2>
              <p className="section-text">We've got you covered with hassle-free shopping, top-tier service, and guarantees that keep you confident in every purchase.</p>
            </div>
          </div>
          <div className="why-us-right-box">
            <div className="w-layout-grid why-us-grid-two">
              {whyUsItems.map((item, i) => (
                <div key={i} ref={itemRefs[i]} className="why-us-block">
                  <div className="why-us-icon-box">
                    <img src={item.icon} loading="lazy" alt="" className="why-us-icon" />
                  </div>
                  <h3 className="why-us-title">{item.title}</h3>
                  <p className="why-us-text">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const categories = [
  { slug: 'man',   title: 'Man',   image: '/images/1-1.jpeg' },
  { slug: 'woman', title: 'Woman', image: '/images/2.jpeg'   },
];

export function CategorySection() {
  const refs = [useSideReveal('left', 0), useSideReveal('right', 150)];

  return (
    <section id="Category-Section" className="category-section">
      <div className="w-layout-blockcontainer container w-container">
        <div className="w-dyn-list">
          <div role="list" className="category-collection w-dyn-items">
            {categories.map((cat, i) => (
              <div key={cat.slug} role="listitem" className="w-dyn-item">
                <Link ref={refs[i]} to={`/category/${cat.slug}`} className="category-block w-inline-block">
                  <div className="bg category-overlay"></div>
                  <img src={cat.image} alt={cat.title} className="category-image" loading="lazy" />
                  <h2 className="category-title">{cat.title}</h2>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
