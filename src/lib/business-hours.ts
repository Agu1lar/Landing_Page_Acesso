/** Commercial desk hours — America/Sao_Paulo, Monday–Friday. */
export const COMMERCIAL_HOURS = {
  timeZone: 'America/Sao_Paulo',
  openHour: 7,
  openMinute: 30,
  closeHour: 17,
  closeMinute: 15,
  /** Display string aligned with `brand.hours`. */
  scheduleLabel: 'seg–sex, 7h30–17h15',
} as const;

type SaoPauloClock = {
  weekday: number;
  hour: number;
  minute: number;
};

const WEEKDAY_MAP: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

/**
 * Reads clock parts in Belo Horizonte (America/Sao_Paulo).
 */
export function getSaoPauloClock(at: Date = new Date()): SaoPauloClock {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: COMMERCIAL_HOURS.timeZone,
    weekday: 'short',
    hour: 'numeric',
    minute: 'numeric',
    hour12: false,
  }).formatToParts(at);

  const weekdayToken = parts.find((part) => part.type === 'weekday')?.value ?? 'Sun';
  const hour = Number(parts.find((part) => part.type === 'hour')?.value ?? '0');
  const minute = Number(parts.find((part) => part.type === 'minute')?.value ?? '0');

  return {
    weekday: WEEKDAY_MAP[weekdayToken] ?? 0,
    hour,
    minute,
  };
}

function toMinutes(hour: number, minute: number) {
  return hour * 60 + minute;
}

/**
 * Whether the commercial team is within desk hours (weekdays 7:30–17:15 BH).
 */
export function isCommercialHoursOpen(at: Date = new Date()): boolean {
  const { weekday, hour, minute } = getSaoPauloClock(at);

  if (weekday === 0 || weekday === 6) {
    return false;
  }

  const now = toMinutes(hour, minute);
  const open = toMinutes(COMMERCIAL_HOURS.openHour, COMMERCIAL_HOURS.openMinute);
  const close = toMinutes(COMMERCIAL_HOURS.closeHour, COMMERCIAL_HOURS.closeMinute);

  return now >= open && now <= close;
}

export function getCommercialHoursStatus(at: Date = new Date()): 'open' | 'closed' {
  return isCommercialHoursOpen(at) ? 'open' : 'closed';
}
