'use client';

import { useTranslations } from 'next-intl';

type BlogUnpublishFormProps = {
  action: (formData: FormData) => void;
  slug: string;
};

/**
 * Submits unpublish with a browser confirmation prompt.
 */
export function BlogUnpublishForm(props: BlogUnpublishFormProps) {
  const t = useTranslations('BlogAdminPage');

  return (
    <form
      action={props.action}
      onSubmit={(event) => {
        if (!window.confirm(t('unpublish_confirm'))) {
          event.preventDefault();
        }
      }}
    >
      <input name="slug" type="hidden" value={props.slug} />
      <button className="text-sm font-medium text-amber-700 hover:underline" type="submit">
        {t('unpublish')}
      </button>
    </form>
  );
}
