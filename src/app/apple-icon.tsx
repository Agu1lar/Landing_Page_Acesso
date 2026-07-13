import { ImageResponse } from 'next/og';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

/**
 * Ícone para iOS / “Adicionar à tela de início”.
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
          <path d="M32 8 L54 52 H10 Z" fill="#FFFFFF" />
        </svg>
      </div>
    ),
    { ...size },
  );
}
