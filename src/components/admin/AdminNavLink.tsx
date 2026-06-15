'use client';

import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { isAdminNavActive } from '@/lib/admin-nav';
import { Link } from '@/libs/I18nNavigation';

type AdminNavLinkProps = {
  href: string;
  label: string;
  icon?: ReactNode;
};

/**
 * Sidebar navigation link with active state for the admin shell.
 */
export function AdminNavLink(props: AdminNavLinkProps) {
  const pathname = usePathname();
  const active = isAdminNavActive(pathname, props.href);

  return (
    <Link
      className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
        active
          ? 'bg-white/10 text-white shadow-sm ring-1 ring-white/10'
          : 'text-slate-300 hover:bg-white/5 hover:text-white'
      }`}
      href={props.href}
    >
      {props.icon ? <span className="shrink-0 opacity-90">{props.icon}</span> : null}
      <span>{props.label}</span>
    </Link>
  );
}
