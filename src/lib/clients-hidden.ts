const STORAGE_KEY = 'acesso-admin-hidden-clients';

/** Loads client ids hidden from the admin list for this browser session. */
export function loadHiddenClientIds(): number[] {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.filter((value): value is number => typeof value === 'number' && value > 0);
  } catch {
    return [];
  }
}

/** Hides client ids from the admin list until the browser tab/session is cleared. */
export function hideClientIds(ids: number[]) {
  if (typeof window === 'undefined' || ids.length === 0) {
    return;
  }

  const next = new Set([...loadHiddenClientIds(), ...ids]);
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
}

/** Removes ids from the hidden list (e.g. after restoring from database). */
export function unhideClientIds(ids: number[]) {
  if (typeof window === 'undefined' || ids.length === 0) {
    return;
  }

  const remove = new Set(ids);
  const next = loadHiddenClientIds().filter((id) => !remove.has(id));
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}
