import { describe, expect, it } from 'vitest';
import { buildPersistedIdentityKeys, isClientHidden } from '@/lib/clients-hidden';

describe('clients-hidden', () => {
  it('matches recreated client by email even with a new id', () => {
    const keys = buildPersistedIdentityKeys({
      id: 10,
      displayName: 'Maria Silva',
      email: 'Maria@Example.com',
      phone: '(31) 99999-0000',
    });

    expect(keys).toContain('email:maria@example.com');
    expect(keys).toContain('phone:31999990000');

    const hidden = {
      ids: [10],
      identityKeys: keys,
    };

    expect(
      isClientHidden(
        {
          id: 99,
          displayName: 'Maria Silva',
          email: 'maria@example.com',
          phone: '31999990000',
        },
        hidden,
      ),
    ).toBe(true);
  });

  it('falls back to display name when no contact identifiers exist', () => {
    const keys = buildPersistedIdentityKeys({
      id: 3,
      displayName: 'Cliente Sem Contato',
    });

    expect(keys).toContain('name:cliente sem contato');
  });
});
