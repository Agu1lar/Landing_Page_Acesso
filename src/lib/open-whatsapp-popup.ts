/**
 * Opens a blank tab synchronously (must run in the user-click call stack).
 * Avoids popup blockers after await fetch, and avoids noopener features that
 * make window.open always return null even when the tab opens.
 */
export function openBlankTabForWhatsApp(): Window | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const popup = window.open('about:blank', '_blank');
  if (popup) {
    try {
      popup.opener = null;
    } catch {
      // Some browsers may freeze opener; ignore.
    }
  }
  return popup;
}

/**
 * Navigates a previously opened blank tab to the WhatsApp URL.
 * @returns true when navigation was applied to an open tab.
 */
export function navigateWhatsAppPopup(popup: Window | null, whatsappUrl: string): boolean {
  if (!popup || popup.closed) {
    return false;
  }

  try {
    popup.location.href = whatsappUrl;
    return true;
  } catch {
    return false;
  }
}

/**
 * Closes a blank tab opened for WhatsApp when the lead request fails.
 */
export function closeWhatsAppPopup(popup: Window | null) {
  if (!popup || popup.closed) {
    return;
  }

  try {
    popup.close();
  } catch {
    // Ignore close failures.
  }
}
