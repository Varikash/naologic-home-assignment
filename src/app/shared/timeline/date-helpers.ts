/**
 * ISO date helpers. All dates are `YYYY-MM-DD` strings; parsing/arithmetic
 * is done in UTC to keep `addDays`/`daysBetween` immune to local DST shifts.
 * `today()` returns the user's local civil date — that is what the user means
 * by "today" on the timeline.
 */

export function today(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function addDays(iso: string, days: number): string {
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function addMonths(iso: string, months: number): string {
  const [y, m, d] = iso.split('-').map(Number);
  const target = new Date(Date.UTC(y, m - 1 + months, 1));
  const ty = target.getUTCFullYear();
  const tm = target.getUTCMonth();
  // Clamp the day to the target month's length (e.g. Jan 31 + 1mo → Feb 28).
  const lastDay = new Date(Date.UTC(ty, tm + 1, 0)).getUTCDate();
  return new Date(Date.UTC(ty, tm, Math.min(d, lastDay))).toISOString().slice(0, 10);
}

export function daysBetween(startIso: string, endIso: string): number {
  const [ys, ms, ds] = startIso.split('-').map(Number);
  const [ye, me, de] = endIso.split('-').map(Number);
  const startMs = Date.UTC(ys, ms - 1, ds);
  const endMs = Date.UTC(ye, me - 1, de);
  return Math.round((endMs - startMs) / 86_400_000);
}
