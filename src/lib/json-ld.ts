import { brand } from '@/lib/brand';
import { getEquipmentImageSrc } from '@/lib/equipment-images';
import type { Equipment } from '@/types/equipment';
import { CATEGORY_LABELS } from '@/types/equipment';
import { getBaseUrl } from '@/utils/Helpers';

/**
 * LocalBusiness schema for site-wide SEO (NAP aligned with footer).
 */
export function buildLocalBusinessJsonLd() {
  const baseUrl = getBaseUrl();

  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: brand.name,
    legalName: brand.legalName,
    url: baseUrl,
    telephone: `+55${brand.phone}`,
    email: brand.email,
    foundingDate: String(brand.foundedYear),
    address: {
      '@type': 'PostalAddress',
      streetAddress: brand.address.street,
      addressLocality: brand.address.city,
      addressRegion: brand.address.state,
      postalCode: brand.address.zip,
      addressCountry: 'BR',
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '07:30',
        closes: '17:15',
      },
    ],
    areaServed: {
      '@type': 'GeoCircle',
      geoMidpoint: {
        '@type': 'GeoCoordinates',
        latitude: -19.9167,
        longitude: -43.9345,
      },
      geoRadius: '80000',
    },
  };
}

/**
 * Product schema for equipment detail pages (locação sob consulta).
 */
export function buildProductJsonLd(equipment: Equipment) {
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}/equipamentos/${equipment.slug}`;

  const imagePath = getEquipmentImageSrc(equipment.slug);

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: equipment.name,
    description: equipment.shortDescription,
    category: CATEGORY_LABELS[equipment.category],
    url,
    ...(imagePath ? { image: `${baseUrl}${imagePath}` } : {}),
    brand: {
      '@type': 'Brand',
      name: brand.name,
    },
    offers: {
      '@type': 'Offer',
      url,
      priceCurrency: 'BRL',
      availability: equipment.available
        ? 'https://schema.org/InStock'
        : 'https://schema.org/PreOrder',
      seller: {
        '@type': 'Organization',
        name: brand.name,
      },
    },
  };
}
