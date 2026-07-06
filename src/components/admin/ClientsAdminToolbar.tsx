type ClientsAdminToolbarProps = {
  label: string;
  mergeLabel: string;
  deleteLabel: string;
  canMerge: boolean;
  onMerge: () => void;
  onDelete: () => void;
};

export function ClientsAdminToolbar(props: ClientsAdminToolbarProps) {
  return (
    <div className="sticky top-4 z-10 flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-card)] border border-primary/20 bg-surface px-4 py-3 shadow-sm">
      <p className="text-sm font-medium text-neutral-800">{props.label}</p>
      <div className="flex flex-wrap gap-2">
        {props.canMerge ? (
          <button
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
            onClick={props.onMerge}
            type="button"
          >
            {props.mergeLabel}
          </button>
        ) : null}
        <button
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100"
          onClick={props.onDelete}
          type="button"
        >
          {props.deleteLabel}
        </button>
      </div>
    </div>
  );
}
