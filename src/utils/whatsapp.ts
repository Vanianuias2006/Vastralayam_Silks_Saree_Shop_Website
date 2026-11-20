export const PRIMARY_WHATSAPP_NUMBER = '916303930616';
export const PRIMARY_PHONE_DISPLAY = '+91 6303930616';
export const SECONDARY_PHONE_DISPLAY = '+91 8179699611';
export const SECONDARY_PHONE_LINK = 'tel:+918179699611';
export const PRIMARY_PHONE_LINK = 'tel:+916303930616';

export const STORE_ADDRESS_LINES = [
  '304, 3rd Floor, Arunodaya Prides,',
  'Opposite Maruti Gardens,',
  'Near Blinkit, Annapurna Colony,',
  'Nagaram, Hyderabad – 500083, Telangana.',
];

export const GOOGLE_MAPS_QUERY =
  'Arunodaya Prides, Opposite Maruti Gardens, Annapurna Colony, Nagaram, Hyderabad 500083';

export const GOOGLE_MAPS_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  GOOGLE_MAPS_QUERY
)}`;

export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0,
  }).format(amount);
}

export function buildWhatsAppOrderUrl(
  sareeName: string,
  price: number,
  options?: {
    quantity?: number;
    customerName?: string;
    city?: string;
    notes?: string;
  }
): string {
  const formattedPrice = formatINR(price);
  let message = `Hello Vastralayam Silks! I am interested in purchasing ${sareeName}. Price: ₹${formattedPrice}. Please share more details and availability.`;

  if (options) {
    const extras: string[] = [];
    if (options.quantity && options.quantity > 1) {
      extras.push(`Quantity: ${options.quantity}`);
    }
    if (options.customerName?.trim()) {
      extras.push(`Name: ${options.customerName.trim()}`);
    }
    if (options.city?.trim()) {
      extras.push(`City: ${options.city.trim()}`);
    }
    if (options.notes?.trim()) {
      extras.push(`Notes: ${options.notes.trim()}`);
    }
    if (extras.length > 0) {
      message += `\n\n${extras.join(' | ')}`;
    }
  }

  return `https://wa.me/${PRIMARY_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export function buildGeneralWhatsAppUrl(customMessage?: string): string {
  const text =
    customMessage ||
    'Hello Vastralayam Silks! I would like to explore your saree collections and store availability.';
  return `https://wa.me/${PRIMARY_WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}
