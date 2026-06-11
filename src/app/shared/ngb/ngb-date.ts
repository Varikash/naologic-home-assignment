import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';

/**
 * Converters between our ISO `YYYY-MM-DD` strings and ng-bootstrap's
 * `NgbDateStruct` ({ year, month, day }). Months are 1-indexed on both sides.
 * Purely lexical — no Date object, no timezone surface.
 */

export function isoToNgb(iso: string): NgbDateStruct {
  const [year, month, day] = iso.split('-').map(Number);
  return { year, month, day };
}

export function ngbToIso(ngb: NgbDateStruct): string {
  const y = String(ngb.year).padStart(4, '0');
  const m = String(ngb.month).padStart(2, '0');
  const d = String(ngb.day).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
