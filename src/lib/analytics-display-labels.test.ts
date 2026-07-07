import { describe, expect, it } from 'vitest';
import {
  formatCampaignName,
  formatDevice,
  formatEquipmentAnalyticsLabel,
  formatOriginForOutgoingMessage,
  formatSitePath,
  formatTrafficSource,
  formatWhatsAppOrigin,
} from '@/lib/analytics-display-labels';

describe('analytics display labels', () => {
  it('maps whatsapp origin codes to plain language', () => {
    expect(formatWhatsAppOrigin('site-header')).toBe('Topo do site (menu principal)');
    expect(formatWhatsAppOrigin('site-flutuante')).toBe('Botão flutuante (canto da tela)');
  });

  it('simplifies origins in outgoing messages', () => {
    expect(formatOriginForOutgoingMessage('site-header')).toBe('site');
    expect(formatOriginForOutgoingMessage('site-orcamento')).toBe('site');
    expect(formatOriginForOutgoingMessage('site')).toBe('site');
    expect(formatOriginForOutgoingMessage('')).toBe('site');
  });

  it('humanizes unknown site-* origins', () => {
    expect(formatWhatsAppOrigin('site-foo-bar')).toBe('Foo Bar');
  });

  it('maps common site paths', () => {
    expect(formatSitePath('/')).toBe('Página inicial');
    expect(formatSitePath('/pt-BR/equipamentos')).toBe('Catálogo de equipamentos');
    expect(formatSitePath('/equipamentos/plataforma-articulada')).toBe(
      'Ficha: Plataforma Articulada',
    );
  });

  it('labels traffic and devices', () => {
    expect(formatTrafficSource('direto')).toBe('Acesso direto (sem link de campanha)');
    expect(formatDevice('desktop')).toBe('Computador');
  });

  it('shortens multi-item lead equipment lines', () => {
    expect(
      formatEquipmentAnalyticsLabel('Compactador · Placa · Betoneira', 'lead'),
    ).toBe('Compactador e mais 2 itens');
    expect(formatEquipmentAnalyticsLabel('—', 'whatsapp')).toBe(
      'Clique sem equipamento específico',
    );
  });

  it('formats empty campaigns', () => {
    expect(formatCampaignName('(sem campanha)')).toBe('Sem campanha vinculada');
  });
});
