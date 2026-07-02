'use client';

import { useTranslations } from 'next-intl';
import { useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { uploadAdminEquipmentLaudo } from '@/lib/admin-image-upload-client';

type EquipmentLaudoFieldProps = {
  slug: string;
  url: string;
  label: string;
  onUrlChange: (url: string) => void;
  onLabelChange: (label: string) => void;
};

/**
 * Single PDF upload for equipment laudo técnico (hosted on same domain).
 */
export function EquipmentLaudoField(props: EquipmentLaudoFieldProps) {
  const t = useTranslations('EquipmentAdminForm');
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = async (file: File) => {
    setUploading(true);
    setError(null);

    try {
      const { url } = await uploadAdminEquipmentLaudo({
        file,
        slug: props.slug,
      });
      props.onUrlChange(url);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : t('laudo_upload_error_generic'));
    } finally {
      setUploading(false);
    }
  };

  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      void uploadFile(file);
    }
    event.target.value = '';
  };

  const removeLaudo = () => {
    props.onUrlChange('');
    setError(null);
  };

  return (
    <div className="rounded-lg border border-neutral-200 bg-neutral-50/60 p-4">
      <div>
        <h3 className="text-sm font-semibold text-neutral-900">{t('field_laudo_title')}</h3>
        <p className="mt-1 text-xs text-neutral-600">{t('field_laudo_hint')}</p>
      </div>

      <input
        accept="application/pdf,.pdf"
        className="sr-only"
        onChange={onFileChange}
        ref={inputRef}
        type="file"
      />

      {props.url ? (
        <div className="mt-3 space-y-3">
          <p className="text-sm text-neutral-700">
            <span className="font-medium">{t('field_laudo_attached')}</span>{' '}
            <a
              className="text-primary hover:underline"
              href={props.url}
              rel="noopener noreferrer"
              target="_blank"
            >
              {t('field_laudo_preview')}
            </a>
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              disabled={uploading}
              onClick={() => inputRef.current?.click()}
              size="sm"
              type="button"
              variant="outline"
            >
              {uploading ? t('laudo_upload_in_progress') : t('field_laudo_replace')}
            </Button>
            <Button onClick={removeLaudo} size="sm" type="button" variant="outline">
              {t('field_laudo_remove')}
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-3">
          <Button
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
            size="sm"
            type="button"
            variant="outline"
          >
            {uploading ? t('laudo_upload_in_progress') : t('field_laudo_upload')}
          </Button>
        </div>
      )}

      <div className="mt-4">
        <label className="mb-1 block text-sm font-medium text-neutral-700" htmlFor="laudoLabel">
          {t('field_laudo_label')}
        </label>
        <input
          className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm"
          id="laudoLabel"
          onChange={(event) => props.onLabelChange(event.target.value)}
          placeholder={t('field_laudo_label_placeholder')}
          value={props.label}
        />
        <p className="mt-1 text-xs text-neutral-500">{t('field_laudo_label_hint')}</p>
      </div>

      {error ? <p className="mt-2 text-sm text-red-700">{error}</p> : null}
    </div>
  );
}
