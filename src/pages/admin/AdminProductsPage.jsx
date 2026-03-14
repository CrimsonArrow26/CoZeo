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
      console.error('Delete error:', error);
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
        <div className="section _100px">
          <div className="container">
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
      
      <div className="section _100px">
        <div className="container">
          <div className="admin-header">
            <Link to="/admin" className="back-link">
              <ArrowLeft size={18} />
              Back to Dashboard
            </Link>
            <h1>Manage Products</h1>
            <button 
              className="primary-button"
              onClick={() => navigate('/admin/products/new')}
            >
              <Plus size={18} />
              Add Product
            </button>
          </div>

          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products?.map(product => (
                  <tr key={product.id}>
                    <td className="product-cell">
                      <img 
                        src={product.images?.[0] || '/images/placeholder.png'} 
                        alt={product.name}
                        className="product-thumbnail"
                      />
                      <span>{product.name}</span>
                    </td>
                    <td>{product.category}</td>
                    <td>₹{product.price?.toLocaleString()}</td>
                    <td>{product.stock}</td>
                    <td>
                      <span className={`status-badge ${product.is_active ? 'active' : 'inactive'}`}>
                        {product.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="actions-cell">
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
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
