import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';

interface SareeImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackTitle?: string;
}

export const SareeImage: React.FC<SareeImageProps> = ({
  src,
  alt,
  className = 'w-full h-full object-cover',
  fallbackTitle,
}) => {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <div
        className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-[#1B1814] via-[#12100E] to-[#0D0C0B] border border-[#C6A15B]/35"
        role="img"
        aria-label={alt}
      >
        <div className="w-10 h-10 rounded-full border border-[#C6A15B]/60 flex items-center justify-center mb-3 text-[#E5C573]">
          <Sparkles className="w-4 h-4" />
        </div>
        <p className="font-serif text-base text-[#F6EFE2] leading-snug max-w-[18ch]">
          {fallbackTitle || alt}
        </p>
        <span className="mt-1 text-xs text-[#C5B8A5]">Vastralayam Silks</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      className={className}
      loading="lazy"
    />
  );
};
