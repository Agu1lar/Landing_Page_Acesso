import { getEquipmentBySlug } from '@/lib/equipment';
import { buildLeadCartItemDisplay, parseLeadCartItems } from '@/lib/lead-cart';
import { Link } from '@/libs/I18nNavigation';

type LeadCartItemsListProps = {
  itemsJson: string | null | undefined;
  quantityLabel: (count: number) => string;
  catalogNameNoteLabel: (name: string) => string;
};

/**
 * Renders quote cart lines with catalog context for the lead detail page.
 */
export async function LeadCartItemsList(props: LeadCartItemsListProps) {
  const items = parseLeadCartItems(props.itemsJson);
  if (items.length === 0) {
    return null;
  }

  const rows = await Promise.all(
    items.map(async (item) => {
      const catalog = item.kind === 'equipment' ? await getEquipmentBySlug(item.slug) : null;
      const display = buildLeadCartItemDisplay(item, catalog);
      return { item, display };
    }),
  );

  return (
    <ul className="divide-y divide-neutral-100 text-sm">
      {rows.map(({ item, display }) => (
        <li className="flex flex-wrap items-start justify-between gap-2 py-3" key={`${item.slug}-${item.name}`}>
          <div className="min-w-0">
            <Link
              className="font-medium text-primary hover:underline"
              href={`/equipamentos/${item.slug}`}
            >
              {item.name}
            </Link>
            <p className="mt-0.5 text-xs text-neutral-600">{display.subtitle}</p>
            {display.catalogNameNote ? (
              <p className="mt-1 text-xs text-amber-800">
                {props.catalogNameNoteLabel(display.catalogNameNote)}
              </p>
            ) : null}
          </div>
          <span className="shrink-0 font-medium text-neutral-800">
            {props.quantityLabel(item.quantity)}
          </span>
        </li>
      ))}
    </ul>
  );
}
