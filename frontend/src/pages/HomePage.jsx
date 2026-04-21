// src/pages/HomePage.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import ProductCard from '../components/ProductCard';
import { FiChevronRight, FiTruck, FiShield, FiRefreshCw, FiHeadphones } from 'react-icons/fi';

const HERO_SLIDES = [
  { bg: 'from-blue-600 to-blue-900', title: 'Big Billion Days Sale!', subtitle: 'Up to 80% off on Electronics', cta: 'Shop Now', link: '/search?q=electronics' },
  { bg: 'from-purple-600 to-pink-700', title: 'Fashion Week Deals', subtitle: 'Trendy styles at unbeatable prices', cta: 'Explore Fashion', link: '/search?q=fashion' },
  { bg: 'from-green-500 to-teal-700', title: 'Fresh Arrivals', subtitle: 'New products added daily', cta: 'View New', link: '/products' },
];

const CATEGORIES = [
  { name: 'Electronics', emoji: '📱', color: 'bg-blue-100 text-blue-700' },
  { name: 'Fashion', emoji: '👗', color: 'bg-pink-100 text-pink-700' },
  { name: 'Home & Garden', emoji: '🏠', color: 'bg-yellow-100 text-yellow-700' },
  { name: 'Beauty', emoji: '💄', color: 'bg-red-100 text-red-700' },
  { name: 'Sports', emoji: '⚽', color: 'bg-green-100 text-green-700' },
  { name: 'Books', emoji: '📚', color: 'bg-indigo-100 text-indigo-700' },
  { name: 'Toys', emoji: '🧸', color: 'bg-orange-100 text-orange-700' },
  { name: 'Grocery', emoji: '🛒', color: 'bg-teal-100 text-teal-700' },
];

const FEATURES = [
  { icon: FiTruck, title: 'Free Delivery', desc: 'On orders above ₹500' },
  { icon: FiShield, title: 'Secure Payment', desc: '100% secure transactions' },
  { icon: FiRefreshCw, title: 'Easy Returns', desc: '7-day return policy' },
  { icon: FiHeadphones, title: '24/7 Support', desc: 'Dedicated support team' },
];

export default function HomePage() {
  const [featured, setFeatured] = useState([]);
  const [deals, setDeals] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [slideIndex, setSlideIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [f, d, n] = await Promise.all([
          api.get('/featured'),
          api.get('/deals'),
          api.get('/new-arrivals'),
        ]);
        setFeatured(f.data);
        setDeals(d.data);
        setNewArrivals(n.data);
      } catch {}
      setLoading(false);
    };
    fetchAll();

    const timer = setInterval(() => setSlideIndex(i => (i + 1) % HERO_SLIDES.length), 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div>
      {/* Hero Slider */}
      <div className={`bg-gradient-to-r ${HERO_SLIDES[slideIndex].bg} text-white transition-all duration-700`}>
        <div className="max-w-7xl mx-auto px-4 py-16 flex flex-col md:flex-row items-center justify-between">
          <div>
            <span className="bg-yellow-400 text-gray-900 text-xs font-bold px-3 py-1 rounded-full uppercase">Limited Time</span>
            <h1 className="text-4xl md:text-5xl font-black mt-3 mb-2">{HERO_SLIDES[slideIndex].title}</h1>
            <p className="text-xl text-white/80 mb-6">{HERO_SLIDES[slideIndex].subtitle}</p>
            <Link to={HERO_SLIDES[slideIndex].link}
              className="bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-bold px-8 py-3 rounded-xl inline-block transition text-lg">
              {HERO_SLIDES[slideIndex].cta} →
            </Link>
          </div>
          <div className="text-[120px] mt-8 md:mt-0">🛍️</div>
        </div>
        <div className="flex justify-center gap-2 pb-4">
          {HERO_SLIDES.map((_, i) => (
            <button key={i} onClick={() => setSlideIndex(i)}
              className={`w-2.5 h-2.5 rounded-full transition ${i === slideIndex ? 'bg-yellow-400 w-6' : 'bg-white/50'}`} />
          ))}
        </div>
      </div>

      {/* Features */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-5 grid grid-cols-2 md:grid-cols-4 gap-4">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex items-center gap-3">
              <div className="bg-blue-100 p-2.5 rounded-xl"><Icon className="text-blue-600 text-xl" /></div>
              <div>
                <p className="font-semibold text-sm text-gray-800">{title}</p>
                <p className="text-xs text-gray-500">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-12">
        {/* Categories */}
        <section>
          <SectionHeader title="Shop by Category" link="/products" />
          <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
            {CATEGORIES.map(({ name, emoji, color }) => (
              <Link key={name} to={`/search?q=${name}`}
                className={`${color} rounded-2xl p-4 flex flex-col items-center gap-2 hover:scale-105 transition cursor-pointer`}>
                <span className="text-3xl">{emoji}</span>
                <span className="text-xs font-semibold text-center">{name}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Flash Deals */}
        {deals.length > 0 && (
          <section>
            <SectionHeader title="⚡ Today's Deals" link="/search?sort=deals" />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {deals.slice(0, 10).map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </section>
        )}

        {/* Promo Banners */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { bg: 'from-orange-400 to-red-500', emoji: '📱', title: 'Electronics Sale', sub: 'Up to 60% off' },
            { bg: 'from-purple-500 to-pink-600', emoji: '👗', title: 'Fashion Week', sub: 'Flat ₹200 off' },
            { bg: 'from-green-400 to-teal-600', emoji: '🏠', title: 'Home Essentials', sub: 'Buy 2 Get 1' },
          ].map(({ bg, emoji, title, sub }) => (
            <div key={title} className={`bg-gradient-to-br ${bg} text-white rounded-2xl p-6 flex items-center justify-between hover:scale-[1.02] transition cursor-pointer`}>
              <div>
                <h3 className="font-bold text-lg">{title}</h3>
                <p className="text-sm text-white/80">{sub}</p>
                <button className="mt-3 bg-white/20 hover:bg-white/30 text-white text-xs px-4 py-1.5 rounded-full transition">Shop Now</button>
              </div>
              <span className="text-5xl">{emoji}</span>
            </div>
          ))}
        </div>

        {/* Featured Products */}
        {featured.length > 0 && (
          <section>
            <SectionHeader title="⭐ Featured Products" link="/products?featured=1" />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {featured.slice(0, 10).map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </section>
        )}

        {/* New Arrivals */}
        {newArrivals.length > 0 && (
          <section>
            <SectionHeader title="🆕 New Arrivals" link="/products?sort=newest" />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {newArrivals.slice(0, 10).map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </section>
        )}

        {/* Sell CTA */}
        <div className="bg-gradient-to-r from-gray-900 to-blue-900 text-white rounded-2xl p-10 text-center">
          <h2 className="text-3xl font-black mb-3">Start Selling on RoopMart</h2>
          <p className="text-gray-300 mb-6 max-w-lg mx-auto">Join thousands of sellers and reach millions of customers across India. It's free to register!</p>
          <Link to="/seller/register" className="bg-yellow-400 text-gray-900 font-bold px-8 py-3 rounded-xl text-lg inline-block hover:bg-yellow-300 transition">
            Become a Seller →
          </Link>
        </div>
      </div>
    </div>
  );
}

function SectionHeader({ title, link }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-xl font-bold text-gray-800">{title}</h2>
      <Link to={link} className="text-blue-600 text-sm flex items-center gap-1 hover:underline">
        View All <FiChevronRight />
      </Link>
    </div>
  );
}
