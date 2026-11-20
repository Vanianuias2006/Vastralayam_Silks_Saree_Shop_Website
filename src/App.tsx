import { useEffect, useState } from 'react';
import { DEFAULT_STORE_DATA } from './data/defaultStore';
import { PageRoute, SareeCategory, SareeProduct, StoreData } from './types';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { WhatsAppFloat } from './components/WhatsAppFloat';
import { HomePage } from './pages/HomePage';
import { CollectionsPage } from './pages/CollectionsPage';
import { GalleryPage } from './pages/GalleryPage';
import { PurchasePage } from './pages/PurchasePage';
import { ContactPage } from './pages/ContactPage';
import { AdminPage } from './pages/AdminPage';

const PAGE_TITLES: Record<PageRoute, string> = {
  home: 'Vastralayam Silks — Grace in Every Weave',
  collections: 'Collections with Prices — Vastralayam Silks',
  gallery: 'Saree Gallery — Vastralayam Silks',
  purchase: 'Purchase Saree — Vastralayam Silks',
  contact: 'Contact & Visit Nagaram Showroom — Vastralayam Silks',
  admin: 'Owner Catalogue Manager — Vastralayam Silks',
};

function parseHashRoute(): PageRoute {
  const hash = window.location.hash.replace(/^#\/?/, '').toLowerCase();
  if (
    hash === 'collections' ||
    hash === 'gallery' ||
    hash === 'purchase' ||
    hash === 'contact' ||
    hash === 'admin'
  ) {
    return hash;
  }
  return 'home';
}

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageRoute>(() => parseHashRoute());
  const [store, setStore] = useState<StoreData>(DEFAULT_STORE_DATA);
  const [selectedCategory, setSelectedCategory] = useState<SareeCategory | 'All'>('All');
  const [selectedProduct, setSelectedProduct] = useState<SareeProduct | null>(
    DEFAULT_STORE_DATA.products[0] || null
  );

  useEffect(() => {
    let active = true;
    fetch('/api/store')
      .then((res) => (res.ok ? res.json() : null))
      .then((data: StoreData | null) => {
        if (!active || !data || !Array.isArray(data.products)) return;
        if (data.products.length > 0) {
          setStore(data);
          setSelectedProduct((prev) => {
            if (!prev) return data.products[0];
            return data.products.find((p) => p.id === prev.id) || data.products[0];
          });
        }
      })
      .catch(() => {
        // Retain default fallback catalogue on offline preview
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const onHashChange = () => {
      setCurrentPage(parseHashRoute());
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  useEffect(() => {
    document.title = PAGE_TITLES[currentPage];
  }, [currentPage]);

  const navigateTo = (page: PageRoute) => {
    setCurrentPage(page);
    const targetHash = page === 'home' ? '#home' : `#${page}`;
    if (window.location.hash !== targetHash) {
      window.history.pushState(null, '', targetHash);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewProduct = (product: SareeProduct) => {
    setSelectedProduct(product);
    navigateTo('purchase');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0D0C0B] text-[#F6EFE2]">
      <Navbar currentPage={currentPage} onNavigate={navigateTo} />

      <main className="flex-1">
        {currentPage === 'home' && (
          <HomePage
            products={store.products}
            settings={store.settings}
            onNavigate={navigateTo}
            onSelectCategory={setSelectedCategory}
            onViewProduct={handleViewProduct}
          />
        )}

        {currentPage === 'collections' && (
          <CollectionsPage
            products={store.products}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            onViewProduct={handleViewProduct}
            onNavigate={navigateTo}
            announcementText={store.settings.announcementText}
          />
        )}

        {currentPage === 'gallery' && (
          <GalleryPage
            gallery={store.gallery}
            products={store.products}
            onViewProduct={handleViewProduct}
          />
        )}

        {currentPage === 'purchase' && (
          <PurchasePage
            products={store.products}
            selectedProduct={selectedProduct}
            onSelectProduct={setSelectedProduct}
            onNavigate={navigateTo}
          />
        )}

        {currentPage === 'contact' && <ContactPage settings={store.settings} />}

        {currentPage === 'admin' && (
          <AdminPage store={store} onStoreUpdated={setStore} />
        )}
      </main>

      <Footer settings={store.settings} onNavigate={navigateTo} />
      <WhatsAppFloat />
    </div>
  );
}
