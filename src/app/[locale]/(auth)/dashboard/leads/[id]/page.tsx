import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { LeadNotesForm } from '@/components/admin/LeadNotesForm';
import { LeadStatusForm } from '@/components/admin/LeadStatusForm';
import { Button } from '@/components/ui/Button';
import { LEAD_STATUSES, type LeadStatus } from '@/lib/lead-status';
import { formatLeadCartItems, getLeadById, parseLeadCartItems } from '@/lib/leads-admin';
import { Link } from '@/libs/I18nNavigation';
import { resolveAppLocale } from '@/utils/locale';

type LeadDetailPageProps = {
  params: Promise<{ locale: string; id: string }>;
};

function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'full',
    timeStyle: 'short',
  }).format(date);
}

export async function generateMetadata(props: LeadDetailPageProps): Promise<Metadata> {
  const { locale, id } = await props.params;
  const lead = await getLeadById(Number.parseInt(id, 10));
  const t = await getTranslations({
    locale: resolveAppLocale(locale),
    namespace: 'LeadsAdminPage',
  });
  return {
    title: lead ? t('detail_meta_title', { id: lead.id, name: lead.name }) : t('meta_title'),
  };
}

export default async function LeadDetailPage(props: LeadDetailPageProps) {
  const { locale, id } = await props.params;
  setRequestLocale(resolveAppLocale(locale));
  const t = await getTranslations({
    locale: resolveAppLocale(locale),
    namespace: 'LeadsAdminPage',
  });

  const leadId = Number.parseInt(id, 10);
  if (Number.isNaN(leadId)) {
    notFound();
  }

  const lead = await getLeadById(leadId);
  if (!lead) {
    notFound();
  }

  const cartItems = parseLeadCartItems(lead.itemsJson);
  const statusLabels = Object.fromEntries(
    LEAD_STATUSES.map((status) => [status, t(`status_${status}` as 'status_new')]),
  ) as Record<LeadStatus, string>;
  const displayStatus = statusLabels[lead.status as LeadStatus] ?? lead.status;
  let rentalLabel = lead.rentalPeriod ?? '—';
  if (lead.rentalPeriod === 'diaria') {
    rentalLabel = t('rental_diaria');
  } else if (lead.rentalPeriod === 'semanal') {
    rentalLabel = t('rental_semanal');
  } else if (lead.rentalPeriod === 'mensal') {
    rentalLabel = t('rental_mensal');
  } else if (lead.rentalPeriod === 'ainda_nao_sei') {
    rentalLabel = t('rental_unknown');
  }

  return (
    <div className="space-y-6 py-6">
      <div className="flex flex-wrap items-center gap-3">
        <Button href="/dashboard/leads" size="sm" variant="outline">
          {t('back_to_list')}
        </Button>
        <p className="text-sm text-neutral-500">
          {t('detail_id', { id: lead.id })} · {formatDateTime(lead.createdAt)}
        </p>
      </div>

      <h1 className="font-heading text-2xl font-bold text-neutral-900">{lead.name}</h1>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-lg border border-neutral-200 bg-surface p-4">
          <h2 className="font-semibold text-neutral-900">{t('section_contact')}</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <div>
              <dt className="text-neutral-500">{t('field_email')}</dt>
              <dd>
                <a className="text-primary hover:underline" href={`mailto:${lead.email}`}>
                  {lead.email}
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-neutral-500">{t('field_phone')}</dt>
              <dd>
                <a className="text-primary hover:underline" href={`tel:${lead.phone}`}>
                  {lead.phone}
                </a>
              </dd>
            </div>
            {lead.company ? (
              <div>
                <dt className="text-neutral-500">{t('field_company')}</dt>
                <dd>{lead.company}</dd>
              </div>
            ) : null}
            <div>
              <dt className="text-neutral-500">{t('field_city')}</dt>
              <dd>{lead.city}</dd>
            </div>
          </dl>
        </section>

        <section className="rounded-lg border border-neutral-200 bg-surface p-4">
          <h2 className="font-semibold text-neutral-900">{t('section_request')}</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <div>
              <dt className="text-neutral-500">{t('field_rental_period')}</dt>
              <dd>{rentalLabel}</dd>
            </div>
            <div>
              <dt className="text-neutral-500">{t('field_origin')}</dt>
              <dd>{lead.origin}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-neutral-500">{t('field_status')}</dt>
              <dd className="font-medium text-neutral-900">{displayStatus}</dd>
              <LeadStatusForm
                currentStatus={lead.status}
                errorMessage={t('status_update_error')}
                fieldLabel={t('field_status')}
                labels={statusLabels}
                leadId={lead.id}
                saveLabel={t('status_save')}
              />
            </div>
            {lead.equipmentName ? (
              <div>
                <dt className="text-neutral-500">{t('field_equipment_summary')}</dt>
                <dd>{lead.equipmentName}</dd>
              </div>
            ) : null}
          </dl>
        </section>
      </div>

      {cartItems.length > 0 ? (
        <section className="rounded-lg border border-neutral-200 bg-surface p-4">
          <h2 className="font-semibold text-neutral-900">{t('section_cart')}</h2>
          <ul className="mt-3 divide-y divide-neutral-100 text-sm">
            {cartItems.map((item) => (
              <li
                className="flex flex-wrap items-center justify-between gap-2 py-2"
                key={item.slug}
              >
                <div>
                  <Link
                    className="font-medium text-primary hover:underline"
                    href={`/equipamentos/${item.slug}`}
                  >
                    {item.name}
                  </Link>
                  <p className="text-xs text-neutral-500">
                    {item.kind === 'accessory' ? t('kind_accessory') : t('kind_equipment')} ·{' '}
                    {item.slug}
                  </p>
                </div>
                <span className="font-medium text-neutral-800">
                  {t('quantity_label', { count: item.quantity })}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <section className="rounded-lg border border-neutral-200 bg-surface p-4 text-sm text-neutral-600">
          <h2 className="font-semibold text-neutral-900">{t('section_cart')}</h2>
          <p className="mt-2">
            {(formatLeadCartItems(lead.itemsJson) || lead.equipmentName) ?? t('cart_empty')}
          </p>
        </section>
      )}

      {lead.utmSource ||
      lead.utmMedium ||
      lead.utmCampaign ||
      lead.referrer ||
      lead.landingPage ? (
        <section className="rounded-lg border border-neutral-200 bg-surface p-4">
          <h2 className="font-semibold text-neutral-900">{t('section_attribution')}</h2>
          <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
            {lead.utmSource ? (
              <div>
                <dt className="text-neutral-500">{t('field_utm_source')}</dt>
                <dd>{lead.utmSource}</dd>
              </div>
            ) : null}
            {lead.utmMedium ? (
              <div>
                <dt className="text-neutral-500">{t('field_utm_medium')}</dt>
                <dd>{lead.utmMedium}</dd>
              </div>
            ) : null}
            {lead.utmCampaign ? (
              <div>
                <dt className="text-neutral-500">{t('field_utm_campaign')}</dt>
                <dd>{lead.utmCampaign}</dd>
              </div>
            ) : null}
            {lead.utmContent ? (
              <div>
                <dt className="text-neutral-500">{t('field_utm_content')}</dt>
                <dd>{lead.utmContent}</dd>
              </div>
            ) : null}
            {lead.utmTerm ? (
              <div>
                <dt className="text-neutral-500">{t('field_utm_term')}</dt>
                <dd>{lead.utmTerm}</dd>
              </div>
            ) : null}
            {lead.landingPage ? (
              <div className="sm:col-span-2">
                <dt className="text-neutral-500">{t('field_landing_page')}</dt>
                <dd className="break-all">{lead.landingPage}</dd>
              </div>
            ) : null}
            {lead.referrer ? (
              <div className="sm:col-span-2">
                <dt className="text-neutral-500">{t('field_referrer')}</dt>
                <dd className="break-all">{lead.referrer}</dd>
              </div>
            ) : null}
          </dl>
        </section>
      ) : null}

      {lead.message ? (
        <section className="rounded-lg border border-neutral-200 bg-surface p-4">
          <h2 className="font-semibold text-neutral-900">{t('section_message')}</h2>
          <p className="mt-2 text-sm whitespace-pre-wrap text-neutral-700">{lead.message}</p>
        </section>
      ) : null}

      <section className="rounded-lg border border-neutral-200 bg-surface p-4">
        <h2 className="font-semibold text-neutral-900">{t('section_internal_notes')}</h2>
        <p className="mt-1 text-xs text-neutral-500">{t('internal_notes_hint')}</p>
        <LeadNotesForm
          errorMessage={t('notes_update_error')}
          fieldLabel={t('field_internal_notes')}
          initialNotes={lead.internalNotes ?? ''}
          leadId={lead.id}
          placeholder={t('internal_notes_placeholder')}
          saveLabel={t('notes_save')}
        />
      </section>
    </div>
  );
}
