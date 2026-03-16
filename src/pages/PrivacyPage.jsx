import { Link } from 'react-router-dom';
import Header from '../components/Header';
import { Footer } from '../components/SubscribeFooter';

export default function PrivacyPage() {
  return (
    <div className="page-wrapper">
      <Header />
      <section style={{ padding: '60px 0 80px', minHeight: '60vh' }}>
        <div className="w-layout-blockcontainer container w-container">
          {/* Breadcrumb */}
          <div className="breadcrumb-link-block" style={{ marginBottom: 24 }}>
            <Link to="/" className="breadcrumb-link">Home</Link>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-current">Privacy Policy</span>
          </div>

          <div className="legal-content" style={{ maxWidth: '800px' }}>
            <h1 style={{ fontSize: '36px', fontWeight: 600, marginBottom: '32px' }}>Privacy Policy</h1>
            
            <div style={{ lineHeight: 1.8, color: '#444' }}>
              <p style={{ marginBottom: '24px' }}>
                At CoZeo, we respect your privacy and are committed to protecting your personal information. 
                This Privacy Policy explains how we collect, use, and safeguard your data.
              </p>

              <h3 style={{ fontSize: '20px', fontWeight: 600, marginTop: '32px', marginBottom: '16px', color: '#121212' }}>
                1. Information We Collect
              </h3>
              <p style={{ marginBottom: '16px' }}>
                We collect information you provide directly to us, including your name, email address, 
                shipping address, phone number, and payment information when you make a purchase or 
                create an account.
              </p>

              <h3 style={{ fontSize: '20px', fontWeight: 600, marginTop: '32px', marginBottom: '16px', color: '#121212' }}>
                2. How We Use Your Information
              </h3>
              <p style={{ marginBottom: '16px' }}>
                We use your information to process orders, provide customer support, send order updates, 
                and improve our services. With your consent, we may also send you marketing communications 
                about new products and promotions.
              </p>

              <h3 style={{ fontSize: '20px', fontWeight: 600, marginTop: '32px', marginBottom: '16px', color: '#121212' }}>
                3. Data Security
              </h3>
              <p style={{ marginBottom: '16px' }}>
                We implement appropriate security measures to protect your personal information. 
                Your payment information is encrypted and processed securely through our payment partners.
              </p>

              <h3 style={{ fontSize: '20px', fontWeight: 600, marginTop: '32px', marginBottom: '16px', color: '#121212' }}>
                4. Third-Party Services
              </h3>
              <p style={{ marginBottom: '16px' }}>
                We may share your information with trusted third-party service providers who assist us 
                with payment processing, shipping, and website analytics. These providers are contractually 
                obligated to protect your data.
              </p>

              <h3 style={{ fontSize: '20px', fontWeight: 600, marginTop: '32px', marginBottom: '16px', color: '#121212' }}>
                5. Cookies
              </h3>
              <p style={{ marginBottom: '16px' }}>
                We use cookies to enhance your browsing experience, remember your preferences, 
                and analyze website traffic. You can control cookies through your browser settings.
              </p>

              <h3 style={{ fontSize: '20px', fontWeight: 600, marginTop: '32px', marginBottom: '16px', color: '#121212' }}>
                6. Your Rights
              </h3>
              <p style={{ marginBottom: '16px' }}>
                You have the right to access, correct, or delete your personal information. 
                You may also opt out of marketing communications at any time by contacting us.
              </p>

              <h3 style={{ fontSize: '20px', fontWeight: 600, marginTop: '32px', marginBottom: '16px', color: '#121212' }}>
                7. Contact Us
              </h3>
              <p style={{ marginBottom: '16px' }}>
                If you have any questions about this Privacy Policy or our data practices, 
                please contact us at support@cozeo.com.
              </p>

              <p style={{ marginTop: '48px', paddingTop: '24px', borderTop: '1px solid #e5e5e5', fontSize: '14px', color: '#666' }}>
                Last updated: March 2025
              </p>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
