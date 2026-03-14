import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Header from '../../components/Header';
import { Footer } from '../../components/SubscribeFooter';
import { useProduct } from '../../hooks/useProducts';
import { ArrowLeft, Plus, X, Save, Trash2, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { formatPrice } from '../../lib/utils';

const SIZES = ['S', 'M', 'L', 'XL', 'XXL'];
const CATEGORIES = ['man', 'woman'];
const BADGES = ['sale', 'drop', 'new'];
const COLORS = ['Black', 'White', 'Gray', 'Navy', 'Red', 'Blue', 'Green', 'Beige', 'Brown', 'Pink'];

export default function AdminProductEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: product, isLoading } = useProduct(id || '');
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    long_description: '',
    price: 0,
    discount_price: null as number | null,
    stock: 0,
    category: 'man',
    badge: null as string | null,
    images: [] as string[],
    sizes: [] as string[],
    colors: [] as string[],
    specs: {
      fabric_type: '',
      fit_style: '',
      neckline: '',
      sleeve_length: '',
      pattern: '',
      finish: '',
      care_instructions: '',
    },
    rating: 0,
    review_count: 0,
    is_featured: false,
    is_spotlight: false,
    is_active: true,
  });

  // Load product data into form
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        slug: product.slug || '',
        description: product.description || '',
        long_description: product.long_description || '',
        price: product.price || 0,
        discount_price: product.discount_price,
        stock: product.stock || 0,
        category: product.category || 'man',
        badge: product.badge,
        images: product.images || [],
        sizes: product.sizes || [],
        colors: product.colors || [],
        specs: {
          fabric_type: product.specs?.fabric_type || '',
          fit_style: product.specs?.fit_style || '',
          neckline: product.specs?.neckline || '',
          sleeve_length: product.specs?.sleeve_length || '',
          pattern: product.specs?.pattern || '',
          finish: product.specs?.finish || '',
          care_instructions: product.specs?.care_instructions || '',
        },
        rating: product.rating || 0,
        review_count: product.review_count || 0,
        is_featured: product.is_featured || false,
        is_spotlight: product.is_spotlight || false,
        is_active: product.is_active ?? true,
      });
    }
  }, [product]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSpecChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      specs: { ...prev.specs, [field]: value }
    }));
  };

  const handleImageAdd = () => {
    const url = prompt('Enter image URL:');
    if (url && url.trim()) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, url.trim()]
      }));
    }
  };

  const handleImageRemove = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const toggleSize = (size: string) => {
    setFormData(prev => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter(s => s !== size)
        : [...prev.sizes, size]
    }));
  };

  const toggleColor = (color: string) => {
    setFormData(prev => ({
      ...prev,
      colors: prev.colors.includes(color)
        ? prev.colors.filter(c => c !== color)
        : [...prev.colors, color]
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // TODO: Implement actual save API call
      // const { error } = await supabase.from('products').update(formData).eq('id', id);
      // if (error) throw error;
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Product saved successfully');
      navigate('/admin/products');
    } catch (error) {
      toast.error('Failed to save product');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) return;
    
    try {
      // TODO: Implement actual delete API call
      toast.success('Product deleted successfully');
      navigate('/admin/products');
    } catch (error) {
      toast.error('Failed to delete product');
    }
  };

  if (isLoading) {
    return (
      <div className="page-wrapper">
        <Header />
        <div className="section _100px">
          <div className="container">
            <div className="loading">Loading product...</div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const displayPrice = formData.discount_price || formData.price;
  const originalPrice = formData.discount_price ? formData.price : null;

  return (
    <div className="page-wrapper">
      <Header />
      
      <div className="section _100px">
        <div className="container">
          {/* Header */}
          <div className="admin-header">
            <Link to="/admin/products" className="back-link">
              <ArrowLeft size={18} />
              Back to Products
            </Link>
            <h1>Edit Product</h1>
            <div style={{ display: 'flex', gap: 12 }}>
              <button 
                className="icon-btn delete"
                onClick={handleDelete}
                title="Delete Product"
              >
                <Trash2 size={18} />
              </button>
              <button 
                className="primary-button"
                onClick={handleSave}
                disabled={isSaving}
              >
                <Save size={18} />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: 40, alignItems: 'start' }}>
            {/* Left Column - Form */}
            <div className="admin-section">
              {/* Basic Info */}
              <div className="coupon-form">
                <h3>Basic Information</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label>Product Name *</label>
                    <input 
                      type="text" 
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Enter product name"
                    />
                  </div>
                  <div className="form-group">
                    <label>Slug *</label>
                    <input 
                      type="text" 
                      value={formData.slug}
                      onChange={(e) => handleInputChange('slug', e.target.value)}
                      placeholder="product-url-slug"
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginTop: 16 }}>
                  <label>Short Description</label>
                  <input 
                    type="text" 
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Brief product description"
                  />
                </div>

                <div className="form-group" style={{ marginTop: 16 }}>
                  <label>Long Description</label>
                  <textarea 
                    value={formData.long_description}
                    onChange={(e) => handleInputChange('long_description', e.target.value)}
                    placeholder="Detailed product description"
                    rows={4}
                  />
                </div>
              </div>

              {/* Pricing */}
              <div className="coupon-form">
                <h3>Pricing & Stock</h3>
                <div className="form-row three-col">
                  <div className="form-group">
                    <label>Price (₹) *</label>
                    <input 
                      type="number" 
                      value={formData.price}
                      onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                      placeholder="0"
                    />
                  </div>
                  <div className="form-group">
                    <label>Discount Price (₹)</label>
                    <input 
                      type="number" 
                      value={formData.discount_price || ''}
                      onChange={(e) => handleInputChange('discount_price', e.target.value ? parseFloat(e.target.value) : null)}
                      placeholder="Optional"
                    />
                  </div>
                  <div className="form-group">
                    <label>Stock *</label>
                    <input 
                      type="number" 
                      value={formData.stock}
                      onChange={(e) => handleInputChange('stock', parseInt(e.target.value) || 0)}
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>

              {/* Category & Badge */}
              <div className="coupon-form">
                <h3>Category & Badge</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label>Category *</label>
                    <select 
                      value={formData.category}
                      onChange={(e) => handleInputChange('category', e.target.value)}
                    >
                      {CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Badge</label>
                    <select 
                      value={formData.badge || ''}
                      onChange={(e) => handleInputChange('badge', e.target.value || null)}
                    >
                      <option value="">None</option>
                      {BADGES.map(badge => (
                        <option key={badge} value={badge}>{badge.charAt(0).toUpperCase() + badge.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Images */}
              <div className="coupon-form">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <h3>Product Images</h3>
                  <button 
                    type="button"
                    className="apply-coupon-btn"
                    onClick={handleImageAdd}
                  >
                    <Plus size={16} />
                    Add Image
                  </button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                  {formData.images.map((img, index) => (
                    <div key={index} style={{ position: 'relative', aspectRatio: '1', borderRadius: 8, overflow: 'hidden', border: '2px solid #e5e5e5' }}>
                      <img src={img} alt={`Product ${index + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <button 
                        onClick={() => handleImageRemove(index)}
                        style={{ 
                          position: 'absolute', 
                          top: 4, 
                          right: 4, 
                          width: 28, 
                          height: 28, 
                          borderRadius: '50%', 
                          background: '#ef4444', 
                          color: '#fff', 
                          border: 'none', 
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                  {formData.images.length === 0 && (
                    <div style={{ 
                      aspectRatio: '1', 
                      borderRadius: 8, 
                      border: '2px dashed #e5e5e5', 
                      display: 'flex', 
                      flexDirection: 'column',
                      alignItems: 'center', 
                      justifyContent: 'center',
                      color: '#999'
                    }}>
                      <ImageIcon size={32} />
                      <span style={{ fontSize: 12, marginTop: 8 }}>No images</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Sizes */}
              <div className="coupon-form">
                <h3>Available Sizes</h3>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  {SIZES.map(size => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => toggleSize(size)}
                      style={{
                        padding: '12px 24px',
                        borderRadius: 8,
                        border: formData.sizes.includes(size) ? '2px solid #121212' : '2px solid #e5e5e5',
                        background: formData.sizes.includes(size) ? '#121212' : '#fff',
                        color: formData.sizes.includes(size) ? '#fff' : '#121212',
                        cursor: 'pointer',
                        fontWeight: 600,
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Colors */}
              <div className="coupon-form">
                <h3>Available Colors</h3>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  {COLORS.map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => toggleColor(color)}
                      style={{
                        padding: '8px 16px',
                        borderRadius: 20,
                        border: formData.colors.includes(color) ? '2px solid #121212' : '2px solid #e5e5e5',
                        background: formData.colors.includes(color) ? '#121212' : '#fff',
                        color: formData.colors.includes(color) ? '#fff' : '#121212',
                        cursor: 'pointer',
                        fontWeight: 500,
                        fontSize: 14,
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>

              {/* Specifications */}
              <div className="coupon-form">
                <h3>Product Specifications</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label>Fabric Type</label>
                    <input 
                      type="text" 
                      value={formData.specs.fabric_type}
                      onChange={(e) => handleSpecChange('fabric_type', e.target.value)}
                      placeholder="e.g., Cotton, Polyester"
                    />
                  </div>
                  <div className="form-group">
                    <label>Fit Style</label>
                    <input 
                      type="text" 
                      value={formData.specs.fit_style}
                      onChange={(e) => handleSpecChange('fit_style', e.target.value)}
                      placeholder="e.g., Regular, Slim"
                    />
                  </div>
                </div>
                <div className="form-row" style={{ marginTop: 16 }}>
                  <div className="form-group">
                    <label>Neckline</label>
                    <input 
                      type="text" 
                      value={formData.specs.neckline}
                      onChange={(e) => handleSpecChange('neckline', e.target.value)}
                      placeholder="e.g., Round Neck, V-Neck"
                    />
                  </div>
                  <div className="form-group">
                    <label>Sleeve Length</label>
                    <input 
                      type="text" 
                      value={formData.specs.sleeve_length}
                      onChange={(e) => handleSpecChange('sleeve_length', e.target.value)}
                      placeholder="e.g., Full Sleeve, Half Sleeve"
                    />
                  </div>
                </div>
                <div className="form-row" style={{ marginTop: 16 }}>
                  <div className="form-group">
                    <label>Pattern</label>
                    <input 
                      type="text" 
                      value={formData.specs.pattern}
                      onChange={(e) => handleSpecChange('pattern', e.target.value)}
                      placeholder="e.g., Solid, Striped"
                    />
                  </div>
                  <div className="form-group">
                    <label>Finish</label>
                    <input 
                      type="text" 
                      value={formData.specs.finish}
                      onChange={(e) => handleSpecChange('finish', e.target.value)}
                      placeholder="e.g., Soft, Matte"
                    />
                  </div>
                </div>
                <div className="form-group" style={{ marginTop: 16 }}>
                  <label>Care Instructions</label>
                  <textarea 
                    value={formData.specs.care_instructions}
                    onChange={(e) => handleSpecChange('care_instructions', e.target.value)}
                    placeholder="Washing and care instructions"
                    rows={3}
                  />
                </div>
              </div>

              {/* Settings */}
              <div className="coupon-form">
                <h3>Product Settings</h3>
                <div className="form-row three-col">
                  <label className="form-group checkbox" style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
                    <input 
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => handleInputChange('is_active', e.target.checked)}
                    />
                    <span>Active</span>
                  </label>
                  <label className="form-group checkbox" style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
                    <input 
                      type="checkbox"
                      checked={formData.is_featured}
                      onChange={(e) => handleInputChange('is_featured', e.target.checked)}
                    />
                    <span>Featured</span>
                  </label>
                  <label className="form-group checkbox" style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
                    <input 
                      type="checkbox"
                      checked={formData.is_spotlight}
                      onChange={(e) => handleInputChange('is_spotlight', e.target.checked)}
                    />
                    <span>Spotlight</span>
                  </label>
                </div>
                <div className="form-row" style={{ marginTop: 16 }}>
                  <div className="form-group">
                    <label>Rating</label>
                    <input 
                      type="number" 
                      min="0" 
                      max="5" 
                      step="0.1"
                      value={formData.rating}
                      onChange={(e) => handleInputChange('rating', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Review Count</label>
                    <input 
                      type="number" 
                      value={formData.review_count}
                      onChange={(e) => handleInputChange('review_count', parseInt(e.target.value) || 0)}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Preview */}
            <div style={{ position: 'sticky', top: 100 }}>
              <div className="checkout-sidebar" style={{ position: 'static' }}>
                <h3>Product Preview</h3>
                
                {formData.images.length > 0 && (
                  <img 
                    src={formData.images[0]} 
                    alt="Preview" 
                    style={{ width: '100%', aspectRatio: '3/4', objectFit: 'cover', borderRadius: 12, marginBottom: 20 }}
                  />
                )}

                <h4 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>{formData.name || 'Product Name'}</h4>
                
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
                  <span style={{ fontSize: 24, fontWeight: 700 }}>{formatPrice(displayPrice)}</span>
                  {originalPrice && (
                    <span style={{ fontSize: 16, textDecoration: 'line-through', color: '#999' }}>
                      {formatPrice(originalPrice)}
                    </span>
                  )}
                </div>

                <p style={{ fontSize: 14, color: '#666', marginBottom: 16, lineHeight: 1.5 }}>
                  {formData.description || 'No description'}
                </p>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
                  {formData.sizes.map(size => (
                    <span key={size} style={{ 
                      padding: '4px 12px', 
                      background: '#f5f5f5', 
                      borderRadius: 4,
                      fontSize: 12,
                      fontWeight: 500
                    }}>
                      {size}
                    </span>
                  ))}
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
                  {formData.colors.map(color => (
                    <span key={color} style={{ 
                      padding: '4px 12px', 
                      background: '#f5f5f5', 
                      borderRadius: 20,
                      fontSize: 12,
                      fontWeight: 500
                    }}>
                      {color}
                    </span>
                  ))}
                </div>

                <div style={{ paddingTop: 16, borderTop: '1px solid #e5e5e5' }}>
                  <p style={{ fontSize: 13, color: '#666', margin: '4px 0' }}>
                    <strong>Category:</strong> {formData.category}
                  </p>
                  <p style={{ fontSize: 13, color: '#666', margin: '4px 0' }}>
                    <strong>Stock:</strong> {formData.stock} units
                  </p>
                  <p style={{ fontSize: 13, color: '#666', margin: '4px 0' }}>
                    <strong>Status:</strong> {formData.is_active ? 'Active' : 'Inactive'}
                  </p>
                  {formData.badge && (
                    <p style={{ fontSize: 13, color: '#666', margin: '4px 0' }}>
                      <strong>Badge:</strong> {formData.badge}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
