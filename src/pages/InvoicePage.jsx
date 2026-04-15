import { useParams, Link } from 'react-router-dom';
import { useOrder, useOrderItems } from '../hooks/useOrders';
import { formatPrice, formatDate } from '../lib/utils';
import { Download, Printer, ArrowLeft, FileText } from 'lucide-react';
import { useEffect, useRef } from 'react';

export default function InvoicePage() {
  const { id } = useParams();
  const { data: order, isLoading } = useOrder(id || '');
  const { data: orderItems } = useOrderItems(id || '');
  const invoiceRef = useRef(null);

  useEffect(() => {
    // Auto-print when page loads
    const timer = setTimeout(() => {
      // window.print();
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="page-wrapper">
        <div className="container" style={{ padding: '60px 20px', textAlign: 'center' }}>
          <p>Loading invoice...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="page-wrapper">
        <div className="container" style={{ padding: '60px 20px', textAlign: 'center' }}>
          <h2>Invoice Not Found</h2>
          <Link to="/orders" className="primary-button" style={{ marginTop: '20px' }}>
            View Orders
          </Link>
        </div>
      </div>
    );
  }

  const invoiceNumber = order.display_id || order.id.slice(0, 8).toUpperCase();
  const invoiceDate = formatDate(order.created_at);
  const subtotal = order.subtotal || orderItems?.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0) || 0;
  const discount = order.discount_amount || 0;
  const total = order.total || subtotal - discount;

  return (
    <div className="page-wrapper invoice-page">
      {/* Header Actions - Hidden when printing */}
      <div className="invoice-actions no-print" style={{ 
        padding: '20px', 
        background: '#f5f5f5',
        borderBottom: '1px solid #ddd'
      }}>
        <div className="container" style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <Link to={`/order-confirmation/${order.id}`} className="secondary-button" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ArrowLeft size={18} />
            Back to Order
          </Link>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={handlePrint} className="primary-button" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Printer size={18} />
              Print Invoice
            </button>
          </div>
        </div>
      </div>

      {/* Invoice Content */}
      <div className="container" style={{ padding: '40px 20px', maxWidth: '800px', margin: '0 auto' }}>
        <div 
          ref={invoiceRef}
          className="invoice-document"
          style={{
            background: '#fff',
            padding: '40px',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}
        >
          {/* Invoice Header */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'flex-start',
            marginBottom: '40px',
            paddingBottom: '30px',
            borderBottom: '2px solid #121212'
          }}>
            <div>
              <h1 style={{ 
                fontSize: '32px', 
                fontWeight: '700', 
                marginBottom: '8px',
                color: '#121212'
              }}>
                CoZeo
              </h1>
              <p style={{ color: '#666', fontSize: '14px' }}>
                Premium Streetwear Fashion
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <h2 style={{ 
                fontSize: '24px', 
                fontWeight: '600',
                color: '#121212',
                marginBottom: '8px'
              }}>
                INVOICE
              </h2>
              <p style={{ color: '#666', fontSize: '14px' }}>
                #{invoiceNumber}
              </p>
            </div>
          </div>

          {/* Invoice Details Grid */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr',
            gap: '40px',
            marginBottom: '40px'
          }}>
            {/* Bill To */}
            <div>
              <h3 style={{ 
                fontSize: '12px', 
                textTransform: 'uppercase', 
                color: '#999',
                marginBottom: '12px',
                letterSpacing: '1px'
              }}>
                Bill To
              </h3>
              <p style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>
                {order.shipping_name || 'Customer'}
              </p>
              <p style={{ fontSize: '14px', color: '#666', lineHeight: '1.6' }}>
                {order.shipping_address}<br />
                {order.shipping_city}, {order.shipping_state} {order.shipping_pincode}<br />
                Phone: {order.shipping_phone || 'N/A'}
              </p>
            </div>

            {/* Invoice Info */}
            <div>
              <h3 style={{ 
                fontSize: '12px', 
                textTransform: 'uppercase', 
                color: '#999',
                marginBottom: '12px',
                letterSpacing: '1px'
              }}>
                Invoice Details
              </h3>
              <div style={{ fontSize: '14px', lineHeight: '1.8' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#666' }}>Invoice Date:</span>
                  <span>{invoiceDate}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#666' }}>Order ID:</span>
                  <span>{order.display_id || order.id.slice(0, 8).toUpperCase()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#666' }}>Payment Method:</span>
                  <span style={{ textTransform: 'capitalize' }}>{order.payment_method || 'Cashfree'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#666' }}>Payment Status:</span>
                  <span style={{ 
                    color: order.payment_status === 'paid' ? '#22c55e' : '#f59e0b',
                    fontWeight: '600',
                    textTransform: 'capitalize'
                  }}>
                    {order.payment_status || 'Pending'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div style={{ marginBottom: '40px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #121212' }}>
                  <th style={{ textAlign: 'left', padding: '12px 0', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>Item</th>
                  <th style={{ textAlign: 'center', padding: '12px 0', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>Qty</th>
                  <th style={{ textAlign: 'right', padding: '12px 0', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>Price</th>
                  <th style={{ textAlign: 'right', padding: '12px 0', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {orderItems?.map((item, index) => (
                  <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '16px 0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {item.product_image && (
                          <img 
                            src={item.product_image} 
                            alt={item.product_name}
                            style={{ 
                              width: '60px', 
                              height: '60px', 
                              objectFit: 'cover',
                              borderRadius: '4px'
                            }}
                          />
                        )}
                        <div>
                          <p style={{ fontWeight: '600', marginBottom: '4px' }}>{item.product_name}</p>
                          <p style={{ fontSize: '12px', color: '#666' }}>
                            Size: {item.size} {item.color && `| Color: ${item.color}`}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td style={{ textAlign: 'center', padding: '16px 0' }}>{item.quantity}</td>
                    <td style={{ textAlign: 'right', padding: '16px 0' }}>{formatPrice(item.unit_price)}</td>
                    <td style={{ textAlign: 'right', padding: '16px 0', fontWeight: '600' }}>
                      {formatPrice(item.total_price)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div style={{ 
            borderTop: '2px solid #121212',
            paddingTop: '24px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end'
          }}>
            <div style={{ width: '300px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ color: '#666' }}>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ color: '#666' }}>Discount</span>
                  <span style={{ color: '#22c55e' }}>-{formatPrice(discount)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ color: '#666' }}>Shipping</span>
                <span style={{ color: '#22c55e' }}>Free</span>
              </div>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                paddingTop: '16px',
                borderTop: '1px solid #ddd',
                fontSize: '18px',
                fontWeight: '700'
              }}>
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div style={{ 
            marginTop: '60px',
            paddingTop: '30px',
            borderTop: '1px solid #eee',
            textAlign: 'center'
          }}>
            <p style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
              Thank you for shopping with CoZeo!
            </p>
            <p style={{ fontSize: '12px', color: '#999' }}>
              For any queries, contact us at support@cozeo.com
            </p>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          .no-print {
            display: none !important;
          }
          .invoice-page {
            background: white !important;
          }
          .invoice-document {
            box-shadow: none !important;
            padding: 20px !important;
          }
          body {
            background: white;
          }
        }
      `}</style>
    </div>
  );
}
