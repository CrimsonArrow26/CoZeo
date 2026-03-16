import { Link } from 'react-router-dom';
import Header from '../components/Header';
import { Footer } from '../components/SubscribeFooter';

export default function ShippingPage() {
  return (
    <div className="page-wrapper">
      <Header />
      <section style={{ padding: '60px 0 80px', minHeight: '60vh' }}>
        <div className="w-layout-blockcontainer container w-container">
          {/* Breadcrumb */}
          <div className="breadcrumb-link-block" style={{ marginBottom: 24 }}>
            <Link to="/" className="breadcrumb-link">Home</Link>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-current">Shipping Info</span>
          </div>

          <div className="legal-content" style={{ maxWidth: '800px' }}>
            <h1 style={{ fontSize: '36px', fontWeight: 600, marginBottom: '32px' }}>Shipping Information</h1>
            
            <div style={{ lineHeight: 1.8, color: '#444' }}>
              <p style={{ marginBottom: '24px' }}>
                We offer fast and reliable shipping across India. Here's everything you need to know 
                about delivery times, costs, and tracking your order.
              </p>

              <h3 style={{ fontSize: '20px', fontWeight: 600, marginTop: '32px', marginBottom: '16px', color: '#121212' }}>
                1. Free Shipping
              </h3>
              <p style={{ marginBottom: '16px' }}>
                Enjoy <strong>free shipping</strong> on all orders across India! No minimum order value required. 
                We believe in making streetwear accessible to everyone without hidden shipping costs.
              </p>

              <h3 style={{ fontSize: '20px', fontWeight: 600, marginTop: '32px', marginBottom: '16px', color: '#121212' }}>
                2. Delivery Times
              </h3>
              <p style={{ marginBottom: '16px' }}>
                <strong>Metro Cities (Mumbai, Delhi, Bangalore, Hyderabad, Chennai, Pune):</strong> 2-3 business days<br />
                <strong>Tier 2 Cities:</strong> 3-5 business days<br />
                <strong>Other Locations:</strong> 5-7 business days<br />
                <br />
                Orders are processed within 24 hours (excluding weekends and holidays).
              </p>

              <h3 style={{ fontSize: '20px', fontWeight: 600, marginTop: '32px', marginBottom: '16px', color: '#121212' }}>
                3. Order Tracking
              </h3>
              <p style={{ marginBottom: '16px' }}>
                Once your order is shipped, you'll receive a tracking number via email and SMS. 
                You can also track your order in real-time through your CoZeo account dashboard. 
                Track your order <Link to="/orders/track" style={{ color: '#121212', textDecoration: 'underline' }}>here</Link>.
              </p>

              <h3 style={{ fontSize: '20px', fontWeight: 600, marginTop: '32px', marginBottom: '16px', color: '#121212' }}>
                4. Shipping Partners
              </h3>
              <p style={{ marginBottom: '16px' }}>
                We partner with trusted logistics providers including Delhivery, Blue Dart, and India Post 
                to ensure safe and timely delivery of your orders. The carrier is selected based on your 
                location for optimal delivery speed.
              </p>

              <h3 style={{ fontSize: '20px', fontWeight: 600, marginTop: '32px', marginBottom: '16px', color: '#121212' }}>
                5. Delivery Attempts
              </h3>
              <p style={{ marginBottom: '16px' }}>
                Our delivery partners will attempt delivery up to 3 times. If delivery fails, 
                the package will be returned to us. Please ensure someone is available to receive 
                the package or provide a secure delivery location.
              </p>

              <h3 style={{ fontSize: '20px', fontWeight: 600, marginTop: '32px', marginBottom: '16px', color: '#121212' }}>
                6. Change of Address
              </h3>
              <p style={{ marginBottom: '16px' }}>
                If you need to change your delivery address after placing an order, please contact us 
                within 12 hours at support@cozeo.com. Once an order is shipped, the address cannot be modified.
              </p>

              <h3 style={{ fontSize: '20px', fontWeight: 600, marginTop: '32px', marginBottom: '16px', color: '#121212' }}>
                7. Lost or Damaged Packages
              </h3>
              <p style={{ marginBottom: '16px' }}>
                In the rare event that your package is lost or arrives damaged, please contact us 
                within 48 hours of the expected delivery date. We'll investigate with the carrier 
                and provide a replacement or full refund.
              </p>

              <h3 style={{ fontSize: '20px', fontWeight: 600, marginTop: '32px', marginBottom: '16px', color: '#121212' }}>
                8. International Shipping
              </h3>
              <p style={{ marginBottom: '16px' }}>
                Currently, we only ship within India. International shipping will be available soon. 
                Stay tuned for updates!
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
