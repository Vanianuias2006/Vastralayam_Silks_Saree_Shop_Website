import React, { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Expand, MessageCircle, X } from 'lucide-react';
import { GalleryItem, GallerySection, SareeProduct } from '../types';
import { buildGeneralWhatsAppUrl } from '../utils/whatsapp';
import { SareeImage } from '../components/SareeImage';

interface GalleryPageProps {
  gallery: GalleryItem[];
  products: SareeProduct[];
  onViewProduct: (product: SareeProduct) => void;
}

const SECTIONS: Array<'All' | GallerySection> = [
  'All',
  'Silk',
  'Traditional',
  'Designer',
  'Festive',
];

export const GalleryPage: React.FC<GalleryPageProps> = ({
  gallery,
  products,
  onViewProduct,
}) => {
  const [activeSection, setActiveSection] = useState<'All' | GallerySection>('All');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const visibleItems = useMemo(() => {
    if (activeSection === 'All') return gallery;
    return gallery.filter((item) => item.section === activeSection);
  }, [gallery, activeSection]);

  const activeLightboxItem =
    lightboxIndex !== null && visibleItems[lightboxIndex]
      ? visibleItems[lightboxIndex]
      : null;

  useEffect(() => {
    if (lightboxIndex === null) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setLightboxIndex(null);
      } else if (e.key === 'ArrowRight') {
        setLightboxIndex((prev) =>
          prev === null ? null : (prev + 1) % visibleItems.length
        );
      } else if (e.key === 'ArrowLeft') {
        setLightboxIndex((prev) =>
          prev === null ? null : (prev - 1 + visibleItems.length) % visibleItems.length
        );
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [lightboxIndex, visibleItems.length]);

  const linkedProduct = activeLightboxItem?.linkedProductId
    ? products.find((p) => p.id === activeLightboxItem.linkedProductId)
    : undefined;

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      {/* Header */}
      <div className="pb-8 border-b border-[#C6A15B]/30 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <p className="text-xs tracking-[0.14em] uppercase text-[#E5C573] font-medium">
            Showroom Lookbook
          </p>
          <h1 className="mt-2 font-serif text-4xl sm:text-5xl font-semibold text-[#F6EFE2]">
            The Saree Gallery
          </h1>
          <p className="mt-3 text-sm sm:text-base text-[#C5B8A5] max-w-2xl leading-relaxed">
            Explore close-up silk textures, handwoven borders, and ceremonial drapes. Click any
            photograph for full-screen showroom inspection.
          </p>
        </div>

        {/* Section Filter Tabs */}
        <div
          className="inline-flex flex-wrap gap-1 p-1 bg-[#161412] border border-[#C6A15B]/35 self-start lg:self-auto"
          role="tablist"
          aria-label="Gallery sections"
        >
          {SECTIONS.map((sec) => {
            const active = activeSection === sec;
            return (
              <button
                key={sec}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => {
                  setActiveSection(sec);
                  setLightboxIndex(null);
                }}
                className={`px-4 py-2 text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                  active
                    ? 'bg-[#C6A15B] text-[#0D0C0B]'
                    : 'text-[#C5B8A5] hover:text-[#F6EFE2]'
                }`}
              >
                {sec === 'All' ? 'All Sections' : `${sec} Sarees`}
              </button>
            );
          })}
        </div>
      </div>

      {/* Editorial Masonry-Inspired Grid */}
      {visibleItems.length > 0 ? (
        <div className="mt-10 columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
          {visibleItems.map((item, idx) => (
            <figure
              key={item.id}
              className="break-inside-avoid group relative bg-[#161412] border border-[#C6A15B]/30 hover:border-[#C6A15B] transition-colors overflow-hidden"
            >
              <button
                type="button"
                onClick={() => setLightboxIndex(idx)}
                className="relative w-full block text-left overflow-hidden cursor-pointer focus-visible:outline-2 focus-visible:outline-[#C6A15B]"
                aria-label={`Inspect ${item.title} in full screen`}
              >
                <div
                  className={
                    idx % 3 === 0
                      ? 'aspect-[4/5]'
                      : idx % 2 === 0
                      ? 'aspect-square'
                      : 'aspect-[4/3]'
                  }
                >
                  <SareeImage
                    src={item.image}
                    alt={item.title}
                    fallbackTitle={item.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                  />
                </div>

                {/* Hover Expand Icon */}
                <span className="absolute top-3 right-3 w-9 h-9 bg-[#090807]/90 text-[#E5C573] border border-[#C6A15B]/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <Expand className="w-4 h-4" aria-hidden="true" />
                </span>

                {/* Caption */}
                <figcaption className="p-5 bg-[#161412] border-t border-[#C6A15B]/25">
                  <div className="text-xs text-[#E5C573] font-medium">
                    {item.section} · {item.categoryLabel}
                  </div>
                  <h2 className="mt-1 font-serif text-xl font-semibold text-[#F6EFE2]">
                    {item.title}
                  </h2>
                  <p className="mt-1.5 text-xs sm:text-sm text-[#C5B8A5] leading-relaxed">
                    {item.caption}
                  </p>
                </figcaption>
              </button>
            </figure>
          ))}
        </div>
      ) : (
        <div className="my-12 bg-[#161412] border border-[#C6A15B]/35 p-10 text-center max-w-md mx-auto">
          <p className="font-serif text-2xl text-[#F6EFE2]">
            No gallery visuals in this section yet.
          </p>
          <button
            type="button"
            onClick={() => setActiveSection('All')}
            className="mt-4 px-5 py-2.5 text-xs font-semibold bg-[#C6A15B] text-[#0D0C0B] cursor-pointer"
          >
            View All Gallery Sections
          </button>
        </div>
      )}

      {/* Full-Screen Lightbox */}
      {activeLightboxItem && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={activeLightboxItem.title}
          className="fixed inset-0 z-50 bg-[#050404]/95 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8"
        >
          <button
            type="button"
            onClick={() => setLightboxIndex(null)}
            aria-label="Close full-screen viewer"
            className="absolute top-4 right-4 sm:top-6 sm:right-6 w-11 h-11 bg-[#161412] text-[#E5C573] border border-[#C6A15B] hover:bg-[#C6A15B] hover:text-[#0D0C0B] transition-colors flex items-center justify-center cursor-pointer z-10"
          >
            <X className="w-5 h-5" />
          </button>

          {visibleItems.length > 1 && (
            <>
              <button
                type="button"
                onClick={() =>
                  setLightboxIndex((prev) =>
                    prev === null
                      ? 0
                      : (prev - 1 + visibleItems.length) % visibleItems.length
                  )
                }
                aria-label="Previous saree photograph"
                className="hidden sm:flex absolute left-6 top-1/2 -translate-y-1/2 w-11 h-11 bg-[#161412]/90 text-[#E5C573] border border-[#C6A15B]/60 hover:bg-[#C6A15B] hover:text-[#0D0C0B] items-center justify-center cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() =>
                  setLightboxIndex((prev) =>
                    prev === null ? 0 : (prev + 1) % visibleItems.length
                  )
                }
                aria-label="Next saree photograph"
                className="hidden sm:flex absolute right-6 top-1/2 -translate-y-1/2 w-11 h-11 bg-[#161412]/90 text-[#E5C573] border border-[#C6A15B]/60 hover:bg-[#C6A15B] hover:text-[#0D0C0B] items-center justify-center cursor-pointer"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          <div className="max-w-5xl w-full bg-[#161412] border border-[#C6A15B]/55 grid grid-cols-1 lg:grid-cols-12 overflow-hidden max-h-[90vh]">
            <div className="lg:col-span-8 bg-[#090807] max-h-[55vh] lg:max-h-[85vh] overflow-hidden flex items-center justify-center">
              <SareeImage
                src={activeLightboxItem.image}
                alt={activeLightboxItem.title}
                className="w-full h-full object-contain"
              />
            </div>
            <div className="lg:col-span-4 p-6 sm:p-8 flex flex-col justify-between bg-[#161412] overflow-y-auto">
              <div>
                <p className="text-xs tracking-wider uppercase text-[#E5C573] font-medium">
                  {activeLightboxItem.section} · {activeLightboxItem.categoryLabel}
                </p>
                <h2 className="mt-2 font-serif text-2xl sm:text-3xl font-semibold text-[#F6EFE2]">
                  {activeLightboxItem.title}
                </h2>
                <p className="mt-3 text-sm text-[#C5B8A5] leading-relaxed">
                  {activeLightboxItem.caption}
                </p>
              </div>

              <div className="mt-8 pt-6 border-t border-[#C6A15B]/25 space-y-3">
                {linkedProduct && (
                  <button
                    type="button"
                    onClick={() => {
                      setLightboxIndex(null);
                      onViewProduct(linkedProduct);
                    }}
                    className="w-full py-3 px-4 text-xs font-semibold bg-[#C6A15B] text-[#0D0C0B] hover:bg-[#E5C573] transition-colors cursor-pointer"
                  >
                    View Saree Price & Purchase Details
                  </button>
                )}
                <a
                  href={buildGeneralWhatsAppUrl(
                    `Hello Vastralayam Silks! I viewed "${activeLightboxItem.title}" in your Gallery and would like to know more about availability.`
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 text-xs font-medium border border-[#C6A15B]/45 text-[#F6EFE2] hover:border-[#E5C573] hover:text-[#E5C573] transition-colors"
                >
                  <MessageCircle className="w-4 h-4 text-[#E5C573]" aria-hidden="true" />
                  <span>Enquire on WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
