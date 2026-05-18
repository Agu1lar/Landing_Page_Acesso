'use client';

import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { filterSearchItems } from '@/lib/search';
import { useRouter } from '@/libs/I18nNavigation';
import { CATEGORY_LABELS } from '@/types/equipment';
import type { EquipmentCategory } from '@/types/equipment';

export type SearchIndexItem = {
  slug: string;
  name: string;
  category: EquipmentCategory;
  tags: string[];
};

type GlobalSearchProps = {
  index: SearchIndexItem[];
  className?: string;
  id?: string;
  compact?: boolean;
};

export function GlobalSearch({ index, className = '', id, compact = false }: GlobalSearchProps) {
  const t = useTranslations('Search');
  const router = useRouter();
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const results = useMemo(
    () => filterSearchItems(index, query, 8),
    [index, query],
  );

  const goToAll = useCallback(() => {
    const q = query.trim();
    router.push(q ? `/equipamentos?q=${encodeURIComponent(q)}` : '/equipamentos');
    setOpen(false);
    setQuery('');
  }, [query, router]);

  const goToItem = useCallback(
    (slug: string) => {
      router.push(`/equipamentos/${slug}`);
      setOpen(false);
      setQuery('');
    },
    [router],
  );

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () =>{  window.removeEventListener('keydown', onKeyDown); };
  }, []);

  useEffect(() => {
    const onPointerDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    return () =>{  document.removeEventListener('mousedown', onPointerDown); };
  }, []);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, Math.max(results.length - 1, 0)));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[activeIndex]) {
        goToItem(results[activeIndex].slug);
      } else {
        goToAll();
      }
    } else if (e.key === 'Escape') {
      setOpen(false);
      inputRef.current?.blur();
    }
  };

  return (
    <div ref={rootRef} className={`relative z-50 ${className}`}>
      <div className="relative">
        <label className="sr-only" htmlFor={id}>
          {t('aria_label')}
        </label>
        <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-neutral-400">
          <SearchIcon />
        </span>
        <input
          ref={inputRef}
          className={`w-full rounded-lg border border-neutral-200 bg-neutral-50 text-neutral-900 transition-colors placeholder:text-neutral-400 focus:border-primary focus:bg-surface focus:ring-2 focus:ring-primary/20 focus:outline-none ${
            compact ? 'py-1.5 pr-10 pl-9 text-sm' : 'py-2 pr-16 pl-10 text-sm'
          }`}
          id={id}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            setActiveIndex(0);
          }}
          onFocus={() =>{  setOpen(true); }}
          onKeyDown={onKeyDown}
          placeholder={t('placeholder')}
          type="search"
          value={query}
          autoComplete="off"
          
          aria-expanded={open && query.trim().length > 0}
          aria-controls={listId}
          aria-autocomplete="list"
        />
        {!compact && (
          <kbd className="pointer-events-none absolute top-1/2 right-3 hidden -translate-y-1/2 rounded border border-neutral-200 bg-surface px-1.5 py-0.5 font-mono text-[10px] text-neutral-400 sm:inline">
            ⌘K
          </kbd>
        )}
      </div>

      {open && query.trim() ? (
        <ul
          className="absolute z-[100] mt-1 max-h-80 w-full overflow-auto rounded-lg border border-neutral-200 bg-surface py-1 shadow-lg"
          id={listId}
          role="listbox"
        >
          {results.length === 0 ? (
            <li className="px-4 py-3 text-sm text-neutral-600">{t('no_results')}</li>
          ) : (
            results.map((item, i) => (
              <li key={item.slug} role="option" aria-selected={i === activeIndex}>
                <button
                  className={`flex w-full flex-col gap-0.5 px-4 py-2.5 text-left text-sm transition-colors hover:bg-neutral-50 ${i === activeIndex ? 'bg-primary-light' : ''}`}
                  onMouseDown={(e) =>{  e.preventDefault(); }}
                  onClick={() =>{  goToItem(item.slug); }}
                  type="button"
                >
                  <span className="font-medium text-neutral-900">{item.name}</span>
                  <span className="text-xs text-neutral-500">{CATEGORY_LABELS[item.category]}</span>
                </button>
              </li>
            ))
          )}
          <li className="border-t border-neutral-100">
            <button
              className="w-full px-4 py-2.5 text-left text-sm font-medium text-primary hover:bg-neutral-50"
              onMouseDown={(e) =>{  e.preventDefault(); }}
              onClick={goToAll}
              type="button"
            >
              {t('view_all')} →
            </button>
          </li>
        </ul>
      ) : null}
    </div>
  );
}

function SearchIcon() {
  return (
    <svg aria-hidden className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        d="M21 21l-4.35-4.35M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14z"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
      />
    </svg>
  );
}
