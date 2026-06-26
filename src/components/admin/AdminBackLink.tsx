import Link from 'next/link';

type AdminBackLinkProps = {
  href: string;
  label: string;
};

/**
 * Back navigation link for admin edit pages.
 */
export function AdminBackLink(props: AdminBackLinkProps) {
  return (
    <Link
      className="inline-flex items-center text-sm font-medium text-neutral-600 hover:text-neutral-900"
      href={props.href}
    >
      <span aria-hidden className="mr-1">
        ←
      </span>
      {props.label}
    </Link>
  );
}
