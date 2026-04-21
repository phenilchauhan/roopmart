// src/pages/PaymentResultPage.jsx
import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../api/axios';

export default function PaymentResultPage() {
  const [params] = useSearchParams();
  const status = params.get('status');
  const orderId = params.get('order');
  const success = status === 'TXN_SUCCESS';

  return (
    <div className="max-w-lg mx-auto px-4 py-20 text-center">
      <div className={`w-20 h-20 rounded-full flex items-center justify-center text-4xl mx-auto mb-6 ${success ? 'bg-green-100' : 'bg-red-100'}`}>
        {success ? '✅' : '❌'}
      </div>
      <h1 className={`text-2xl font-black mb-2 ${success ? 'text-green-700' : 'text-red-700'}`}>
        {success ? 'Payment Successful!' : 'Payment Failed'}
      </h1>
      <p className="text-gray-500 mb-2">Order: <span className="font-mono font-semibold text-gray-700">{orderId}</span></p>
      <p className="text-gray-400 text-sm mb-8">
        {success ? 'Your order has been placed and confirmed. You will receive a confirmation email shortly.' : 'Your payment was not completed. Please try again.'}
      </p>
      <div className="flex gap-3 justify-center">
        {success ? (
          <>
            <Link to="/orders" className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition">View Orders</Link>
            <Link to="/" className="border px-6 py-3 rounded-xl font-medium hover:bg-gray-50 transition">Continue Shopping</Link>
          </>
        ) : (
          <>
            <Link to="/cart" className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition">Try Again</Link>
            <Link to="/" className="border px-6 py-3 rounded-xl font-medium hover:bg-gray-50 transition">Go Home</Link>
          </>
        )}
      </div>
    </div>
  );
}
