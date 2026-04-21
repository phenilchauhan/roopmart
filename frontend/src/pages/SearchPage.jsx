// src/pages/SearchPage.jsx
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import ProductCard from '../components/ProductCard';

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!query) return;
    setLoading(true);
    api.get('/search', { params: { q: query } })
      .then(r => setProducts(r.data.data || r.data))
      .finally(() => setLoading(false));
  }, [query]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-xl font-bold mb-2 text-gray-800">
        Search results for: <span className="text-blue-600">"{query}"</span>
      </h1>
      <p className="text-sm text-gray-400 mb-6">{products.length} products found</p>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array(10).fill(0).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border animate-pulse">
              <div className="bg-gray-200 aspect-square rounded-t-xl" />
              <div className="p-3 space-y-2">
                <div className="h-3 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-5xl mb-4">😕</p>
          <h2 className="text-xl font-bold text-gray-700 mb-2">No results found</h2>
          <p className="text-gray-400">Try different keywords or browse our categories</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {products.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  );
}
