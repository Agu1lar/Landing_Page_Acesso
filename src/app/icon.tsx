import { ImageResponse } from 'next/og';

export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

/**
 * Favicon da aba — marca Acesso (círculo vermelho + triângulo contornado).
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
            d="M32 12 L50 48 H14 Z"
            fill="none"
            stroke="#FFFFFF"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="5.5"
          />
        </svg>
      </div>
    ),
    { ...size },
  );
}
