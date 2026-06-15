/** Normalizes e-mail for allowlist matching. */
export function normalizeAllowlistEmail(email: string) {
  return email.trim().toLowerCase();
}

/** Permissive check for corporate e-mails like comercial1@acessoequipamentos.com.br */
export function isAllowedDashboardEmail(email: string) {
  const normalized = normalizeAllowlistEmail(email);
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/u.test(normalized);
}

export type AllowlistEntry = {
  id: number;
  email: string;
  role: string;
  addedByEmail: string | null;
  createdAt: Date;
};
