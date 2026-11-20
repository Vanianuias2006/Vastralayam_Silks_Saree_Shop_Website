import React, { useState } from 'react';
import { ArrowRight, MessageCircle } from 'lucide-react';
import { SareeProduct } from '../types';
import { buildWhatsAppOrderUrl, formatINR } from '../utils/whatsapp';
import { SareeImage } from './SareeImage';

interface ProductCardProps {
  product: SareeProduct;
  onViewDetails: (product: SareeProduct) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onViewDetails }) => {
  const [photoView, setPhotoView] = useState<'mannequin' | 'original'>('mannequin');
  const hasDualPhotos = Boolean(product.originalImage && product.originalImage.trim());
  const activeSrc =
    photoView === 'original' && hasDualPhotos ? product.originalImage! : product.image;

  const hasDiscount =
    typeof product.originalPrice === 'number' && product.originalPrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)
    : 0;

  const whatsappUrl = buildWhatsAppOrderUrl(product.name, product.price);
  const shortCategory = product.category.replace(/ Sarees$/, '');

  return (
    <article className="group bg-[#161412] border border-[#C6A15B]/30 flex flex-col transition-transform duration-200 hover:-translate-y-0.5 hover:border-[#C6A15B]">
      {/* 4:3 Editorial Image Container */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#0D0C0B]">
        <button
          type="button"
          onClick={() => onViewDetails(product)}
          className="w-full h-full block text-left cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C6A15B]"
          aria-label={`View details for ${product.name}`}
        >
          <SareeImage
            src={activeSrc}
            alt={`${product.name} (${photoView === 'original' ? 'Original photo' : 'Mannequin view'})`}
            fallbackTitle={product.name}
            className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
          />
        </button>

        {/* Dual Photo Switcher when both AI Mannequin & Original Photo exist */}
        {hasDualPhotos && (
          <div
            className="absolute bottom-2.5 right-2.5 inline-flex bg-[#090807]/90 border border-[#C6A15B]/55 p-0.5 backdrop-blur-sm"
            role="group"
            aria-label="Switch saree photo view"
          >
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setPhotoView('mannequin');
              }}
              className={`px-2 py-1 text-[11px] font-medium transition-colors cursor-pointer ${
                photoView === 'mannequin'
                  ? 'bg-[#C6A15B] text-[#0D0C0B]'
                  : 'text-[#C5B8A5] hover:text-[#F6EFE2]'
              }`}
            >
              Mannequin
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setPhotoView('original');
              }}
              className={`px-2 py-1 text-[11px] font-medium transition-colors cursor-pointer ${
                photoView === 'original'
                  ? 'bg-[#C6A15B] text-[#0D0C0B]'
                  : 'text-[#C5B8A5] hover:text-[#F6EFE2]'
              }`}
            >
              Original
            </button>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-5 sm:p-6 flex flex-col flex-1">
        {/* Clean Unboxed Metadata (Zero-Pill Discipline) */}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[#C5B8A5]">
          <span className="tracking-wide text-[#E5C573] font-medium">{shortCategory}</span>
          <span aria-hidden="true">·</span>
          <span>{product.availability}</span>
          {product.isSample && (
            <>
              <span aria-hidden="true">·</span>
              <span>Sample Entry</span>
            </>
          )}
          {!product.isSample && product.isNewArrival && (
            <>
              <span aria-hidden="true">·</span>
              <span>New Arrival</span>
            </>
          )}
        </div>

        {/* Saree Name */}
        <h3 className="mt-2 font-serif text-xl sm:text-2xl font-semibold text-[#F6EFE2] leading-snug">
          <button
            type="button"
            onClick={() => onViewDetails(product)}
            className="text-left hover:text-[#E5C573] transition-colors cursor-pointer"
          >
            {product.name}
          </button>
        </h3>

        {/* Price & Optional Discount in INR */}
        <div className="mt-2 flex flex-wrap items-baseline gap-2.5">
          <span className="text-lg font-semibold text-[#F6EFE2] tabular-nums">
            ₹{formatINR(product.price)}
          </span>
          {hasDiscount && (
            <>
              <span className="text-sm text-[#A39683] line-through tabular-nums">
                ₹{formatINR(product.originalPrice!)}
              </span>
              {discountPercent > 0 && (
                <span className="text-xs font-medium text-[#E5C573] tabular-nums">
                  · Save {discountPercent}%
                </span>
              )}
            </>
          )}
          {product.isSample && (
            <span className="text-xs text-[#A39683]">(Sample Price)</span>
          )}
        </div>

        {/* Short Description */}
        <p className="mt-2.5 text-sm text-[#C5B8A5] leading-relaxed line-clamp-2 flex-1">
          {product.description}
        </p>

        {/* Actions */}
        <div className="mt-5 pt-4 border-t border-[#C6A15B]/20 flex flex-col sm:flex-row gap-2.5">
          <button
            type="button"
            onClick={() => onViewDetails(product)}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-semibold bg-[#C6A15B] text-[#0D0C0B] hover:bg-[#E5C573] transition-colors duration-200 whitespace-nowrap cursor-pointer"
          >
            <span>View Details</span>
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-medium bg-[#0D0C0B] text-[#F6EFE2] border border-[#C6A15B]/45 hover:border-[#E5C573] hover:text-[#E5C573] transition-colors duration-200 whitespace-nowrap"
          >
            <MessageCircle className="w-3.5 h-3.5 text-[#E5C573]" aria-hidden="true" />
            <span>Purchase on WhatsApp</span>
          </a>
        </div>
      </div>
    </article>
  );
};
