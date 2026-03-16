import { Link } from 'react-router-dom';
import Header from '../components/Header';
import { Footer } from '../components/SubscribeFooter';

export default function RefundPage() {
  return (
    <div className="page-wrapper">
      <Header />
      <section style={{ padding: '60px 0 80px', minHeight: '60vh' }}>
        <div className="w-layout-blockcontainer container w-container">
          {/* Breadcrumb */}
          <div className="breadcrumb-link-block" style={{ marginBottom: 24 }}>
            <Link to="/" className="breadcrumb-link">Home</Link>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-current">Refund Policy</span>
          </div>

          <div className="legal-content" style={{ maxWidth: '800px' }}>
            <h1 style={{ fontSize: '36px', fontWeight: 600, marginBottom: '32px' }}>Refund Policy</h1>
            
            <div style={{ lineHeight: 1.8, color: '#444' }}>
              <p style={{ marginBottom: '24px' }}>
                We want you to be completely satisfied with your CoZeo purchase. If you're not happy 
                with your order, we offer hassle-free returns and exchanges within 30 days.
              </p>

              <h3 style={{ fontSize: '20px', fontWeight: 600, marginTop: '32px', marginBottom: '16px', color: '#121212' }}>
                1. Return Eligibility
              </h3>
              <p style={{ marginBottom: '16px' }}>
                Items must be returned within 30 days of delivery. Products must be unworn, unwashed, 
                and in original condition with all tags attached. Items marked as "Final Sale" 
                cannot be returned or exchanged.
              </p>

              <h3 style={{ fontSize: '20px', fontWeight: 600, marginTop: '32px', marginBottom: '16px', color: '#121212' }}>
                2. How to Return
              </h3>
              <p style={{ marginBottom: '16px' }}>
                1. Log into your CoZeo account and go to "My Orders"<br />
                2. Select the order and items you wish to return<br />
                3. Print the prepaid return label<br />
                4. Pack items securely in original packaging<br />
                5. Drop off at any authorized shipping center
              </p>

              <h3 style={{ fontSize: '20px', fontWeight: 600, marginTop: '32px', marginBottom: '16px', color: '#121212' }}>
                3. Refund Process
              </h3>
              <p style={{ marginBottom: '16px' }}>
                Once we receive and inspect your return, we'll process your refund within 5-7 business days. 
                Refunds will be issued to the original payment method. You'll receive an email confirmation 
                once the refund is processed.
              </p>

              <h3 style={{ fontSize: '20px', fontWeight: 600, marginTop: '32px', marginBottom: '16px', color: '#121212' }}>
                4. Exchanges
              </h3>
              <p style={{ marginBottom: '16px' }}>
                We offer free exchanges for different sizes or colors, subject to availability. 
                Simply follow the return process and select "Exchange" instead of "Refund." 
                Your replacement item will be shipped once we receive the original.
              </p>

              <h3 style={{ fontSize: '20px', fontWeight: 600, marginTop: '32px', marginBottom: '16px', color: '#121212' }}>
                5. Damaged or Defective Items
              </h3>
              <p style={{ marginBottom: '16px' }}>
                If you receive a damaged or defective item, please contact us immediately at 
                support@cozeo.com with photos. We'll provide a prepaid return label and issue 
                a full refund or replacement at no additional cost.
              </p>

              <h3 style={{ fontSize: '20px', fontWeight: 600, marginTop: '32px', marginBottom: '16px', color: '#121212' }}>
                6. Non-Returnable Items
              </h3>
              <p style={{ marginBottom: '16px' }}>
                Gift cards, personalized items, and items marked as "Final Sale" cannot be returned. 
                Undergarments and swimwear can only be returned if unworn with original hygienic liners intact.
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
