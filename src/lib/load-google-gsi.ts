const GIS_SCRIPT_ID = 'google-gsi-client';
const GIS_SCRIPT_SRC = 'https://accounts.google.com/gsi/client';

/** Loads the Google Identity Services client script once. */
export function loadGoogleGsiScript() {
  return new Promise<void>((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('GIS requires browser'));
      return;
    }

    if (window.google?.accounts?.id) {
      resolve();
      return;
    }

    const existing = document.getElementById(GIS_SCRIPT_ID);
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => reject(new Error('GIS load failed')), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.id = GIS_SCRIPT_ID;
    script.src = GIS_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('GIS load failed'));
    document.head.appendChild(script);
  });
}
