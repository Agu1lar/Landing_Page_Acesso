import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  closeWhatsAppPopup,
  navigateWhatsAppPopup,
  openBlankTabForWhatsApp,
} from '@/lib/open-whatsapp-popup';

describe('open-whatsapp-popup', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('opens blank tab without noopener features and clears opener', () => {
    const popup = {
      opener: {} as Window,
      closed: false,
      close: vi.fn(),
      location: { href: '' },
    };
    const openMock = vi.fn(() => popup);
    vi.stubGlobal('window', { open: openMock });

    const result = openBlankTabForWhatsApp();

    expect(openMock).toHaveBeenCalledWith('about:blank', '_blank');
    expect(result).toBe(popup);
    expect(popup.opener).toBeNull();
  });

  it('reports false when popup was blocked', () => {
    vi.stubGlobal('window', { open: vi.fn(() => null) });
    expect(openBlankTabForWhatsApp()).toBeNull();
    expect(navigateWhatsAppPopup(null, 'https://wa.me/5531999999999')).toBe(false);
  });

  it('navigates an open popup to WhatsApp URL', () => {
    const popup = {
      closed: false,
      location: { href: 'about:blank' },
      close: vi.fn(),
    } as unknown as Window;

    expect(navigateWhatsAppPopup(popup, 'https://wa.me/5531994700201?text=oi')).toBe(true);
    expect(popup.location.href).toBe('https://wa.me/5531994700201?text=oi');
  });

  it('closes blank popup on failure path', () => {
    const close = vi.fn();
    const popup = { closed: false, close } as unknown as Window;
    closeWhatsAppPopup(popup);
    expect(close).toHaveBeenCalled();
  });
});
