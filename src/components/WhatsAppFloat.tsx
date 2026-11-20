import React from 'react';
import { MessageCircle } from 'lucide-react';
import { buildGeneralWhatsAppUrl } from '../utils/whatsapp';

export const WhatsAppFloat: React.FC = () => {
  return (
    <a
      href={buildGeneralWhatsAppUrl()}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with Vastralayam Silks on WhatsApp"
      className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-2.5 px-4 py-3 bg-[#161412] text-[#E5C573] border border-[#C6A15B] shadow-xl hover:bg-[#C6A15B] hover:text-[#0D0C0B] transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E5C573]"
    >
      <MessageCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
      <span className="text-xs font-semibold tracking-wide whitespace-nowrap hidden sm:inline">
        WhatsApp Concierge
      </span>
    </a>
  );
};
