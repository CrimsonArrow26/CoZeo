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
            <h1 style={{ fontSize: '36px', fontWeight: 600, marginBottom: '8px' }}>Terms and Conditions</h1>
            <p style={{ fontSize: '14px', color: '#666', marginBottom: '32px' }}>
              <strong>CoZeo</strong> | Effective Date: March 2026 | Last Updated: March 2026
            </p>
            
            <div style={{ lineHeight: 1.8, color: '#444' }}>
              <p style={{ marginBottom: '24px' }}>
                These Terms and Conditions govern your use of the CoZeo website (cozeo.in) and all services available through it, 
                including browsing products, creating an account, placing orders, participating in giveaways, and contacting us for support.
              </p>
              <p style={{ marginBottom: '32px' }}>
                Please read these terms carefully before using our website. By accessing or using CoZeo, you confirm that you have read, 
                understood, and agree to be bound by these terms. If you do not agree, do not use our website.
              </p>

              <h2 style={{ fontSize: '24px', fontWeight: 600, marginTop: '40px', marginBottom: '20px', color: '#121212' }}>
                1. About CoZeo
              </h2>
              <p style={{ marginBottom: '16px' }}>
                CoZeo is an online streetwear clothing store operated by <strong>CoZeo Wear Pvt Ltd</strong> (owned by Chirag Sanjay Gadiya), based in Pune, Maharashtra, India. 
                We sell clothing, accessories, and related products directly to customers.
              </p>
              <p style={{ marginBottom: '8px' }}><strong>Contact:</strong></p>
              <p style={{ marginBottom: '8px' }}>Email: cozeo.enterprise@gmail.com</p>
              <p style={{ marginBottom: '24px' }}>Address: Raunit Electricals, Shivaji Chowk, Kamshet, Pune, Maharashtra, India</p>

              <h2 style={{ fontSize: '24px', fontWeight: 600, marginTop: '40px', marginBottom: '20px', color: '#121212' }}>
                2. Eligibility
              </h2>
              <p style={{ marginBottom: '16px' }}>
                You must be at least 13 years of age to use this website. By using CoZeo, you represent that you are at least 13 years old.
              </p>
              <p style={{ marginBottom: '16px' }}>
                To place an order, you must be at least 18 years old, or have the consent of a parent or legal guardian who accepts 
                responsibility for the purchase.
              </p>
              <p style={{ marginBottom: '24px' }}>
                You must provide accurate and truthful information when creating an account or placing an order. CoZeo reserves the right 
                to cancel orders or suspend accounts where false information is provided.
              </p>

              <h2 style={{ fontSize: '24px', fontWeight: 600, marginTop: '40px', marginBottom: '20px', color: '#121212' }}>
                3. Your Account
              </h2>

              <h3 style={{ fontSize: '20px', fontWeight: 600, marginTop: '24px', marginBottom: '12px', color: '#121212' }}>
                3.1 Registration
              </h3>
              <p style={{ marginBottom: '16px' }}>
                You may browse our website without registering. However, to place an order, track orders, request returns, or enter giveaways, 
                you must create an account.
              </p>
              <p style={{ marginBottom: '24px' }}>
                When creating an account, you are responsible for providing accurate information including your full name and a valid email address. 
                Your password is managed securely by Supabase Auth and is never visible to CoZeo.
              </p>

              <h3 style={{ fontSize: '20px', fontWeight: 600, marginTop: '24px', marginBottom: '12px', color: '#121212' }}>
                3.2 Account Security
              </h3>
              <p style={{ marginBottom: '16px' }}>
                You are responsible for maintaining the confidentiality of your account login credentials. You are responsible for all activity 
                that occurs under your account. If you suspect unauthorised access to your account, notify us immediately at cozeo.enterprise@gmail.com.
              </p>
              <p style={{ marginBottom: '24px' }}>
                CoZeo will never ask for your password by email, phone, or any other channel.
              </p>

              <h3 style={{ fontSize: '20px', fontWeight: 600, marginTop: '24px', marginBottom: '12px', color: '#121212' }}>
                3.3 Account Suspension and Termination
              </h3>
              <p style={{ marginBottom: '24px' }}>
                We reserve the right to suspend or permanently close your account if you violate these terms, provide false information, 
                engage in fraudulent activity, or abuse our returns or giveaway systems.
              </p>
              <p style={{ marginBottom: '24px' }}>
                You may delete your account at any time from your dashboard. See our Privacy Policy for how your data is handled after deletion.
              </p>

              <h2 style={{ fontSize: '24px', fontWeight: 600, marginTop: '40px', marginBottom: '20px', color: '#121212' }}>
                4. Products
              </h2>

              <h3 style={{ fontSize: '20px', fontWeight: 600, marginTop: '24px', marginBottom: '12px', color: '#121212' }}>
                4.1 Product Descriptions
              </h3>
              <p style={{ marginBottom: '24px' }}>
                We make every effort to display our products accurately. Product images, colours, and descriptions are as accurate as reasonably possible. 
                However, actual colours may vary slightly depending on your device's screen settings. Fabric and sizing descriptions are provided as guidance.
              </p>

              <h3 style={{ fontSize: '20px', fontWeight: 600, marginTop: '24px', marginBottom: '12px', color: '#121212' }}>
                4.2 Pricing
              </h3>
              <p style={{ marginBottom: '24px' }}>
                All prices on CoZeo are displayed in Indian Rupees (₹) and are inclusive of applicable taxes unless stated otherwise. 
                Prices are subject to change without notice. The price you see at the time you place your order is the price you will be charged.
              </p>

              <h3 style={{ fontSize: '20px', fontWeight: 600, marginTop: '24px', marginBottom: '12px', color: '#121212' }}>
                4.3 Availability and Stock
              </h3>
              <p style={{ marginBottom: '16px' }}>
                All orders are subject to product availability. We reserve the right to limit quantities. If a product goes out of stock after 
                you place your order, we will notify you by email and offer either a replacement, a store credit, or a full refund.
              </p>
              <p style={{ marginBottom: '24px' }}>
                Stock levels shown on the website are updated in real time. However, in rare cases where two customers attempt to purchase 
                the last available item simultaneously, one order may be cancelled. In such cases, a full refund will be processed.
              </p>

              <h3 style={{ fontSize: '20px', fontWeight: 600, marginTop: '24px', marginBottom: '12px', color: '#121212' }}>
                4.4 Product Sizes
              </h3>
              <p style={{ marginBottom: '24px' }}>
                Size charts are provided on product pages as guidance. Actual fit may vary. If you are unsure of your size, we recommend checking 
                the size guide before purchasing. Size-related returns are accepted within our return window as described in Section 9.
              </p>

              <h2 style={{ fontSize: '24px', fontWeight: 600, marginTop: '40px', marginBottom: '20px', color: '#121212' }}>
                5. Orders
              </h2>

              <h3 style={{ fontSize: '20px', fontWeight: 600, marginTop: '24px', marginBottom: '12px', color: '#121212' }}>
                5.1 Placing an Order
              </h3>
              <p style={{ marginBottom: '24px' }}>
                When you place an order on CoZeo, you are making an offer to purchase the selected products at the listed price. An order is not 
                confirmed until you receive an order confirmation email from us. We reserve the right to decline or cancel any order for reasons 
                including but not limited to pricing errors, suspected fraud, or product unavailability.
              </p>

              <h3 style={{ fontSize: '20px', fontWeight: 600, marginTop: '24px', marginBottom: '12px', color: '#121212' }}>
                5.2 Order Confirmation
              </h3>
              <p style={{ marginBottom: '16px' }}>
                After a successful payment, you will receive an order confirmation email containing your order number, items ordered, total amount, 
                and estimated processing details. Please retain this email for your records.
              </p>
              <p style={{ marginBottom: '24px' }}>
                If you do not receive a confirmation email within 30 minutes of placing an order, check your spam folder first, 
                then contact us at cozeo.enterprise@gmail.com.
              </p>

              <h3 style={{ fontSize: '20px', fontWeight: 600, marginTop: '24px', marginBottom: '12px', color: '#121212' }}>
                5.3 Order Cancellation by You
              </h3>
              <p style={{ marginBottom: '16px' }}>
                You may cancel an order only if its status is <strong>Pending</strong> or <strong>Confirmed</strong>. Once an order has been 
                marked as <strong>Packed</strong>, it cannot be cancelled. To cancel, use the Cancel Order option on your order tracking page 
                or contact us at cozeo.enterprise@gmail.com.
              </p>
              <p style={{ marginBottom: '24px' }}>
                For Cash on Delivery orders cancelled before dispatch, no charges apply. For prepaid orders cancelled before dispatch, 
                a full refund will be processed within 5–7 business days.
              </p>

              <h3 style={{ fontSize: '20px', fontWeight: 600, marginTop: '24px', marginBottom: '12px', color: '#121212' }}>
                5.4 Order Cancellation by CoZeo
              </h3>
              <p style={{ marginBottom: '24px' }}>
                We reserve the right to cancel any order and issue a full refund in cases including: product is out of stock, pricing error 
                on the website, suspected fraudulent activity, or inability to verify your delivery address. We will notify you by email if your order is cancelled by us.
              </p>

              <h3 style={{ fontSize: '20px', fontWeight: 600, marginTop: '24px', marginBottom: '12px', color: '#121212' }}>
                5.5 Order Modifications
              </h3>
              <p style={{ marginBottom: '24px' }}>
                Once an order is placed, we are unable to modify the items, sizes, colours, or delivery address. If you need to make a change, 
                cancel the order (if it has not been packed) and place a new one.
              </p>

              <h2 style={{ fontSize: '24px', fontWeight: 600, marginTop: '40px', marginBottom: '20px', color: '#121212' }}>
                6. Payments
              </h2>

              <h3 style={{ fontSize: '20px', fontWeight: 600, marginTop: '24px', marginBottom: '12px', color: '#121212' }}>
                6.1 Payment Methods
              </h3>
              <p style={{ marginBottom: '16px' }}>CoZeo accepts the following payment methods:</p>
              <ul style={{ marginBottom: '24px', paddingLeft: '24px' }}>
                <li style={{ marginBottom: '8px' }}><strong>Razorpay</strong> — credit cards, debit cards, netbanking, and UPI via the Razorpay checkout</li>
                <li style={{ marginBottom: '8px' }}><strong>UPI</strong> — direct transfer to CoZeo's UPI ID (semi-manual, requires admin confirmation)</li>
                <li style={{ marginBottom: '8px' }}><strong>Cash on Delivery (COD)</strong> — available for eligible orders at checkout</li>
              </ul>

              <h3 style={{ fontSize: '20px', fontWeight: 600, marginTop: '24px', marginBottom: '12px', color: '#121212' }}>
                6.2 Payment Processing
              </h3>
              <p style={{ marginBottom: '16px' }}>
                Card and netbanking payments are processed securely by Razorpay, an RBI-authorised Payment Aggregator. CoZeo does not receive, 
                store, or have access to your card number, CVV, expiry date, or bank credentials at any point. All such data is handled 
                exclusively by Razorpay under their PCI-DSS Level 1 compliance.
              </p>
              <p style={{ marginBottom: '24px' }}>
                By completing a payment through Razorpay, you also agree to Razorpay's Terms of Service at razorpay.com/terms.
              </p>

              <h3 style={{ fontSize: '20px', fontWeight: 600, marginTop: '24px', marginBottom: '12px', color: '#121212' }}>
                6.3 Payment Failures
              </h3>
              <p style={{ marginBottom: '24px' }}>
                If a payment fails, your order will remain in a pending state. Your cart will not be cleared. You may retry payment from the checkout page. 
                CoZeo is not responsible for charges applied by your bank or card issuer in connection with a failed transaction.
              </p>

              <h3 style={{ fontSize: '20px', fontWeight: 600, marginTop: '24px', marginBottom: '12px', color: '#121212' }}>
                6.4 Cash on Delivery
              </h3>
              <p style={{ marginBottom: '24px' }}>
                COD orders are subject to availability and may not be offered for all locations or order values. For COD orders, payment is due 
                in full at the time of delivery. If you are unavailable to receive or pay for a COD order at the time of delivery, the order 
                may be cancelled and you may be restricted from placing future COD orders.
              </p>

              <h3 style={{ fontSize: '20px', fontWeight: 600, marginTop: '24px', marginBottom: '12px', color: '#121212' }}>
                6.5 Currency
              </h3>
              <p style={{ marginBottom: '24px' }}>
                All transactions on CoZeo are in Indian Rupees (₹). We do not accept foreign currency payments.
              </p>

              <h3 style={{ fontSize: '20px', fontWeight: 600, marginTop: '24px', marginBottom: '12px', color: '#121212' }}>
                6.6 GST and Taxes
              </h3>
              <p style={{ marginBottom: '24px' }}>
                Prices displayed include applicable Goods and Services Tax (GST) where required by Indian law.
              </p>

              <h2 style={{ fontSize: '24px', fontWeight: 600, marginTop: '40px', marginBottom: '20px', color: '#121212' }}>
                7. Delivery
              </h2>

              <h3 style={{ fontSize: '20px', fontWeight: 600, marginTop: '24px', marginBottom: '12px', color: '#121212' }}>
                7.1 Delivery Scope
              </h3>
              <p style={{ marginBottom: '24px' }}>
                CoZeo currently delivers to select locations in India. Delivery availability will be confirmed at checkout based on your pincode. 
                Pan-India delivery to all pincodes is not yet available.
              </p>

              <h3 style={{ fontSize: '20px', fontWeight: 600, marginTop: '24px', marginBottom: '12px', color: '#121212' }}>
                7.2 Delivery Timelines
              </h3>
              <p style={{ marginBottom: '24px' }}>
                Estimated delivery timelines are provided at checkout and in your order confirmation email. These are estimates only and not guaranteed. 
                Delays may occur due to courier conditions, public holidays, or circumstances beyond our control.
              </p>

              <h3 style={{ fontSize: '20px', fontWeight: 600, marginTop: '24px', marginBottom: '12px', color: '#121212' }}>
                7.3 Delivery Address
              </h3>
              <p style={{ marginBottom: '24px' }}>
                You are responsible for providing a complete and accurate delivery address at the time of placing your order. CoZeo is not 
                responsible for undelivered orders resulting from an incorrect or incomplete address provided by you. If a package is returned 
                to us due to an incorrect address, we will contact you to arrange re-delivery at your cost.
              </p>

              <h3 style={{ fontSize: '20px', fontWeight: 600, marginTop: '24px', marginBottom: '12px', color: '#121212' }}>
                7.4 Delivery Attempts
              </h3>
              <p style={{ marginBottom: '24px' }}>
                Our delivery partners may make up to two delivery attempts. If delivery is unsuccessful after two attempts, the package may be 
                held at a local facility or returned to us. Contact us at cozeo.enterprise@gmail.com if you experience delivery issues.
              </p>

              <h3 style={{ fontSize: '20px', fontWeight: 600, marginTop: '24px', marginBottom: '12px', color: '#121212' }}>
                7.5 Risk of Loss
              </h3>
              <p style={{ marginBottom: '24px' }}>
                Risk of loss and title for products pass to you upon delivery to your shipping address.
              </p>

              <h2 style={{ fontSize: '24px', fontWeight: 600, marginTop: '40px', marginBottom: '20px', color: '#121212' }}>
                8. Order Tracking
              </h2>

              <h3 style={{ fontSize: '20px', fontWeight: 600, marginTop: '24px', marginBottom: '12px', color: '#121212' }}>
                8.1 Tracking Stages
              </h3>
              <p style={{ marginBottom: '24px' }}>
                Every order on CoZeo passes through the following stages: Confirmed, Packed, Shipped, Arrived, and Delivered. 
                Your order's current stage is visible at the tracking URL provided in your order confirmation email.
              </p>

              <h3 style={{ fontSize: '20px', fontWeight: 600, marginTop: '24px', marginBottom: '12px', color: '#121212' }}>
                8.2 Public Tracking URL
              </h3>
              <p style={{ marginBottom: '24px' }}>
                Your order tracking page is accessible via a unique URL that does not require login. Do not share this URL publicly, 
                as it contains your order details and partial delivery address.
              </p>

              <h3 style={{ fontSize: '20px', fontWeight: 600, marginTop: '24px', marginBottom: '12px', color: '#121212' }}>
                8.3 Status Notifications
              </h3>
              <p style={{ marginBottom: '24px' }}>
                You will receive an email notification each time your order moves to the next stage. These emails are sent to the address 
                associated with your CoZeo account.
              </p>

              <h2 style={{ fontSize: '24px', fontWeight: 600, marginTop: '40px', marginBottom: '20px', color: '#121212' }}>
                9. Returns and Refunds
              </h2>

              <h3 style={{ fontSize: '20px', fontWeight: 600, marginTop: '24px', marginBottom: '12px', color: '#121212' }}>
                9.1 Return Window
              </h3>
              <p style={{ marginBottom: '24px' }}>
                You may request a return within <strong>7 days</strong> of your order being marked as Delivered. Return requests submitted 
                after this window will not be accepted.
              </p>

              <h3 style={{ fontSize: '20px', fontWeight: 600, marginTop: '24px', marginBottom: '12px', color: '#121212' }}>
                9.2 Eligible Reasons for Return
              </h3>
              <p style={{ marginBottom: '16px' }}>Returns are accepted for the following reasons:</p>
              <ul style={{ marginBottom: '24px', paddingLeft: '24px' }}>
                <li style={{ marginBottom: '8px' }}>Item arrived damaged or defective</li>
                <li style={{ marginBottom: '8px' }}>Wrong item was sent (incorrect product, size, or colour)</li>
                <li style={{ marginBottom: '8px' }}>Item does not match the product description on the website</li>
                <li style={{ marginBottom: '8px' }}>Size does not fit (exchange or refund at our discretion)</li>
                <li style={{ marginBottom: '8px' }}>Change of mind (eligible for exchange or store credit only, not cash refund)</li>
              </ul>

              <h3 style={{ fontSize: '20px', fontWeight: 600, marginTop: '24px', marginBottom: '12px', color: '#121212' }}>
                9.3 Non-Returnable Items
              </h3>
              <p style={{ marginBottom: '16px' }}>The following cannot be returned:</p>
              <ul style={{ marginBottom: '24px', paddingLeft: '24px' }}>
                <li style={{ marginBottom: '8px' }}>Items that have been worn, washed, or damaged by the customer after delivery</li>
                <li style={{ marginBottom: '8px' }}>Items returned without their original tags</li>
                <li style={{ marginBottom: '8px' }}>Items purchased during final sale events marked as non-returnable at the time of purchase</li>
              </ul>

              <h3 style={{ fontSize: '20px', fontWeight: 600, marginTop: '24px', marginBottom: '12px', color: '#121212' }}>
                9.4 How to Request a Return
              </h3>
              <p style={{ marginBottom: '24px' }}>
                Log in to your account, go to your dashboard, find the relevant order, and click Request Return. Fill in the reason, 
                an optional description, and upload up to three photos of the item. Submit the form. You will receive a confirmation email within 24 hours.
              </p>

              <h3 style={{ fontSize: '20px', fontWeight: 600, marginTop: '24px', marginBottom: '12px', color: '#121212' }}>
                9.5 Return Review
              </h3>
              <p style={{ marginBottom: '24px' }}>
                We aim to review all return requests within 2 business days of submission. We will notify you by email of approval or rejection. 
                If rejected, we will provide the reason.
              </p>

              <h3 style={{ fontSize: '20px', fontWeight: 600, marginTop: '24px', marginBottom: '12px', color: '#121212' }}>
                9.6 Refunds
              </h3>
              <p style={{ marginBottom: '16px' }}>Refunds are processed to the original payment method. Timeline by method:</p>
              <ul style={{ marginBottom: '24px', paddingLeft: '24px' }}>
                <li style={{ marginBottom: '8px' }}><strong>Razorpay (card / netbanking / UPI):</strong> 5–7 business days after approval</li>
                <li style={{ marginBottom: '8px' }}><strong>UPI (manual transfer):</strong> 3–5 business days after approval</li>
                <li style={{ marginBottom: '8px' }}><strong>Cash on Delivery:</strong> Refunded to a bank account or UPI ID you provide, within 5–7 business days</li>
              </ul>
              <p style={{ marginBottom: '24px' }}>
                We do not offer instant refunds. Refund timelines depend partly on your bank or payment provider.
              </p>

              <h3 style={{ fontSize: '20px', fontWeight: 600, marginTop: '24px', marginBottom: '12px', color: '#121212' }}>
                9.7 Replacements
              </h3>
              <p style={{ marginBottom: '24px' }}>
                If you request a replacement, it is subject to stock availability in your size and colour. If the item is unavailable, we will offer a refund instead.
              </p>

              <h2 style={{ fontSize: '24px', fontWeight: 600, marginTop: '40px', marginBottom: '20px', color: '#121212' }}>
                10. Giveaway
              </h2>

              <h3 style={{ fontSize: '20px', fontWeight: 600, marginTop: '24px', marginBottom: '12px', color: '#121212' }}>
                10.1 Eligibility
              </h3>
              <p style={{ marginBottom: '24px' }}>
                Our giveaway contests are open to residents of India. Employees of CoZeo and their immediate family members are not eligible.
              </p>

              <h3 style={{ fontSize: '20px', fontWeight: 600, marginTop: '24px', marginBottom: '12px', color: '#121212' }}>
                10.2 One Entry Per Person
              </h3>
              <p style={{ marginBottom: '24px' }}>
                Each person may submit only one entry per giveaway contest. Duplicate entries using the same email address will be rejected. 
                Attempts to submit multiple entries will result in disqualification.
              </p>

              <h3 style={{ fontSize: '20px', fontWeight: 600, marginTop: '24px', marginBottom: '12px', color: '#121212' }}>
                10.3 Entry Information
              </h3>
              <p style={{ marginBottom: '24px' }}>
                By entering a giveaway, you consent to CoZeo collecting and storing your name, email, phone number, college name, social media handles, 
                and an uploaded photo for the purpose of managing the contest. This information will not be used for any other purpose and will be 
                deleted within 90 days of the contest closing.
              </p>

              <h3 style={{ fontSize: '20px', fontWeight: 600, marginTop: '24px', marginBottom: '12px', color: '#121212' }}>
                10.4 Winner Selection
              </h3>
              <p style={{ marginBottom: '24px' }}>
                Winners are selected at the discretion of CoZeo based on criteria announced at the time of the contest. CoZeo's decisions regarding winners are final.
              </p>

              <h3 style={{ fontSize: '20px', fontWeight: 600, marginTop: '24px', marginBottom: '12px', color: '#121212' }}>
                10.5 Prize Delivery
              </h3>
              <p style={{ marginBottom: '24px' }}>
                Prizes will be shipped to the winner at no cost within India. Winners will be contacted via the email address used for entry. 
                If a winner does not respond within 7 days of being contacted, the prize may be awarded to another entrant.
              </p>

              <h3 style={{ fontSize: '20px', fontWeight: 600, marginTop: '24px', marginBottom: '12px', color: '#121212' }}>
                10.6 No Purchase Necessary
              </h3>
              <p style={{ marginBottom: '24px' }}>
                Participation in a giveaway does not require any purchase and does not improve your chances of winning.
              </p>

              <h2 style={{ fontSize: '24px', fontWeight: 600, marginTop: '40px', marginBottom: '20px', color: '#121212' }}>
                11. User Conduct
              </h2>
              <p style={{ marginBottom: '16px' }}>You agree not to use CoZeo to:</p>
              <ul style={{ marginBottom: '24px', paddingLeft: '24px' }}>
                <li style={{ marginBottom: '8px' }}>Submit false, misleading, or fraudulent information</li>
                <li style={{ marginBottom: '8px' }}>Attempt to gain unauthorised access to any part of our systems or another user's account</li>
                <li style={{ marginBottom: '8px' }}>Use automated tools to scrape, crawl, or harvest data from our website</li>
                <li style={{ marginBottom: '8px' }}>Place orders with no intention of receiving or paying for them</li>
                <li style={{ marginBottom: '8px' }}>Abuse the returns system by repeatedly returning items without valid reason</li>
                <li style={{ marginBottom: '8px' }}>Harass or threaten our staff or other users</li>
                <li style={{ marginBottom: '8px' }}>Engage in any activity that violates applicable Indian law</li>
              </ul>
              <p style={{ marginBottom: '24px' }}>
                We reserve the right to suspend accounts or cancel orders for any violations of the above.
              </p>

              <h2 style={{ fontSize: '24px', fontWeight: 600, marginTop: '40px', marginBottom: '20px', color: '#121212' }}>
                12. Intellectual Property
              </h2>
              <p style={{ marginBottom: '16px' }}>
                All content on the CoZeo website — including product names, descriptions, photographs, graphics, logos, the CoZeo brand name, 
                and the website design — is the property of CoZeo or its content suppliers and is protected by applicable intellectual property laws.
              </p>
              <p style={{ marginBottom: '16px' }}>
                You may not copy, reproduce, distribute, or create derivative works from any content on this website without our express written permission.
              </p>
              <p style={{ marginBottom: '24px' }}>
                Product images and branding referenced from the Velora Webflow template are used under the applicable template licence.
              </p>

              <h2 style={{ fontSize: '24px', fontWeight: 600, marginTop: '40px', marginBottom: '20px', color: '#121212' }}>
                13. Disclaimer of Warranties
              </h2>
              <p style={{ marginBottom: '16px' }}>
                The CoZeo website and its content are provided on an "as is" and "as available" basis without warranties of any kind, either express or implied. 
                We do not warrant that the website will be uninterrupted, error-free, or free of viruses or harmful components.
              </p>
              <p style={{ marginBottom: '24px' }}>
                Product descriptions and images are provided in good faith but we do not warrant that they are completely accurate, current, or free of errors.
              </p>

              <h2 style={{ fontSize: '24px', fontWeight: 600, marginTop: '40px', marginBottom: '20px', color: '#121212' }}>
                14. Limitation of Liability
              </h2>
              <p style={{ marginBottom: '16px' }}>
                To the fullest extent permitted by applicable law, CoZeo and its owners, employees, and service providers shall not be liable 
                for any indirect, incidental, special, or consequential damages arising from your use of the website or any products purchased through it.
              </p>
              <p style={{ marginBottom: '16px' }}>
                Our total liability to you for any claim arising from your use of CoZeo or a purchase made through it shall not exceed the amount 
                you paid for the specific order giving rise to the claim.
              </p>
              <p style={{ marginBottom: '24px' }}>
                Nothing in these terms limits our liability for fraud, personal injury caused by our negligence, or any other liability that cannot be excluded under Indian law.
              </p>

              <h2 style={{ fontSize: '24px', fontWeight: 600, marginTop: '40px', marginBottom: '20px', color: '#121212' }}>
                15. Third-Party Services
              </h2>
              <p style={{ marginBottom: '16px' }}>
                CoZeo uses the following third-party services to operate:
              </p>
              <p style={{ marginBottom: '8px' }}>
                <strong>Supabase</strong> — database, authentication, and file storage. Your data is stored on Supabase infrastructure. 
                Use is subject to Supabase's terms at supabase.com/terms.
              </p>
              <p style={{ marginBottom: '8px' }}>
                <strong>Razorpay</strong> — payment processing. By making a payment through Razorpay, you are also subject to Razorpay's terms at razorpay.com/terms. 
                CoZeo is not responsible for any issues arising from the Razorpay payment process.
              </p>
              <p style={{ marginBottom: '24px' }}>
                <strong>EmailJS</strong> — transactional email delivery. Used to send order and status notification emails.
              </p>
              <p style={{ marginBottom: '24px' }}>
                CoZeo is not responsible for the terms, practices, or availability of these third-party services.
              </p>

              <h2 style={{ fontSize: '24px', fontWeight: 600, marginTop: '40px', marginBottom: '20px', color: '#121212' }}>
                16. Privacy
              </h2>
              <p style={{ marginBottom: '24px' }}>
                Your use of CoZeo is also governed by our Privacy Policy, which is available at cozeo.in/privacy. The Privacy Policy is incorporated 
                into these terms by reference. By agreeing to these terms, you also agree to our Privacy Policy.
              </p>

              <h2 style={{ fontSize: '24px', fontWeight: 600, marginTop: '40px', marginBottom: '20px', color: '#121212' }}>
                17. Changes to These Terms
              </h2>
              <p style={{ marginBottom: '24px' }}>
                We may update these terms at any time. When we do, we will update the Last Updated date at the top of this page. For material changes, 
                we will notify you by email or by displaying a notice on the website. Your continued use of CoZeo after updated terms are posted 
                constitutes your acceptance of the new terms.
              </p>
              <p style={{ marginBottom: '24px' }}>
                If you do not agree to the updated terms, you must stop using our website.
              </p>

              <h2 style={{ fontSize: '24px', fontWeight: 600, marginTop: '40px', marginBottom: '20px', color: '#121212' }}>
                18. Governing Law and Disputes
              </h2>
              <p style={{ marginBottom: '16px' }}>
                These terms are governed by and construed in accordance with the laws of India, including the Information Technology Act, 2000, 
                the Consumer Protection Act, 2019, and other applicable Indian statutes.
              </p>
              <p style={{ marginBottom: '24px' }}>
                Any dispute arising from these terms or your use of CoZeo shall first be attempted to be resolved through direct communication with us at cozeo.enterprise@gmail.com. 
                If a resolution cannot be reached, disputes shall be subject to the exclusive jurisdiction of the competent courts in Pune, Maharashtra, India.
              </p>

              <h2 style={{ fontSize: '24px', fontWeight: 600, marginTop: '40px', marginBottom: '20px', color: '#121212' }}>
                19. Severability
              </h2>
              <p style={{ marginBottom: '24px' }}>
                If any provision of these terms is found to be unlawful, void, or unenforceable, that provision shall be deemed severable and shall not 
                affect the validity and enforceability of the remaining provisions.
              </p>

              <h2 style={{ fontSize: '24px', fontWeight: 600, marginTop: '40px', marginBottom: '20px', color: '#121212' }}>
                20. Entire Agreement
              </h2>
              <p style={{ marginBottom: '24px' }}>
                These Terms and Conditions, together with our Privacy Policy, constitute the entire agreement between you and CoZeo regarding your use 
                of this website and supersede all prior agreements, representations, or understandings.
              </p>

              <h2 style={{ fontSize: '24px', fontWeight: 600, marginTop: '40px', marginBottom: '20px', color: '#121212' }}>
                21. Contact Us
              </h2>
              <p style={{ marginBottom: '8px' }}>For any questions about these Terms and Conditions:</p>
              <p style={{ marginBottom: '8px' }}><strong>Email:</strong> cozeo.enterprise@gmail.com</p>
              <p style={{ marginBottom: '8px' }}><strong>Response time:</strong> Within 5 business days</p>
              <p style={{ marginBottom: '16px' }}><strong>Address:</strong> Raunit Electricals, Shivaji Chowk, Kamshet, Pune, Maharashtra, India</p>

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
