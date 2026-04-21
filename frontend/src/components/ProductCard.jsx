// src/components/ProductCard.jsx
import { Link } from 'react-router-dom';
import { FiHeart, FiShoppingCart, FiStar } from 'react-icons/fi';
import { useCartStore, useAuthStore, useWishlistStore } from '../store/stores';
import toast from 'react-hot-toast';

export default function ProductCard({ product }) {
  const { addToCart } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const { toggle, isWishlisted } = useWishlistStore();

  const wishlisted = isWishlisted(product.id);
  const discountPercent = product.sale_price
    ? Math.round(((product.price - product.sale_price) / product.price) * 100)
    : 0;
  const effectivePrice = product.sale_price || product.price;
  const image = Array.isArray(product.images) ? product.images[0] : product.images;

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) { toast.error('Please login to add to cart'); return; }
    await addToCart(product.id, 1);
  };

  const handleWishlist = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) { toast.error('Please login'); return; }
    await toggle(product.id);
  };

  return (
    <Link to={`/products/${product.id}`}
      className="bg-white rounded-xl shadow-sm hover:shadow-md transition group overflow-hidden border border-gray-100">
      {/* Image */}
      <div className="relative overflow-hidden bg-gray-50 aspect-square">
        <img
          src={image || `https://picsum.photos/seed/${product.id}/300/300`}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
        />
        {discountPercent > 0 && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
            -{discountPercent}%
          </span>
        )}
        <button onClick={handleWishlist}
          className={`absolute top-2 right-2 p-1.5 rounded-full transition ${wishlisted ? 'bg-red-500 text-white' : 'bg-white text-gray-400 hover:text-red-500'}`}>
          <FiHeart className={wishlisted ? 'fill-white' : ''} />
        </button>
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition">
          <button onClick={handleAddToCart}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs py-2 flex items-center justify-center gap-1 font-semibold transition">
            <FiShoppingCart /> Add to Cart
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="text-xs text-gray-400 mb-0.5">{product.brand || product.store?.name}</p>
        <h3 className="text-sm font-medium text-gray-800 line-clamp-2 leading-snug">{product.name}</h3>
        <div className="flex items-center gap-1 mt-1">
          <FiStar className="text-yellow-400 fill-yellow-400 text-xs" />
          <span className="text-xs text-gray-600">{product.rating?.toFixed(1) || '4.0'}</span>
          <span className="text-xs text-gray-400">({product.reviews_count || 0})</span>
        </div>
        <div className="flex items-center gap-2 mt-1.5">
          <span className="font-bold text-gray-900">₹{effectivePrice?.toLocaleString('en-IN')}</span>
          {product.sale_price && (
            <span className="text-xs text-gray-400 line-through">₹{product.price?.toLocaleString('en-IN')}</span>
          )}
        </div>
        {product.stock === 0 && (
          <span className="text-xs text-red-500 font-medium mt-1 block">Out of Stock</span>
        )}
      </div>
    </Link>
  );
}
