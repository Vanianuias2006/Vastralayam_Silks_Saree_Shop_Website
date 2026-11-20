import React, { useState } from 'react';
import { Menu, MessageCircle, X } from 'lucide-react';
import { BRAND_ASSETS } from '../data/defaultStore';
import { PageRoute } from '../types';
import { buildGeneralWhatsAppUrl } from '../utils/whatsapp';

interface NavbarProps {
  currentPage: PageRoute;
  onNavigate: (page: PageRoute) => void;
}

const NAV_ITEMS: Array<{ id: PageRoute; label: string }> = [
  { id: 'home', label: 'Home' },
  { id: 'collections', label: 'Collections' },
  { id: 'gallery', label: 'Gallery' },
  { id: 'purchase', label: 'Purchase' },
  { id: 'contact', label: 'Contact' },
];

export const Navbar: React.FC<NavbarProps> = ({ currentPage, onNavigate }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNav = (page: PageRoute) => {
    setMobileMenuOpen(false);
    onNavigate(page);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#090807]/95 backdrop-blur-md border-b border-[#C6A15B]/35">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-8">
        {/* Zone 1: Gold-Framed Official Logo + Single-line Brand Wordmark */}
        <button
          type="button"
          onClick={() => handleNav('home')}
          className="inline-flex items-center gap-3 text-left group whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#C6A15B] cursor-pointer"
        >
          <span className="p-0.5 bg-[#FAF4EC] border border-[#C6A15B] shrink-0">
            <img
              src={BRAND_ASSETS.logo}
              alt="Vastralayam Silks official logo"
              className="w-10 h-10 object-cover block"
            />
          </span>
          <span className="font-serif text-xl sm:text-2xl font-semibold tracking-[0.08em] text-[#F6EFE2] group-hover:text-[#E5C573] transition-colors">
            VASTRALAYAM SILKS
          </span>
        </button>

        {/* Zone 2: 5 concise single-line text nav links */}
        <nav
          aria-label="Primary navigation"
          className="hidden md:flex items-center gap-7 text-sm font-medium"
        >
          {NAV_ITEMS.map((item) => {
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNav(item.id)}
                className={`relative py-1 whitespace-nowrap shrink-0 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#C6A15B] ${
                  isActive
                    ? 'text-[#E5C573] font-semibold'
                    : 'text-[#C5B8A5] hover:text-[#F6EFE2]'
                }`}
              >
                {item.label}
                <span
                  aria-hidden="true"
                  className={`absolute left-0 right-0 -bottom-0.5 h-[1.5px] bg-[#C6A15B] transition-transform duration-200 origin-left ${
                    isActive ? 'scale-x-100' : 'scale-x-0'
                  }`}
                />
              </button>
            );
          })}
        </nav>

        {/* Zone 3: 1 Primary Gold Action + Mobile Menu Button */}
        <div className="flex items-center gap-3 shrink-0">
          <a
            href={buildGeneralWhatsAppUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold tracking-wide bg-[#C6A15B] text-[#0D0C0B] border border-[#C6A15B] hover:bg-[#E5C573] hover:border-[#E5C573] transition-colors duration-200 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E5C573]"
          >
            <MessageCircle className="w-3.5 h-3.5" aria-hidden="true" />
            <span>WhatsApp</span>
          </a>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            className="md:hidden inline-flex items-center justify-center w-11 h-11 text-[#E5C573] border border-[#C6A15B]/45 bg-[#161412] hover:bg-[#231F1B] transition-colors cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#12100E] border-t border-[#C6A15B]/30 px-4 py-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNav(item.id)}
                className={`w-full text-left px-3 py-3 text-base flex items-center justify-between border-b border-[#C6A15B]/15 cursor-pointer ${
                  isActive
                    ? 'text-[#E5C573] font-semibold bg-[#1B1814]'
                    : 'text-[#C5B8A5] hover:text-[#F6EFE2]'
                }`}
              >
                <span>{item.label}</span>
                {isActive && (
                  <span className="text-xs text-[#C6A15B]" aria-hidden="true">
                    Active
                  </span>
                )}
              </button>
            );
          })}
          <div className="pt-3">
            <a
              href={buildGeneralWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold bg-[#C6A15B] text-[#0D0C0B] hover:bg-[#E5C573] transition-colors"
            >
              <MessageCircle className="w-4 h-4" aria-hidden="true" />
              <span>Chat on WhatsApp</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
