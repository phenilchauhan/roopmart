// src/store/authStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../api/axios';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: async (email, password) => {
        const res = await api.post('/login', { email, password });
        const { user, token } = res.data;
        localStorage.setItem('token', token);
        set({ user, token, isAuthenticated: true });
        return res.data;
      },

      register: async (data) => {
        const res = await api.post('/register', data);
        const { user, token } = res.data;
        localStorage.setItem('token', token);
        set({ user, token, isAuthenticated: true });
        return res.data;
      },

      storeRegister: async (data) => {
        const res = await api.post('/store/register', data);
        const { user, token } = res.data;
        localStorage.setItem('token', token);
        set({ user, token, isAuthenticated: true });
        return res.data;
      },

      logout: async () => {
        try { await api.post('/logout'); } catch {}
        localStorage.removeItem('token');
        set({ user: null, token: null, isAuthenticated: false });
      },

      fetchMe: async () => {
        const res = await api.get('/me');
        set({ user: res.data });
      },

      updateUser: (user) => set({ user }),
    }),
    { name: 'auth-storage', partialize: (s) => ({ token: s.token, user: s.user, isAuthenticated: s.isAuthenticated }) }
  )
);

// src/store/cartStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../api/axios';
import toast from 'react-hot-toast';

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      count: 0,
      subtotal: 0,
      coupon: null,
      discount: 0,

      fetchCart: async () => {
        try {
          const res = await api.get('/cart');
          set({ items: res.data.items, count: res.data.count, subtotal: res.data.subtotal });
        } catch {}
      },

      addToCart: async (productId, quantity = 1, variant = null) => {
        await api.post('/cart', { product_id: productId, quantity, variant });
        toast.success('Added to cart!');
        get().fetchCart();
      },

      updateQuantity: async (id, quantity) => {
        await api.put(`/cart/${id}`, { quantity });
        get().fetchCart();
      },

      removeFromCart: async (id) => {
        await api.delete(`/cart/${id}`);
        toast.success('Item removed');
        get().fetchCart();
      },

      clearCart: async () => {
        await api.delete('/cart');
        set({ items: [], count: 0, subtotal: 0, coupon: null, discount: 0 });
      },

      applyCoupon: async (code, cartTotal) => {
        const res = await api.post('/cart/coupon', { code, cart_total: cartTotal });
        set({ coupon: res.data.coupon, discount: res.data.discount });
        toast.success(res.data.message);
        return res.data;
      },

      getTotal: () => {
        const { subtotal, discount } = get();
        const shipping = subtotal > 500 ? 0 : 49;
        const tax = ((subtotal - discount) * 0.18);
        return {
          subtotal,
          discount,
          shipping,
          tax: parseFloat(tax.toFixed(2)),
          total: parseFloat((subtotal - discount + shipping + tax).toFixed(2)),
        };
      },
    }),
    { name: 'cart-storage', partialize: (s) => ({ count: s.count }) }
  )
);

// src/store/wishlistStore.js
import { create } from 'zustand';
import api from '../api/axios';
import toast from 'react-hot-toast';

export const useWishlistStore = create((set, get) => ({
  items: [],

  fetchWishlist: async () => {
    const res = await api.get('/wishlist');
    set({ items: res.data });
  },

  toggle: async (productId) => {
    await api.post(`/wishlist/${productId}`);
    get().fetchWishlist();
  },

  isWishlisted: (productId) => get().items.some(i => i.product_id === productId),
}));
