type EquipmentLaudoLinkProps = {
  href: string;
  label: string;
  downloadHint: string;
};

/**
 * Public link to open or download equipment laudo PDF (same-domain hosting).
 */
export function EquipmentLaudoLink(props: EquipmentLaudoLinkProps) {
  return (
    <p className="mt-3">
      <a
        className="text-sm font-medium text-primary hover:underline sm:text-base"
        href={props.href}
        rel="noopener noreferrer"
        target="_blank"
      >
        {props.label}
      </a>
      <span className="mt-1 block text-xs text-neutral-500">{props.downloadHint}</span>
    </p>
  );
}
