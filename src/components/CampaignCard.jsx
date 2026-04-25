import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Package, Upload, ArrowRight, X, ShoppingCart, Sparkles, CheckCircle } from 'lucide-react';
import { formatPrice } from '../lib/utils';
import { useCart } from '../CartContext';
import { useCustomDesignApparelTypes } from '../hooks/useAppSettings';
import { toast } from 'sonner';

export default function CampaignCard({ campaign }) {
  const [showModal, setShowModal] = useState(false);
  const { data: apparelTypes = ['hoodie'] } = useCustomDesignApparelTypes();
  const { addToCart } = useCart();
  const products = campaign.campaign_products || [];
  const regularProducts = products.filter(p => !p.is_custom_design_slot);
  const hasCustomDesign = products.some(p => p.is_custom_design_slot);

  // Custom design upload state
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [customDesignUploaded, setCustomDesignUploaded] = useState(false);
  const [customDesign, setCustomDesign] = useState(null);
  const [apparelType, setApparelType] = useState('hoodie');
  
  const savings = campaign.original_total - campaign.combo_price;
  const discountPercentage = Math.round((savings / campaign.original_total) * 100);
  
  // Calculate days remaining
  const endDate = new Date(campaign.ends_at);
  const now = new Date();
  const daysRemaining = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('upload_preset', 'unsigned_preset'); // Use your Cloudinary preset

      const response = await fetch('https://api.cloudinary.com/v1_1/dnez7rl46/image/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (data.secure_url) {
        setCustomDesign({
          imageUrl: data.secure_url,
          previewUrl: data.secure_url,
        });
        setCustomDesignUploaded(true);
        toast.success('Design uploaded successfully!');
      }
    } catch (error) {
      toast.error('Failed to upload design');
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddToCart = () => {
    if (hasCustomDesign && !customDesignUploaded) {
      toast.error('Please upload your custom design first');
      return;
    }

    // Add all campaign products to cart
    regularProducts.forEach(cp => {
      if (cp.product) {
        addToCart({
          id: cp.product.id,
          name: cp.product.name,
          price: cp.product.discount_price || cp.product.price,
          size: 'M', // Default size
          image: cp.product.images?.[0],
          quantity: cp.min_quantity || 1,
          campaign_id: campaign.id,
        });
      }
    });

    // If has custom design, add it to cart
    if (hasCustomDesign && customDesignUploaded) {
      addToCart({
        id: `custom-${campaign.id}`,
        name: campaign.custom_design_label || 'Custom Hoodie',
        price: 0, // Price is included in combo
        size: 'M',
        image: customDesign?.previewUrl || '/images/hoodie-placeholder.png',
        qty: 1,
        campaign_id: campaign.id,
        is_custom_design: true,
        custom_design_id: customDesign?.imageUrl, // Use Cloudinary URL as ID
        custom_design_front: customDesign?.imageUrl,
        custom_design_back: null,
        apparel_type: apparelType,
        print_location: 'front',
      });
    }

    toast.success(`Added ${campaign.name} to cart!`);
    setShowModal(false);
    // Reset upload state
    setSelectedFile(null);
    setPreviewUrl(null);
    setCustomDesignUploaded(false);
    setCustomDesign(null);
  };

  return (
    <>
      <div className="campaign-card">
        {campaign.badge && (
          <span className="campaign-card-badge">{campaign.badge}</span>
        )}
        
        {/* Campaign Image */}
        {campaign.image_url && (
          <div className="campaign-card-image">
            <img src={campaign.image_url} alt={campaign.name} />
          </div>
        )}
        
        <div className="campaign-card-header">
          <h3 className="campaign-card-title">{campaign.name}</h3>
          {campaign.description && (
            <p className="campaign-card-description">{campaign.description}</p>
          )}
        </div>

        <div className="campaign-card-products">
          {regularProducts.slice(0, 3).map((cp, index) => (
            <div key={cp.id} className="campaign-mini-product">
              {cp.product?.images?.[0] ? (
                <img 
                  src={cp.product.images[0]} 
                  alt={cp.product.name}
                  className="campaign-mini-image"
                />
              ) : (
                <div className="campaign-mini-placeholder">
                  <Package size={16} />
                </div>
              )}
              <span className="campaign-mini-name">{cp.product?.name}</span>
              {cp.min_quantity > 1 && (
                <span className="campaign-mini-qty">x{cp.min_quantity}</span>
              )}
            </div>
          ))}
          
          {hasCustomDesign && (
            <div className="campaign-mini-product custom-design">
              <div className="campaign-mini-placeholder custom">
                <Upload size={16} />
              </div>
              <span className="campaign-mini-name">
                {campaign.custom_design_label || 'Custom Design'}
              </span>
            </div>
          )}
          
          {regularProducts.length > 3 && (
            <div className="campaign-more-products">
              +{regularProducts.length - 3} more
            </div>
          )}
        </div>

        <div className="campaign-card-pricing">
          <div className="campaign-price-row">
            <span className="campaign-original-price">
              {formatPrice(campaign.original_total)}
            </span>
            <span className="campaign-discount-badge">
              {discountPercentage}% OFF
            </span>
          </div>
          <div className="campaign-combo-price">
            <span className="campaign-price-label">Combo Price</span>
            <span className="campaign-price-value">{formatPrice(campaign.combo_price)}</span>
          </div>
          <div className="campaign-savings">
            You save {formatPrice(savings)}
          </div>
        </div>

        {daysRemaining > 0 && daysRemaining <= 7 && (
          <div className="campaign-urgency">
            <Clock size={14} />
            <span>Ends in {daysRemaining} day{daysRemaining !== 1 ? 's' : ''}</span>
          </div>
        )}

        <button 
          onClick={() => setShowModal(true)}
          className="campaign-card-button"
        >
          <span>View Deal</span>
          <ArrowRight size={16} />
        </button>
      </div>

      {/* Campaign Modal */}
      {showModal && (
        <div className="campaign-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="campaign-modal" onClick={(e) => e.stopPropagation()}>
            <button className="campaign-modal-close" onClick={() => setShowModal(false)}>
              <X size={24} />
            </button>
            
            {campaign.image_url && (
              <div className="campaign-modal-image">
                <img src={campaign.image_url} alt={campaign.name} />
              </div>
            )}
            
            <div className="campaign-modal-header">
              {campaign.badge && (
                <span className="campaign-modal-badge">{campaign.badge}</span>
              )}
              <h2 className="campaign-modal-title">{campaign.name}</h2>
              {campaign.description && (
                <p className="campaign-modal-description">{campaign.description}</p>
              )}
            </div>

            <div className="campaign-modal-products">
              <h4>What's Included:</h4>
              <div className="campaign-modal-product-list">
                {regularProducts.map((cp) => (
                  <div key={cp.id} className="campaign-modal-product-item">
                    {cp.product?.images?.[0] ? (
                      <img src={cp.product.images[0]} alt={cp.product.name} />
                    ) : (
                      <div className="campaign-modal-product-placeholder">
                        <Package size={20} />
                      </div>
                    )}
                    <div className="campaign-modal-product-info">
                      <span className="product-name">{cp.product?.name}</span>
                      <span className="product-qty">Qty: {cp.min_quantity || 1}</span>
                      {cp.product && (
                        <span className="product-price">
                          {formatPrice(cp.product.discount_price || cp.product.price)}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
                
                {hasCustomDesign && (
                  <div className="campaign-modal-product-item custom-design">
                    <div className="campaign-modal-product-placeholder custom">
                      {customDesignUploaded ? (
                        <CheckCircle size={20} color="#22c55e" />
                      ) : (
                        <Sparkles size={20} />
                      )}
                    </div>
                    <div className="campaign-modal-product-info">
                      <span className="product-name">
                        {campaign.custom_design_label || 'Custom Design Upload'}
                      </span>
                      <span className="product-note">
                        {customDesignUploaded ? 'Design uploaded!' : 'Upload your own design'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Custom Design Upload Section */}
            {hasCustomDesign && !customDesignUploaded && (
              <div style={{ marginTop: '20px', padding: '20px', background: '#f9fafb', borderRadius: '12px', border: '2px dashed #e5e7eb' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <Sparkles size={18} color="#1a1a1a" />
                  <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#1a1a1a' }}>
                    Upload Your Custom Design
                  </h4>
                </div>
                <div style={{ position: 'relative', cursor: 'pointer', minHeight: '120px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', border: '2px dashed #d1d5db', background: '#fff', padding: '20px' }}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
                  />
                  {previewUrl ? (
                    <img src={previewUrl} alt="Preview" style={{ maxHeight: '100px', borderRadius: '8px' }} />
                  ) : (
                    <>
                      <Upload size={32} color="#9ca3af" style={{ marginBottom: '8px' }} />
                      <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>Click to upload or drag and drop</p>
                      <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>PNG, JPG up to 5MB</p>
                    </>
                  )}
                </div>
                {selectedFile && (
                  <p style={{ fontSize: '13px', color: '#1a1a1a', marginTop: '8px', marginBottom: '12px' }}>
                    Selected: {selectedFile.name}
                  </p>
                )}
                <button
                  onClick={handleUpload}
                  disabled={!selectedFile || isUploading}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: selectedFile ? '#1a1a1a' : '#e5e7eb',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: selectedFile ? 'pointer' : 'not-allowed',
                    opacity: selectedFile ? 1 : 0.5
                  }}
                >
                  {isUploading ? 'Uploading...' : 'Continue with this Design'}
                </button>
              </div>
            )}

            <div className="campaign-modal-pricing">
              <div className="price-row original">
                <span>Original Total:</span>
                <span className="strikethrough">{formatPrice(campaign.original_total)}</span>
              </div>
              <div className="price-row combo">
                <span>Combo Price:</span>
                <span className="highlight">{formatPrice(campaign.combo_price)}</span>
              </div>
              <div className="price-row savings">
                <span>You Save:</span>
                <span className="savings-amount">{formatPrice(savings)} ({discountPercentage}%)</span>
              </div>
            </div>

            <div className="campaign-modal-actions">
              <button
                className="campaign-modal-add-cart"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  alert('Button clicked!');
                  handleAddToCart();
                }}
                disabled={hasCustomDesign && !customDesignUploaded}
                style={{
                  opacity: (hasCustomDesign && !customDesignUploaded) ? 0.5 : 1,
                  cursor: (hasCustomDesign && !customDesignUploaded) ? 'not-allowed' : 'pointer'
                }}
                type="button"
              >
                <ShoppingCart size={20} />
                {hasCustomDesign && !customDesignUploaded ? 'Upload Design First' : 'Add Combo to Cart'}
              </button>
              <Link
                to={`/campaign/${campaign.slug}`}
                className="campaign-modal-view-details"
                onClick={() => setShowModal(false)}
              >
                View Full Details
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
