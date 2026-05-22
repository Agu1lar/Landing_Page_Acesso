import { SignOutButton } from '@clerk/nextjs';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/libs/I18nNavigation';

type AdminNavItem = {
  href: string;
  label: string;
};

type AdminShellProps = {
  children: React.ReactNode;
  role: 'admin' | 'comercial';
  breadcrumbs?: { label: string; href?: string }[];
};

/**
 * Sidebar layout for dashboard admin modules.
 */
export async function AdminShell(props: AdminShellProps) {
  const t = await getTranslations('DashboardLayout');

  const nav: AdminNavItem[] =
    props.role === 'admin'
      ? [
          { href: '/dashboard/equipamentos', label: t('equipment_link') },
          { href: '/dashboard/equipamentos/new', label: t('equipment_new_link') },
        ]
      : [{ href: '/dashboard/leads', label: t('leads_link') }];

  return (
    <div className="min-h-screen bg-neutral-50 lg:grid lg:grid-cols-[240px_1fr]">
      <aside className="border-b border-neutral-200 bg-surface lg:border-r lg:border-b-0">
        <div className="px-4 py-5">
          <p className="font-heading text-lg font-bold text-neutral-900">Acesso Equipamentos</p>
          <p className="mt-1 text-xs text-neutral-500">{t('admin_panel_label')}</p>
        </div>
        <nav aria-label={t('admin_nav_label')} className="px-2 pb-4 lg:pb-6">
          <ul className="space-y-1">
            {nav.map((item) => (
              <li key={item.href}>
                <Link
                  className="block rounded-lg px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900"
                  href={item.href}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="border-t border-neutral-200 px-4 py-4">
          <SignOutButton>
            <button
              className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100"
              type="button"
            >
              {t('sign_out')}
            </button>
          </SignOutButton>
        </div>
      </aside>

      <div className="min-w-0">
        {props.breadcrumbs && props.breadcrumbs.length > 0 ? (
          <nav aria-label="Breadcrumb" className="border-b border-neutral-200 bg-surface px-4 py-3 sm:px-6">
            <ol className="flex flex-wrap items-center gap-2 text-sm text-neutral-600">
              {props.breadcrumbs.map((crumb, index) => (
                <li className="flex items-center gap-2" key={`${crumb.label}-${index}`}>
                  {index > 0 ? <span aria-hidden>/</span> : null}
                  {crumb.href ? (
                    <Link className="hover:text-primary" href={crumb.href}>
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="font-medium text-neutral-900">{crumb.label}</span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        ) : null}
        <div className="px-4 sm:px-6 lg:px-8">{props.children}</div>
      </div>
    </div>
  );
}
