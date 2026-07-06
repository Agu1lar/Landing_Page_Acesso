import { describe, expect, it } from 'vitest';
import {
  clientSortKey,
  hasClientIdentityKey,
  normalizeClientIdentity,
  pickClientDisplayName,
  tokenizeClientSearchQuery,
} from '@/lib/client-identity';

describe('client identity', () => {
  it('normalizes email and phone for matching', () => {
    const identity = normalizeClientIdentity({
      displayName: ' João Silva ',
      email: 'Joao@Example.com',
      phone: '(31) 99999-0000',
      googleSub: 'google-sub-123',
    });

    expect(identity.email).toBe('joao@example.com');
    expect(identity.phoneNormalized).toBe('31999990000');
    expect(identity.googleSub).toBe('google-sub-123');
    expect(hasClientIdentityKey(identity)).toBe(true);
  });

  it('requires at least one stable identifier', () => {
    const identity = normalizeClientIdentity({
      displayName: 'Anônimo',
    });

    expect(hasClientIdentityKey(identity)).toBe(false);
  });

  it('sorts ignoring accents and leading articles', () => {
    expect(clientSortKey('Álvaro Costa')).toBe('alvaro costa');
    expect(clientSortKey('de Souza')).toBe('souza');
    expect(
      clientSortKey('Ana').localeCompare(clientSortKey('Bruno'), 'pt-BR'),
    ).toBeLessThan(0);
  });

  it('tokenizes multi-word search queries', () => {
    expect(tokenizeClientSearchQuery('  belo  horizonte  ')).toEqual(['belo', 'horizonte']);
  });

  it('prefers a richer display name when merging', () => {
    expect(pickClientDisplayName('joao', 'João da Silva')).toBe('João da Silva');
    expect(pickClientDisplayName('Maria Oliveira', 'Maria')).toBe('Maria Oliveira');
  });
});
