import { ImageResponse } from 'next/og';
import { brand } from '@/lib/brand';
import { getEquipmentBySlug } from '@/lib/equipment';
import { CATEGORY_LABELS } from '@/types/equipment';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

type OgImageProps = {
  params: Promise<{ slug: string }>;
};

export default async function EquipmentOpenGraphImage(props: OgImageProps) {
  const { slug } = await props.params;
  const equipment = await getEquipmentBySlug(slug);
  const title = equipment?.name ?? 'Equipamento para locação';
  const category = equipment ? CATEGORY_LABELS[equipment.category] : 'Locação';

  return new ImageResponse(
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        width: '100%',
        height: '100%',
        padding: 64,
        background: 'linear-gradient(135deg, #faf5f5 0%, #f3ecec 100%)',
        color: '#0f172a',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <p style={{ fontSize: 24, fontWeight: 600, color: '#c41e24', margin: 0 }}>{brand.name}</p>
      <p style={{ fontSize: 48, fontWeight: 700, lineHeight: 1.15, margin: 0, maxWidth: 1000 }}>
        {title}
      </p>
      <p style={{ fontSize: 22, color: '#475569', margin: 0 }}>
        {category} · Valores sob consulta · BH e região metropolitana
      </p>
    </div>,
    { ...size },
  );
}
