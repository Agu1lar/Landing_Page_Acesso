export type WhatsAppOSOpenOptions = {
  phone: string;
  name?: string;
  email?: string;
  message?: string;
  cartItems?: unknown[];
  pageUrl?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  tags?: string[];
};

declare global {
  interface Window {
    WhatsAppOS?: {
      openWhatsApp: (options: WhatsAppOSOpenOptions) => void;
    };
  }
}

export {};
