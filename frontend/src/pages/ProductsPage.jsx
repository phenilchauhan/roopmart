// src/pages/ProductsPage.jsx
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import ProductCard from '../components/ProductCard';
import { FiFilter, FiChevronDown } from 'react-icons/fi';

const SORT_OPTIONS = [
  { value: '', label: 'Relevance' },
  { value: 'newest', label: 'Newest First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'popular', label: 'Most Popular' },
];

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category_id: searchParams.get('category_id') || '',
    min_price: searchParams.get('min_price') || '',
    max_price: searchParams.get('max_price') || '',
    sort: searchParams.get('sort') || '',
    page: 1,
  });

  useEffect(() => { api.get('/categories').then(r => setCategories(r.data)); }, []);

  useEffect(() => {
    setLoading(true);
    const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== ''));
    api.get('/products', { params })
      .then(r => {
        setProducts(r.data.data || r.data);
        setPagination(r.data);
      })
      .finally(() => setLoading(false));
  }, [filters]);

  const updateFilter = (key, val) => setFilters(f => ({ ...f, [key]: val, page: 1 }));

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex gap-6">
        {/* Sidebar Filters */}
        <aside className="w-56 shrink-0 hidden md:block">
          <div className="bg-white rounded-xl border shadow-sm p-4 sticky top-24">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><FiFilter /> Filters</h3>

            {/* Category */}
            <div className="mb-5">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Category</h4>
              <div className="space-y-1.5">
                <label className="flex items-center gap-2 cursor-pointer text-sm">
                  <input type="radio" name="cat" value="" checked={filters.category_id === ''} onChange={() => updateFilter('category_id', '')} />
                  <span>All Categories</span>
                </label>
                {categories.map(cat => (
                  <label key={cat.id} className="flex items-center gap-2 cursor-pointer text-sm">
                    <input type="radio" name="cat" value={cat.id} checked={filters.category_id === String(cat.id)} onChange={() => updateFilter('category_id', String(cat.id))} />
                    <span>{cat.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div className="mb-5">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Price Range</h4>
              <div className="flex gap-2">
                <input type="number" placeholder="Min" value={filters.min_price}
                  onChange={e => updateFilter('min_price', e.target.value)}
                  className="w-full border rounded-lg px-2 py-1.5 text-xs outline-none focus:border-blue-500" />
                <input type="number" placeholder="Max" value={filters.max_price}
                  onChange={e => updateFilter('max_price', e.target.value)}
                  className="w-full border rounded-lg px-2 py-1.5 text-xs outline-none focus:border-blue-500" />
              </div>
            </div>

            <button onClick={() => setFilters({ category_id:'', min_price:'', max_price:'', sort:'', page:1 })}
              className="w-full text-xs text-red-500 hover:text-red-700 py-2 border border-red-200 rounded-lg hover:bg-red-50 transition">
              Clear Filters
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1">
          {/* Sort Bar */}
          <div className="flex items-center justify-between mb-5">
            <p className="text-sm text-gray-500">{pagination?.total || 0} products found</p>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-500">Sort:</label>
              <select value={filters.sort} onChange={e => updateFilter('sort', e.target.value)}
                className="border rounded-lg px-3 py-1.5 text-sm outline-none focus:border-blue-500">
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array(12).fill(0).map((_, i) => (
                <div key={i} className="bg-white rounded-xl border animate-pulse">
                  <div className="bg-gray-200 aspect-square rounded-t-xl" />
                  <div className="p-3 space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                    <div className="h-4 bg-gray-200 rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-4xl mb-4">🔍</p>
              <h3 className="text-xl font-bold text-gray-700 mb-2">No products found</h3>
              <p className="text-gray-400">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.last_page > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {Array.from({ length: pagination.last_page }, (_, i) => i + 1).map(page => (
                <button key={page} onClick={() => setFilters(f => ({ ...f, page }))}
                  className={`w-9 h-9 rounded-lg text-sm font-medium transition ${filters.page === page ? 'bg-blue-600 text-white' : 'bg-white border text-gray-600 hover:bg-gray-50'}`}>
                  {page}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
