import { describe, expect, it } from 'vitest';
import {
  collectClientAliasInserts,
  mergeClientFields,
  pickClientDisplayName,
  pickRichestScalar,
} from '@/lib/client-identity';

describe('pickRichestScalar', () => {
  it('prefers non-null values', () => {
    expect(pickRichestScalar(null, 'Empresa ABC')).toBe('Empresa ABC');
    expect(pickRichestScalar('João', null)).toBe('João');
  });

  it('prefers longer informative strings', () => {
    expect(pickRichestScalar('ACME', 'ACME Locações Ltda')).toBe('ACME Locações Ltda');
  });
});

describe('mergeClientFields', () => {
  it('merges names, dates and richest scalars', () => {
    const merged = mergeClientFields([
      {
        displayName: 'maria',
        email: 'maria@x.com',
        phone: null,
        phoneNormalized: null,
        googleSub: null,
        company: 'ACME',
        firstSeenAt: new Date('2026-01-10T12:00:00.000Z'),
        lastActivityAt: new Date('2026-02-01T12:00:00.000Z'),
      },
      {
        displayName: 'Maria Silva',
        email: 'maria.silva@y.com',
        phone: '(31) 99999-8888',
        phoneNormalized: '31999998888',
        googleSub: 'google-123',
        company: null,
        firstSeenAt: new Date('2026-01-05T12:00:00.000Z'),
        lastActivityAt: new Date('2026-03-01T12:00:00.000Z'),
      },
    ]);

    expect(merged.displayName).toBe(pickClientDisplayName('maria', 'Maria Silva'));
    expect(merged.email).toBe('maria.silva@y.com');
    expect(merged.phone).toBe('(31) 99999-8888');
    expect(merged.googleSub).toBe('google-123');
    expect(merged.company).toBe('ACME');
    expect(merged.firstSeenAt.toISOString()).toBe('2026-01-05T12:00:00.000Z');
    expect(merged.lastActivityAt.toISOString()).toBe('2026-03-01T12:00:00.000Z');
  });
});

describe('collectClientAliasInserts', () => {
  it('stores secondary emails and phones as aliases', () => {
    const primary = mergeClientFields([
      {
        displayName: 'Maria',
        email: 'maria@x.com',
        phone: '(31) 99999-8888',
        phoneNormalized: '31999998888',
        googleSub: null,
        company: null,
        firstSeenAt: new Date('2026-01-01T12:00:00.000Z'),
        lastActivityAt: new Date('2026-02-01T12:00:00.000Z'),
      },
      {
        displayName: 'Maria Silva',
        email: 'maria.silva@y.com',
        phone: null,
        phoneNormalized: null,
        googleSub: 'google-abc',
        company: null,
        firstSeenAt: new Date('2026-01-02T12:00:00.000Z'),
        lastActivityAt: new Date('2026-02-02T12:00:00.000Z'),
      },
    ]);

    const aliases = collectClientAliasInserts(
      primary,
      [
        {
          displayName: 'Maria',
          email: 'maria@x.com',
          phone: '(31) 99999-8888',
          phoneNormalized: '31999998888',
          googleSub: null,
          company: null,
          firstSeenAt: new Date('2026-01-01T12:00:00.000Z'),
          lastActivityAt: new Date('2026-02-01T12:00:00.000Z'),
        },
        {
          displayName: 'Maria Silva',
          email: 'maria.silva@y.com',
          phone: null,
          phoneNormalized: null,
          googleSub: 'google-abc',
          company: null,
          firstSeenAt: new Date('2026-01-02T12:00:00.000Z'),
          lastActivityAt: new Date('2026-02-02T12:00:00.000Z'),
        },
      ],
      1,
    );

    expect(aliases).toEqual([
      { clientId: 1, kind: 'email', value: 'maria@x.com' },
    ]);
    expect(primary.googleSub).toBe('google-abc');
  });
});
