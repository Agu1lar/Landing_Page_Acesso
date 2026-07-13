import { ImageResponse } from 'next/og';

export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

/**
 * Favicon — contorno fechado com tampões nos vértices.
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
          <path d="M32 8 L54 52 H10 Z M32 20 L46 46 H18 Z" fill="#FFFFFF" fillRule="evenodd" />
          <circle cx="32" cy="8" fill="#FFFFFF" r="3.2" />
          <circle cx="54" cy="52" fill="#FFFFFF" r="3.2" />
          <circle cx="10" cy="52" fill="#FFFFFF" r="3.2" />
        </svg>
      </div>
    ),
    { ...size },
  );
}
