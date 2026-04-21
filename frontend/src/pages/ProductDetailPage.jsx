// src/pages/ProductDetailPage.jsx
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { useCartStore, useWishlistStore, useAuthStore } from '../store/stores';
import ProductCard from '../components/ProductCard';
import toast from 'react-hot-toast';
import { FiStar, FiHeart, FiShoppingCart, FiTruck, FiShield, FiRefreshCw, FiChevronRight } from 'react-icons/fi';

export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('description');

  const { addToCart } = useCartStore();
  const { toggle, isWishlisted } = useWishlistStore();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/products/${id}`);
        setProduct(res.data.product);
        setRelated(res.data.related);
        setSelectedImage(0);
      } catch { toast.error('Product not found'); }
      setLoading(false);
    };
    fetchProduct();
    window.scrollTo(0, 0);
  }, [id]);

  if (loading) return (
    <div className="max-w-7xl mx-auto px-4 py-12 flex justify-center">
      <div className="animate-spin w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full" />
    </div>
  );
  if (!product) return <div className="text-center py-20 text-gray-500">Product not found</div>;

  const images = Array.isArray(product.images) && product.images.length > 0
    ? product.images
    : [`https://picsum.photos/seed/${product.id}/600/600`];

  const effectivePrice = product.sale_price || product.price;
  const discount = product.sale_price
    ? Math.round(((product.price - product.sale_price) / product.price) * 100)
    : 0;
  const wishlisted = isWishlisted(product.id);

  const handleAddToCart = async () => {
    if (!isAuthenticated) { toast.error('Please login first'); return; }
    await addToCart(product.id, qty);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link to="/" className="hover:text-blue-600">Home</Link>
        <FiChevronRight className="text-xs" />
        <Link to="/products" className="hover:text-blue-600">Products</Link>
        <FiChevronRight className="text-xs" />
        <span className="text-gray-800 line-clamp-1">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Images */}
        <div>
          <div className="bg-white rounded-2xl overflow-hidden border aspect-square mb-3">
            <img src={images[selectedImage]} alt={product.name} className="w-full h-full object-contain p-6" />
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {images.map((img, i) => (
                <button key={i} onClick={() => setSelectedImage(i)}
                  className={`border-2 rounded-lg overflow-hidden w-16 h-16 shrink-0 transition ${i === selectedImage ? 'border-blue-600' : 'border-gray-200'}`}>
                  <img src={img} alt="" className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          {product.brand && <p className="text-blue-600 text-sm font-medium mb-1">{product.brand}</p>}
          <h1 className="text-2xl font-bold text-gray-800 mb-3">{product.name}</h1>

          {/* Rating */}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex">
              {[1,2,3,4,5].map(s => (
                <FiStar key={s} className={`text-sm ${s <= Math.round(product.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
              ))}
            </div>
            <span className="text-sm text-gray-500">{product.rating?.toFixed(1)} ({product.reviews_count} reviews)</span>
          </div>

          {/* Price */}
          <div className="bg-gray-50 rounded-xl p-4 mb-5">
            <div className="flex items-end gap-3">
              <span className="text-3xl font-black text-gray-900">₹{Number(effectivePrice).toLocaleString('en-IN')}</span>
              {product.sale_price && (
                <>
                  <span className="text-lg text-gray-400 line-through">₹{Number(product.price).toLocaleString('en-IN')}</span>
                  <span className="bg-red-100 text-red-600 text-sm font-bold px-2 py-0.5 rounded">-{discount}%</span>
                </>
              )}
            </div>
            {product.sale_price && (
              <p className="text-green-600 text-sm mt-1">You save ₹{(product.price - product.sale_price).toLocaleString('en-IN')}</p>
            )}
          </div>

          {/* Stock */}
          <div className={`text-sm font-medium mb-4 ${product.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
            {product.stock > 0 ? `✓ In Stock (${product.stock} available)` : '✗ Out of Stock'}
          </div>

          {/* Quantity */}
          {product.stock > 0 && (
            <div className="flex items-center gap-4 mb-5">
              <span className="text-sm font-medium text-gray-700">Quantity:</span>
              <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                <button onClick={() => setQty(Math.max(1, qty - 1))}
                  className="px-3 py-2 bg-gray-100 hover:bg-gray-200 transition text-lg font-bold">-</button>
                <span className="px-5 py-2 font-semibold">{qty}</span>
                <button onClick={() => setQty(Math.min(product.stock, qty + 1))}
                  className="px-3 py-2 bg-gray-100 hover:bg-gray-200 transition text-lg font-bold">+</button>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 mb-6">
            <button onClick={handleAddToCart} disabled={product.stock === 0}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition disabled:opacity-50">
              <FiShoppingCart /> Add to Cart
            </button>
            <button onClick={() => toggle(product.id)}
              className={`p-3 rounded-xl border-2 transition ${wishlisted ? 'bg-red-50 border-red-500 text-red-500' : 'border-gray-200 text-gray-400 hover:border-red-300'}`}>
              <FiHeart className={wishlisted ? 'fill-red-500' : ''} />
            </button>
          </div>

          {/* Highlights */}
          <div className="grid grid-cols-3 gap-3 text-center mb-6">
            {[
              { icon: FiTruck, label: 'Free Delivery', sub: 'Above ₹500' },
              { icon: FiRefreshCw, label: '7 Day Return', sub: 'Easy returns' },
              { icon: FiShield, label: 'Secure', sub: '100% safe' },
            ].map(({ icon: Icon, label, sub }) => (
              <div key={label} className="bg-gray-50 rounded-xl p-3">
                <Icon className="text-blue-600 text-xl mx-auto mb-1" />
                <p className="text-xs font-semibold text-gray-700">{label}</p>
                <p className="text-xs text-gray-400">{sub}</p>
              </div>
            ))}
          </div>

          {/* Store */}
          {product.store && (
            <div className="bg-blue-50 rounded-xl p-4">
              <p className="text-sm text-gray-500">Sold by</p>
              <p className="font-semibold text-blue-700">{product.store.name}</p>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-10 bg-white rounded-2xl overflow-hidden border">
        <div className="flex border-b">
          {['description', 'specifications', 'reviews'].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-6 py-3 text-sm font-medium capitalize transition ${tab === t ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>
              {t}
            </button>
          ))}
        </div>
        <div className="p-6">
          {tab === 'description' && (
            <p className="text-gray-600 leading-relaxed whitespace-pre-line">{product.description}</p>
          )}
          {tab === 'specifications' && product.specifications && (
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(product.specifications).map(([k, v]) => (
                <div key={k} className="flex gap-3">
                  <span className="text-sm font-medium text-gray-500 w-32 shrink-0">{k}</span>
                  <span className="text-sm text-gray-800">{v}</span>
                </div>
              ))}
            </div>
          )}
          {tab === 'reviews' && (
            <div className="space-y-4">
              {product.reviews?.length > 0 ? product.reviews.map(review => (
                <div key={review.id} className="border-b pb-4">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold text-sm">
                      {review.user?.name?.[0]}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{review.user?.name}</p>
                      <div className="flex">
                        {[1,2,3,4,5].map(s => (
                          <FiStar key={s} className={`text-xs ${s <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`} />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">{review.comment}</p>
                </div>
              )) : <p className="text-gray-500 text-center py-8">No reviews yet. Be the first to review!</p>}
            </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <div className="mt-10">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Related Products</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {related.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      )}
    </div>
  );
}
