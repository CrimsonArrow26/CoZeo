import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Plus, Tag, Trash2, Edit2, Check, X } from 'lucide-react';
import Header from '../../components/Header';
import { useCoupons, useCreateCoupon, useUpdateCoupon, useDeleteCoupon } from '../../hooks/useCoupons';
import { formatPrice } from '../../lib/utils';
import { toast } from 'sonner';

export default function AdminCouponsPage() {
  const { data: coupons, isLoading } = useCoupons();
  const createCoupon = useCreateCoupon();
  const updateCoupon = useUpdateCoupon();
  const deleteCoupon = useDeleteCoupon();

  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    discount_percentage: 10,
    max_uses: null,
    expires_at: '',
    is_active: true,
  });

  const handleCreate = async (e) => {
    e.preventDefault();
    
    if (!formData.code.trim()) {
      toast.error('Please enter a coupon code');
      return;
    }

    const couponData = {
      code: formData.code.trim().toUpperCase(),
      discount_percentage: parseInt(formData.discount_percentage) || 10,
      max_uses: formData.max_uses ? parseInt(formData.max_uses) : null,
      expires_at: formData.expires_at || null,
      is_active: formData.is_active,
      current_uses: 0,
    };

    await createCoupon.mutateAsync(couponData);
    setIsCreating(false);
    setFormData({
      code: '',
      discount_percentage: 10,
      max_uses: null,
      expires_at: '',
      is_active: true,
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    
    const updates = {
      discount_percentage: parseInt(formData.discount_percentage) || 10,
      max_uses: formData.max_uses ? parseInt(formData.max_uses) : null,
      expires_at: formData.expires_at || null,
      is_active: formData.is_active,
    };

    await updateCoupon.mutateAsync({ id: editingId, ...updates });
    setEditingId(null);
    setFormData({
      code: '',
      discount_percentage: 10,
      max_uses: null,
      expires_at: '',
      is_active: true,
    });
  };

  const startEditing = (coupon) => {
    setEditingId(coupon.id);
    setFormData({
      code: coupon.code,
      discount_percentage: coupon.discount_percentage,
      max_uses: coupon.max_uses || '',
      expires_at: coupon.expires_at ? coupon.expires_at.split('T')[0] : '',
      is_active: coupon.is_active,
    });
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this coupon?')) {
      await deleteCoupon.mutateAsync(id);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const isExpired = (expiresAt) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

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
            <h1>Coupon Management</h1>
          </div>
          <button
            className="primary-button"
            onClick={() => setIsCreating(true)}
            disabled={isCreating}
          >
            <Plus size={16} />
            Create Coupon
          </button>
        </div>

        {/* Create Coupon Form */}
        {isCreating && (
          <form onSubmit={handleCreate} className="coupon-form">
            <h3>Create New Coupon</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Coupon Code *</label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="e.g., SUMMER20"
                  required
                />
              </div>
              <div className="form-group">
                <label>Discount Percentage *</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={formData.discount_percentage}
                  onChange={(e) => setFormData({ ...formData, discount_percentage: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Max Uses (optional)</label>
                <input
                  type="number"
                  min="1"
                  value={formData.max_uses}
                  onChange={(e) => setFormData({ ...formData, max_uses: e.target.value })}
                  placeholder="Leave empty for unlimited"
                />
              </div>
              <div className="form-group">
                <label>Expires At (optional)</label>
                <input
                  type="date"
                  value={formData.expires_at}
                  onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                />
              </div>
            </div>
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
                onClick={() => setIsCreating(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="primary-button"
                disabled={createCoupon.isPending}
              >
                {createCoupon.isPending ? 'Creating...' : 'Create Coupon'}
              </button>
            </div>
          </form>
        )}

        {/* Coupons Table */}
        {isLoading ? (
          <p>Loading coupons...</p>
        ) : coupons?.length === 0 ? (
          <div className="empty-state">
            <Tag size={48} style={{ opacity: 0.3, marginBottom: 16 }} />
            <p>No coupons created yet</p>
          </div>
        ) : (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Discount</th>
                  <th>Uses</th>
                  <th>Max Uses</th>
                  <th>Expires</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {coupons?.map((coupon) => (
                  <tr key={coupon.id}>
                    {editingId === coupon.id ? (
                      <>
                        <td>
                          <strong>{coupon.code}</strong>
                        </td>
                        <td>
                          <input
                            type="number"
                            min="1"
                            max="100"
                            value={formData.discount_percentage}
                            onChange={(e) => setFormData({ ...formData, discount_percentage: e.target.value })}
                            className="table-input"
                            style={{ width: '60px' }}
                          />
                          %
                        </td>
                        <td>{coupon.current_uses}</td>
                        <td>
                          <input
                            type="number"
                            min="1"
                            value={formData.max_uses}
                            onChange={(e) => setFormData({ ...formData, max_uses: e.target.value })}
                            className="table-input"
                            style={{ width: '80px' }}
                            placeholder="∞"
                          />
                        </td>
                        <td>
                          <input
                            type="date"
                            value={formData.expires_at}
                            onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                            className="table-input"
                          />
                        </td>
                        <td>
                          <label className="checkbox-label">
                            <input
                              type="checkbox"
                              checked={formData.is_active}
                              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                            />
                            Active
                          </label>
                        </td>
                        <td>
                          <div className="actions-cell">
                            <button
                              className="icon-btn edit"
                              onClick={handleUpdate}
                              title="Save"
                            >
                              <Check size={16} />
                            </button>
                            <button
                              className="icon-btn delete"
                              onClick={() => setEditingId(null)}
                              title="Cancel"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td>
                          <div className="coupon-cell">
                            <span className="coupon-tag">{coupon.code}</span>
                          </div>
                        </td>
                        <td>{coupon.discount_percentage}%</td>
                        <td>{coupon.current_uses}</td>
                        <td>{coupon.max_uses || '∞'}</td>
                        <td>{formatDate(coupon.expires_at)}</td>
                        <td>
                          <span className={`status-badge ${coupon.is_active && !isExpired(coupon.expires_at) ? 'active' : 'inactive'}`}>
                            {coupon.is_active && !isExpired(coupon.expires_at) ? 'Active' : isExpired(coupon.expires_at) ? 'Expired' : 'Inactive'}
                          </span>
                        </td>
                        <td>
                          <div className="actions-cell">
                            <button
                              className="icon-btn edit"
                              onClick={() => startEditing(coupon)}
                              title="Edit"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              className="icon-btn delete"
                              onClick={() => handleDelete(coupon.id)}
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
    </div>
  );
}
