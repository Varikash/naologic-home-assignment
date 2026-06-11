import { Injectable } from '@angular/core';
import { NgbDateParserFormatter, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';

/**
 * Parses and formats `NgbDateStruct` as `DD.MM.YYYY` (dots) for the
 * work-order panel datepickers. Provide at component level so it only
 * affects the panel, not anywhere else ngb-datepicker might appear.
 */
@Injectable()
export class DdMmYyyyDateFormatter extends NgbDateParserFormatter {
  parse(value: string): NgbDateStruct | null {
    if (!value) return null;
    const parts = value.trim().split('.');
    if (parts.length !== 3) return null;
    const [d, m, y] = parts.map((p) => Number(p));
    if (!Number.isInteger(d) || !Number.isInteger(m) || !Number.isInteger(y)) return null;
    if (m < 1 || m > 12 || d < 1 || d > 31 || y < 1000) return null;
    return { year: y, month: m, day: d };
  }

  format(date: NgbDateStruct | null): string {
    if (!date) return '';
    const d = String(date.day).padStart(2, '0');
    const m = String(date.month).padStart(2, '0');
    return `${d}.${m}.${date.year}`;
  }
}
