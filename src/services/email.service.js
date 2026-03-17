import emailjs from '@emailjs/browser';
import { EMAILJS_CONFIG } from '../config/emailjs.config';

// Initialize EmailJS with public key
export function initEmailJS() {
  if (EMAILJS_CONFIG.PUBLIC_KEY) {
    emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);
  }
}

/**
 * Send welcome email to user and notification to admin when joining CoZeo group
 * @param {Object} params
 * @param {string} params.email - User's email address
 * @param {string} params.name - User's name (optional)
 */
export async function sendJoinCoZeoEmails({ email, name = '' }) {
  try {
    // Validate email
    if (!email || !email.includes('@')) {
      throw new Error('Valid email is required');
    }

    // Send welcome email to user
    const welcomePromise = emailjs.send(
      EMAILJS_CONFIG.SERVICES.COZEO_GROUP,
      EMAILJS_CONFIG.TEMPLATES.WELCOME_EMAIL,
      {
        to_email: email,
        to_name: name || 'Valued Member',
        from_name: 'CoZeo Team',
        reply_to: EMAILJS_CONFIG.ADMIN_EMAIL,
      }
    );

    // Send notification to admin
    const adminPromise = emailjs.send(
      EMAILJS_CONFIG.SERVICES.COZEO_GROUP,
      EMAILJS_CONFIG.TEMPLATES.ADMIN_NOTIFICATION,
      {
        to_email: EMAILJS_CONFIG.ADMIN_EMAIL,
        subscriber_email: email,
        subscriber_name: name || 'Not provided',
        joined_at: new Date().toLocaleString(),
      }
    );

    // Send both emails concurrently
    const [welcomeResult, adminResult] = await Promise.allSettled([
      welcomePromise,
      adminPromise
    ]);

    return {
      success: welcomeResult.status === 'fulfilled' && adminResult.status === 'fulfilled',
      welcomeSent: welcomeResult.status === 'fulfilled',
      adminNotified: adminResult.status === 'fulfilled',
    };
  } catch (error) {
    throw error;
  }
}

/**
 * Send order confirmation emails
 * @param {Object} params
 * @param {string} params.customerEmail - Customer's email
 * @param {string} params.customerName - Customer's name
 * @param {string} params.orderId - Order ID
 * @param {string} params.orderDate - Order date
 * @param {Array} params.items - Order items
 * @param {number} params.total - Order total
 * @param {string} params.shippingAddress - Shipping address
 * @param {string} params.paymentMethod - Payment method
 * @param {string} params.invoiceUrl - URL to invoice (optional)
 */
export async function sendOrderConfirmationEmails({
  customerEmail,
  customerName,
  orderId,
  orderDate,
  items,
  total,
  shippingAddress,
  paymentMethod,
  invoiceUrl = '',
}) {
  try {
    // Validate required fields
    if (!customerEmail || !customerEmail.includes('@')) {
      throw new Error('Valid customer email is required');
    }
    if (!orderId) {
      throw new Error('Order ID is required');
    }

    // Format items for email template
    const itemsList = items.map(item => {
      const itemPrice = item.total_price || item.price || 0;
      const itemTotal = itemPrice * (item.quantity || 1);
      return `${item.name} x ${item.quantity} - ₹${itemTotal}`;
    }).join('\n');

    // Send order confirmation to customer
    const customerPromise = emailjs.send(
      EMAILJS_CONFIG.SERVICES.ORDER_CONFIRMATION,
      EMAILJS_CONFIG.TEMPLATES.ORDER_CONFIRMATION,
      {
        to_email: customerEmail,
        to_name: customerName || 'Valued Customer',
        order_id: orderId,
        order_date: orderDate || new Date().toLocaleDateString(),
        items_list: itemsList,
        order_total: `₹${total}`,
        shipping_address: shippingAddress,
        payment_method: paymentMethod,
        invoice_url: invoiceUrl,
        from_name: 'CoZeo Team',
      }
    );

    // Send order details to admin
    const adminPromise = emailjs.send(
      EMAILJS_CONFIG.SERVICES.ORDER_CONFIRMATION,
      EMAILJS_CONFIG.TEMPLATES.ORDER_ADMIN_NOTIFY,
      {
        to_email: EMAILJS_CONFIG.ADMIN_EMAIL,
        customer_email: customerEmail,
        customer_name: customerName || 'Not provided',
        order_id: orderId,
        order_date: orderDate || new Date().toLocaleDateString(),
        items_list: itemsList,
        order_total: `₹${total}`,
        shipping_address: shippingAddress,
        payment_method: paymentMethod,
        order_time: new Date().toLocaleString(),
      }
    );

    // Send both emails concurrently
    const [customerResult, adminResult] = await Promise.allSettled([
      customerPromise,
      adminPromise
    ]);

    return {
      success: customerResult.status === 'fulfilled' && adminResult.status === 'fulfilled',
      customerNotified: customerResult.status === 'fulfilled',
      adminNotified: adminResult.status === 'fulfilled',
    };
  } catch (error) {
    throw error;
  }
}

/**
 * Test EmailJS configuration
 * Use this to verify your EmailJS setup is working
 */
export async function testEmailJSConfig() {
  try {
    if (!EMAILJS_CONFIG.PUBLIC_KEY) {
      return { 
        success: false, 
        error: 'EmailJS public key not configured. Add VITE_EMAILJS_PUBLIC_KEY to your .env file.' 
      };
    }

    // Try to send a test email
    const result = await emailjs.send(
      EMAILJS_CONFIG.SERVICES.COZEO_GROUP,
      EMAILJS_CONFIG.TEMPLATES.WELCOME_EMAIL,
      {
        to_email: 'test@example.com',
        to_name: 'Test User',
      }
    );

    return { success: true, result };
  } catch (error) {
    return { 
      success: false, 
      error: error.message,
      hint: 'Make sure your EmailJS service and template IDs are correct in emailjs.config.js'
    };
  }
}
