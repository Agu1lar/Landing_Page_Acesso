import { normalizeClientIdentity } from '@/lib/client-identity';

const STORAGE_KEY = 'acesso-admin-hidden-clients-v2';
const LEGACY_SESSION_KEY = 'acesso-admin-hidden-clients';

export type HideableClient = {
  id: number;
  displayName?: string | null;
  email?: string | null;
  phone?: string | null;
  phoneNormalized?: string | null;
  googleSub?: string | null;
};

type HiddenClientStore = {
  ids: number[];
  identityKeys: string[];
};

function readJsonStorage(key: string, storage: Storage): HiddenClientStore | null {
  try {
    const raw = storage.getItem(key);
    if (!raw) {
      return null;
    }
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') {
      return null;
    }
    const record = parsed as Partial<HiddenClientStore>;
    const ids = Array.isArray(record.ids)
      ? record.ids.filter((value): value is number => typeof value === 'number' && value > 0)
      : [];
    const identityKeys = Array.isArray(record.identityKeys)
      ? record.identityKeys.filter((value): value is string => typeof value === 'string' && value.length > 0)
      : [];
    return { ids, identityKeys };
  } catch {
    return null;
  }
}

function emptyStore(): HiddenClientStore {
  return { ids: [], identityKeys: [] };
}

function mergeStores(...stores: HiddenClientStore[]): HiddenClientStore {
  return {
    ids: [...new Set(stores.flatMap((store) => store.ids))],
    identityKeys: [...new Set(stores.flatMap((store) => store.identityKeys))],
  };
}

function persistStore(store: HiddenClientStore) {
  if (typeof window === 'undefined') {
    return;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

function loadLegacySessionIds(): number[] {
  if (typeof window === 'undefined') {
    return [];
  }
  try {
    const raw = sessionStorage.getItem(LEGACY_SESSION_KEY);
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

/** Loads hidden client ids and identity keys from browser storage. */
export function loadHiddenClientStore(): HiddenClientStore {
  if (typeof window === 'undefined') {
    return emptyStore();
  }

  const current = readJsonStorage(STORAGE_KEY, localStorage) ?? emptyStore();
  const legacyIds = loadLegacySessionIds();
  if (legacyIds.length === 0) {
    return current;
  }

  const merged = mergeStores(current, { ids: legacyIds, identityKeys: [] });
  persistStore(merged);
  sessionStorage.removeItem(LEGACY_SESSION_KEY);
  return merged;
}

/** @deprecated Use loadHiddenClientStore — kept for compatibility. */
export function loadHiddenClientIds(): number[] {
  return loadHiddenClientStore().ids;
}

/** Builds stable identity keys that survive client row recreation after delete/backfill. */
export function buildPersistedIdentityKeys(client: HideableClient): string[] {
  const identity = normalizeClientIdentity({
    displayName: client.displayName ?? 'Visitante',
    email: client.email,
    phone: client.phone,
    googleSub: client.googleSub,
  });

  const keys: string[] = [];
  if (identity.email) {
    keys.push(`email:${identity.email}`);
  }
  if (identity.phoneNormalized) {
    keys.push(`phone:${identity.phoneNormalized}`);
  }
  if (identity.googleSub) {
    keys.push(`google:${identity.googleSub}`);
  }

  if (keys.length === 0) {
    const name = client.displayName?.trim().toLowerCase();
    if (name && name.length >= 3 && name !== 'visitante') {
      keys.push(`name:${name}`);
    }
  }

  return keys;
}

/** True when the client should stay hidden from the admin list in this browser. */
export function isClientHidden(client: HideableClient, store: HiddenClientStore = loadHiddenClientStore()) {
  if (store.ids.includes(client.id)) {
    return true;
  }

  const keys = buildPersistedIdentityKeys(client);
  return keys.some((key) => store.identityKeys.includes(key));
}

/** Hides clients from the admin list (by id + e-mail/telefone/Google). */
export function hideClients(clients: HideableClient[]) {
  if (typeof window === 'undefined' || clients.length === 0) {
    return;
  }

  const store = loadHiddenClientStore();
  const ids = new Set(store.ids);
  const identityKeys = new Set(store.identityKeys);

  for (const client of clients) {
    ids.add(client.id);
    for (const key of buildPersistedIdentityKeys(client)) {
      identityKeys.add(key);
    }
  }

  persistStore({
    ids: [...ids],
    identityKeys: [...identityKeys],
  });
}

/** @deprecated Use hideClients — kept for compatibility. */
export function hideClientIds(ids: number[]) {
  hideClients(ids.map((id) => ({ id })));
}

/** Removes clients from the hidden list. */
export function unhideClients(clients: HideableClient[]) {
  if (typeof window === 'undefined' || clients.length === 0) {
    return;
  }

  const removeIds = new Set(clients.map((client) => client.id));
  const removeKeys = new Set(clients.flatMap((client) => buildPersistedIdentityKeys(client)));
  const store = loadHiddenClientStore();

  persistStore({
    ids: store.ids.filter((id) => !removeIds.has(id)),
    identityKeys: store.identityKeys.filter((key) => !removeKeys.has(key)),
  });
}

/** @deprecated Use unhideClients — kept for compatibility. */
export function unhideClientIds(ids: number[]) {
  unhideClients(ids.map((id) => ({ id })));
}
