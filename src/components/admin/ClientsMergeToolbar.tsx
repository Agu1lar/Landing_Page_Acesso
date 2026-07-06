type ClientsMergeToolbarProps = {
  count: number;
  label: string;
  mergeLabel: string;
  onMerge: () => void;
};

export function ClientsMergeToolbar(props: ClientsMergeToolbarProps) {
  return (
    <div className="sticky top-4 z-10 flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-card)] border border-primary/20 bg-surface px-4 py-3 shadow-sm">
      <p className="text-sm font-medium text-neutral-800">{props.label}</p>
      <button
        className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
        onClick={props.onMerge}
        type="button"
      >
        {props.mergeLabel}
      </button>
    </div>
  );
}
