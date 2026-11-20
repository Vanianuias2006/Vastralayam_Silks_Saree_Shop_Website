import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  MessageCircle,
  Minus,
  Phone,
  Plus,
  ShieldCheck,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { PageRoute, SareeProduct } from '../types';
import {
  PRIMARY_PHONE_DISPLAY,
  PRIMARY_PHONE_LINK,
  buildWhatsAppOrderUrl,
  formatINR,
} from '../utils/whatsapp';
import { SareeImage } from '../components/SareeImage';

interface PurchasePageProps {
  products: SareeProduct[];
  selectedProduct: SareeProduct | null;
  onSelectProduct: (product: SareeProduct) => void;
  onNavigate: (page: PageRoute) => void;
}

export const PurchasePage: React.FC<PurchasePageProps> = ({
  products,
  selectedProduct,
  onSelectProduct,
  onNavigate,
}) => {
  const activeProduct = selectedProduct || products[0] || null;
  const [quantity, setQuantity] = useState(1);
  const [zoomed, setZoomed] = useState(false);
  const [activePhotoTab, setActivePhotoTab] = useState<'mannequin' | 'original'>('mannequin');
  const [showOrderPanel, setShowOrderPanel] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerCity, setCustomerCity] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [orderSubmittedId, setOrderSubmittedId] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    setActivePhotoTab('mannequin');
    setZoomed(false);
  }, [activeProduct?.id]);

  if (!activeProduct) {
    return (
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h1 className="font-serif text-3xl text-[#F6EFE2]">No sarees currently in catalogue</h1>
        <button
          type="button"
          onClick={() => onNavigate('collections')}
          className="mt-5 px-6 py-3 text-xs font-semibold bg-[#C6A15B] text-[#0D0C0B] cursor-pointer"
        >
          Return to Collections
        </button>
      </div>
    );
  }

  const hasDualPhotos = Boolean(
    activeProduct.originalImage && activeProduct.originalImage.trim()
  );
  const displayedImage =
    activePhotoTab === 'original' && hasDualPhotos
      ? activeProduct.originalImage!
      : activeProduct.image;

  const hasDiscount =
    typeof activeProduct.originalPrice === 'number' &&
    activeProduct.originalPrice > activeProduct.price;
  const discountPercent = hasDiscount
    ? Math.round(
        ((activeProduct.originalPrice! - activeProduct.price) /
          activeProduct.originalPrice!) *
          100
      )
    : 0;

  const totalEstimate = activeProduct.price * quantity;
  const directWhatsAppUrl = buildWhatsAppOrderUrl(activeProduct.name, activeProduct.price, {
    quantity,
  });

  const handleConfirmPurchaseRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    if (!customerName.trim() || !customerPhone.trim()) {
      setSubmitError(
        'Please enter your name and phone number so our store can confirm availability.'
      );
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: customerName.trim(),
          phone: customerPhone.trim(),
          productName: activeProduct.name,
          message: `Purchase Confirmation Request · Saree: ${activeProduct.name} · Unit Price: ₹${formatINR(
            activeProduct.price
          )} · Qty: ${quantity} · Estimated Total: ₹${formatINR(totalEstimate)}${
            customerCity.trim() ? ` · City: ${customerCity.trim()}` : ''
          }${orderNotes.trim() ? ` · Notes: ${orderNotes.trim()}` : ''}`,
        }),
      });
      const data = (await response.json()) as { inquiry?: { id: string }; error?: string };
      if (!response.ok) {
        throw new Error(data.error || 'Could not record request.');
      }
      setOrderSubmittedId(data.inquiry?.id || `REQ-${Date.now()}`);
    } catch (err) {
      setSubmitError(
        err instanceof Error
          ? err.message
          : 'Unable to save request right now. Please confirm directly on WhatsApp.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      {/* Top Breadcrumb + Quick Saree Switcher */}
      <div className="pb-6 border-b border-[#C6A15B]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => onNavigate('collections')}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-[#C5B8A5] hover:text-[#E5C573] transition-colors cursor-pointer self-start"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          <span>Back to Collections</span>
        </button>

        <div className="flex items-center gap-2.5">
          <label
            htmlFor="purchase-saree-select"
            className="text-xs text-[#C5B8A5] whitespace-nowrap"
          >
            Select Saree:
          </label>
          <select
            id="purchase-saree-select"
            value={activeProduct.id}
            onChange={(e) => {
              const found = products.find((p) => p.id === e.target.value);
              if (found) {
                onSelectProduct(found);
                setQuantity(1);
                setOrderSubmittedId(null);
                setShowOrderPanel(false);
              }
            }}
            className="bg-[#161412] border border-[#C6A15B]/45 px-3 py-2 text-xs sm:text-sm text-[#F6EFE2] max-w-[260px] sm:max-w-xs focus:outline-none focus:border-[#E5C573] cursor-pointer"
          >
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} — ₹{formatINR(p.price)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Contiguous Purchase Module */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
        {/* Left Sticky Image Frame + Mannequin / Original Photo Switcher */}
        <div className="lg:col-span-6 lg:sticky lg:top-24 space-y-4">
          <div className="p-2 border border-[#C6A15B]/55 bg-[#161412]">
            <div className="relative bg-[#0D0C0B] border border-[#C6A15B]/35 overflow-hidden">
              <div className="aspect-[4/3] w-full overflow-hidden">
                <SareeImage
                  src={displayedImage}
                  alt={`${activeProduct.name} — ${
                    activePhotoTab === 'original' ? 'Original Saree Photo' : 'Mannequin View'
                  }`}
                  fallbackTitle={activeProduct.name}
                  className={`w-full h-full object-cover transition-transform duration-500 ${
                    zoomed ? 'scale-125 cursor-zoom-out' : 'scale-100 cursor-zoom-in'
                  }`}
                />
              </div>
              <button
                type="button"
                onClick={() => setZoomed((z) => !z)}
                aria-label={zoomed ? 'Reset image zoom' : 'Zoom in on silk weave'}
                className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-[#090807]/90 text-[#E5C573] border border-[#C6A15B]/55 hover:bg-[#C6A15B] hover:text-[#0D0C0B] transition-colors cursor-pointer"
              >
                {zoomed ? (
                  <>
                    <ZoomOut className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Reset Zoom</span>
                  </>
                ) : (
                  <>
                    <ZoomIn className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Inspect Weave</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Dual Photo Selector (Mannequin vs. Original Saree Photo) */}
          {hasDualPhotos && (
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setActivePhotoTab('mannequin')}
                className={`p-2 bg-[#161412] border text-left transition-colors cursor-pointer flex items-center gap-3 ${
                  activePhotoTab === 'mannequin'
                    ? 'border-[#E5C573]'
                    : 'border-[#C6A15B]/30 hover:border-[#C6A15B]'
                }`}
              >
                <div className="w-14 h-11 shrink-0 overflow-hidden bg-[#0D0C0B]">
                  <SareeImage
                    src={activeProduct.image}
                    alt="Mannequin view thumbnail"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <span className="block text-xs font-semibold text-[#F6EFE2]">
                    Mannequin View
                  </span>
                  <span className="block text-[11px] text-[#C5B8A5]">Store drape look</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setActivePhotoTab('original')}
                className={`p-2 bg-[#161412] border text-left transition-colors cursor-pointer flex items-center gap-3 ${
                  activePhotoTab === 'original'
                    ? 'border-[#E5C573]'
                    : 'border-[#C6A15B]/30 hover:border-[#C6A15B]'
                }`}
              >
                <div className="w-14 h-11 shrink-0 overflow-hidden bg-[#0D0C0B]">
                  <SareeImage
                    src={activeProduct.originalImage!}
                    alt="Original saree photo thumbnail"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <span className="block text-xs font-semibold text-[#F6EFE2]">
                    Original Photo
                  </span>
                  <span className="block text-[11px] text-[#C5B8A5]">Actual saree photograph</span>
                </div>
              </button>
            </div>
          )}
        </div>

        {/* Right Purchase Details Module */}
        <div className="lg:col-span-6 bg-[#161412] border border-[#C6A15B]/40 p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-2 text-xs text-[#C5B8A5]">
            <span className="text-[#E5C573] font-medium">{activeProduct.category}</span>
            <span aria-hidden="true">·</span>
            <span>{activeProduct.availability}</span>
            {activeProduct.isSample && (
              <>
                <span aria-hidden="true">·</span>
                <span>Sample Entry</span>
              </>
            )}
            {activeProduct.sku && (
              <>
                <span aria-hidden="true">·</span>
                <span className="tabular-nums">{activeProduct.sku}</span>
              </>
            )}
          </div>

          <h1 className="mt-3 font-serif text-3xl sm:text-4xl font-semibold text-[#F6EFE2] leading-tight">
            {activeProduct.name}
          </h1>

          {/* Price & Optional Discount Display */}
          <div className="mt-4 flex flex-wrap items-baseline gap-3 pb-5 border-b border-[#C6A15B]/25">
            <span className="text-2xl sm:text-3xl font-semibold text-[#F6EFE2] tabular-nums">
              ₹{formatINR(activeProduct.price)}
            </span>
            {hasDiscount && (
              <>
                <span className="text-base text-[#A39683] line-through tabular-nums">
                  ₹{formatINR(activeProduct.originalPrice!)}
                </span>
                {discountPercent > 0 && (
                  <span className="text-xs font-semibold text-[#E5C573] tabular-nums">
                    · Save {discountPercent}%
                  </span>
                )}
              </>
            )}
            <span className="text-xs text-[#C5B8A5]">
              {activeProduct.isSample
                ? '(Sample Price — Editable in Catalogue Manager)'
                : 'Inclusive of silk inspection & muslin wrap'}
            </span>
          </div>

          <p className="mt-5 text-sm sm:text-base text-[#C5B8A5] leading-relaxed">
            {activeProduct.description}
          </p>

          {/* Product Details Specification Grid */}
          <dl className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 py-5 border-y border-[#C6A15B]/25 text-xs sm:text-sm">
            <div>
              <dt className="text-[#E5C573] font-medium">Weave & Fabric</dt>
              <dd className="mt-1 text-[#F6EFE2]">{activeProduct.fabricDetails}</dd>
            </div>
            <div>
              <dt className="text-[#E5C573] font-medium">Blouse Piece</dt>
              <dd className="mt-1 text-[#F6EFE2]">{activeProduct.blouseIncluded}</dd>
            </div>
            <div>
              <dt className="text-[#E5C573] font-medium">Dimensions</dt>
              <dd className="mt-1 text-[#F6EFE2]">{activeProduct.lengthSpec}</dd>
            </div>
            <div>
              <dt className="text-[#E5C573] font-medium">Care</dt>
              <dd className="mt-1 text-[#F6EFE2]">{activeProduct.careInstructions}</dd>
            </div>
          </dl>

          {/* Quantity Selection & Total */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium text-[#F6EFE2]">Quantity</span>
              <div className="inline-flex items-center border border-[#C6A15B]/50 bg-[#0D0C0B]">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                  className="w-10 h-10 flex items-center justify-center text-[#E5C573] hover:bg-[#1F1C18] cursor-pointer"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span
                  className="w-10 text-center text-sm font-semibold text-[#F6EFE2] tabular-nums"
                  aria-live="polite"
                >
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                  aria-label="Increase quantity"
                  className="w-10 h-10 flex items-center justify-center text-[#E5C573] hover:bg-[#1F1C18] cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="text-right">
              <span className="block text-xs text-[#C5B8A5]">Order Estimate</span>
              <span className="text-xl font-semibold text-[#E5C573] tabular-nums">
                ₹{formatINR(totalEstimate)}
              </span>
            </div>
          </div>

          {/* Primary Purchase & WhatsApp Actions */}
          <div className="mt-7 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => {
                setShowOrderPanel((prev) => !prev);
                setOrderSubmittedId(null);
              }}
              className="py-3.5 px-6 text-sm font-semibold bg-[#C6A15B] text-[#0D0C0B] hover:bg-[#E5C573] transition-colors duration-200 cursor-pointer"
            >
              Purchase Now
            </button>
            <a
              href={directWhatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 py-3.5 px-6 text-sm font-medium bg-[#0D0C0B] text-[#F6EFE2] border border-[#C6A15B]/55 hover:border-[#E5C573] hover:text-[#E5C573] transition-colors duration-200"
            >
              <MessageCircle className="w-4 h-4 text-[#E5C573]" aria-hidden="true" />
              <span>WhatsApp Order</span>
            </a>
          </div>

          {/* Transparent Ordering Note */}
          <div className="mt-5 flex items-start gap-2.5 text-xs text-[#C5B8A5] leading-relaxed">
            <ShieldCheck className="w-4 h-4 text-[#E5C573] shrink-0 mt-0.5" aria-hidden="true" />
            <p>
              Orders are confirmed personally by our store team via WhatsApp ({PRIMARY_PHONE_DISPLAY})
              so we can share live natural-light saree photos and confirm stock before payment.
            </p>
          </div>

          {/* Direct Purchase Confirmation Panel */}
          {showOrderPanel && (
            <div className="mt-6 pt-6 border-t border-[#C6A15B]/35">
              {orderSubmittedId ? (
                <div className="bg-[#0D0C0B] border border-[#C6A15B]/55 p-5 space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#E5C573] shrink-0 mt-0.5" />
                    <div>
                      <h2 className="font-serif text-xl font-semibold text-[#F6EFE2]">
                        Order Request Recorded
                      </h2>
                      <p className="mt-1 text-xs text-[#C5B8A5] tabular-nums">
                        Reference: {orderSubmittedId} · {activeProduct.name} × {quantity} (₹
                        {formatINR(totalEstimate)})
                      </p>
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm text-[#C5B8A5] leading-relaxed">
                    Tap below to send your confirmed request directly to Vastralayam Silks on
                    WhatsApp for instant stock verification and payment details.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <a
                      href={buildWhatsAppOrderUrl(activeProduct.name, activeProduct.price, {
                        quantity,
                        customerName,
                        city: customerCity,
                        notes: orderNotes,
                      })}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold bg-[#C6A15B] text-[#0D0C0B] hover:bg-[#E5C573] transition-colors"
                    >
                      <MessageCircle className="w-4 h-4" aria-hidden="true" />
                      <span>Confirm on WhatsApp Now</span>
                    </a>
                    <a
                      href={PRIMARY_PHONE_LINK}
                      className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-medium border border-[#C6A15B]/45 text-[#F6EFE2] hover:border-[#E5C573] transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5 text-[#E5C573]" aria-hidden="true" />
                      <span>Call {PRIMARY_PHONE_DISPLAY}</span>
                    </a>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleConfirmPurchaseRequest} className="space-y-4">
                  <h2 className="font-serif text-xl font-semibold text-[#F6EFE2]">
                    Reserve & Confirm Order via Store Concierge
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="order-name" className="block text-xs font-medium text-[#F6EFE2] mb-1">
                        Your Name *
                      </label>
                      <input
                        id="order-name"
                        type="text"
                        required
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Full name"
                        className="w-full px-3.5 py-2.5 text-sm bg-[#0D0C0B] border border-[#C6A15B]/45 text-[#F6EFE2] focus:outline-none focus:border-[#E5C573]"
                      />
                    </div>
                    <div>
                      <label htmlFor="order-phone" className="block text-xs font-medium text-[#F6EFE2] mb-1">
                        WhatsApp / Mobile Number *
                      </label>
                      <input
                        id="order-phone"
                        type="tel"
                        required
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full px-3.5 py-2.5 text-sm bg-[#0D0C0B] border border-[#C6A15B]/45 text-[#F6EFE2] focus:outline-none focus:border-[#E5C573]"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="order-city" className="block text-xs font-medium text-[#F6EFE2] mb-1">
                        Delivery City / Locality
                      </label>
                      <input
                        id="order-city"
                        type="text"
                        value={customerCity}
                        onChange={(e) => setCustomerCity(e.target.value)}
                        placeholder="e.g., Hyderabad"
                        className="w-full px-3.5 py-2.5 text-sm bg-[#0D0C0B] border border-[#C6A15B]/45 text-[#F6EFE2] focus:outline-none focus:border-[#E5C573]"
                      />
                    </div>
                    <div>
                      <label htmlFor="order-notes" className="block text-xs font-medium text-[#F6EFE2] mb-1">
                        Occasion / Drape Request
                      </label>
                      <input
                        id="order-notes"
                        type="text"
                        value={orderNotes}
                        onChange={(e) => setOrderNotes(e.target.value)}
                        placeholder="e.g., Requesting video call"
                        className="w-full px-3.5 py-2.5 text-sm bg-[#0D0C0B] border border-[#C6A15B]/45 text-[#F6EFE2] focus:outline-none focus:border-[#E5C573]"
                      />
                    </div>
                  </div>

                  {submitError && (
                    <p className="text-xs text-red-200 bg-red-950/60 border border-red-400/50 px-3 py-2">
                      {submitError}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-6 py-2.5 text-xs font-semibold bg-[#C6A15B] text-[#0D0C0B] hover:bg-[#E5C573] disabled:opacity-60 transition-colors cursor-pointer"
                    >
                      {submitting ? 'Recording Request...' : 'Submit & Proceed to WhatsApp'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowOrderPanel(false)}
                      className="px-4 py-2.5 text-xs text-[#C5B8A5] hover:text-[#F6EFE2] cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
