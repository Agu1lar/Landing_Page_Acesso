import Script from 'next/script';
import { getWhatsAppOSConfig, getWhatsAppOSWidgetScriptUrl } from '@/lib/whatsappos';

/**
 * Loads the whatsappOS widget script on marketing pages when env vars are set.
 */
export function WhatsAppOSWidget() {
  const config = getWhatsAppOSConfig();

  if (!config) {
    return null;
  }

  return (
    <Script async src={getWhatsAppOSWidgetScriptUrl(config)} strategy="afterInteractive" />
  );
}
