import photoAliases from '@/data/equipment-photo-aliases.json';

const aliasMap = photoAliases as Record<string, string>;

let variantsBySlug: Map<string, Set<string>> | null = null;

function getVariantsBySlug() {
  if (variantsBySlug) {
    return variantsBySlug;
  }

  variantsBySlug = new Map();

  const link = (left: string, right: string) => {
    if (!variantsBySlug!.has(left)) {
      variantsBySlug!.set(left, new Set());
    }
    if (!variantsBySlug!.has(right)) {
      variantsBySlug!.set(right, new Set());
    }
    variantsBySlug.get(left)!.add(right);
    variantsBySlug.get(right)!.add(left);
  };

  for (const [from, to] of Object.entries(aliasMap)) {
    link(from, to);
  }

  return variantsBySlug;
}

/**
 * Returns slug variants linked through equipment-photo-aliases.json (includes the slug itself).
 */
export function getEquipmentSlugVariants(slug: string) {
  const variants = new Set<string>([slug]);
  const linked = getVariantsBySlug().get(slug);

  if (linked) {
    for (const value of linked) {
      variants.add(value);
    }
  }

  return variants;
}

/**
 * Returns true when any slug variant is managed in Postgres (active or archived).
 */
export function isSlugManagedInPostgres(slug: string, managedSlugs: Set<string>) {
  for (const variant of getEquipmentSlugVariants(slug)) {
    if (managedSlugs.has(variant)) {
      return true;
    }
  }

  return false;
}
