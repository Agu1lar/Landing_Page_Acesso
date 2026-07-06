import { SignOutButton } from '@clerk/nextjs';
import { getTranslations } from 'next-intl/server';
import { AdminHelpLauncher } from '@/components/admin/AdminHelpLauncher';
import { AdminNavLink } from '@/components/admin/AdminNavLink';
import { brand } from '@/lib/brand';

type AdminShellProps = {
  children: React.ReactNode;
  role: 'admin' | 'comercial';
};

/**
 * Corporate sidebar layout for dashboard admin modules.
 */
export async function AdminShell(props: AdminShellProps) {
  const t = await getTranslations('DashboardLayout');
  const roleLabel = props.role === 'admin' ? t('role_admin') : t('role_comercial');

  return (
    <div className="min-h-screen bg-[#f1f4f8] lg:flex">
      <aside className="flex w-full flex-col border-b border-neutral-800 bg-neutral-900 text-white lg:fixed lg:inset-y-0 lg:z-30 lg:w-64 lg:border-b-0 lg:border-r">
        <div className="border-b border-white/10 px-5 py-6">
          <div className="flex items-center gap-3">
            <div
              aria-hidden
              className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary font-heading text-sm font-bold text-white"
            >
              AE
            </div>
            <div className="min-w-0">
              <p className="truncate font-heading text-base font-bold leading-tight">Acesso</p>
              <p className="truncate text-xs text-slate-400">{t('admin_panel_label')}</p>
            </div>
          </div>
          <span className="mt-4 inline-flex rounded-full bg-white/10 px-2.5 py-1 text-xs font-medium text-slate-200 ring-1 ring-white/10">
            {roleLabel}
          </span>
        </div>

        <nav aria-label={t('admin_nav_label')} className="flex-1 overflow-y-auto px-3 py-4">
          <p className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
            {t('nav_group_commercial')}
          </p>
          <ul className="space-y-1">
            <li>
              <AdminNavLink href="/dashboard/leads" icon="leads" label={t('leads_link')} />
            </li>
            <li>
              <AdminNavLink
                href="/dashboard/leads/consulta"
                icon="search"
                label={t('leads_consulta_link')}
              />
            </li>
            <li>
              <AdminNavLink
                href="/dashboard/analytics"
                icon="analytics"
                label={t('analytics_link')}
              />
            </li>
            <li>
              <AdminNavLink href="/dashboard/dicas" icon="blog" label={t('blog_link')} />
            </li>
            <li>
              <AdminNavLink href="/dashboard/dicas/new" icon="plus" label={t('blog_new_link')} />
            </li>
          </ul>

          {props.role === 'admin' ? (
            <>
              <p className="mt-6 px-3 pb-2 text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
                {t('nav_group_catalog')}
              </p>
              <ul className="space-y-1">
                <li>
                  <AdminNavLink
                    href="/dashboard/equipamentos"
                    icon="equipment"
                    label={t('equipment_link')}
                  />
                </li>
                <li>
                  <AdminNavLink
                    href="/dashboard/equipamentos/new"
                    icon="plus"
                    label={t('equipment_new_link')}
                  />
                </li>
              </ul>

              <p className="mt-6 px-3 pb-2 text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
                {t('nav_group_settings')}
              </p>
              <ul className="space-y-1">
                <li>
                  <AdminNavLink
                    href="/dashboard/acesso"
                    icon="access"
                    label={t('access_link')}
                  />
                </li>
              </ul>
            </>
          ) : null}
        </nav>

        <div className="border-t border-white/10 p-4">
          <div className="mb-4 rounded-lg border border-white/10 bg-white/5 px-3 py-3">
            <p className="text-[11px] font-semibold tracking-wide text-slate-300 uppercase">
              {t('support_title')}
            </p>
            <p className="mt-1 text-xs text-slate-400">{t('support_hint')}</p>
            <a
              className="mt-2 block truncate text-sm font-medium text-white hover:underline"
              href={`mailto:${brand.techSupportEmail}`}
            >
              {brand.techSupportEmail}
            </a>
            <p className="mt-2 text-[11px] leading-relaxed text-slate-500">{t('developed_by')}</p>
          </div>
          <SignOutButton>
            <button
              className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2.5 text-sm font-medium text-slate-200 transition-colors hover:bg-white/10 hover:text-white"
              type="button"
            >
              {t('sign_out')}
            </button>
          </SignOutButton>
        </div>
      </aside>

      <div className="min-w-0 flex-1 lg:pl-64">
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">{props.children}</main>
        <AdminHelpLauncher role={props.role} />
      </div>
    </div>
  );
}
