import { ImageResponse } from 'next/og';

export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

/**
 * Favicon oficial: triângulo contornado com abertura no inferior esquerdo (marca Acesso).
 */
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
        }}
      >
        <svg height="32" viewBox="0 0 64 64" width="32">
          <circle cx="32" cy="32" fill="#A51C1C" r="32" />
          <path
            d="M17 41 L32 11 L51 49 L13 49"
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
