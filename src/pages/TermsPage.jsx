import { Link } from 'react-router-dom';
import Header from '../components/Header';
import { Footer } from '../components/SubscribeFooter';

export default function TermsPage() {
  return (
    <div className="page-wrapper">
      <Header />
      <section style={{ padding: '60px 0 80px', minHeight: '60vh' }}>
        <div className="w-layout-blockcontainer container w-container">
          {/* Breadcrumb */}
          <div className="breadcrumb-link-block" style={{ marginBottom: 24 }}>
            <Link to="/" className="breadcrumb-link">Home</Link>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-current">Terms of Service</span>
          </div>

          <div className="legal-content" style={{ maxWidth: '800px' }}>
            <h1 style={{ fontSize: '36px', fontWeight: 600, marginBottom: '32px' }}>Terms of Service</h1>
            
            <div style={{ lineHeight: 1.8, color: '#444' }}>
              <p style={{ marginBottom: '24px' }}>
                Welcome to CoZeo. By accessing or using our website, you agree to be bound by these Terms of Service. 
                Please read them carefully before making a purchase.
              </p>

              <h3 style={{ fontSize: '20px', fontWeight: 600, marginTop: '32px', marginBottom: '16px', color: '#121212' }}>
                1. Acceptance of Terms
              </h3>
              <p style={{ marginBottom: '16px' }}>
                By accessing or using CoZeo's website and services, you agree to these Terms of Service. 
                If you do not agree, please do not use our services.
              </p>

              <h3 style={{ fontSize: '20px', fontWeight: 600, marginTop: '32px', marginBottom: '16px', color: '#121212' }}>
                2. Product Information
              </h3>
              <p style={{ marginBottom: '16px' }}>
                We strive to display our products and their colors as accurately as possible. 
                However, actual colors may vary depending on your monitor and device settings.
              </p>

              <h3 style={{ fontSize: '20px', fontWeight: 600, marginTop: '32px', marginBottom: '16px', color: '#121212' }}>
                3. Pricing and Payment
              </h3>
              <p style={{ marginBottom: '16px' }}>
                All prices are listed in INR (Indian Rupees) and are inclusive of applicable taxes. 
                We reserve the right to change prices at any time without prior notice.
              </p>

              <h3 style={{ fontSize: '20px', fontWeight: 600, marginTop: '32px', marginBottom: '16px', color: '#121212' }}>
                4. Order Acceptance
              </h3>
              <p style={{ marginBottom: '16px' }}>
                Your order is an offer to purchase our products. We reserve the right to accept or decline 
                your order for any reason, including product availability, errors in pricing, or other issues.
              </p>

              <h3 style={{ fontSize: '20px', fontWeight: 600, marginTop: '32px', marginBottom: '16px', color: '#121212' }}>
                5. Shipping and Delivery
              </h3>
              <p style={{ marginBottom: '16px' }}>
                Delivery times are estimates and may vary based on location and circumstances. 
                We are not responsible for delays caused by shipping carriers or customs.
              </p>

              <h3 style={{ fontSize: '20px', fontWeight: 600, marginTop: '32px', marginBottom: '16px', color: '#121212' }}>
                6. Limitation of Liability
              </h3>
              <p style={{ marginBottom: '16px' }}>
                CoZeo shall not be liable for any indirect, incidental, special, or consequential damages 
                arising from your use of our services or products.
              </p>

              <h3 style={{ fontSize: '20px', fontWeight: 600, marginTop: '32px', marginBottom: '16px', color: '#121212' }}>
                7. Changes to Terms
              </h3>
              <p style={{ marginBottom: '16px' }}>
                We may update these Terms of Service from time to time. The latest version will always 
                be posted on this page with the effective date.
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
