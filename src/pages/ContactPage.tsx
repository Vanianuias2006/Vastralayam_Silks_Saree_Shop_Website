import React, { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  ExternalLink,
  Instagram,
  MapPin,
  MessageCircle,
  Phone,
  Send,
} from 'lucide-react';
import { BRAND_ASSETS } from '../data/defaultStore';
import { SiteSettings } from '../types';
import {
  GOOGLE_MAPS_QUERY,
  GOOGLE_MAPS_URL,
  PRIMARY_PHONE_DISPLAY,
  PRIMARY_PHONE_LINK,
  SECONDARY_PHONE_DISPLAY,
  SECONDARY_PHONE_LINK,
  STORE_ADDRESS_LINES,
  buildGeneralWhatsAppUrl,
} from '../utils/whatsapp';
import { SareeImage } from '../components/SareeImage';

interface ContactPageProps {
  settings: SiteSettings;
}

export const ContactPage: React.FC<ContactPageProps> = ({ settings }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedData, setSubmittedData] = useState<{
    id: string;
    name: string;
    phone: string;
    message: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !phone.trim() || !message.trim()) {
      setError('Please enter your name, phone number, and message.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          message: message.trim(),
        }),
      });
      const data = (await response.json()) as {
        inquiry?: { id: string; name: string; phone: string; message: string };
        error?: string;
      };
      if (!response.ok || !data.inquiry) {
        throw new Error(data.error || 'Could not send enquiry.');
      }
      setSubmittedData(data.inquiry);
      setName('');
      setPhone('');
      setMessage('');
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to submit form right now. Please message us on WhatsApp directly.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const mapEmbedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(
    GOOGLE_MAPS_QUERY
  )}&t=&z=16&ie=UTF8&iwloc=&output=embed`;

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      {/* Header */}
      <div className="pb-8 border-b border-[#C6A15B]/30">
        <p className="text-xs tracking-[0.14em] uppercase text-[#E5C573] font-medium">
          Visit Our Saree Store
        </p>
        <h1 className="mt-2 font-serif text-4xl sm:text-5xl font-semibold text-[#F6EFE2]">
          Contact Vastralayam Silks
        </h1>
        <p className="mt-3 text-sm sm:text-base text-[#C5B8A5] max-w-2xl leading-relaxed">
          Visit our Nagaram saree showroom in Hyderabad to explore handpicked silks in person, or
          connect directly via phone and WhatsApp.
        </p>
      </div>

      {/* Contact Details + Enquiry Form */}
      <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left: Store Address, Mother Branding Card, Click-to-Call, Hours & Instagram */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#161412] border border-[#C6A15B]/40 p-6 sm:p-8 space-y-6">
            {/* Personal Branding Header with Mother Portrait */}
            <div className="flex items-center gap-4 pb-5 border-b border-[#C6A15B]/25">
              <div className="w-16 h-16 overflow-hidden border border-[#C6A15B] bg-[#0D0C0B] shrink-0">
                <SareeImage
                  src={settings.founderPortraitUrl || BRAND_ASSETS.founderPortrait}
                  alt="Founder of Vastralayam Silks"
                  className="w-full h-full object-cover object-top"
                />
              </div>
              <div>
                <h2 className="font-serif text-2xl font-semibold text-[#F6EFE2]">
                  Vastralayam Silks
                </h2>
                <p className="text-xs text-[#E5C573] font-medium">
                  Grace in Every Weave · Family-Run Saree Store
                </p>
              </div>
            </div>

            <div>
              <div className="flex items-start gap-3 text-sm text-[#C5B8A5]">
                <MapPin className="w-4 h-4 text-[#E5C573] shrink-0 mt-1" aria-hidden="true" />
                <address className="not-italic leading-relaxed">
                  {STORE_ADDRESS_LINES.map((line) => (
                    <div key={line}>{line}</div>
                  ))}
                </address>
              </div>
            </div>

            {/* Click-to-call & WhatsApp Actions */}
            <div className="pt-5 border-t border-[#C6A15B]/25 space-y-3">
              <p className="text-xs tracking-wider uppercase text-[#E5C573] font-medium">
                Direct Phone & WhatsApp
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2.5">
                <a
                  href={PRIMARY_PHONE_LINK}
                  className="inline-flex items-center justify-between px-4 py-3 text-sm font-medium bg-[#0D0C0B] text-[#F6EFE2] border border-[#C6A15B]/40 hover:border-[#E5C573] transition-colors tabular-nums"
                >
                  <span className="inline-flex items-center gap-2.5">
                    <Phone className="w-4 h-4 text-[#E5C573]" aria-hidden="true" />
                    <span>{PRIMARY_PHONE_DISPLAY}</span>
                  </span>
                  <span className="text-xs text-[#C5B8A5]">Call Primary</span>
                </a>

                <a
                  href={SECONDARY_PHONE_LINK}
                  className="inline-flex items-center justify-between px-4 py-3 text-sm font-medium bg-[#0D0C0B] text-[#F6EFE2] border border-[#C6A15B]/40 hover:border-[#E5C573] transition-colors tabular-nums"
                >
                  <span className="inline-flex items-center gap-2.5">
                    <Phone className="w-4 h-4 text-[#E5C573]" aria-hidden="true" />
                    <span>{SECONDARY_PHONE_DISPLAY}</span>
                  </span>
                  <span className="text-xs text-[#C5B8A5]">Call Alternate</span>
                </a>

                <a
                  href={buildGeneralWhatsAppUrl(
                    'Hello Vastralayam Silks! I would like to visit your Nagaram showroom or enquire about your saree collections.'
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold bg-[#C6A15B] text-[#0D0C0B] hover:bg-[#E5C573] transition-colors"
                >
                  <MessageCircle className="w-4 h-4" aria-hidden="true" />
                  <span>Message on WhatsApp</span>
                </a>
              </div>
            </div>

            {/* Editable Business Hours */}
            <div className="pt-5 border-t border-[#C6A15B]/25 space-y-2">
              <div className="flex items-center gap-2 text-xs tracking-wider uppercase text-[#E5C573] font-medium">
                <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Business Hours</span>
              </div>
              <p className="text-sm text-[#F6EFE2]">{settings.hoursWeekdays}</p>
              <p className="text-sm text-[#C5B8A5]">{settings.hoursSunday}</p>
            </div>

            {/* Editable Instagram Link */}
            <div className="pt-5 border-t border-[#C6A15B]/25 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs tracking-wider uppercase text-[#E5C573] font-medium">
                  Instagram
                </p>
                <p className="text-sm text-[#F6EFE2] mt-0.5">{settings.instagramHandle}</p>
              </div>
              <a
                href={settings.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium bg-[#0D0C0B] text-[#E5C573] border border-[#C6A15B]/55 hover:bg-[#C6A15B] hover:text-[#0D0C0B] transition-colors"
              >
                <Instagram className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Follow</span>
              </a>
            </div>
          </div>
        </div>

        {/* Right: Contact Form */}
        <div className="lg:col-span-7 bg-[#161412] border border-[#C6A15B]/40 p-6 sm:p-8">
          <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#F6EFE2]">
            Send a Saree Enquiry
          </h2>
          <p className="mt-2 text-sm text-[#C5B8A5]">
            Looking for a specific weave, bridal wedding sarees, or a showroom visit time? Share
            your message below.
          </p>

          {submittedData ? (
            <div className="mt-6 bg-[#0D0C0B] border border-[#C6A15B]/55 p-6 space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#E5C573] shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-serif text-xl font-semibold text-[#F6EFE2]">
                    Thank you, {submittedData.name}
                  </h3>
                  <p className="mt-1 text-sm text-[#C5B8A5]">
                    Your enquiry ({submittedData.id}) has been received by Vastralayam Silks. We
                    will reach out to {submittedData.phone} shortly.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3 pt-2">
                <a
                  href={buildGeneralWhatsAppUrl(
                    `Hello Vastralayam Silks! My name is ${submittedData.name} (${submittedData.phone}). ${submittedData.message}`
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold bg-[#C6A15B] text-[#0D0C0B] hover:bg-[#E5C573] transition-colors"
                >
                  <MessageCircle className="w-4 h-4" aria-hidden="true" />
                  <span>Also Send via WhatsApp</span>
                </a>
                <button
                  type="button"
                  onClick={() => setSubmittedData(null)}
                  className="px-4 py-2.5 text-xs font-medium border border-[#C6A15B]/45 text-[#F6EFE2] hover:border-[#E5C573] cursor-pointer"
                >
                  Send Another Message
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="contact-name"
                    className="block text-xs font-medium text-[#F6EFE2] mb-1.5"
                  >
                    Full Name *
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className="w-full px-4 py-3 text-sm bg-[#0D0C0B] border border-[#C6A15B]/45 text-[#F6EFE2] placeholder:text-[#A39683] focus:outline-none focus:border-[#E5C573]"
                  />
                </div>
                <div>
                  <label
                    htmlFor="contact-phone"
                    className="block text-xs font-medium text-[#F6EFE2] mb-1.5"
                  >
                    Phone Number *
                  </label>
                  <input
                    id="contact-phone"
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-4 py-3 text-sm bg-[#0D0C0B] border border-[#C6A15B]/45 text-[#F6EFE2] placeholder:text-[#A39683] focus:outline-none focus:border-[#E5C573]"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="contact-message"
                  className="block text-xs font-medium text-[#F6EFE2] mb-1.5"
                >
                  Message *
                </label>
                <textarea
                  id="contact-message"
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us about the saree weave, occasion, or showroom visit time you prefer..."
                  className="w-full px-4 py-3 text-sm bg-[#0D0C0B] border border-[#C6A15B]/45 text-[#F6EFE2] placeholder:text-[#A39683] focus:outline-none focus:border-[#E5C573]"
                />
              </div>

              {error && (
                <p className="text-xs text-red-200 bg-red-950/60 border border-red-400/50 px-3 py-2">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 text-sm font-semibold bg-[#C6A15B] text-[#0D0C0B] hover:bg-[#E5C573] disabled:opacity-60 transition-colors cursor-pointer"
              >
                <Send className="w-4 h-4" aria-hidden="true" />
                <span>{submitting ? 'Sending Enquiry...' : 'Send Enquiry'}</span>
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Google Maps Location Section */}
      <section className="mt-14 bg-[#161412] border border-[#C6A15B]/40">
        <div className="p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#C6A15B]/25">
          <div>
            <p className="text-xs tracking-[0.14em] uppercase text-[#E5C573] font-medium">
              Directions
            </p>
            <h2 className="mt-1 font-serif text-2xl sm:text-3xl font-semibold text-[#F6EFE2]">
              Nagaram, Hyderabad Location Map
            </h2>
            <p className="mt-1 text-sm text-[#C5B8A5]">
              304, 3rd Floor, Arunodaya Prides, Opposite Maruti Gardens, Near Blinkit, Annapurna
              Colony, Nagaram – 500083
            </p>
          </div>
          <a
            href={GOOGLE_MAPS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold bg-[#C6A15B] text-[#0D0C0B] hover:bg-[#E5C573] transition-colors whitespace-nowrap self-start sm:self-auto"
          >
            <span>Open in Google Maps</span>
            <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
          </a>
        </div>

        <div className="w-full h-[340px] sm:h-[400px] bg-[#0D0C0B]">
          <iframe
            title="Vastralayam Silks Nagaram Hyderabad Location Map"
            src={mapEmbedUrl}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="w-full h-full border-0"
          />
        </div>
      </section>
    </div>
  );
};
