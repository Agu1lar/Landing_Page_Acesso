'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { pickImageFiles, uploadAdminImage } from '@/lib/admin-image-upload-client';

export type GalleryItem = {
  url: string;
  alt: string;
  isPrimary: boolean;
};

type EquipmentPhotoGalleryProps = {
  items: GalleryItem[];
  onChange: (items: GalleryItem[]) => void;
  slug: string;
  defaultAlt?: string;
};

/**
 * Drag-and-drop and file-picker gallery for equipment photos.
 */
export function EquipmentPhotoGallery(props: EquipmentPhotoGalleryProps) {
  const t = useTranslations('EquipmentAdminForm');
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadFiles = async (files: FileList | File[]) => {
    const list = pickImageFiles(files);
    if (list.length === 0) {
      setError(t('upload_error_format'));
      return;
    }

    setUploading(true);
    setError(null);

    const nextItems = [...props.items];
    let primaryExists = nextItems.some((item) => item.isPrimary);

    try {
      for (const file of list) {
        const { url } = await uploadAdminImage({
          file,
          endpoint: '/api/admin/equipment/upload',
          slug: props.slug,
        });

        const isPrimary = !primaryExists;
        nextItems.push({
          url,
          alt: props.defaultAlt?.trim() ?? file.name.replace(/\.[^.]+$/u, ''),
          isPrimary,
        });
        if (isPrimary) {
          primaryExists = true;
        }
      }

      props.onChange(nextItems);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : t('upload_error_generic'));
    } finally {
      setUploading(false);
    }
  };

  const onDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(false);
    if (event.dataTransfer.files.length > 0) {
      void uploadFiles(event.dataTransfer.files);
    }
  };

  const setPrimary = (index: number) => {
    props.onChange(
      props.items.map((item, itemIndex) => ({
        ...item,
        isPrimary: itemIndex === index,
      })),
    );
  };

  const removeItem = (index: number) => {
    const next = props.items.filter((_, itemIndex) => itemIndex !== index);
    if (next.length > 0 && !next.some((item) => item.isPrimary)) {
      next[0]!.isPrimary = true;
    }
    props.onChange(next);
  };

  const updateAlt = (index: number, alt: string) => {
    props.onChange(
      props.items.map((item, itemIndex) => (itemIndex === index ? { ...item, alt } : item)),
    );
  };

  return (
    <div className="space-y-4">
      <div
        className={`rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
          dragOver
            ? 'border-primary bg-primary-light/40'
            : 'border-neutral-300 bg-neutral-50/80 hover:border-neutral-400'
        }`}
        onDragLeave={() => setDragOver(false)}
        onDragOver={(event) => {
          event.preventDefault();
          setDragOver(true);
        }}
        onDrop={onDrop}
      >
        <input
          accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
          className="sr-only"
          multiple
          onChange={(event) => {
            if (event.target.files) {
              void uploadFiles(event.target.files);
              event.target.value = '';
            }
          }}
          ref={inputRef}
          type="file"
        />
        <p className="font-medium text-neutral-900">{t('upload_drop_title')}</p>
        <p className="mt-1 text-sm text-neutral-600">{t('upload_drop_hint')}</p>
        <Button
          className="mt-4"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          size="sm"
          type="button"
          variant="outline"
        >
          {uploading ? t('upload_in_progress') : t('upload_choose_files')}
        </Button>
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      {props.items.length > 0 ? (
        <ul className="grid gap-4 sm:grid-cols-2">
          {props.items.map((item, index) => (
            <li
              className="space-y-3 rounded-lg border border-neutral-200 bg-surface p-3"
              key={`${item.url}-${index}`}
            >
              <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-neutral-100">
                <Image
                  alt={item.alt || t('photo_preview_alt')}
                  className="object-cover"
                  fill
                  sizes="(max-width: 640px) 100vw, 280px"
                  src={item.url}
                  unoptimized
                />
              </div>
              <label className="block text-sm">
                <span className="mb-1 block font-medium text-neutral-700">{t('field_photo_alt')}</span>
                <input
                  className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm"
                  onChange={(event) => updateAlt(index, event.target.value)}
                  value={item.alt}
                />
              </label>
              <div className="flex flex-wrap items-center gap-3">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    checked={item.isPrimary}
                    name="primaryPhoto"
                    onChange={() => setPrimary(index)}
                    type="radio"
                  />
                  {t('field_photo_primary')}
                </label>
                <button
                  className="text-sm text-red-700 hover:underline"
                  onClick={() => removeItem(index)}
                  type="button"
                >
                  {t('photo_remove')}
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-neutral-500">{t('upload_empty')}</p>
      )}
    </div>
  );
}
