import { ImageResponse } from 'next/og';
import { brand } from '@/lib/brand';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          padding: 64,
          background: 'linear-gradient(135deg, #faf5f5 0%, #f3ecec 100%)',
          color: '#0f172a',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <p style={{ fontSize: 28, fontWeight: 600, color: '#c41e24', margin: 0 }}>{brand.name}</p>
        <p style={{ fontSize: 52, fontWeight: 700, lineHeight: 1.15, marginTop: 24, maxWidth: 900 }}>
          Locação de equipamentos para construção civil
        </p>
        <p style={{ fontSize: 26, marginTop: 24, color: '#475569' }}>
          Belo Horizonte e região metropolitana · Desde {brand.foundedYear}
        </p>
      </div>
    ),
    { ...size },
  );
}
