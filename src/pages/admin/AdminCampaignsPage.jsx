import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Edit2, Check, X, Megaphone, Calendar, Tag, Package, Upload, Eye, EyeOff } from 'lucide-react';
import Header from '../../components/Header';
import { useCampaigns, useCreateCampaign, useUpdateCampaign, useDeleteCampaign } from '../../hooks/useCampaigns';
import { useProducts } from '../../hooks/useProducts';
import { formatPrice } from '../../lib/utils';
import { toast } from 'sonner';

export default function AdminCampaignsPage() {
  const { data: campaigns, isLoading } = useCampaigns();
  const { data: products } = useProducts();
  const createCampaign = useCreateCampaign();
  const updateCampaign = useUpdateCampaign();
  const deleteCampaign = useDeleteCampaign();

  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    slug: '',
    badge: '',
    combo_price: 999,
    original_total: 0,
    starts_at: '',
    ends_at: '',
    is_active: true,
    max_uses: '',
    requires_custom_design: false,
    custom_design_label: 'Upload Your Custom Design',
    image_url: '',
    print_price: 299,
    selectedProducts: [],
  });

  const generateSlug = (name) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };

  const handleNameChange = (name) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: generateSlug(name),
    }));
  };

  // Generate unique slug with timestamp if needed
  const generateUniqueSlug = (baseSlug) => {
    const timestamp = Date.now().toString(36).slice(-4);
    return `${baseSlug}-${timestamp}`;
  };

  const handleAddProduct = (productId) => {
    const product = products?.find(p => p.id === productId);
    if (!product) return;

    setFormData(prev => ({
      ...prev,
      selectedProducts: [
        ...prev.selectedProducts,
        {
          product_id: product.id,
          name: product.name,
          price: product.discount_price || product.price,
          min_quantity: 1,
          is_custom_design_slot: product.slug === 'custom-design-apparel',
        },
      ],
    }));
  };

  const handleRemoveProduct = (index) => {
    setFormData(prev => ({
      ...prev,
      selectedProducts: prev.selectedProducts.filter((_, i) => i !== index),
    }));
  };

  const handleUpdateProduct = (index, updates) => {
    setFormData(prev => ({
      ...prev,
      selectedProducts: prev.selectedProducts.map((p, i) => 
        i === index ? { ...p, ...updates } : p
      ),
    }));
  };

  const calculateOriginalTotal = (selectedProducts) => {
    return selectedProducts.reduce((sum, p) => sum + (p.price * p.min_quantity), 0);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Please enter a campaign name');
      return;
    }
    if (!formData.slug.trim()) {
      toast.error('Please enter a campaign slug');
      return;
    }
    if (formData.selectedProducts.length === 0) {
      toast.error('Please select at least one product');
      return;
    }
    if (!formData.starts_at || !formData.ends_at) {
      toast.error('Please set start and end dates');
      return;
    }

    const originalTotal = calculateOriginalTotal(formData.selectedProducts);
    
    // Generate unique slug to avoid conflicts
    const baseSlug = formData.slug.trim() || generateSlug(formData.name.trim());
    const uniqueSlug = generateUniqueSlug(baseSlug);
    
    const campaignData = {
      name: formData.name.trim(),
      description: formData.description.trim() || null,
      slug: uniqueSlug,
      badge: formData.badge.trim() || null,
      combo_price: parseFloat(formData.combo_price) || 999,
      original_total: originalTotal,
      starts_at: new Date(formData.starts_at).toISOString(),
      ends_at: new Date(formData.ends_at).toISOString(),
      is_active: formData.is_active,
      max_uses: formData.max_uses ? parseInt(formData.max_uses) : null,
      requires_custom_design: formData.requires_custom_design,
      custom_design_label: formData.custom_design_label.trim() || null,
      image_url: formData.image_url.trim() || null,
      print_price: parseFloat(formData.print_price) || 299,
    };

    const products = formData.selectedProducts.map(p => ({
      product_id: p.product_id,
      min_quantity: parseInt(p.min_quantity) || 1,
      is_custom_design_slot: p.is_custom_design_slot,
    }));

    await createCampaign.mutateAsync({ campaign: campaignData, products });
    resetForm();
    setIsCreating(false);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    
    const originalTotal = calculateOriginalTotal(formData.selectedProducts);
    
    const campaignUpdates = {
      name: formData.name.trim(),
      description: formData.description.trim() || null,
      slug: formData.slug.trim(),
      badge: formData.badge.trim() || null,
      combo_price: parseFloat(formData.combo_price) || 999,
      original_total: originalTotal,
      starts_at: new Date(formData.starts_at).toISOString(),
      ends_at: new Date(formData.ends_at).toISOString(),
      is_active: formData.is_active,
      max_uses: formData.max_uses ? parseInt(formData.max_uses) : null,
      requires_custom_design: formData.requires_custom_design,
      custom_design_label: formData.custom_design_label.trim() || null,
      image_url: formData.image_url.trim() || null,
      print_price: parseFloat(formData.print_price) || 299,
    };

    const products = formData.selectedProducts.map(p => ({
      product_id: p.product_id,
      min_quantity: parseInt(p.min_quantity) || 1,
      is_custom_design_slot: p.is_custom_design_slot,
    }));

    await updateCampaign.mutateAsync({ 
      id: editingId, 
      campaign: campaignUpdates, 
      products 
    });
    resetForm();
    setEditingId(null);
  };

  const startEditing = (campaign) => {
    setEditingId(campaign.id);
    setFormData({
      name: campaign.name,
      description: campaign.description || '',
      slug: campaign.slug,
      badge: campaign.badge || '',
      combo_price: campaign.combo_price,
      original_total: campaign.original_total,
      starts_at: campaign.starts_at ? campaign.starts_at.split('T')[0] : '',
      ends_at: campaign.ends_at ? campaign.ends_at.split('T')[0] : '',
      is_active: campaign.is_active,
      max_uses: campaign.max_uses || '',
      requires_custom_design: campaign.requires_custom_design,
      custom_design_label: campaign.custom_design_label || 'Upload Your Custom Design',
      image_url: campaign.image_url || '',
      print_price: campaign.print_price || 299,
      selectedProducts: campaign.campaign_products?.map(cp => ({
        product_id: cp.product_id,
        name: cp.product?.name || 'Unknown Product',
        price: cp.product?.discount_price || cp.product?.price || 0,
        min_quantity: cp.min_quantity,
        is_custom_design_slot: cp.is_custom_design_slot,
      })) || [],
    });
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this campaign?')) {
      await deleteCampaign.mutateAsync(id);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      slug: '',
      badge: '',
      combo_price: 999,
      original_total: 0,
      starts_at: '',
      ends_at: '',
      is_active: true,
      max_uses: '',
      requires_custom_design: false,
      custom_design_label: 'Upload Your Custom Design',
      image_url: '',
      print_price: 299,
      selectedProducts: [],
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const isExpired = (endsAt) => {
    if (!endsAt) return false;
    return new Date(endsAt) < new Date();
  };

  const isStarted = (startsAt) => {
    if (!startsAt) return false;
    return new Date(startsAt) <= new Date();
  };

  const getCampaignStatus = (campaign) => {
    if (!campaign.is_active) return { label: 'Inactive', class: 'inactive' };
    if (isExpired(campaign.ends_at)) return { label: 'Expired', class: 'inactive' };
    if (!isStarted(campaign.starts_at)) return { label: 'Scheduled', class: 'scheduled' };
    return { label: 'Active', class: 'active' };
  };

  // Filter out already selected products
  const availableProducts = products?.filter(p => 
    !formData.selectedProducts.some(sp => sp.product_id === p.id)
  ) || [];

  return (
    <div className="page-wrapper">
      <Header />
      <div className="section _100px">
        <div className="container">
        <div className="admin-header">
          <div>
            <Link to="/admin" className="back-link">
              <ArrowLeft size={16} />
              Back to Dashboard
            </Link>
            <h1>Campaign Management</h1>
          </div>
          <button
            className="primary-button"
            onClick={() => setIsCreating(true)}
            disabled={isCreating}
          >
            <Plus size={16} />
            Create Campaign
          </button>
        </div>

        {/* Create/Edit Campaign Form */}
        {(isCreating || editingId) && (
          <form onSubmit={editingId ? handleUpdate : handleCreate} className="coupon-form">
            <h3>{editingId ? 'Edit Campaign' : 'Create New Campaign'}</h3>
            
            {/* Basic Info */}
            <div className="form-row">
              <div className="form-group">
                <label>Campaign Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g., Summer Combo Deal"
                  required
                />
              </div>
              <div className="form-group">
                <label>Slug *</label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="e.g., summer-combo"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the campaign..."
                rows={2}
              />
            </div>

            <div className="form-group">
              <label>Campaign Image URL</label>
              <input
                type="url"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                placeholder="https://example.com/campaign-image.jpg"
              />
              {formData.image_url && (
                <div className="campaign-image-preview">
                  <img src={formData.image_url} alt="Campaign preview" />
                </div>
              )}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Badge Text (optional)</label>
                <input
                  type="text"
                  value={formData.badge}
                  onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                  placeholder="e.g., LIMITED TIME"
                />
              </div>
              <div className="form-group">
                <label>Combo Price (₹) *</label>
                <input
                  type="number"
                  min="1"
                  value={formData.combo_price}
                  onChange={(e) => setFormData({ ...formData, combo_price: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Print Price per Location (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={formData.print_price}
                  onChange={(e) => setFormData({ ...formData, print_price: e.target.value })}
                  placeholder="299"
                />
                <small style={{ color: '#666', fontSize: '12px' }}>
                  Price for each custom print location (front/back)
                </small>
              </div>
              <div className="form-group">
                <label>Max Uses (optional)</label>
                <input
                  type="number"
                  min="1"
                  value={formData.max_uses}
                  onChange={(e) => setFormData({ ...formData, max_uses: e.target.value })}
                  placeholder="Unlimited"
                />
              </div>
            </div>

            {/* Dates */}
            <div className="form-row">
              <div className="form-group">
                <label>Start Date *</label>
                <input
                  type="date"
                  value={formData.starts_at}
                  onChange={(e) => setFormData({ ...formData, starts_at: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>End Date *</label>
                <input
                  type="date"
                  value={formData.ends_at}
                  onChange={(e) => setFormData({ ...formData, ends_at: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Product Selection */}
            <div className="form-section">
              <label>Select Products *</label>
              <div className="product-selection-box">
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      handleAddProduct(e.target.value);
                      e.target.value = '';
                    }
                  }}
                  value=""
                >
                  <option value="">Add a product...</option>
                  {availableProducts.map(product => (
                    <option key={product.id} value={product.id}>
                      {product.name} - {formatPrice(product.discount_price || product.price)}
                    </option>
                  ))}
                </select>

                {formData.selectedProducts.length > 0 && (
                  <div className="selected-products">
                    {formData.selectedProducts.map((product, index) => (
                      <div key={index} className="selected-product-item">
                        <div className="product-info">
                          <span className="product-name">{product.name}</span>
                          <span className="product-price">{formatPrice(product.price)}</span>
                        </div>
                        <div className="product-controls">
                          <input
                            type="number"
                            min="1"
                            max="10"
                            value={product.min_quantity}
                            onChange={(e) => handleUpdateProduct(index, { min_quantity: parseInt(e.target.value) || 1 })}
                            className="quantity-input"
                            title="Minimum quantity required"
                          />
                          {product.is_custom_design_slot && (
                            <span className="custom-design-indicator" title="Custom design required">
                              <Upload size={14} />
                            </span>
                          )}
                          <button
                            type="button"
                            className="icon-btn delete"
                            onClick={() => handleRemoveProduct(index)}
                          >
                            <X size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {formData.selectedProducts.length > 0 && (
                  <div className="combo-summary">
                    <div className="summary-row">
                      <span>Original Total:</span>
                      <span className="original-price">{formatPrice(calculateOriginalTotal(formData.selectedProducts))}</span>
                    </div>
                    <div className="summary-row highlight">
                      <span>Combo Price:</span>
                      <span className="combo-price">{formatPrice(formData.combo_price)}</span>
                    </div>
                    <div className="summary-row savings">
                      <span>You Save:</span>
                      <span className="savings-amount">
                        {formatPrice(calculateOriginalTotal(formData.selectedProducts) - formData.combo_price)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Custom Design Options */}
            <div className="form-group checkbox">
              <label>
                <input
                  type="checkbox"
                  checked={formData.requires_custom_design}
                  onChange={(e) => setFormData({ ...formData, requires_custom_design: e.target.checked })}
                />
                Requires Custom Design Upload
              </label>
            </div>

            {formData.requires_custom_design && (
              <div className="form-group">
                <label>Custom Design Upload Label</label>
                <input
                  type="text"
                  value={formData.custom_design_label}
                  onChange={(e) => setFormData({ ...formData, custom_design_label: e.target.value })}
                  placeholder="e.g., Upload Your Custom Design"
                />
              </div>
            )}

            <div className="form-group checkbox">
              <label>
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                />
                Active
              </label>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={() => {
                  setIsCreating(false);
                  setEditingId(null);
                  resetForm();
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="primary-button"
                disabled={createCampaign.isPending || updateCampaign.isPending}
              >
                {editingId 
                  ? (updateCampaign.isPending ? 'Updating...' : 'Update Campaign')
                  : (createCampaign.isPending ? 'Creating...' : 'Create Campaign')
                }
              </button>
            </div>
          </form>
        )}

        {/* Campaigns Table */}
        {isLoading ? (
          <p>Loading campaigns...</p>
        ) : campaigns?.length === 0 ? (
          <div className="empty-state">
            <Megaphone size={48} style={{ opacity: 0.3, marginBottom: 16 }} />
            <p>No campaigns created yet</p>
            <p style={{ fontSize: 14, color: '#666', marginTop: 8 }}>
              Create combo deals to showcase on your store
            </p>
          </div>
        ) : (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Campaign</th>
                  <th>Products</th>
                  <th>Combo Price</th>
                  <th>Savings</th>
                  <th>Duration</th>
                  <th>Uses</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {campaigns?.map((campaign) => {
                  const status = getCampaignStatus(campaign);
                  const productCount = campaign.campaign_products?.length || 0;
                  const savings = campaign.original_total - campaign.combo_price;
                  
                  return (
                    <tr key={campaign.id}>
                      <td>
                        <div className="campaign-cell">
                          <span className="campaign-name">{campaign.name}</span>
                          {campaign.badge && (
                            <span className="campaign-badge">{campaign.badge}</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="products-cell">
                          <span className="product-count">{productCount} items</span>
                          {campaign.campaign_products?.some(cp => cp.is_custom_design_slot) && (
                            <span className="campaign-feature" title="Contains custom design slot">
                              <Upload size={12} />
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        <span className="combo-price">{formatPrice(campaign.combo_price)}</span>
                      </td>
                      <td>
                        <span className="savings-amount">{formatPrice(savings)}</span>
                      </td>
                      <td>
                        <div className="duration-cell">
                          <Calendar size={14} />
                          <span>{formatDate(campaign.starts_at)} - {formatDate(campaign.ends_at)}</span>
                        </div>
                      </td>
                      <td>
                        <span className="uses-count">
                          {campaign.current_uses || 0}/{campaign.max_uses || '∞'}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge ${status.class}`}>
                          {status.label}
                        </span>
                      </td>
                      <td>
                        <div className="actions-cell">
                          <button
                            className="icon-btn edit"
                            onClick={() => startEditing(campaign)}
                            title="Edit"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            className="icon-btn delete"
                            onClick={() => handleDelete(campaign.id)}
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
    </div>
  );
}
