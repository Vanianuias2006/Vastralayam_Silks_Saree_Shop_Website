import React, { useState } from 'react';
import { ArrowRight, Check, Instagram, MessageCircle, Sparkles } from 'lucide-react';
import { BRAND_ASSETS, IMAGES } from '../data/defaultStore';
import { PageRoute, SareeCategory, SareeProduct, SiteSettings } from '../types';
import { ProductCard } from '../components/ProductCard';
import { SareeImage } from '../components/SareeImage';
import { buildGeneralWhatsAppUrl } from '../utils/whatsapp';

interface HomePageProps {
  products: SareeProduct[];
  settings: SiteSettings;
  onNavigate: (page: PageRoute) => void;
  onSelectCategory: (category: SareeCategory | 'All') => void;
  onViewProduct: (product: SareeProduct) => void;
}

const FEATURED_COLLECTIONS: Array<{
  title: string;
  category: SareeCategory;
  subtitle: string;
  image: string;
}> = [
  {
    title: 'Kata Linen Sarees',
    category: 'Kata Linen Sarees',
    subtitle: '₹1,199 (Before ₹1,399) · Soft linen weaves with antique gold zari.',
    image: IMAGES.kataLinen,
  },
  {
    title: 'Tana Pattu Sarees',
    category: 'Tana Pattu Sarees',
    subtitle: '₹550 (Before ₹750) · Featherlight festive silk-blend drapes.',
    image: IMAGES.tanaPattu,
  },
  {
    title: 'Dola Silk Check',
    category: 'Dola Silk Check Sarees',
    subtitle: '₹550 (Before ₹720) · Checked florals with woven zari borders.',
    image: IMAGES.dolaCheck,
  },
  {
    title: 'Ajrak Mirror & Daily Wear',
    category: 'Ajrak Mirror Sarees',
    subtitle: 'Starting ₹500 · Bandhani mirror work & breezy everyday sarees.',
    image: IMAGES.ajrakMirror,
  },
];

const HERITAGE_PILLARS = [
  {
    number: '01.',
    title: 'Personally Handpicked Sarees',
    description:
      'Every drape at Vastralayam Silks is individually inspected for silk richness, weave balance, and authentic zari finish before reaching our shelves.',
  },
  {
    number: '02.',
    title: 'Bridal, Festive & Everyday Range',
    description:
      'From grand Kanchipuram muhurtham silks to featherlight Tana Pattu and Pochampally Ikkats, curated for every family milestone.',
  },
  {
    number: '03.',
    title: 'Mannequin & Original Photo Clarity',
    description:
      'We share both draped mannequin looks and real-life original saree photographs with honest discounted pricing so you shop with complete confidence.',
  },
  {
    number: '04.',
    title: 'Direct Store Guidance on WhatsApp',
    description:
      'Clear INR pricing with direct family-led confirmation on WhatsApp—never automated bots or hidden charges.',
  },
];

const TESTIMONIALS = [
  {
    quote:
      'We needed two bridal Kanchipuram drapes on a tight wedding timeline. Vastralayam Silks shared close-up natural light videos on WhatsApp and helped us finalize both sarees during one calm showroom visit.',
    author: 'Sravanthi Reddy',
    context: 'Bridal Trousseau · Sainikpuri, Hyderabad',
  },
  {
    quote:
      'Finding authentic Pochampally Ikkat silks with crisp borders for my daughter’s engagement felt effortless here. The weave texture and fall matched exactly what was shown.',
    author: 'Padmavathi Rao',
    context: 'Family Celebration · AS Rao Nagar, Hyderabad',
  },
  {
    quote:
      'Ordered a festive silk saree for my mother from Bengaluru after a quick WhatsApp call. Careful muslin packaging and prompt dispatch made the entire experience trustworthy.',
    author: 'Ananya Kulkarni',
    context: 'Festive Gifting · Bengaluru',
  },
];

const OrnamentalDivider: React.FC = () => (
  <div className="flex items-center gap-3 my-4" aria-hidden="true">
    <span className="h-[1px] w-14 bg-[#C6A15B]/75" />
    <span className="w-2 h-2 rotate-45 border border-[#E5C573] bg-[#0D0C0B]" />
    <span className="h-[1px] w-14 bg-[#C6A15B]/75" />
  </div>
);

export const HomePage: React.FC<HomePageProps> = ({
  products,
  settings,
  onNavigate,
  onSelectCategory,
  onViewProduct,
}) => {
  const [showcaseTab, setShowcaseTab] = useState<'new' | 'best'>('new');

  const newArrivals = products.filter((p) => p.isNewArrival).slice(0, 3);
  const bestSellers = products.filter((p) => p.isBestSeller).slice(0, 3);
  const displayedProducts = showcaseTab === 'new' ? newArrivals : bestSellers;

  const instagramPreviews = [
    { src: IMAGES.kataLinen, alt: 'Copper Cream Kata Linen saree with magenta gold zari' },
    { src: IMAGES.tanaPattu, alt: 'Dark Green Tana Pattu saree with rose-gold zari' },
    { src: IMAGES.dolaCheck, alt: 'Pink Floral Dola Silk Check saree' },
    { src: IMAGES.dailyWear, alt: 'Rama Green Daily Wear Shibra Bandhani saree' },
  ];

  return (
    <div>
      {/* 1. HERO SECTION — BLACK & GOLD EDITORIAL */}
      <section className="bg-[#0D0C0B] border-b border-[#C6A15B]/35">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
            {/* Left Editorial Copy Column */}
            <div className="lg:col-span-6 flex flex-col justify-center py-2 lg:py-6">
              <div className="flex items-center gap-3">
                <span className="h-[1px] w-8 bg-[#C6A15B]" aria-hidden="true" />
                <p className="text-xs sm:text-sm tracking-[0.16em] uppercase text-[#E5C573] font-medium">
                  Grace in Every Weave · Nagaram, Hyderabad
                </p>
              </div>

              <h1 className="mt-4 font-serif text-[clamp(2.5rem,4.6vw,4.35rem)] font-semibold text-[#F6EFE2] leading-[1.06] tracking-tight text-balance">
                Elegance Woven in Every Thread.
              </h1>

              <OrnamentalDivider />

              <p className="mt-2 text-base sm:text-lg text-[#C5B8A5] leading-relaxed max-w-xl">
                Discover the timeless beauty of Indian sarees at Vastralayam Silks. Kata Linen,
                Tana Pattu, Dola Silk Checks, Ajrak Mirror, and Daily Wear sarees handpicked with
                personal care and transparent store-offer pricing.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={() => {
                    onSelectCategory('All');
                    onNavigate('collections');
                  }}
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 text-sm font-semibold bg-[#C6A15B] text-[#0D0C0B] border border-[#C6A15B] hover:bg-[#E5C573] hover:border-[#E5C573] transition-colors duration-200 whitespace-nowrap cursor-pointer"
                >
                  <span>Shop Collections</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('gallery')}
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 text-sm font-medium bg-[#161412] text-[#F6EFE2] border border-[#C6A15B]/45 hover:border-[#E5C573] hover:text-[#E5C573] transition-colors duration-200 whitespace-nowrap cursor-pointer"
                >
                  <span>Explore Gallery</span>
                </button>
              </div>

              <div className="mt-10 pt-6 border-t border-[#C6A15B]/25 grid grid-cols-3 gap-4 text-xs sm:text-sm text-[#C5B8A5]">
                <div>
                  <span className="block font-serif text-lg sm:text-xl font-semibold text-[#E5C573]">
                    5 Collections
                  </span>
                  <span>22+ ready-to-order sarees</span>
                </div>
                <div>
                  <span className="block font-serif text-lg sm:text-xl font-semibold text-[#E5C573]">
                    Hyderabad
                  </span>
                  <span>Nagaram family saree store</span>
                </div>
                <div>
                  <span className="block font-serif text-lg sm:text-xl font-semibold text-[#E5C573]">
                    Direct Care
                  </span>
                  <span>Mannequin & original photos</span>
                </div>
              </div>
            </div>

            {/* Right Hero Photography in Double Antique Gold Frame */}
            <div className="lg:col-span-6">
              <div className="h-full p-2 border border-[#C6A15B]/60 bg-[#161412]">
                <div className="relative h-[380px] sm:h-[480px] lg:h-full min-h-[460px] overflow-hidden border border-[#C6A15B]/40 bg-[#0D0C0B]">
                  <SareeImage
                    src={IMAGES.hero}
                    alt="Black Kata Linen saree with antique gold zari border draped in the Vastralayam Silks store"
                    fallbackTitle="Vastralayam Silks Kata Linen Collection"
                    className="w-full h-full object-cover object-top"
                  />
                  <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6 bg-gradient-to-t from-[#090807]/95 via-[#090807]/55 to-transparent text-[#F6EFE2]">
                    <p className="text-xs tracking-[0.12em] uppercase text-[#E5C573]">
                      Vastralayam Silks · Store Collection
                    </p>
                    <p className="mt-1 font-serif text-xl sm:text-2xl text-[#F6EFE2]">
                      Black Kata Linen with Antique Gold Zari Border
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. FOUNDER & FAMILY HERITAGE BRANDING (MOTHER'S PHOTO + OFFICIAL LOGO) */}
      <section className="bg-[#12100E] border-b border-[#C6A15B]/30 py-16 sm:py-20">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#161412] border border-[#C6A15B]/45 p-6 sm:p-10 lg:p-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              {/* Mother's Branding Portrait */}
              <div className="lg:col-span-5">
                <div className="p-2.5 border border-[#C6A15B]/70 bg-[#0D0C0B]">
                  <div className="aspect-[4/5] w-full overflow-hidden border border-[#C6A15B]/40 bg-[#161412]">
                    <SareeImage
                      src={settings.founderPortraitUrl || BRAND_ASSETS.founderPortrait}
                      alt="Founder of Vastralayam Silks wearing an artisanal teal and maroon-zari silk saree in front of our saree collection"
                      fallbackTitle="Vastralayam Silks Founder"
                      className="w-full h-full object-cover object-top"
                    />
                  </div>
                </div>
              </div>

              {/* Brand Story & Official Gold-Sealed Logo Crest */}
              <div className="lg:col-span-7 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center gap-5 pb-5 border-b border-[#C6A15B]/25">
                  <div className="p-1.5 bg-[#FAF4EC] border-2 border-[#C6A15B] shrink-0 self-start">
                    <img
                      src={BRAND_ASSETS.logo}
                      alt="Vastralayam Silks — Grace in Every Weave"
                      className="w-22 h-22 sm:w-24 sm:h-24 object-cover block"
                    />
                  </div>
                  <div>
                    <p className="text-xs tracking-[0.14em] uppercase text-[#E5C573] font-medium">
                      Our Heart & Identity
                    </p>
                    <h2 className="mt-1 font-serif text-3xl sm:text-4xl font-semibold text-[#F6EFE2] leading-tight">
                      Personally Selected Sarees, Rooted in Family Trust
                    </h2>
                  </div>
                </div>

                <p className="text-base text-[#F6EFE2] leading-relaxed">
                  Vastralayam Silks is a warm, family-run Indian saree store built on a mother’s
                  lifelong eye for authentic silk, rich zari, and graceful everyday weaves.
                </p>
                <p className="text-sm sm:text-base text-[#C5B8A5] leading-relaxed">
                  Every saree on our shelves in Nagaram, Hyderabad is hand-chosen one by one for
                  its fabric comfort, colour harmony, and lasting heirloom quality. Whether you are
                  shopping for a bridal muhurtham, a family festival, or a thoughtful gift, you
                  receive honest guidance and transparent discounted pricing straight from our store.
                </p>

                <div className="pt-3 flex flex-wrap items-center gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      onSelectCategory('All');
                      onNavigate('collections');
                    }}
                    className="inline-flex items-center gap-2 px-6 py-3 text-xs sm:text-sm font-semibold bg-[#C6A15B] text-[#0D0C0B] hover:bg-[#E5C573] transition-colors cursor-pointer"
                  >
                    <span>Explore Our Sarees</span>
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </button>
                  <a
                    href={buildGeneralWhatsAppUrl(
                      'Hello Vastralayam Silks! I would love to see your current saree collection and discuss options.'
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 text-xs sm:text-sm font-medium bg-[#0D0C0B] text-[#F6EFE2] border border-[#C6A15B]/55 hover:border-[#E5C573] hover:text-[#E5C573] transition-colors"
                  >
                    <MessageCircle className="w-4 h-4 text-[#E5C573]" aria-hidden="true" />
                    <span>Speak Directly on WhatsApp</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FEATURED SAREE COLLECTIONS */}
      <section className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-8 border-b border-[#C6A15B]/30">
          <div>
            <p className="text-xs tracking-[0.14em] uppercase text-[#E5C573] font-medium">
              Curated Silks & Handlooms
            </p>
            <h2 className="mt-2 font-serif text-3xl sm:text-4xl font-semibold text-[#F6EFE2]">
              Featured Saree Collections
            </h2>
          </div>
          <button
            type="button"
            onClick={() => {
              onSelectCategory('All');
              onNavigate('collections');
            }}
            className="inline-flex items-center gap-2 text-sm font-medium text-[#E5C573] hover:text-[#F6EFE2] transition-colors cursor-pointer self-start sm:self-auto"
          >
            <span>View all sarees</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURED_COLLECTIONS.map((col) => (
            <button
              key={col.category}
              type="button"
              onClick={() => {
                onSelectCategory(col.category);
                onNavigate('collections');
              }}
              className="group text-left bg-[#161412] border border-[#C6A15B]/30 hover:border-[#C6A15B] transition-all duration-200 hover:-translate-y-0.5 cursor-pointer flex flex-col"
            >
              <div className="aspect-[4/3] w-full overflow-hidden bg-[#0D0C0B]">
                <SareeImage
                  src={col.image}
                  alt={col.title}
                  fallbackTitle={col.title}
                  className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.04]"
                />
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-serif text-xl font-semibold text-[#F6EFE2] group-hover:text-[#E5C573] transition-colors">
                    {col.title}
                  </h3>
                  <p className="mt-1.5 text-sm text-[#C5B8A5] leading-relaxed">
                    {col.subtitle}
                  </p>
                </div>
                <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-[#E5C573]">
                  <span>Browse Collection</span>
                  <ArrowRight
                    className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* 4. NEW ARRIVALS & BEST SELLERS SHOWCASE */}
      <section className="bg-[#12100E] border-y border-[#C6A15B]/30 py-16 sm:py-20">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <p className="text-xs tracking-[0.14em] uppercase text-[#E5C573] font-medium">
                Curated Sarees · Store Offers
              </p>
              <h2 className="mt-2 font-serif text-3xl sm:text-4xl font-semibold text-[#F6EFE2]">
                {showcaseTab === 'new' ? 'New Arrivals' : 'Best Sellers'}
              </h2>
              <p className="mt-2 text-sm text-[#C5B8A5] max-w-xl">
                Preview real Vastralayam Silks sarees with dual mannequin-in-store and original
                photographs, honest weave details, and special discounted INR pricing.
              </p>
            </div>

            <div
              role="tablist"
              aria-label="Showcase selection"
              className="inline-flex p-1 bg-[#0D0C0B] border border-[#C6A15B]/40 self-start md:self-auto"
            >
              <button
                type="button"
                role="tab"
                aria-selected={showcaseTab === 'new'}
                onClick={() => setShowcaseTab('new')}
                className={`px-5 py-2 text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                  showcaseTab === 'new'
                    ? 'bg-[#C6A15B] text-[#0D0C0B]'
                    : 'text-[#C5B8A5] hover:text-[#F6EFE2]'
                }`}
              >
                New Arrivals
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={showcaseTab === 'best'}
                onClick={() => setShowcaseTab('best')}
                className={`px-5 py-2 text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                  showcaseTab === 'best'
                    ? 'bg-[#C6A15B] text-[#0D0C0B]'
                    : 'text-[#C5B8A5] hover:text-[#F6EFE2]'
                }`}
              >
                Best Sellers
              </button>
            </div>
          </div>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {displayedProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onViewDetails={onViewProduct}
              />
            ))}
          </div>

          <div className="mt-10 text-center">
            <button
              type="button"
              onClick={() => {
                onSelectCategory('All');
                onNavigate('collections');
              }}
              className="inline-flex items-center gap-2 px-7 py-3 text-sm font-semibold bg-[#C6A15B] text-[#0D0C0B] hover:bg-[#E5C573] transition-colors cursor-pointer"
            >
              <span>Explore Full Catalogue & Prices</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </section>

      {/* 5. WHY CHOOSE VASTRALAYAM SILKS + CLIENT TESTIMONIALS */}
      <section className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-6 space-y-6">
            <div>
              <p className="text-xs tracking-[0.14em] uppercase text-[#E5C573] font-medium">
                Our Promise
              </p>
              <h2 className="mt-2 font-serif text-3xl sm:text-4xl font-semibold text-[#F6EFE2]">
                Why Choose Vastralayam Silks
              </h2>
            </div>

            <div className="divide-y divide-[#C6A15B]/25 border-y border-[#C6A15B]/25">
              {HERITAGE_PILLARS.map((pillar) => (
                <div key={pillar.number} className="py-5 flex gap-4">
                  <span className="font-serif text-lg font-semibold text-[#E5C573] tabular-nums shrink-0">
                    {pillar.number}
                  </span>
                  <div>
                    <h3 className="font-serif text-xl font-semibold text-[#F6EFE2]">
                      {pillar.title}
                    </h3>
                    <p className="mt-1 text-sm text-[#C5B8A5] leading-relaxed">
                      {pillar.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-6 space-y-6">
            <div>
              <p className="text-xs tracking-[0.14em] uppercase text-[#E5C573] font-medium">
                Patron Stories
              </p>
              <h2 className="mt-2 font-serif text-3xl sm:text-4xl font-semibold text-[#F6EFE2]">
                Trusted by Families Across Hyderabad
              </h2>
            </div>

            <div className="space-y-4">
              {TESTIMONIALS.map((item) => (
                <blockquote
                  key={item.author}
                  className="bg-[#161412] border border-[#C6A15B]/35 p-6"
                >
                  <p className="text-[#F6EFE2] leading-relaxed italic font-serif text-lg sm:text-xl">
                    “{item.quote}”
                  </p>
                  <footer className="mt-4 pt-3 border-t border-[#C6A15B]/20 flex items-center justify-between gap-2 text-xs text-[#C5B8A5]">
                    <span className="font-semibold text-[#E5C573]">{item.author}</span>
                    <span>{item.context}</span>
                  </footer>
                </blockquote>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 6. INSTAGRAM GALLERY PREVIEW */}
      <section className="bg-[#12100E] border-t border-[#C6A15B]/30 py-16">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-8">
            <div>
              <p className="text-xs tracking-[0.14em] uppercase text-[#E5C573] font-medium">
                Visual Journal
              </p>
              <h2 className="mt-2 font-serif text-3xl sm:text-4xl font-semibold text-[#F6EFE2]">
                Follow Our Sarees on Instagram
              </h2>
            </div>
            <a
              href={settings.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-medium bg-[#161412] text-[#E5C573] border border-[#C6A15B]/55 hover:bg-[#C6A15B] hover:text-[#0D0C0B] transition-colors self-start sm:self-auto"
            >
              <Instagram className="w-4 h-4" aria-hidden="true" />
              <span>{settings.instagramHandle}</span>
            </a>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {instagramPreviews.map((img) => (
              <button
                key={img.alt}
                type="button"
                onClick={() => onNavigate('gallery')}
                className="group relative aspect-square overflow-hidden border border-[#C6A15B]/35 bg-[#0D0C0B] cursor-pointer"
                aria-label={`Open gallery: ${img.alt}`}
              >
                <SareeImage
                  src={img.src}
                  alt={img.alt}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-[#090807]/0 group-hover:bg-[#090807]/40 transition-colors flex items-center justify-center">
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0D0C0B]/95 border border-[#C6A15B] text-[#E5C573] text-xs font-medium">
                    <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>View Gallery</span>
                  </span>
                </div>
              </button>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-[#C5B8A5]">
            <span className="inline-flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-[#E5C573]" aria-hidden="true" />
              <span>Mannequin + Original Photo Transparency</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-[#E5C573]" aria-hidden="true" />
              <span>Nagaram Showroom Walk-ins Welcome</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-[#E5C573]" aria-hidden="true" />
              <span>Pan-India Insured Dispatch</span>
            </span>
          </div>
        </div>
      </section>
    </div>
  );
};
