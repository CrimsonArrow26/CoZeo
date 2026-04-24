import { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Megaphone, ArrowRight } from 'lucide-react';
import { useActiveCampaigns } from '../hooks/useCampaigns';
import CampaignCard from './CampaignCard';

function useFadeIn() {
  const ref = useRef();
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.classList.add('fade-in');
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        el.classList.add('visible');
        observer.unobserve(el);
      }
    }, { threshold: 0.1 });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return ref;
}

export default function CampaignsSection() {
  const sectionRef = useFadeIn();
  const { data: campaigns, isLoading } = useActiveCampaigns();

  if (isLoading) {
    return (
      <section className="campaigns-section">
        <div className="container">
          <div className="loading">Loading campaigns...</div>
        </div>
      </section>
    );
  }

  if (!campaigns || campaigns.length === 0) {
    return null;
  }

  return (
    <section ref={sectionRef} className="campaigns-section">
      <div className="container">
        <div className="section-title-box two">
          <span className="section-badge">
            <Megaphone size={14} />
            Limited Time Offers
          </span>
          <h2 className="section-title">Special Combo Deals</h2>
          <p className="section-text">
            Exclusive combinations at unbeatable prices. Grab them before they're gone!
          </p>
        </div>

        <div className={`campaigns-grid campaigns-count-${campaigns.length}`}>
          {campaigns.map((campaign) => (
            <CampaignCard key={campaign.id} campaign={campaign} />
          ))}
        </div>

        <div className="campaigns-footer">
          <Link to="/shop" className="view-all-link">
            <span>View All Products</span>
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  );
}
