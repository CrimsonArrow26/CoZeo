import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

export function SubscribeSection() {
  const ref = useRef();
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    }, { threshold: 0.1 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) setSubmitted(true);
  };

  return (
    <section className="subscribe-section">
      <div className="subscribe-wrapper">
        <div ref={ref} className="w-layout-blockcontainer container w-container" style={{ opacity: 0, transform: "translateY(40px)", transition: "opacity 0.8s ease, transform 0.8s ease" }}>
          <div className="w-layout-grid subscribe-grid">
            <div className="subscribe-content-box">
              <div className="section-title-box mb-zero three">
                <h2 className="section-title">Join the CoZeo Crew!</h2>
                <p className="section-text">Get exclusive drops, early access to sales, and streetwear tips delivered to your inbox. Be the first to know what's fresh.</p>
              </div>
            </div>
            <div className="subscribe-form-box">
              <div className="subscribe-form-block w-form">
                {!submitted ? (
                  <form className="subscribe-form" onSubmit={handleSubmit}>
                    <div className="subscribe-form-group">
                      <input
                        className="subscribe-input-field w-input"
                        type="email"
                        placeholder="Enter Your E-mail"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                      />
                      <input type="submit" className="subscribe-button w-button" value="Subscribe" />
                    </div>
                    <p className="subscribe-text">Weekly newsletter. Unsubscribe anytime.</p>
                  </form>
                ) : (
                  <div className="subscribe-success w-form-done">
                    <p className="success-message-text">Thank you! Your submission has been received!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const socialLinks = [
  { icon: '/images/svgviewer-output-2.svg', label: 'Linkedin', url: 'https://linkedin.com/company/cozeo' },
  { icon: '/images/svgviewer-output-20-1--1.svg', label: 'Instagram', url: 'https://instagram.com/cozeo' },
  { icon: '/images/svgviewer-output-20-2--1.svg', label: 'Twitter', url: 'https://twitter.com/cozeo' },
  { icon: '/images/svgviewer-output-20-3--1.svg', label: 'Facebook', url: 'https://facebook.com/cozeo' },
];

export function Footer() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const scrollTo = (id) => (e) => {
    e.preventDefault();
    if (location.pathname !== '/') {
      navigate(`/#${id}`);
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="main-footer" style={{ marginTop: '60px' }}>
      <div className="footer-widgets-box">
        <div className="w-layout-blockcontainer container w-container">
          <div className="w-layout-grid footer-grid">
            <div className="footer-widget about-widget">
              <Link to="/" className="footer-logo-link w-inline-block">
                <p className="footer-logo-text">CoZeo</p>
              </Link>
              <h5 className="footer-title">Your Style, Your Story</h5>
              <p className="footer-text">Where street culture meets self-expression. We craft bold, high-quality pieces for those who dare to stand out. Wear your story.</p>
            </div>
            <div className="footer-widget links-widget">
              <div className="footer-list-box">
                <h5 className="footer-list-title">Menu</h5>
                {[['Hero-Section','Home'],['Product-Section','Shop'],['About-Section','About Us'],['Featured-Section','Collection'],['Category-Section','Category']].map(([id, label], i, arr) => (
                  <a key={id} href="#" onClick={scrollTo(id)} className={`footer-list-link w-inline-block${i === arr.length-1 ? ' mb-zero' : ''}`}>
                    <p className="footer-list-text">{label}</p>
                  </a>
                ))}
              </div>
            </div>
            <div className="footer-widget links-widget">
              <div className="footer-list-box">
                <h5 className="footer-list-title">Quick Links</h5>
                {[
                  ['/', 'Home'],
                  ['/shop', 'Shop'],
                  ['/giveaway', 'Giveaway'],
                  ['/dashboard', 'My Account'],
                  ['/orders/track', 'Track Order'],
                ].map(([href, label], i, arr) => (
                  <Link key={i} to={href} className={`footer-list-link w-inline-block${i === arr.length-1 ? ' mb-zero' : ''}`}>
                    <p className="footer-list-text">{label}</p>
                  </Link>
                ))}
              </div>
            </div>
            <div className="footer-widget links-widget">
              <div className="footer-list-box">
                <h5 className="footer-list-title">Legal</h5>
                {[
                  ['/terms', 'Terms of Service'],
                  ['/privacy', 'Privacy Policy'],
                  ['/refund', 'Refund Policy'],
                  ['/shipping', 'Shipping Info'],
                ].map(([href, label], i, arr) => (
                  <Link key={i} to={href} className={`footer-list-link w-inline-block${i === arr.length-1 ? ' mb-zero' : ''}`}>
                    <p className="footer-list-text">{label}</p>
                  </Link>
                ))}
              </div>
            </div>
            <div className="footer-widget links-widget">
              <div className="footer-list-box">
                <h5 className="footer-list-title">Social</h5>
                {socialLinks.map((s, i) => (
                  <a key={i} href={s.url} target="_blank" rel="noopener noreferrer" className={`footer-list-link w-inline-block${i === socialLinks.length-1 ? ' mb-zero' : ''}`}>
                    <img src={s.icon} alt="" className="footer-list-icon" loading="lazy" />
                    <p className="footer-list-text">{s.label}</p>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="w-layout-blockcontainer container w-container">
          <p className="footer-copyright">
            © Copyright <span className="footer-copyright-text">CoZeo</span>
            {' '}| Design by <span className="footer-copyright-text">PY</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
