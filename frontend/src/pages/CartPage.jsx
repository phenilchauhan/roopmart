// src/pages/CartPage.jsx
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCartStore, useAuthStore } from '../store/stores';
import { FiTrash2, FiMinus, FiPlus, FiShoppingBag } from 'react-icons/fi';

export default function CartPage() {
  const { items, fetchCart, updateQuantity, removeFromCart, getTotal } = useCartStore();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => { if (isAuthenticated) fetchCart(); }, [isAuthenticated]);

  if (!isAuthenticated) return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <FiShoppingBag className="text-6xl text-gray-300 mx-auto mb-4" />
      <h2 className="text-2xl font-bold mb-2">Your Cart is Empty</h2>
      <p className="text-gray-500 mb-6">Please login to view your cart</p>
      <Link to="/login" className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition">Login</Link>
    </div>
  );

  if (items.length === 0) return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <FiShoppingBag className="text-6xl text-gray-300 mx-auto mb-4" />
      <h2 className="text-2xl font-bold mb-2">Your Cart is Empty</h2>
      <p className="text-gray-500 mb-6">Add some products to get started</p>
      <Link to="/products" className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition">Continue Shopping</Link>
    </div>
  );

  const totals = getTotal();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Shopping Cart ({items.length} items)</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-3">
          {items.map(item => {
            const price = item.product?.sale_price || item.product?.price || 0;
            const image = Array.isArray(item.product?.images) ? item.product.images[0] : null;
            return (
              <div key={item.id} className="bg-white rounded-xl p-4 flex gap-4 border border-gray-100 shadow-sm">
                <img src={image || `https://picsum.photos/seed/${item.product_id}/100/100`}
                  alt={item.product?.name} className="w-24 h-24 object-contain rounded-lg bg-gray-50 border" />
                <div className="flex-1">
                  <Link to={`/products/${item.product_id}`}
                    className="font-medium text-gray-800 hover:text-blue-600 line-clamp-2 text-sm">{item.product?.name}</Link>
                  <p className="text-xs text-gray-400 mt-0.5">Store: {item.product?.store?.name}</p>
                  <p className="font-bold text-gray-900 mt-1">₹{Number(price).toLocaleString('en-IN')}</p>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                      <button onClick={() => item.quantity > 1 ? updateQuantity(item.id, item.quantity - 1) : removeFromCart(item.id)}
                        className="px-2.5 py-1.5 bg-gray-50 hover:bg-gray-100 transition"><FiMinus className="text-xs" /></button>
                      <span className="px-4 py-1.5 text-sm font-medium">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="px-2.5 py-1.5 bg-gray-50 hover:bg-gray-100 transition"><FiPlus className="text-xs" /></button>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-gray-900">₹{(price * item.quantity).toLocaleString('en-IN')}</span>
                      <button onClick={() => removeFromCart(item.id)} className="text-red-400 hover:text-red-600 transition">
                        <FiTrash2 />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm h-fit sticky top-20">
          <h2 className="text-lg font-bold mb-4 pb-2 border-b">Order Summary</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Subtotal</span>
              <span>₹{totals.subtotal.toLocaleString('en-IN')}</span>
            </div>
            {totals.discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span>-₹{totals.discount.toLocaleString('en-IN')}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-500">Shipping</span>
              <span className={totals.shipping === 0 ? 'text-green-600' : ''}>
                {totals.shipping === 0 ? 'FREE' : `₹${totals.shipping}`}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">GST (18%)</span>
              <span>₹{totals.tax.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between font-bold text-base pt-3 border-t">
              <span>Total</span>
              <span>₹{totals.total.toLocaleString('en-IN')}</span>
            </div>
          </div>
          {totals.shipping > 0 && (
            <p className="text-xs text-green-600 mt-3 bg-green-50 rounded-lg p-2 text-center">
              Add ₹{(500 - totals.subtotal).toFixed(0)} more for FREE delivery!
            </p>
          )}
          <Link to="/checkout"
            className="block mt-5 bg-blue-600 hover:bg-blue-700 text-white text-center py-3 rounded-xl font-bold transition">
            Proceed to Checkout →
          </Link>
          <Link to="/products" className="block mt-2 text-center text-sm text-blue-600 hover:underline">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
