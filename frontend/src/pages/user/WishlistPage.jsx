// src/pages/user/WishlistPage.jsx
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useWishlistStore, useCartStore } from '../../store/stores';
import { FiHeart, FiShoppingCart, FiTrash2 } from 'react-icons/fi';

export default function WishlistPage() {
  const { items, fetchWishlist, toggle } = useWishlistStore();
  const { addToCart } = useCartStore();

  useEffect(() => { fetchWishlist(); }, []);

  if (items.length === 0) return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <FiHeart className="text-6xl text-gray-300 mx-auto mb-4" />
      <h2 className="text-2xl font-bold mb-2">Your Wishlist is Empty</h2>
      <p className="text-gray-500 mb-6">Save items you love to buy later</p>
      <Link to="/products" className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition">Browse Products</Link>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">My Wishlist ({items.length})</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {items.map(item => {
          const p = item.product;
          if (!p) return null;
          const price = p.sale_price || p.price;
          const image = Array.isArray(p.images) ? p.images[0] : null;
          return (
            <div key={item.id} className="bg-white rounded-xl border shadow-sm overflow-hidden group">
              <Link to={`/products/${p.id}`} className="block">
                <div className="aspect-square bg-gray-50 overflow-hidden">
                  <img src={image || `https://picsum.photos/seed/${p.id}/300/300`} alt={p.name}
                    className="w-full h-full object-contain group-hover:scale-105 transition" />
                </div>
              </Link>
              <div className="p-3">
                <Link to={`/products/${p.id}`} className="text-sm font-medium text-gray-700 hover:text-blue-600 line-clamp-2 block">{p.name}</Link>
                <p className="font-bold text-gray-900 mt-1">₹{Number(price).toLocaleString('en-IN')}</p>
                <div className="flex gap-2 mt-3">
                  <button onClick={() => addToCart(p.id, 1)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs py-2 rounded-lg flex items-center justify-center gap-1 transition font-medium">
                    <FiShoppingCart className="text-xs" /> Add to Cart
                  </button>
                  <button onClick={() => toggle(p.id)}
                    className="p-2 border border-red-200 text-red-500 hover:bg-red-50 rounded-lg transition">
                    <FiTrash2 className="text-sm" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
