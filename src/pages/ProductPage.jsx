import { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { Footer } from '../components/SubscribeFooter';
import { useCart } from '../CartContext';
import { useProduct } from '../hooks/useProducts';
import { useCampaign } from '../hooks/useCampaigns';
import { useCustomDesignApparelTypes, useApparelBasePrices, useApparelPrintPrices } from '../hooks/useAppSettings';
import { formatPrice } from '../lib/utils';
import ChatWidget from '../components/ChatWidget';
import { Star, Upload, CheckCircle, ArrowLeft, Sparkles, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../integrations/supabase/client';

export default function ProductPage() {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const campaignSlug = searchParams.get('campaign');
  const { data: product, isLoading, error } = useProduct(slug || '');
  const { data: campaign } = useCampaign(campaignSlug || '');
  const { data: apparelTypes = ['hoodie'] } = useCustomDesignApparelTypes();
  const { data: basePrices = { hoodie: 999, tshirt: 499 } } = useApparelBasePrices();
  const { data: printPrices = { single: 299, both: 598 } } = useApparelPrintPrices();
  const { addToCart } = useCart();
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedColor, setSelectedColor] = useState('');
  const [added, setAdded] = useState(false);
  const [activeTab, setActiveTab] = useState('info');
  
  // Custom design state for custom apparel
  const [apparelType, setApparelType] = useState('hoodie'); // 'hoodie' or 'tshirt'
  const [printLocation, setPrintLocation] = useState('front'); // 'front', 'back', 'both'
  const [frontImage, setFrontImage] = useState(null);
  const [frontPreview, setFrontPreview] = useState(null);
  const [backImage, setBackImage] = useState(null);
  const [backPreview, setBackPreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [customNotes, setCustomNotes] = useState(''); // User notes for design placement
  
  // Set default apparel type based on available types
  useEffect(() => {
    if (apparelTypes.length > 0 && !apparelTypes.includes(apparelType)) {
      setApparelType(apparelTypes[0]);
    }
  }, [apparelTypes, apparelType]);

  // Reset selected image when color changes and notify if no images
  useEffect(() => {
    setSelectedImage(0);
    if (selectedColor && displayProduct?.image_color_mappings?.length) {
      const hasImages = displayProduct.image_color_mappings.some(m => m.color === selectedColor && m.color !== '');
      if (!hasImages) {
        toast.info(`No images available for ${selectedColor}`);
      }
    }
  }, [selectedColor]);
  
  // Get cached product from localStorage
  const [cachedProduct, setCachedProduct] = useState(() => {
    if (typeof window !== 'undefined' && slug) {
      const saved = localStorage.getItem(`product_${slug}`);
      return saved ? JSON.parse(saved) : null;
    }
    return null;
  });

  // Save product to localStorage when loaded
  useEffect(() => {
    if (product && slug) {
      localStorage.setItem(`product_${slug}`, JSON.stringify(product));
      setCachedProduct(product);
    }
  }, [product, slug]);

  const displayProduct = product || cachedProduct;
  const isReallyLoading = isLoading && !displayProduct;

  // Helper function to get images filtered by selected color
  const getFilteredImages = () => {
    if (!displayProduct?.images) return [];
    
    // If no color selected or no mappings exist, show all images
    if (!selectedColor || !displayProduct.image_color_mappings?.length) {
      return displayProduct.images;
    }
    
    // Filter images that match the selected color (only those with a non-empty color assignment)
    const mappedImages = displayProduct.image_color_mappings
      .filter(m => m.color === selectedColor && m.color !== '')
      .map(m => m.image_url);
    
    // If no images match this color, return empty - don't fall back
    return mappedImages;
  };

  const filteredImages = getFilteredImages();

  if (isReallyLoading) {
    return (
      <div className="page-wrapper">
        <Header />
        <div className="w-layout-blockcontainer container w-container" style={{ padding: '100px 20px', textAlign: 'center' }}>
          <h2>Loading product...</h2>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-wrapper">
        <Header />
        <div className="w-layout-blockcontainer container w-container" style={{ padding: '100px 20px', textAlign: 'center' }}>
          <h2>Error loading product</h2>
          <p style={{ color: '#666', marginTop: 10 }}>{error.message}</p>
          <Link to="/shop" className="theme-button w-inline-block" style={{ display: 'inline-flex', marginTop: 20 }}>
            <div className="theme-btn-bg"></div>
            <div className="theme-btn-text-box">
              <div className="theme-btn-text">Browse Shop</div>
              <div className="theme-btn-hover-text">Browse Shop</div>
            </div>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  if (!displayProduct) {
    console.log('Product not found for slug:', slug);
    console.log('Error:', error);
    console.log('Loading:', isLoading);
    return (
      <div className="page-wrapper">
        <Header />
        <div className="w-layout-blockcontainer container w-container" style={{ padding: '100px 20px', textAlign: 'center' }}>
          <h2>Product not found</h2>
          <p style={{ color: '#666', marginTop: 10, fontSize: '14px' }}>
            Slug: <code>{slug}</code>
          </p>
          {error && (
            <p style={{ color: '#e74c3c', marginTop: 10, fontSize: '12px' }}>
              Error: {error.message}
            </p>
          )}
          <Link to="/shop" className="theme-button w-inline-block" style={{ display: 'inline-flex', marginTop: 20 }}>
            <div className="theme-btn-bg"></div>
            <div className="theme-btn-text-box">
              <div className="theme-btn-text">Browse Shop</div>
              <div className="theme-btn-hover-text">Browse Shop</div>
            </div>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart(displayProduct, selectedSize, 1, selectedColor || null);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = async () => {
    if (isCustomApparel) {
      if (printLocation === 'front' && !frontPreview) {
        toast.error('Please upload front design');
        return;
      }
      if (printLocation === 'back' && !backPreview) {
        toast.error('Please upload back design');
        return;
      }
      if (printLocation === 'both' && (!frontPreview || !backPreview)) {
        toast.error('Please upload both front and back designs');
        return;
      }
    }
    await handleAddToCartWithDesign();
    window.location.href = '/checkout';
  };

  const isCustomApparel = displayProduct?.slug === 'custom-design-apparel';

  const handleFrontImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    handleImageUpload(file, 'front');
  };

  const handleBackImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    handleImageUpload(file, 'back');
  };

  const handleImageUpload = async (file, type) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size should be less than 5MB');
      return;
    }
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    try {
      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}-${type}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('custom-designs')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('custom-designs')
        .getPublicUrl(fileName);

      if (type === 'front') {
        setFrontImage(file);
        setFrontPreview(publicUrl);
      } else {
        setBackImage(file);
        setBackPreview(publicUrl);
      }

      // Save to localStorage for the campaign
      if (campaignSlug) {
        const existing = JSON.parse(localStorage.getItem(`campaign_${campaignSlug}_design`) || '{}');
        localStorage.setItem(`campaign_${campaignSlug}_design`, JSON.stringify({
          ...existing,
          [`${type}Url`]: publicUrl,
          apparelType,
          printLocation,
          uploadedAt: new Date().toISOString(),
        }));
      }

      toast.success(`${type === 'front' ? 'Front' : 'Back'} design uploaded!`);
    } catch (error) {
      toast.error('Failed to upload design: ' + error.message);
      console.error('Upload error:', error);
    }
  };

  const fetchCampaignProductsAndAddToCart = (slug) => {
    if (!campaign || !campaign.campaign_products) return;

    const products = campaign.campaign_products || [];
    const regularProducts = products.filter(p => !p.is_custom_design_slot);

    // Add all regular campaign products to cart
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

    toast.success('Campaign products added to cart!');
  };

  const handleAddToCartWithDesign = async () => {
    // Validate based on print location
    if (isCustomApparel) {
      if (printLocation === 'front' && !frontPreview) {
        toast.error('Please upload front design');
        return;
      }
      if (printLocation === 'back' && !backPreview) {
        toast.error('Please upload back design');
        return;
      }
      if (printLocation === 'both' && (!frontPreview || !backPreview)) {
        toast.error('Please upload both front and back designs');
        return;
      }
    }

    // Calculate additional price for custom prints using dynamic pricing
    let additionalPrice = 0;
    if (printLocation === 'both') {
      additionalPrice = printPrices.both;
    } else if (printLocation === 'front' || printLocation === 'back') {
      additionalPrice = printPrices.single;
    }

    const cartItem = {
      ...displayProduct,
      id: displayProduct.id,
      name: `${displayProduct.name} (${apparelType === 'hoodie' ? 'Hoodie' : 'T-Shirt'})`,
      price: (displayProduct.discount_price || displayProduct.price) + additionalPrice,
      size: selectedSize,
      image: frontPreview || backPreview || displayProduct.images?.[0],
      quantity: 1,
      is_custom_design: isCustomApparel,
      custom_design_front: frontPreview,
      custom_design_back: backPreview,
      apparel_type: apparelType,
      print_location: printLocation,
      campaign_slug: campaignSlug,
      custom_notes: customNotes,
    };

    await addToCart(cartItem, selectedSize, 1, selectedColor || null);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);

    // If coming from campaign, also add campaign products to cart
    if (campaignSlug) {
      // Fetch campaign products and add them to cart
      fetchCampaignProductsAndAddToCart(campaignSlug);
    }
  };

  const displayPrice = displayProduct.discount_price || displayProduct.price;
  const originalPrice = displayProduct.discount_price ? displayProduct.price : null;

  return (
    <div className="page-wrapper">
      <Header />
      <section className="product-page-section" style={{ padding: '60px 0 80px', minHeight: '70vh' }}>
        <div className="w-layout-blockcontainer container w-container">
          <div className="product-page-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'start' }}>
            {/* Image Gallery */}
            <div className="product-gallery-col" style={{ position: 'relative' }}>
              <Link 
                to="/shop" 
                className="product-back-link"
                style={{ 
                  position: 'absolute',
                  top: 12,
                  left: 12,
                  zIndex: 10,
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: '6px', 
                  color: '#fff', 
                  fontSize: 13, 
                  textDecoration: 'none',
                  fontFamily: 'Poppins, sans-serif',
                  background: 'rgba(0, 0, 0, 0.6)',
                  padding: '8px 12px',
                  borderRadius: 6,
                  backdropFilter: 'blur(4px)'
                }}
              >
                ← Go back to shop
              </Link>
              <div className="product-main-image" style={{ background: '#f5f5f5', borderRadius: 8, overflow: 'hidden', marginBottom: 16, aspectRatio: '3/4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {filteredImages.length > 0 ? (
                  <img
                    src={filteredImages[selectedImage] || filteredImages[0]}
                    alt={displayProduct.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'opacity 0.3s ease' }}
                  />
                ) : selectedColor && displayProduct.image_color_mappings?.length > 0 ? (
                  <div style={{ textAlign: 'center', color: '#999', padding: 20 }}>
                    <ImageIcon size={48} style={{ marginBottom: 12, opacity: 0.4 }} />
                    <p style={{ fontSize: 14, margin: 0 }}>No images available</p>
                    <p style={{ fontSize: 12, margin: '4px 0 0', color: '#bbb' }}>for {selectedColor}</p>
                  </div>
                ) : (
                  <img
                    src={displayProduct.images?.[0] || '/images/placeholder.jpg'}
                    alt={displayProduct.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'opacity 0.3s ease' }}
                  />
                )}
              </div>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                {filteredImages.length > 0 && filteredImages.map((img, i) => (
                  <div
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    style={{
                      width: 80, height: 80, borderRadius: 6, overflow: 'hidden', cursor: 'pointer',
                      border: i === selectedImage ? '2px solid #000' : '2px solid transparent',
                      transition: 'border 0.2s ease'
                    }}
                  >
                    <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ))}
              </div>
            </div>

            {/* Product Info */}
            <div>
              <div className="breadcrumb-link-block" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: 8, fontFamily: 'Poppins, sans-serif' }}>
                <Link to="/" style={{ color: '#999', textDecoration: 'none', fontSize: 14 }}>Home</Link>
                <span style={{ color: '#999' }}>/</span>
                <span style={{ color: '#999', fontSize: 14 }}>{displayProduct.name}</span>
              </div>
              {displayProduct.badge && (
                <div style={{ display: 'inline-block', background: '#000', color: '#fff', padding: '2px 10px', fontSize: 11, fontWeight: 600, borderRadius: 3, marginBottom: 16, fontFamily: 'Poppins, sans-serif', textTransform: 'uppercase' }}>
                  {displayProduct.badge}
                </div>
              )}
              <h1 className="product-page-title" style={{ fontFamily: '"Big Shoulders", sans-serif', fontSize: 48, fontWeight: 800, textTransform: 'uppercase', margin: '0 0 16px' }}>
                {displayProduct.name}
              </h1>
              
              {/* Rating */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <div style={{ display: 'flex', gap: 2 }}>
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} fill={i < Math.floor(displayProduct.rating) ? '#000' : 'none'} stroke="#000" />
                  ))}
                </div>
                <span style={{ fontSize: 14, color: '#666' }}>({displayProduct.review_count} reviews)</span>
              </div>

              <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 28 }}>
                <span style={{ fontFamily: '"Big Shoulders", sans-serif', fontSize: 36, fontWeight: 700 }}>{formatPrice(displayPrice)}</span>
                {originalPrice && (
                  <span style={{ fontFamily: '"Big Shoulders", sans-serif', fontSize: 24, fontWeight: 500, textDecoration: 'line-through', color: '#999' }}>
                    {formatPrice(originalPrice)}
                  </span>
                )}
              </div>
              
              <p style={{ fontFamily: 'Poppins, sans-serif', color: '#555', lineHeight: 1.7, marginBottom: 28 }}>
                {displayProduct.description}
              </p>

              {/* Campaign Back Link */}
              {campaignSlug && (
                <Link 
                  to={`/campaign/${campaignSlug}`}
                  style={{ 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    gap: '8px', 
                    marginBottom: '24px',
                    color: '#666',
                    fontSize: '14px'
                  }}
                >
                  <ArrowLeft size={16} />
                  Back to Combo Deal
                </Link>
              )}

              {/* Custom Design Upload for Custom Apparel */}
              {isCustomApparel && (
                <div style={{ 
                  background: '#fff', 
                  borderRadius: '16px', 
                  padding: '24px',
                  marginBottom: '24px',
                  border: '2px dashed #1a1a1a'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                    <Sparkles size={24} color="#1a1a1a" />
                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: '#1a1a1a' }}>
                      Customize Your Apparel
                    </h3>
                  </div>
                  
                  {/* Apparel Type Selection */}
                  <div style={{ marginBottom: '20px' }}>
                    <p style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px', color: '#1a1a1a' }}>
                      Choose Apparel Type:
                    </p>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      {apparelTypes.map((type) => {
                        const price = basePrices[type] || (type === 'hoodie' ? 999 : 499);
                        return (
                          <button
                            key={type}
                            onClick={() => setApparelType(type)}
                            style={{
                              flex: 1,
                              padding: '12px 16px',
                              border: apparelType === type ? '2px solid #1a1a1a' : '2px solid #d1d5db',
                              background: apparelType === type ? '#f3f4f6' : '#fff',
                              borderRadius: '10px',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease'
                            }}
                          >
                            <div style={{ fontWeight: 600, color: apparelType === type ? '#1a1a1a' : '#374151' }}>
                              {type === 'hoodie' ? 'Hoodie' : 'T-Shirt'}
                            </div>
                            <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                              ₹{price}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Print Location Selection */}
                  <div style={{ marginBottom: '20px' }}>
                    <p style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px', color: '#1a1a1a' }}>
                      Print Location: (+₹{printPrices.single} per location)
                    </p>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {[
                        { value: 'front', label: 'Front Only' },
                        { value: 'back', label: 'Back Only' },
                        { value: 'both', label: 'Front + Back' }
                      ].map((loc) => (
                        <button
                          key={loc.value}
                          onClick={() => setPrintLocation(loc.value)}
                          style={{
                            padding: '10px 16px',
                            border: printLocation === loc.value ? '2px solid #1a1a1a' : '2px solid #d1d5db',
                            background: printLocation === loc.value ? '#f3f4f6' : '#fff',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '13px',
                            fontWeight: 500,
                            color: printLocation === loc.value ? '#1a1a1a' : '#374151',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          {loc.label}
                          {loc.value === 'both' && <span style={{ marginLeft: '4px', color: '#6b7280' }}>(+₹{printPrices.both})</span>}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Image Uploads */}
                  {(printLocation === 'front' || printLocation === 'both') && (
                    <div style={{ marginBottom: '16px' }}>
                      <p style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px', color: '#1a1a1a' }}>
                        Front Design:
                      </p>
                      <div style={{ 
                        position: 'relative',
                        border: frontPreview ? '2px solid #22c55e' : '2px dashed #9ca3af',
                        borderRadius: '12px',
                        padding: '16px',
                        textAlign: 'center',
                        background: '#fff',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFrontImageUpload}
                          style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
                        />
                        {frontPreview ? (
                          <div style={{ position: 'relative', display: 'inline-block' }}>
                            <img src={frontPreview} alt="Front Design" style={{ maxHeight: '150px', borderRadius: '8px' }} />
                            <div style={{ position: 'absolute', top: '-8px', right: '-8px', width: '24px', height: '24px', background: '#22c55e', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <CheckCircle size={14} color="#fff" />
                            </div>
                          </div>
                        ) : (
                          <>
                            <Upload size={32} color="#9ca3af" style={{ marginBottom: '8px' }} />
                            <p style={{ fontSize: '13px', color: '#6b7280' }}>Click to upload front design</p>
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  {(printLocation === 'back' || printLocation === 'both') && (
                    <div style={{ marginBottom: '16px' }}>
                      <p style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px', color: '#1a1a1a' }}>
                        Back Design:
                      </p>
                      <div style={{ 
                        position: 'relative',
                        border: backPreview ? '2px solid #22c55e' : '2px dashed #9ca3af',
                        borderRadius: '12px',
                        padding: '16px',
                        textAlign: 'center',
                        background: '#fff',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleBackImageUpload}
                          style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
                        />
                        {backPreview ? (
                          <div style={{ position: 'relative', display: 'inline-block' }}>
                            <img src={backPreview} alt="Back Design" style={{ maxHeight: '150px', borderRadius: '8px' }} />
                            <div style={{ position: 'absolute', top: '-8px', right: '-8px', width: '24px', height: '24px', background: '#22c55e', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <CheckCircle size={14} color="#fff" />
                            </div>
                          </div>
                        ) : (
                          <>
                            <Upload size={32} color="#9ca3af" style={{ marginBottom: '8px' }} />
                            <p style={{ fontSize: '13px', color: '#6b7280' }}>Click to upload back design</p>
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Custom Notes Section */}
                  <div style={{ marginTop: '20px' }}>
                    <p style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px', color: '#1a1a1a' }}>
                      Design Instructions (Optional):
                    </p>
                    <textarea
                      value={customNotes}
                      onChange={(e) => setCustomNotes(e.target.value)}
                      placeholder="Describe how you want your design placed (e.g., 'Place design in center, 2 inches from top')"
                      style={{
                        width: '100%',
                        minHeight: '80px',
                        padding: '12px',
                        border: '2px solid #d1d5db',
                        borderRadius: '10px',
                        fontSize: '14px',
                        fontFamily: 'inherit',
                        resize: 'vertical',
                        transition: 'border-color 0.2s'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#1a1a1a'}
                      onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                    />
                  </div>

                  {/* Price Summary */}
                  <div style={{
                    background: '#f9fafb',
                    padding: '16px',
                    borderRadius: '12px',
                    marginTop: '16px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ color: '#6b7280' }}>Base Price ({apparelType === 'hoodie' ? 'Hoodie' : 'T-Shirt'}):</span>
                      <span>₹{basePrices[apparelType] || (apparelType === 'hoodie' ? 999 : 499)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ color: '#6b7280' }}>Print Cost:</span>
                      <span>₹{printLocation === 'both' ? printPrices.both : (printLocation === 'front' || printLocation === 'back') ? printPrices.single : 0}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, fontSize: '16px', borderTop: '1px solid #e5e7eb', paddingTop: '8px' }}>
                      <span>Total:</span>
                      <span>₹{(basePrices[apparelType] || (apparelType === 'hoodie' ? 999 : 499)) + (printLocation === 'both' ? printPrices.both : (printLocation === 'front' || printLocation === 'back') ? printPrices.single : 0)}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Color Selector */}
              {displayProduct.colors && displayProduct.colors.length > 0 && (
                <div style={{ marginBottom: 24 }}>
                  <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, marginBottom: 12, fontSize: 14 }}>
                    COLOR: {selectedColor || displayProduct.colors[0]}
                  </p>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {displayProduct.colors.map(color => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        style={{
                          width: 32, height: 32, borderRadius: '50%', 
                          background: color.toLowerCase() === 'white' ? '#fff' : color.toLowerCase() === 'black' ? '#000' : '#666',
                          border: selectedColor === color ? '3px solid #000' : '1px solid #ddd',
                          cursor: 'pointer',
                          boxShadow: selectedColor === color ? '0 0 0 2px #fff inset' : 'none'
                        }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Size Selector */}
              <div style={{ marginBottom: 32 }}>
                <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, marginBottom: 12, fontSize: 14 }}>SIZE: {selectedSize}</p>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {displayProduct.sizes?.map(size => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      style={{
                        padding: '8px 16px', border: selectedSize === size ? '2px solid #000' : '1px solid #ddd',
                        background: selectedSize === size ? '#000' : '#fff',
                        color: selectedSize === size ? '#fff' : '#000',
                        cursor: 'pointer', fontFamily: 'Poppins, sans-serif', fontSize: 13, fontWeight: 500,
                        borderRadius: 4, transition: 'all 0.2s ease'
                      }}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Out of Stock Warning */}
              {displayProduct.stock === 0 && (
                <div style={{ color: '#e74c3c', marginBottom: 16, fontWeight: 600 }}>
                  ⚠ Out of stock
                </div>
              )}

              {/* Action Buttons */}
              <div className="product-actions product-page-actions">
                <button
                  onClick={handleBuyNow}
                  disabled={displayProduct.stock === 0 || (isCustomApparel && !frontPreview && !backPreview)}
                  className="product-btn buy-now"
                  style={{ 
                    opacity: (displayProduct.stock === 0 || (isCustomApparel && !frontPreview && !backPreview)) ? 0.5 : 1, 
                    cursor: (displayProduct.stock === 0 || (isCustomApparel && !frontPreview && !backPreview)) ? 'not-allowed' : 'pointer' 
                  }}
                >
                  {isCustomApparel && !frontPreview && !backPreview ? 'Upload Design First' : 'Buy Now'}
                </button>

                <button
                  onClick={handleAddToCartWithDesign}
                  disabled={displayProduct.stock === 0 || (isCustomApparel && !frontPreview && !backPreview)}
                  className={`product-btn add-to-cart ${added ? 'added' : ''}`}
                  style={{ 
                    opacity: (displayProduct.stock === 0 || (isCustomApparel && !frontPreview && !backPreview)) ? 0.5 : 1, 
                    cursor: (displayProduct.stock === 0 || (isCustomApparel && !frontPreview && !backPreview)) ? 'not-allowed' : 'pointer' 
                  }}
                >
                  {added ? 'Added ✓' : isCustomApparel && !frontPreview && !backPreview ? 'Upload Design to Add' : 'Add to Cart'}
                </button>
              </div>

              <div style={{ marginTop: 40, padding: 24, background: '#f9f9f9', borderRadius: 8 }}>
                <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: 13, color: '#777', margin: 0, lineHeight: 2 }}>
                  ✓ Free shipping on orders over ₹1500<br />
                  ✓ 30-day hassle-free returns<br />
                  ✓ 100% secure checkout
                </p>
              </div>
            </div>
          </div>

          {/* Product Tabs */}
          <div style={{ marginTop: 60 }}>
            <div style={{ display: 'flex', gap: 32, borderBottom: '1px solid #eee', marginBottom: 24 }}>
              {['info', 'description', 'reviews'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    padding: '12px 0',
                    border: 'none',
                    background: 'none',
                    fontFamily: 'Poppins, sans-serif',
                    fontSize: 14,
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    borderBottom: activeTab === tab ? '2px solid #000' : '2px solid transparent',
                    color: activeTab === tab ? '#000' : '#999'
                  }}
                >
                  {tab === 'info' ? 'Product Info' : tab === 'description' ? 'Description' : 'Reviews'}
                </button>
              ))}
            </div>

            {activeTab === 'info' && (
              <div>
                <h3 style={{ fontFamily: '"Big Shoulders", sans-serif', marginBottom: 16 }}>Product Specifications</h3>
                <table style={{ width: '100%', maxWidth: 500, fontFamily: 'Poppins, sans-serif', fontSize: 14 }}>
                  <tbody>
                    {Object.entries(displayProduct.specs || {}).map(([key, value]) => value && (
                      <tr key={key} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '12px 0', color: '#666', textTransform: 'capitalize' }}>{key.replace(/_/g, ' ')}</td>
                        <td style={{ padding: '12px 0', fontWeight: 500 }}>{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'description' && (
              <div>
                <h3 style={{ fontFamily: '"Big Shoulders", sans-serif', marginBottom: 16 }}>Description</h3>
                <p style={{ fontFamily: 'Poppins, sans-serif', lineHeight: 1.8, color: '#555' }}>
                  {displayProduct.long_description || displayProduct.description}
                </p>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div>
                <h3 style={{ fontFamily: '"Big Shoulders", sans-serif', marginBottom: 16 }}>Reviews</h3>
                <p style={{ fontFamily: 'Poppins, sans-serif', color: '#666' }}>
                  No reviews yet. Be the first to review this product!
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
      <Footer />
      <ChatWidget />
    </div>
  );
}
