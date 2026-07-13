import { ImageResponse } from 'next/og';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

/**
 * Ícone Apple — mesma marca com abertura no inferior esquerdo.
 */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          background: '#A51C1C',
          borderRadius: 36,
        }}
      >
        <svg height="140" viewBox="0 0 64 64" width="140">
          <path
            d="M17 41 L32 11 L51 49 L21 49"
            fill="none"
            stroke="#FFFFFF"
            strokeLinecap="butt"
            strokeLinejoin="miter"
            strokeMiterlimit={8}
            strokeWidth={6}
          />
        </svg>
      </div>
    ),
    { ...size },
  );
}
