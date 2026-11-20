import React, { useMemo, useState } from 'react';
import { ArrowRight, Info, Search, SlidersHorizontal, X } from 'lucide-react';
import { PageRoute, SAREE_CATEGORIES, SareeCategory, SareeProduct } from '../types';
import { ProductCard } from '../components/ProductCard';

interface CollectionsPageProps {
  products: SareeProduct[];
  selectedCategory: SareeCategory | 'All';
  onSelectCategory: (category: SareeCategory | 'All') => void;
  onViewProduct: (product: SareeProduct) => void;
  onNavigate: (page: PageRoute) => void;
  announcementText: string;
}

type QuickFilter = 'all' | 'new' | 'best';
type SortOrder = 'featured' | 'price-asc' | 'price-desc';

export const CollectionsPage: React.FC<CollectionsPageProps> = ({
  products,
  selectedCategory,
  onSelectCategory,
  onViewProduct,
  onNavigate,
  announcementText,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [quickFilter, setQuickFilter] = useState<QuickFilter>('all');
  const [sortOrder, setSortOrder] = useState<SortOrder>('featured');

  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    const list = products.filter((item) => {
      if (selectedCategory !== 'All' && item.category !== selectedCategory) {
        return false;
      }
      if (quickFilter === 'new' && !item.isNewArrival) {
        return false;
      }
      if (quickFilter === 'best' && !item.isBestSeller) {
        return false;
      }
      if (query) {
        const hay = `${item.name} ${item.category} ${item.description} ${item.fabricDetails}`.toLowerCase();
        if (!hay.includes(query)) return false;
      }
      return true;
    });

    if (sortOrder === 'price-asc') {
      return [...list].sort((a, b) => a.price - b.price);
    }
    if (sortOrder === 'price-desc') {
      return [...list].sort((a, b) => b.price - a.price);
    }
    return list;
  }, [products, selectedCategory, quickFilter, searchQuery, sortOrder]);

  const hasSampleItems = products.some((p) => p.isSample);

  const handleReset = () => {
    setSearchQuery('');
    setQuickFilter('all');
    setSortOrder('featured');
    onSelectCategory('All');
  };

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      {/* Page Header */}
      <div className="pb-8 border-b border-[#C6A15B]/30">
        <p className="text-xs tracking-[0.14em] uppercase text-[#E5C573] font-medium">
          Vastralayam Silks Catalogue
        </p>
        <h1 className="mt-2 font-serif text-4xl sm:text-5xl font-semibold text-[#F6EFE2]">
          Collections with Prices
        </h1>
        <p className="mt-3 text-sm sm:text-base text-[#C5B8A5] max-w-2xl leading-relaxed">
          Browse our curated saree categories in Indian Rupees (₹). Switch between Mannequin and
          Original photos on supported items, or select any drape to order on WhatsApp.
        </p>

        {/* Transparent Sample Catalogue Notice */}
        {hasSampleItems && (
          <div className="mt-6 bg-[#161412] border border-[#C6A15B]/45 px-4 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm text-[#F6EFE2]">
            <div className="flex items-start gap-3">
              <Info className="w-4 h-4 text-[#E5C573] shrink-0 mt-0.5" aria-hidden="true" />
              <p className="leading-relaxed text-[#C5B8A5]">
                <span className="font-semibold text-[#F6EFE2]">Sample Catalogue Mode: </span>
                {announcementText ||
                  'Items marked "Sample Entry" display placeholder photography and sample pricing until real Vastralayam Silks saree photographs and discounted costs are uploaded.'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('admin')}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-[#C6A15B] text-[#0D0C0B] hover:bg-[#E5C573] transition-colors whitespace-nowrap shrink-0 self-start sm:self-center cursor-pointer"
            >
              <span>Upload Real Sarees & Costs</span>
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>
        )}
      </div>

      {/* Filter & Search Toolbar */}
      <div className="py-6 space-y-5 border-b border-[#C6A15B]/25">
        <div className="flex flex-col lg:flex-row gap-4 justify-between items-stretch lg:items-center">
          {/* Quick Filter Segmented Controls */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[#161412] border border-[#C6A15B]/35 self-start">
            <button
              type="button"
              onClick={() => setQuickFilter('all')}
              className={`px-4 py-2 text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                quickFilter === 'all'
                  ? 'bg-[#C6A15B] text-[#0D0C0B]'
                  : 'text-[#C5B8A5] hover:text-[#F6EFE2]'
              }`}
            >
              All Sarees
            </button>
            <button
              type="button"
              onClick={() => setQuickFilter('new')}
              className={`px-4 py-2 text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                quickFilter === 'new'
                  ? 'bg-[#C6A15B] text-[#0D0C0B]'
                  : 'text-[#C5B8A5] hover:text-[#F6EFE2]'
              }`}
            >
              New Arrivals
            </button>
            <button
              type="button"
              onClick={() => setQuickFilter('best')}
              className={`px-4 py-2 text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                quickFilter === 'best'
                  ? 'bg-[#C6A15B] text-[#0D0C0B]'
                  : 'text-[#C5B8A5] hover:text-[#F6EFE2]'
              }`}
            >
              Best Sellers
            </button>
          </div>

          {/* Search + Sort Controls */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            <div className="relative flex-1 sm:w-72">
              <Search
                className="w-4 h-4 text-[#C5B8A5] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                aria-hidden="true"
              />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search sarees, weaves, colours..."
                aria-label="Search sarees"
                className="w-full pl-10 pr-9 py-2.5 text-sm bg-[#161412] border border-[#C6A15B]/40 text-[#F6EFE2] placeholder:text-[#A39683] focus:outline-none focus:border-[#E5C573]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#C5B8A5] hover:text-[#F6EFE2] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 bg-[#161412] border border-[#C6A15B]/40 px-3 py-2">
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#E5C573] shrink-0" aria-hidden="true" />
              <label htmlFor="sort-order" className="sr-only">
                Sort sarees
              </label>
              <select
                id="sort-order"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as SortOrder)}
                className="text-xs sm:text-sm bg-[#161412] text-[#F6EFE2] focus:outline-none cursor-pointer pr-2"
              >
                <option value="featured">Sort: Featured</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Category Filter Buttons */}
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by saree category">
          <button
            type="button"
            onClick={() => onSelectCategory('All')}
            className={`px-3.5 py-2 text-xs font-medium border transition-colors whitespace-nowrap cursor-pointer ${
              selectedCategory === 'All'
                ? 'bg-[#C6A15B] text-[#0D0C0B] border-[#C6A15B] font-semibold'
                : 'bg-[#161412] text-[#C5B8A5] border-[#C6A15B]/30 hover:border-[#E5C573] hover:text-[#F6EFE2]'
            }`}
          >
            All Categories
          </button>
          {SAREE_CATEGORIES.map((category) => {
            const active = selectedCategory === category;
            return (
              <button
                key={category}
                type="button"
                onClick={() => onSelectCategory(category)}
                className={`px-3.5 py-2 text-xs font-medium border transition-colors whitespace-nowrap cursor-pointer ${
                  active
                    ? 'bg-[#C6A15B] text-[#0D0C0B] border-[#C6A15B] font-semibold'
                    : 'bg-[#161412] text-[#C5B8A5] border-[#C6A15B]/30 hover:border-[#E5C573] hover:text-[#F6EFE2]'
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>
      </div>

      {/* Results Count */}
      <div className="py-4 flex items-center justify-between text-xs text-[#C5B8A5]">
        <span className="tabular-nums">
          Showing {filteredProducts.length} {filteredProducts.length === 1 ? 'saree' : 'sarees'}
          {selectedCategory !== 'All' ? ` in ${selectedCategory}` : ''}
        </span>
        {(selectedCategory !== 'All' || quickFilter !== 'all' || searchQuery) && (
          <button
            type="button"
            onClick={handleReset}
            className="text-[#E5C573] hover:text-[#F6EFE2] underline underline-offset-4 cursor-pointer"
          >
            Reset all filters
          </button>
        )}
      </div>

      {/* Product Grid or Empty State */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onViewDetails={onViewProduct}
            />
          ))}
        </div>
      ) : (
        <div className="my-10 bg-[#161412] border border-[#C6A15B]/35 p-12 text-center max-w-lg mx-auto">
          <h2 className="font-serif text-2xl font-semibold text-[#F6EFE2]">
            No sarees match your current selection
          </h2>
          <p className="mt-2 text-sm text-[#C5B8A5]">
            Try clearing your search term or switching back to all saree categories.
          </p>
          <button
            type="button"
            onClick={handleReset}
            className="mt-6 px-6 py-2.5 text-xs font-semibold bg-[#C6A15B] text-[#0D0C0B] hover:bg-[#E5C573] transition-colors cursor-pointer"
          >
            Show All Sarees
          </button>
        </div>
      )}
    </div>
  );
};
