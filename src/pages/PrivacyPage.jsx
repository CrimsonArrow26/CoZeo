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
            <h1 style={{ fontSize: '36px', fontWeight: 600, marginBottom: '8px' }}>Privacy Policy</h1>
            <p style={{ fontSize: '14px', color: '#666', marginBottom: '32px' }}>
              <strong>CoZeo</strong> | Effective Date: March 2026 | Last Updated: March 2026
            </p>
            
            <div style={{ lineHeight: 1.8, color: '#444' }}>
              <p style={{ marginBottom: '24px' }}>
                This Privacy Policy explains what personal information CoZeo collects from you when you use our website (cozeo.in), 
                why we collect it, how we use it, who we share it with, and what rights you have over it.
              </p>
              <p style={{ marginBottom: '24px' }}>
                CoZeo is an online streetwear clothing store built for customers in India. By using our website, creating an account, 
                placing an order, or entering our giveaway, you agree to the practices described in this policy.
              </p>
              <p style={{ marginBottom: '32px' }}>
                If you do not agree, please do not use our website.
              </p>

              <h2 style={{ fontSize: '24px', fontWeight: 600, marginTop: '40px', marginBottom: '20px', color: '#121212' }}>
                1. Who We Are
              </h2>
              <p style={{ marginBottom: '16px' }}>
                CoZeo is operated by <strong>CoZeo Wear Pvt Ltd</strong> (owned by Chirag Sanjay Gadiya), based in Pune, Maharashtra, India. We are the data controller for all personal information collected through this website.
              </p>
              <p style={{ marginBottom: '8px' }}>For any privacy-related questions, you can reach us at:</p>
              <p style={{ marginBottom: '8px' }}><strong>Email:</strong> cozeo.enterprise@gmail.com</p>
              <p style={{ marginBottom: '24px' }}><strong>Address:</strong> Raunit Electricals, Shivaji Chowk, Kamshet, Pune, Maharashtra, India</p>

              <h2 style={{ fontSize: '24px', fontWeight: 600, marginTop: '40px', marginBottom: '20px', color: '#121212' }}>
                2. What Information We Collect
              </h2>
              <p style={{ marginBottom: '16px' }}>
                We collect information in three ways: information you give us directly, information created automatically when you use our site, 
                and information handled on our behalf by third-party services.
              </p>

              <h3 style={{ fontSize: '20px', fontWeight: 600, marginTop: '24px', marginBottom: '12px', color: '#121212' }}>
                2.1 Information You Provide Directly
              </h3>
              
              <p style={{ marginBottom: '8px', fontWeight: 500 }}>When you create an account:</p>
              <p style={{ marginBottom: '16px' }}>
                Your full name, email address, and password. Your password is never stored by us in plain text — it is handled entirely 
                by Supabase Auth, our authentication provider.
              </p>

              <p style={{ marginBottom: '8px', fontWeight: 500 }}>When you update your profile:</p>
              <p style={{ marginBottom: '16px' }}>
                Your phone number, delivery address, city, state, and pincode. You may also upload a profile photo.
              </p>

              <p style={{ marginBottom: '8px', fontWeight: 500 }}>When you place an order:</p>
              <p style={{ marginBottom: '16px' }}>
                Your shipping name, phone number, delivery address (street, city, state, pincode), and order notes if you add them. 
                We also store a record of which products you ordered, in what sizes and colours, at what price, and via which payment method 
                (UPI, Razorpay, or Cash on Delivery).
              </p>

              <p style={{ marginBottom: '8px', fontWeight: 500 }}>When you pay via Razorpay:</p>
              <p style={{ marginBottom: '16px' }}>
                We do not see, store, or process your card number, CVV, or bank account details at any point. All card and netbanking 
                payment processing is handled directly and exclusively by Razorpay. What we do store is the Razorpay payment ID 
                (a reference string like <code>pay_abc123</code>) and your payment status (pending, paid, failed, or refunded). 
                We also store your UPI ID if you enter it for manual UPI payment.
              </p>

              <p style={{ marginBottom: '8px', fontWeight: 500 }}>When you enter our giveaway:</p>
              <p style={{ marginBottom: '16px' }}>
                Your full name, email address, phone number, college or university name, Instagram handle, Twitter/X handle, 
                and an uploaded photo. This information is used only to manage the contest and announce winners.
              </p>

              <p style={{ marginBottom: '8px', fontWeight: 500 }}>When you request a return:</p>
              <p style={{ marginBottom: '16px' }}>
                Your reason for returning, an optional description, and up to three photos of the item. This is used only to process your return request.
              </p>

              <p style={{ marginBottom: '8px', fontWeight: 500 }}>When you subscribe to our newsletter:</p>
              <p style={{ marginBottom: '16px' }}>Your email address only.</p>

              <h3 style={{ fontSize: '20px', fontWeight: 600, marginTop: '24px', marginBottom: '12px', color: '#121212' }}>
                2.2 Information Created Automatically
              </h3>
              <p style={{ marginBottom: '16px' }}>
                When you visit our website, basic technical information is recorded by Supabase (our backend provider), including your IP address, 
                browser type, and which pages you access. This is standard server-side logging and is used only for security monitoring 
                and diagnosing technical issues.
              </p>
              <p style={{ marginBottom: '16px' }}>
                We do not run Google Analytics, Meta Pixel, or any behavioural tracking or advertising technology on this website.
              </p>
              <p style={{ marginBottom: '16px' }}>
                We use browser localStorage to store your shopping cart between sessions. This data stays on your device and is not sent 
                to our servers unless you proceed to checkout.
              </p>
              <p style={{ marginBottom: '16px' }}>
                Your authentication session is managed via a secure token stored in your browser by Supabase Auth.
              </p>

              <h3 style={{ fontSize: '20px', fontWeight: 600, marginTop: '24px', marginBottom: '12px', color: '#121212' }}>
                2.3 Information We Do Not Collect
              </h3>
              <p style={{ marginBottom: '24px' }}>
                We do not collect your precise location at any point. We do not collect biometric data. We do not use cookies for advertising 
                or tracking. We do not collect information about children — our site is not directed at anyone under 13 years of age.
              </p>

              <h2 style={{ fontSize: '24px', fontWeight: 600, marginTop: '40px', marginBottom: '20px', color: '#121212' }}>
                3. How We Use Your Information
              </h2>
              <p style={{ marginBottom: '16px' }}>
                <strong>To fulfil your orders.</strong> We use your name, phone number, and delivery address to process and fulfil your purchases, 
                update you on your order status, and handle returns or exchanges.
              </p>
              <p style={{ marginBottom: '16px' }}>
                <strong>To process payments.</strong> We pass your name, phone number, email address, and order total to Razorpay to open their payment modal. 
                Razorpay handles the actual payment. We store the result (paid or failed) and the payment reference ID.
              </p>
              <p style={{ marginBottom: '16px' }}>
                <strong>To send you transactional emails.</strong> When you place an order or when your order status changes (confirmed, packed, shipped, 
                arrived, delivered, cancelled), we send you an email. These emails are sent via EmailJS, our email delivery service. 
                These are not marketing emails — they are service notifications directly related to your order.
              </p>
              <p style={{ marginBottom: '16px' }}>
                <strong>To run our giveaway.</strong> Your giveaway entry information is used only to manage the contest, verify eligibility, and contact the winner.
              </p>
              <p style={{ marginBottom: '16px' }}>
                <strong>To manage returns.</strong> Your return request details are used by our team to review and approve or reject the request.
              </p>
              <p style={{ marginBottom: '16px' }}>
                <strong>To send newsletters.</strong> If you subscribe, we may occasionally send you emails about new product drops and promotions. 
                You can unsubscribe at any time via the link in any email.
              </p>
              <p style={{ marginBottom: '16px' }}>
                <strong>To improve our website.</strong> Anonymous, aggregated usage data may be used to understand which products are popular 
                and how customers navigate the site.
              </p>
              <p style={{ marginBottom: '24px' }}>We do not sell your personal information to anyone, ever.</p>

              <h2 style={{ fontSize: '24px', fontWeight: 600, marginTop: '40px', marginBottom: '20px', color: '#121212' }}>
                4. Who We Share Your Information With
              </h2>
              <p style={{ marginBottom: '16px' }}>
                We share your data only with the third-party services required to operate CoZeo. None of these services use your data for their own advertising purposes.
              </p>

              <h3 style={{ fontSize: '18px', fontWeight: 600, marginTop: '20px', marginBottom: '8px', color: '#121212' }}>Supabase</h3>
              <p style={{ marginBottom: '16px' }}>
                Our database, authentication, and file storage provider. All your account data, order history, profile information, 
                giveaway entries, and uploaded photos are stored on Supabase infrastructure. Supabase servers are located in the United States 
                and European Union. Supabase is SOC 2 Type II certified. Privacy policy: supabase.com/privacy
              </p>

              <h3 style={{ fontSize: '18px', fontWeight: 600, marginTop: '20px', marginBottom: '8px', color: '#121212' }}>Razorpay</h3>
              <p style={{ marginBottom: '16px' }}>
                Our payment processing provider. When you pay by card, netbanking, or UPI via the Razorpay checkout modal, your payment details 
                are entered directly into Razorpay's interface and processed under their systems. CoZeo does not receive or store your card number, 
                CVV, expiry date, or bank credentials at any point. Razorpay is PCI-DSS Level 1 certified and is an RBI-authorised Payment Aggregator. 
                Privacy policy: razorpay.com/privacy-policy
              </p>

              <h3 style={{ fontSize: '18px', fontWeight: 600, marginTop: '20px', marginBottom: '8px', color: '#121212' }}>EmailJS</h3>
              <p style={{ marginBottom: '16px' }}>
                Our transactional email service. EmailJS processes your email address and the content of order confirmation and status 
                notification emails. EmailJS does not use this information for any purpose other than delivering the email. 
                Privacy policy: emailjs.com/legal/privacy-policy
              </p>

              <h3 style={{ fontSize: '18px', fontWeight: 600, marginTop: '20px', marginBottom: '8px', color: '#121212' }}>Google Fonts</h3>
              <p style={{ marginBottom: '16px' }}>
                Our website loads fonts from Google's CDN. This means your browser makes a request to Google's servers when you load any page 
                on our site. Google may log this request. This is limited to font delivery and involves no personal data beyond the standard 
                IP address in a server request. You can learn more at fonts.google.com.
              </p>

              <h3 style={{ fontSize: '18px', fontWeight: 600, marginTop: '20px', marginBottom: '8px', color: '#121212' }}>Legal and regulatory disclosure</h3>
              <p style={{ marginBottom: '24px' }}>
                We may disclose your information if required by law, in response to a valid court order, or to protect the rights, property, 
                or safety of CoZeo, our customers, or the public.
              </p>

              <h2 style={{ fontSize: '24px', fontWeight: 600, marginTop: '40px', marginBottom: '20px', color: '#121212' }}>
                5. Payment Security
              </h2>
              <p style={{ marginBottom: '16px' }}>
                CoZeo does not store, process, or transmit your payment card details through its own systems. All card payments, netbanking, 
                and UPI transactions processed via the Razorpay payment modal are subject to Razorpay's PCI-DSS Level 1 compliance.
              </p>
              <p style={{ marginBottom: '16px' }}>For Cash on Delivery orders, no payment information is collected online.</p>
              <p style={{ marginBottom: '24px' }}>
                For manual UPI transfers, you are asked to enter your UPI ID to generate a payment reference. This UPI ID is stored in your order record.
              </p>

              <h2 style={{ fontSize: '24px', fontWeight: 600, marginTop: '40px', marginBottom: '20px', color: '#121212' }}>
                6. File Uploads and Storage
              </h2>
              <p style={{ marginBottom: '8px', fontWeight: 500 }}>Profile photos:</p>
              <p style={{ marginBottom: '16px' }}>
                Stored in a public Supabase Storage bucket. Your photo is accessible to anyone with the direct URL. 
                You can delete or replace your photo at any time from your dashboard.
              </p>
              <p style={{ marginBottom: '8px', fontWeight: 500 }}>Giveaway entry photos:</p>
              <p style={{ marginBottom: '16px' }}>
                Stored in a private Supabase Storage bucket. Only CoZeo admins can view these photos.
              </p>
              <p style={{ marginBottom: '8px', fontWeight: 500 }}>Return request photos:</p>
              <p style={{ marginBottom: '24px' }}>
                Stored in a private Supabase Storage bucket. Only you and CoZeo admins can access these photos.
              </p>

              <h2 style={{ fontSize: '24px', fontWeight: 600, marginTop: '40px', marginBottom: '20px', color: '#121212' }}>
                7. Data Retention
              </h2>
              <p style={{ marginBottom: '8px', fontWeight: 500 }}>Account and profile data:</p>
              <p style={{ marginBottom: '16px' }}>Retained for as long as your account exists. If you delete your account, your profile data is deleted within 30 days.</p>
              <p style={{ marginBottom: '8px', fontWeight: 500 }}>Order data:</p>
              <p style={{ marginBottom: '16px' }}>Order records are retained for a minimum of 7 years for legal and accounting compliance, even after account deletion.</p>
              <p style={{ marginBottom: '8px', fontWeight: 500 }}>Giveaway entries:</p>
              <p style={{ marginBottom: '16px' }}>Retained for 90 days after the contest closes, then permanently deleted.</p>
              <p style={{ marginBottom: '8px', fontWeight: 500 }}>Return request data:</p>
              <p style={{ marginBottom: '16px' }}>Retained for 1 year after the return is resolved.</p>
              <p style={{ marginBottom: '8px', fontWeight: 500 }}>Newsletter subscriptions:</p>
              <p style={{ marginBottom: '16px' }}>Retained until you unsubscribe. Unsubscribing removes your email from future sends but does not delete the record immediately.</p>
              <p style={{ marginBottom: '8px', fontWeight: 500 }}>Automatically collected server logs:</p>
              <p style={{ marginBottom: '24px' }}>Retained for up to 90 days by Supabase.</p>

              <h2 style={{ fontSize: '24px', fontWeight: 600, marginTop: '40px', marginBottom: '20px', color: '#121212' }}>
                8. Your Rights
              </h2>
              <p style={{ marginBottom: '16px' }}>You have the following rights over your personal data:</p>
              <p style={{ marginBottom: '8px', fontWeight: 500 }}>Access.</p>
              <p style={{ marginBottom: '16px' }}>
                You can view all the personal information we hold about you by logging into your dashboard. 
                Your profile, order history, and notification history are all accessible there.
              </p>
              <p style={{ marginBottom: '8px', fontWeight: 500 }}>Correction.</p>
              <p style={{ marginBottom: '16px' }}>
                You can update your name, phone number, and delivery address from your dashboard at any time.
              </p>
              <p style={{ marginBottom: '8px', fontWeight: 500 }}>Deletion.</p>
              <p style={{ marginBottom: '16px' }}>
                You can request deletion of your account and personal data from your dashboard (Settings → Delete Account) 
                or by emailing cozeo.enterprise@gmail.com. We will process deletion requests within 30 days. Note that order records required 
                for legal and accounting purposes cannot be deleted but will be anonymised.
              </p>
              <p style={{ marginBottom: '8px', fontWeight: 500 }}>Opt-out of marketing.</p>
              <p style={{ marginBottom: '16px' }}>
                You can unsubscribe from newsletters at any time using the unsubscribe link in any email. 
                You cannot opt out of transactional order emails — these are essential service communications.
              </p>
              <p style={{ marginBottom: '8px', fontWeight: 500 }}>Data portability.</p>
              <p style={{ marginBottom: '16px' }}>
                You can request a copy of your personal data in a common format by emailing cozeo.enterprise@gmail.com. We will respond within 30 days.
              </p>
              <p style={{ marginBottom: '24px' }}>To exercise any of these rights, contact us at cozeo.enterprise@gmail.com.</p>

              <h2 style={{ fontSize: '24px', fontWeight: 600, marginTop: '40px', marginBottom: '20px', color: '#121212' }}>
                9. Cookies and Local Storage
              </h2>
              <p style={{ marginBottom: '8px', fontWeight: 500 }}>Session cookies:</p>
              <p style={{ marginBottom: '16px' }}>
                Supabase Auth uses a secure HTTP-only cookie to maintain your login session. This is a functional cookie required for the site to work. 
                It does not track you across other websites.
              </p>
              <p style={{ marginBottom: '8px', fontWeight: 500 }}>Shopping cart:</p>
              <p style={{ marginBottom: '16px' }}>
                Your cart is stored in your browser's localStorage. This data never leaves your device unless you proceed to checkout.
              </p>
              <p style={{ marginBottom: '24px' }}>
                <strong>No tracking or advertising cookies:</strong> We do not use cookies from Google, Meta, or any advertising network. 
                We do not run retargeting campaigns.
              </p>

              <h2 style={{ fontSize: '24px', fontWeight: 600, marginTop: '40px', marginBottom: '20px', color: '#121212' }}>
                10. Children's Privacy
              </h2>
              <p style={{ marginBottom: '24px' }}>
                CoZeo is not directed at children under the age of 13. We do not knowingly collect personal information from anyone under 13. 
                If you are a parent or guardian and believe your child has provided us with personal information, please contact us at 
                cozeo.enterprise@gmail.com and we will delete it promptly.
              </p>

              <h2 style={{ fontSize: '24px', fontWeight: 600, marginTop: '40px', marginBottom: '20px', color: '#121212' }}>
                11. Data Security
              </h2>
              <p style={{ marginBottom: '16px' }}>We take reasonable steps to protect your personal information. These include:</p>
              <ul style={{ marginBottom: '16px', paddingLeft: '24px' }}>
                <li style={{ marginBottom: '8px' }}>Row Level Security (RLS) on all database tables so users can only access their own data</li>
                <li style={{ marginBottom: '8px' }}>All data transmitted over HTTPS</li>
                <li style={{ marginBottom: '8px' }}>Passwords never stored by CoZeo — managed entirely by Supabase Auth</li>
                <li style={{ marginBottom: '8px' }}>Payment card data never passes through CoZeo's systems — handled by Razorpay</li>
                <li style={{ marginBottom: '8px' }}>API secrets and service keys stored as server-side environment variables, never in the client-side code</li>
                <li style={{ marginBottom: '8px' }}>Private file uploads accessible only to the account owner and CoZeo admins</li>
              </ul>
              <p style={{ marginBottom: '16px' }}>No security system is perfect. In the event of a data breach that affects your personal information, we will notify you by email within a reasonable time.</p>

              <h2 style={{ fontSize: '24px', fontWeight: 600, marginTop: '40px', marginBottom: '20px', color: '#121212' }}>
                12. Third-Party Links
              </h2>
              <p style={{ marginBottom: '24px' }}>
                Our website may contain links to external pages such as product reviews, social media profiles, or partner sites. 
                This privacy policy does not apply to those external websites. We encourage you to read the privacy policies of any external site you visit.
              </p>

              <h2 style={{ fontSize: '24px', fontWeight: 600, marginTop: '40px', marginBottom: '20px', color: '#121212' }}>
                13. Changes to This Policy
              </h2>
              <p style={{ marginBottom: '24px' }}>
                We may update this privacy policy from time to time. When we do, we will update the "Last Updated" date at the top of this page 
                and, for significant changes, notify you by email or via a notice on the website. Continued use of CoZeo after a change is posted 
                constitutes acceptance of the updated policy.
              </p>

              <h2 style={{ fontSize: '24px', fontWeight: 600, marginTop: '40px', marginBottom: '20px', color: '#121212' }}>
                14. Governing Law
              </h2>
              <p style={{ marginBottom: '24px' }}>
                This privacy policy is governed by the laws of India, including the Information Technology Act, 2000 and the Information Technology 
                (Amendment) Act, 2008. Any disputes arising from this policy shall be subject to the jurisdiction of courts in Pune, Maharashtra, India.
              </p>

              <h2 style={{ fontSize: '24px', fontWeight: 600, marginTop: '40px', marginBottom: '20px', color: '#121212' }}>
                15. Contact
              </h2>
              <p style={{ marginBottom: '8px' }}>For any questions, concerns, or requests related to this privacy policy or your personal data:</p>
              <p style={{ marginBottom: '8px' }}><strong>Email:</strong> cozeo.enterprise@gmail.com</p>
              <p style={{ marginBottom: '8px' }}><strong>Response time:</strong> Within 7 business days</p>
              <p style={{ marginBottom: '16px' }}>
                For urgent payment-related issues, contact Razorpay support directly at support@razorpay.com.
              </p>

              <p style={{ marginTop: '48px', paddingTop: '24px', borderTop: '1px solid #e5e5e5', fontSize: '14px', color: '#666', textAlign: 'center' }}>
                © 2026 CoZeo. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
