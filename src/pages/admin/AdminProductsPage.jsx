import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import { Footer } from '../../components/SubscribeFooter';
import { useProducts } from '../../hooks/useProducts';
import { Plus, Edit2, Trash2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../../integrations/supabase/client';

export default function AdminProductsPage() {
  const navigate = useNavigate();
  const { data: products, isLoading } = useProducts();

  const handleDelete = async (productId) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
      const { error } = await supabase.from('products').delete().eq('id', productId);
      if (error) throw error;
      toast.success('Product deleted');
    } catch (error) {
      toast.error('Failed to delete product');
    }
  };

  const handleEdit = (product) => {
    navigate(`/admin/products/${product.slug}/edit`);
  };

  if (isLoading) {
    return (
      <div className="page-wrapper">
        <Header />
        <div className="section" style={{ padding: '60px 0' }}>
          <div className="container" style={{ maxWidth: 1200 }}>
            <div className="loading">Loading products...</div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <Header />
      
      <div className="section" style={{ padding: '60px 0' }}>
        <div className="container" style={{ maxWidth: 1200 }}>
          <div className="admin-header" style={{ marginBottom: 40 }}>
            <Link to="/admin" className="back-link">
              <ArrowLeft size={18} />
              Back to Dashboard
            </Link>
            <h1 style={{ fontSize: 28, fontWeight: 700 }}>Manage Products</h1>
            <button 
              className="primary-button"
              onClick={() => navigate('/admin/products/new')}
            >
              <Plus size={18} />
              Add Product
            </button>
          </div>

          <div className="admin-grid-container" style={{ marginTop: 24 }}>
            {/* Grid Header */}
            <div className="admin-grid-header">
              <div className="grid-col-product">Product</div>
              <div className="grid-col-category">Category</div>
              <div className="grid-col-price">Price</div>
              <div className="grid-col-stock">Stock</div>
              <div className="grid-col-status">Status</div>
              <div className="grid-col-actions">Actions</div>
            </div>
            
            {/* Grid Body */}
            {products?.map(product => (
              <div className="admin-grid-row" key={product.id}>
                <div className="grid-col-product">
                  <div className="product-cell">
                    <img 
                      src={product.images?.[0] || '/images/placeholder.png'} 
                      alt={product.name}
                      className="product-thumbnail"
                    />
                    <span>{product.name}</span>
                  </div>
                </div>
                <div className="grid-col-category">{product.category}</div>
                <div className="grid-col-price">₹{(product.discount_price || product.price)?.toLocaleString()}</div>
                <div className="grid-col-stock">{product.stock}</div>
                <div className="grid-col-status">
                  <span className={`status-badge ${product.is_active ? 'active' : 'inactive'}`}>
                    {product.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="grid-col-actions actions-cell">
                  <button 
                    className="icon-btn edit"
                    onClick={() => handleEdit(product)}
                    title="Edit Product"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button 
                    className="icon-btn delete"
                    onClick={() => handleDelete(product.id)}
                    title="Delete Product"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
