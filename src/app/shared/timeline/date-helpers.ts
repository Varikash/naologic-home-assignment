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

export function daysBetween(startIso: string, endIso: string): number {
  const [ys, ms, ds] = startIso.split('-').map(Number);
  const [ye, me, de] = endIso.split('-').map(Number);
  const startMs = Date.UTC(ys, ms - 1, ds);
  const endMs = Date.UTC(ye, me - 1, de);
  return Math.round((endMs - startMs) / 86_400_000);
}
