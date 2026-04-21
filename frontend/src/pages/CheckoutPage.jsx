// src/pages/CheckoutPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useCartStore, useAuthStore } from '../store/stores';
import toast from 'react-hot-toast';

const STATES = ['Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Delhi','Goa','Gujarat',
  'Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra',
  'Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu',
  'Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal'];

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, getTotal, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('paytm');
  const [couponCode, setCouponCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({ name:'',phone:'',address_line1:'',city:'',state:'',pincode:'',type:'home' });

  const totals = getTotal();

  useEffect(() => {
    api.get('/addresses').then(res => {
      setAddresses(res.data);
      const def = res.data.find(a => a.is_default) || res.data[0];
      if (def) setSelectedAddress(def);
    });
  }, []);

  const handleSaveAddress = async () => {
    await api.post('/addresses', newAddress);
    const res = await api.get('/addresses');
    setAddresses(res.data);
    setSelectedAddress(res.data[res.data.length - 1]);
    setShowAddAddress(false);
    toast.success('Address saved');
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) { toast.error('Please select or add a delivery address'); return; }
    setLoading(true);
    try {
      const res = await api.post('/orders', {
        shipping_address: selectedAddress,
        payment_method: paymentMethod,
        coupon_code: couponCode || undefined,
      });

      const order = res.data.order;

      if (paymentMethod === 'cod') {
        toast.success('Order placed successfully!');
        navigate(`/orders/${order.id}`);
        return;
      }

      // Paytm payment
      const payRes = await api.post('/payment/initiate', { order_id: order.id });
      const { params, payment_url } = payRes.data;

      // Create and submit Paytm form
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = payment_url;
      Object.entries(params).forEach(([k, v]) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = k;
        input.value = v;
        form.appendChild(input);
      });
      document.body.appendChild(form);
      form.submit();

    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left */}
        <div className="lg:col-span-2 space-y-6">
          {/* Delivery Address */}
          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
            <h2 className="font-bold text-lg mb-4">📍 Delivery Address</h2>
            <div className="space-y-3">
              {addresses.map(addr => (
                <label key={addr.id}
                  className={`flex gap-3 p-4 rounded-xl border-2 cursor-pointer transition ${selectedAddress?.id === addr.id ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <input type="radio" name="address" checked={selectedAddress?.id === addr.id}
                    onChange={() => setSelectedAddress(addr)} className="mt-1" />
                  <div className="text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{addr.name}</span>
                      <span className="bg-gray-100 text-gray-500 text-xs px-2 py-0.5 rounded capitalize">{addr.type}</span>
                    </div>
                    <p className="text-gray-600 mt-0.5">{addr.address_line1}, {addr.city}, {addr.state} - {addr.pincode}</p>
                    <p className="text-gray-500">📞 {addr.phone}</p>
                  </div>
                </label>
              ))}

              {/* Add New Address */}
              {showAddAddress ? (
                <div className="border-2 border-dashed border-blue-300 rounded-xl p-4 space-y-3">
                  <h3 className="font-semibold text-sm text-blue-700">Add New Address</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {[['name','Full Name'],['phone','Phone Number'],['address_line1','Address'],['city','City'],['pincode','Pincode']].map(([f,p]) => (
                      <input key={f} placeholder={p} value={newAddress[f]}
                        onChange={e => setNewAddress({...newAddress,[f]:e.target.value})}
                        className={`border rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 ${f==='address_line1'?'col-span-2':''}`} />
                    ))}
                    <select value={newAddress.state} onChange={e => setNewAddress({...newAddress,state:e.target.value})}
                      className="border rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500">
                      <option value="">Select State</option>
                      {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <select value={newAddress.type} onChange={e => setNewAddress({...newAddress,type:e.target.value})}
                      className="border rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500">
                      <option value="home">Home</option>
                      <option value="work">Work</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={handleSaveAddress} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition">Save Address</button>
                    <button onClick={() => setShowAddAddress(false)} className="border px-4 py-2 rounded-lg text-sm hover:bg-gray-50 transition">Cancel</button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setShowAddAddress(true)}
                  className="w-full border-2 border-dashed border-gray-300 rounded-xl py-3 text-sm text-gray-500 hover:border-blue-400 hover:text-blue-600 transition">
                  + Add New Address
                </button>
              )}
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
            <h2 className="font-bold text-lg mb-4">💳 Payment Method</h2>
            <div className="space-y-3">
              {[
                { id: 'paytm', label: 'Paytm / UPI / Cards / Net Banking', icon: '🔵', desc: 'Pay securely via Paytm gateway' },
                { id: 'cod', label: 'Cash on Delivery', icon: '💵', desc: 'Pay when your order arrives' },
              ].map(opt => (
                <label key={opt.id}
                  className={`flex gap-3 p-4 rounded-xl border-2 cursor-pointer transition ${paymentMethod === opt.id ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <input type="radio" name="payment" value={opt.id} checked={paymentMethod === opt.id}
                    onChange={() => setPaymentMethod(opt.id)} className="mt-1" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span>{opt.icon}</span>
                      <span className="font-semibold text-sm">{opt.label}</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">{opt.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm h-fit sticky top-20">
          <h2 className="font-bold text-lg mb-4 pb-2 border-b">Order Summary</h2>

          {/* Items */}
          <div className="space-y-2 mb-4">
            {items.slice(0, 3).map(item => (
              <div key={item.id} className="flex gap-2 text-sm">
                <img src={Array.isArray(item.product?.images) ? item.product.images[0] : `https://picsum.photos/seed/${item.product_id}/50/50`}
                  alt="" className="w-12 h-12 object-contain bg-gray-50 rounded border" />
                <div className="flex-1">
                  <p className="text-gray-700 line-clamp-1">{item.product?.name}</p>
                  <p className="text-gray-500">Qty: {item.quantity}</p>
                </div>
              </div>
            ))}
            {items.length > 3 && <p className="text-xs text-gray-400 text-center">+{items.length - 3} more items</p>}
          </div>

          {/* Coupon */}
          <div className="flex gap-2 mb-4">
            <input value={couponCode} onChange={e => setCouponCode(e.target.value)}
              placeholder="Coupon code" className="flex-1 border rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" />
            <button className="bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg text-sm font-medium transition">Apply</button>
          </div>

          {/* Totals */}
          <div className="space-y-2 text-sm border-t pt-4">
            <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>₹{totals.subtotal.toLocaleString('en-IN')}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Shipping</span><span className={totals.shipping === 0 ? 'text-green-600' : ''}>{totals.shipping === 0 ? 'FREE' : `₹${totals.shipping}`}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">GST (18%)</span><span>₹{totals.tax}</span></div>
            <div className="flex justify-between font-bold text-base pt-2 border-t">
              <span>Total</span><span>₹{totals.total.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <button onClick={handlePlaceOrder} disabled={loading}
            className="w-full mt-5 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition disabled:opacity-50 flex items-center justify-center gap-2">
            {loading ? <><span className="animate-spin border-2 border-white border-t-transparent rounded-full w-4 h-4" />Processing...</> : `Place Order • ₹${totals.total.toLocaleString('en-IN')}`}
          </button>
          <p className="text-xs text-gray-400 text-center mt-3">🔒 Secure checkout powered by Paytm</p>
        </div>
      </div>
    </div>
  );
}
