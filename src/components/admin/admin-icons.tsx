'use client';

type IconProps = {
  className?: string;
};

export function IconLeads({ className = 'h-5 w-5' }: IconProps) {
  return (
    <svg aria-hidden className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4-4v2M9 11a4 4 0 100-8 4 4 0 000 8zm11 10v-2a4 4 0 00-3-3.87M19 7a4 4 0 11-8 0 4 4 0 018 0z"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.75"
      />
    </svg>
  );
}

export function IconAnalytics({ className = 'h-5 w-5' }: IconProps) {
  return (
    <svg aria-hidden className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        d="M4 19V5M9 19V9m6 10V3m5 16v-6"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.75"
      />
    </svg>
  );
}

export function IconEquipment({ className = 'h-5 w-5' }: IconProps) {
  return (
    <svg aria-hidden className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        d="M4 7h16M4 12h16M4 17h10"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.75"
      />
    </svg>
  );
}

export function IconPlus({ className = 'h-5 w-5' }: IconProps) {
  return (
    <svg aria-hidden className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path d="M12 5v14M5 12h14" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" />
    </svg>
  );
}

export function IconAccess({ className = 'h-5 w-5' }: IconProps) {
  return (
    <svg aria-hidden className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.75"
      />
    </svg>
  );
}
