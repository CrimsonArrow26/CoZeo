// EmailJS Configuration
// You need to set these values from your EmailJS dashboard
// https://dashboard.emailjs.com/

export const EMAILJS_CONFIG = {
  // Your EmailJS public key (found in Account > API Keys)
  PUBLIC_KEY: import.meta.env.VITE_EMAILJS_PUBLIC_KEY || 'lhz0cNBgqlj8pMhDE',
  
  // Service IDs - you'll create these in EmailJS dashboard
  SERVICES: {
    COZEO_GROUP: 'cozeo_group_service',      // For Join CoZeo emails
    ORDER_CONFIRMATION: 'service_809v8zs',    // For Order confirmation emails
  },
  
  // Template IDs - you'll create these in EmailJS dashboard
  TEMPLATES: {
    // Join CoZeo Group Templates
    WELCOME_EMAIL: 'welcome_template',           // Sent to user
    ADMIN_NOTIFICATION: 'admin_notify_template', // Sent to admin
    
    // Order Confirmation Templates  
    ORDER_CONFIRMATION: 'template_cm37vbr', // Sent to customer
    ORDER_ADMIN_NOTIFY: 'template_gkhcc3h',        // Sent to admin
  },
  
  // Admin email address where notifications will be sent
  ADMIN_EMAIL: 'cozeo.enterprise@gmail.com',
};
