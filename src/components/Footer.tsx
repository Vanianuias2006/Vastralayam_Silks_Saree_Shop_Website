import React from 'react';
import { Instagram, MapPin, MessageCircle, Phone } from 'lucide-react';
import { BRAND_ASSETS } from '../data/defaultStore';
import { PageRoute, SiteSettings } from '../types';
import {
  GOOGLE_MAPS_URL,
  PRIMARY_PHONE_DISPLAY,
  PRIMARY_PHONE_LINK,
  SECONDARY_PHONE_DISPLAY,
  SECONDARY_PHONE_LINK,
  STORE_ADDRESS_LINES,
  buildGeneralWhatsAppUrl,
} from '../utils/whatsapp';

interface FooterProps {
  settings: SiteSettings;
  onNavigate: (page: PageRoute) => void;
}

export const Footer: React.FC<FooterProps> = ({ settings, onNavigate }) => {
  return (
    <footer className="bg-[#070605] text-[#F6EFE2] border-t border-[#C6A15B]/45">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-[#C6A15B]/25">
          {/* Brand Column with Gold-Framed Official Logo */}
          <div className="space-y-4">
            <div className="flex items-center gap-3.5">
              <div className="p-1 bg-[#FAF4EC] border border-[#C6A15B] shrink-0">
                <img
                  src={BRAND_ASSETS.logo}
                  alt="Vastralayam Silks — Grace in Every Weave"
                  className="w-15 h-15 object-cover block"
                />
              </div>
              <div>
                <h2 className="font-serif text-xl tracking-[0.06em] text-[#F6EFE2]">
                  VASTRALAYAM SILKS
                </h2>
                <p className="text-xs text-[#E5C573] mt-0.5">Grace in Every Weave</p>
              </div>
            </div>
            <p className="text-sm text-[#C5B8A5] leading-relaxed">
              Curated Indian handloom silks, bridal Kanchipuram weaves, Pochampally Ikkats,
              and timeless designer sarees personally selected with warmth and authenticity.
            </p>
            <div className="pt-1 flex items-center gap-4">
              <a
                href={settings.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-[#E5C573] hover:text-[#F6EFE2] transition-colors"
              >
                <Instagram className="w-4 h-4" aria-hidden="true" />
                <span>{settings.instagramHandle}</span>
              </a>
            </div>
          </div>

          {/* Explore Links */}
          <div className="space-y-3">
            <h3 className="font-serif text-lg text-[#E5C573]">Explore Saree Store</h3>
            <ul className="space-y-2.5 text-sm text-[#C5B8A5]">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('home')}
                  className="hover:text-[#F6EFE2] transition-colors cursor-pointer"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('collections')}
                  className="hover:text-[#F6EFE2] transition-colors cursor-pointer"
                >
                  Collections with Prices
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('gallery')}
                  className="hover:text-[#F6EFE2] transition-colors cursor-pointer"
                >
                  Saree Gallery
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('purchase')}
                  className="hover:text-[#F6EFE2] transition-colors cursor-pointer"
                >
                  Purchase & Ordering
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('contact')}
                  className="hover:text-[#F6EFE2] transition-colors cursor-pointer"
                >
                  Visit & Contact
                </button>
              </li>
            </ul>
          </div>

          {/* Store Address */}
          <div className="space-y-3">
            <h3 className="font-serif text-lg text-[#E5C573]">Hyderabad Showroom</h3>
            <address className="not-italic text-sm text-[#C5B8A5] leading-relaxed">
              {STORE_ADDRESS_LINES.map((line) => (
                <div key={line}>{line}</div>
              ))}
            </address>
            <a
              href={GOOGLE_MAPS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-[#E5C573] hover:text-[#F6EFE2] transition-colors pt-1"
            >
              <MapPin className="w-3.5 h-3.5" aria-hidden="true" />
              <span>View on Google Maps</span>
            </a>
          </div>

          {/* Concierge & Hours */}
          <div className="space-y-3">
            <h3 className="font-serif text-lg text-[#E5C573]">Direct Store Concierge</h3>
            <div className="space-y-2 text-sm text-[#C5B8A5]">
              <a
                href={PRIMARY_PHONE_LINK}
                className="flex items-center gap-2 hover:text-[#F6EFE2] transition-colors tabular-nums"
              >
                <Phone className="w-3.5 h-3.5 text-[#C6A15B]" aria-hidden="true" />
                <span>{PRIMARY_PHONE_DISPLAY}</span>
              </a>
              <a
                href={SECONDARY_PHONE_LINK}
                className="flex items-center gap-2 hover:text-[#F6EFE2] transition-colors tabular-nums"
              >
                <Phone className="w-3.5 h-3.5 text-[#C6A15B]" aria-hidden="true" />
                <span>{SECONDARY_PHONE_DISPLAY}</span>
              </a>
              <a
                href={buildGeneralWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-2 px-4 py-2 text-xs font-semibold bg-[#C6A15B] text-[#0D0C0B] hover:bg-[#E5C573] transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5" aria-hidden="true" />
                <span>WhatsApp Store</span>
              </a>
            </div>
            <div className="pt-2 text-xs text-[#A39683] space-y-1">
              <p>{settings.hoursWeekdays}</p>
              <p>{settings.hoursSunday}</p>
            </div>
          </div>
        </div>

        <div className="pt-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-[#A39683]">
          <p>© {new Date().getFullYear()} Vastralayam Silks · Nagaram, Hyderabad. All rights reserved.</p>
          <button
            type="button"
            onClick={() => onNavigate('admin')}
            className="text-[#E5C573] hover:text-[#F6EFE2] underline underline-offset-4 transition-colors cursor-pointer"
          >
            Owner Catalogue Manager
          </button>
        </div>
      </div>
    </footer>
  );
};
