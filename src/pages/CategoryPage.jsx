import { useParams, Link } from 'react-router-dom';
import Header from '../components/Header';
import { Footer } from '../components/SubscribeFooter';
import { useProducts } from '../hooks/useProducts';
import { formatPrice } from '../lib/utils';
import ChatWidget from '../components/ChatWidget';

export default function CategoryPage() {
  const { slug } = useParams();
  const title = slug?.charAt(0).toUpperCase() + slug?.slice(1) || 'Category';
  const { data: products, isLoading } = useProducts({ category: slug?.toLowerCase() });

  return (
    <div className="page-wrapper">
      <Header />
      <section style={{ padding: '60px 0 80px' }}>
        <div className="w-layout-blockcontainer container w-container">
          {/* Breadcrumb */}
          <div className="breadcrumb-link-block" style={{ marginBottom: 24 }}>
            <Link to="/" className="breadcrumb-link">Home</Link>
            <span className="breadcrumb-separator">/</span>
            <Link to="/shop" className="breadcrumb-link">Category</Link>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-current">{title}</span>
          </div>

          <div className="section-title-box four" style={{ marginBottom: 48 }}>
            <h2 className="section-title">{title}</h2>
            <p className="section-text">Explore our full {title.toLowerCase()}'s range — crafted for the streets, built for expression.</p>
          </div>

          {isLoading ? (
            <div className="loading">Loading products...</div>
          ) : (
            <div className="product-collection w-dyn-items" role="list">
              {products?.map((product) => (
                <div key={product.id} role="listitem" className="w-dyn-item">
                  <Link to={`/product/${product.slug}`} className="product-block w-inline-block" style={{ opacity: 1 }}>
                    <div className="product-image-box">
                      <img src={product.images?.[0]} alt={product.name} className="product-image" loading="lazy" />
                      {product.badge && <p className={`product-tag ${product.badge}`}>{product.badge}</p>}
                    </div>
                    <div className="product-content-box">
                      <h3 className="product-title">{product.name}</h3>
                      <p className="product-text">{product.description}</p>
                      <div className="product-price-box">
                        <p className="product-price">{formatPrice(product.discount_price || product.price)}</p>
                        {product.discount_price && (
                          <p className="product-discount">{formatPrice(product.price)}</p>
                        )}
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
      <Footer />
      <ChatWidget />
    </div>
  );
}
