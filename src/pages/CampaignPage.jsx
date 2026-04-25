import { useParams, Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ArrowLeft, ShoppingCart, Package, Upload, Sparkles, CheckCircle, Clock } from 'lucide-react';
import { useCampaign } from '../hooks/useCampaigns';
import { useCart } from '../CartContext';
import { useCustomDesignApparelTypes } from '../hooks/useAppSettings';
import Header from '../components/Header';
import { formatPrice } from '../lib/utils';
import { toast } from 'sonner';

export default function CampaignPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { data: campaign, isLoading } = useCampaign(slug);
  const { data: apparelTypes = ['hoodie'] } = useCustomDesignApparelTypes();
  const { addToCart } = useCart();
  const [customDesign, setCustomDesign] = useState(null);
  const [customDesignUploaded, setCustomDesignUploaded] = useState(false);
  const [apparelType, setApparelType] = useState('hoodie');

  // Set default apparel type based on available types
  useEffect(() => {
    if (apparelTypes.length > 0 && !apparelTypes.includes(apparelType)) {
      setApparelType(apparelTypes[0]);
    }
  }, [apparelTypes, apparelType]);

  // Load custom design from localStorage on mount
  useEffect(() => {
    const savedDesign = localStorage.getItem(`campaign_${campaign?.id}_design`);
    if (savedDesign) {
      setCustomDesign(JSON.parse(savedDesign));
      setCustomDesignUploaded(true);
    }
  }, [campaign?.id]);

  if (isLoading) {
    return (
      <div className="page-wrapper">
        <Header />
        <div className="loading" style={{ padding: '100px 0', textAlign: 'center' }}>
          Loading campaign...
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="page-wrapper">
        <Header />
        <div className="container" style={{ padding: '100px 0', textAlign: 'center' }}>
          <h2>Campaign not found</h2>
          <Link to="/" className="theme-button" style={{ marginTop: '20px', display: 'inline-flex' }}>
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  const products = campaign.campaign_products || [];
  const regularProducts = products.filter(p => !p.is_custom_design_slot);
  const hasCustomDesign = products.some(p => p.is_custom_design_slot);
  
  const savings = campaign.original_total - campaign.combo_price;
  const discountPercentage = Math.round((savings / campaign.original_total) * 100);
  
  // Calculate days remaining
  const endDate = new Date(campaign.ends_at);
  const now = new Date();
  const daysRemaining = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));

  // Get campaign image or first product image
  const displayImage = campaign.image_url || regularProducts[0]?.product?.images?.[0] || '/images/hoodie-placeholder.png';

  const handleGoToCustomDesign = () => {
    // Navigate to custom design apparel product page with campaign context
    navigate(`/product/custom-design-apparel?campaign=${campaign.slug}`);
  };

  const handleAddToCart = () => {
    if (hasCustomDesign && !customDesignUploaded) {
      toast.error('Please upload your custom design first');
      return;
    }

    // Add all regular products to cart
    regularProducts.forEach(cp => {
      if (cp.product) {
        addToCart({
          id: cp.product.id,
          name: cp.product.name,
          price: cp.product.discount_price || cp.product.price,
          size: 'M',
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
        custom_design_front: customDesign?.imageUrl,
        custom_design_back: null,
        apparel_type: apparelType,
        print_location: 'front',
      });
    }

    toast.success(`${campaign.name} added to cart!`);
    navigate('/shop');
  };

  return (
    <div className="page-wrapper">
      <Header />
      <section className="campaign-detail-section">
        <div className="container">
          <Link to="/" className="back-link" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '24px', color: '#666' }}>
            <ArrowLeft size={18} />
            Back to Home
          </Link>

          <div className="campaign-detail-grid">
            <div className="campaign-detail-image">
              <img src={displayImage} alt={campaign.name} />
            </div>

            <div className="campaign-detail-info">
              {campaign.badge && (
                <span className="campaign-detail-badge">{campaign.badge}</span>
              )}
              
              <h1 className="campaign-detail-title">{campaign.name}</h1>
              <p className="campaign-detail-description">{campaign.description}</p>

              <div className="campaign-detail-products">
                <h3>What's Included</h3>
                {regularProducts.map((cp) => (
                  <div key={cp.id} className="campaign-detail-product-item">
                    {cp.product?.images?.[0] ? (
                      <img src={cp.product.images[0]} alt={cp.product.name} />
                    ) : (
                      <div className="campaign-detail-product-placeholder">
                        <Package size={24} />
                      </div>
                    )}
                    <div className="campaign-detail-product-info">
                      <div className="name">{cp.product?.name}</div>
                      <div className="qty">Quantity: {cp.min_quantity || 1}</div>
                    </div>
                  </div>
                ))}
                
                {hasCustomDesign && (
                  <div className="campaign-detail-product-item custom-design">
                    {customDesignUploaded ? (
                      <img src={customDesign?.previewUrl} alt="Custom Design" style={{ objectFit: 'cover' }} />
                    ) : (
                      <div className="campaign-detail-product-placeholder custom">
                        <Sparkles size={24} />
                      </div>
                    )}
                    <div className="campaign-detail-product-info">
                      <div className="name">{campaign.custom_design_label || 'Custom Hoodie'}</div>
                      <div className="qty">
                        {customDesignUploaded ? (
                          <span style={{ color: '#22c55e', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <CheckCircle size={14} /> Design uploaded
                          </span>
                        ) : (
                          <span style={{ color: '#ef4444' }}>Design required - click below to upload</span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="campaign-detail-pricing">
                <div className="price-row">
                  <span>Original Total</span>
                  <span className="original">{formatPrice(campaign.original_total)}</span>
                </div>
                <div className="price-row">
                  <span>Combo Price</span>
                  <span className="combo">{formatPrice(campaign.combo_price)}</span>
                </div>
                <div className="price-row">
                  <span>You Save</span>
                  <span className="savings">{formatPrice(savings)} ({discountPercentage}%)</span>
                </div>
              </div>

              {daysRemaining > 0 && daysRemaining <= 7 && (
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  color: '#f59e0b', 
                  fontSize: '14px',
                  fontWeight: 500
                }}>
                  <Clock size={16} />
                  Limited time: Ends in {daysRemaining} days
                </div>
              )}

              <div className="campaign-detail-actions">
                {hasCustomDesign && !customDesignUploaded && (
                  <button 
                    className="campaign-detail-add-cart"
                    onClick={handleGoToCustomDesign}
                    // style={{ background: '#fdfdfd' }}
                  >
                    <Upload size={20} />
                    Upload Your Custom Design
                  </button>
                )}
                
                {/* <button 
                  className="campaign-detail-add-cart"
                  onClick={handleAddToCart}
                  disabled={hasCustomDesign && !customDesignUploaded}
                >
                  <ShoppingCart size={20} />
                  {hasCustomDesign && !customDesignUploaded 
                    ? 'Upload Design to Continue' 
                    : 'Add Combo to Cart'
                  }
                </button> */}
                
                <Link to="/shop" className="theme-button secondary">
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// Custom Design Page for uploading design
export function CustomDesignPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { data: campaign, isLoading } = useCampaign(slug);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size should be less than 5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !campaign) return;

    setIsUploading(true);
    
    // Simulate upload - in production, upload to Supabase storage
    setTimeout(() => {
      const mockImageUrl = previewUrl; // In production, this would be the uploaded URL
      
      // Save to localStorage
      localStorage.setItem(`campaign_${campaign.id}_design`, JSON.stringify({
        imageUrl: mockImageUrl,
        previewUrl: mockImageUrl,
        uploadedAt: new Date().toISOString(),
      }));
      
      toast.success('Custom design uploaded successfully!');
      navigate(`/campaign/${campaign.slug}`);
    }, 1500);
  };

  if (isLoading) {
    return (
      <div className="page-wrapper">
        <Header />
        <div className="loading" style={{ padding: '100px 0', textAlign: 'center' }}>
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <Header />
      <section style={{ padding: '80px 0', minHeight: '80vh' }}>
        <div className="container" style={{ maxWidth: '600px' }}>
          <Link 
            to={campaign ? `/campaign/${campaign.slug}` : '/'} 
            className="back-link" 
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '24px', color: '#666' }}
          >
            <ArrowLeft size={18} />
            Back to Campaign
          </Link>

          <div className="custom-design-card" style={{ borderColor: '#121212' }}>
            <h1>Upload Your Custom Design</h1>
            <p>{campaign?.custom_design_label || 'Create your unique hoodie design'}</p>

            <div className="upload-area" style={{ borderColor: '#121212' }}>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="file-input"
              />
              
              {previewUrl ? (
                <img src={previewUrl} alt="Preview" className="preview-image" />
              ) : (
                <>
                  <Upload size={48} className="upload-icon" style={{ color: '#121212' }} />
                  <p className="upload-text">Click to upload or drag and drop</p>
                  <p className="upload-hint">PNG, JPG up to 5MB</p>
                </>
              )}
            </div>

            {selectedFile && (
              <p className="selected-file">Selected: {selectedFile.name}</p>
            )}

            <button
              onClick={handleUpload}
              disabled={!selectedFile || isUploading}
              className="upload-button"
              style={{ background: selectedFile ? '#121212' : undefined }}
            >
              {isUploading ? 'Uploading...' : 'Continue with this Design'}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
