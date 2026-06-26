'use client';

import { useTranslations } from 'next-intl';
import { AdminPendingButton } from '@/components/admin/AdminPendingButton';

type BlogPublishFormProps = {
  action: (formData: FormData) => void;
  returnTo: string;
  slug: string;
};

/**
 * Publishes a draft article from the admin list with loading feedback.
 */
export function BlogPublishForm(props: BlogPublishFormProps) {
  const t = useTranslations('BlogAdminPage');
  const tCommon = useTranslations('AdminCommon');

  return (
    <form action={props.action}>
      <input name="returnTo" type="hidden" value={props.returnTo} />
      <input name="slug" type="hidden" value={props.slug} />
      <AdminPendingButton
        label={t('publish')}
        pendingLabel={tCommon('publishing')}
        variant="linkSuccess"
      />
    </form>
  );
}
