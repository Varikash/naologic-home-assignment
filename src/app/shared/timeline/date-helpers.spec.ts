import { addDays, addMonths, daysBetween, today } from './date-helpers';

describe('date-helpers', () => {
  describe('today', () => {
    it('returns an ISO YYYY-MM-DD string', () => {
      expect(today()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  describe('addDays', () => {
    it('returns the same date when adding 0', () => {
      expect(addDays('2025-06-15', 0)).toBe('2025-06-15');
    });

    it('adds positive days', () => {
      expect(addDays('2025-01-01', 5)).toBe('2025-01-06');
    });

    it('adds negative days', () => {
      expect(addDays('2025-01-10', -5)).toBe('2025-01-05');
    });

    it('rolls over month boundary forward', () => {
      expect(addDays('2025-01-30', 5)).toBe('2025-02-04');
    });

    it('rolls over month boundary backward', () => {
      expect(addDays('2025-03-02', -5)).toBe('2025-02-25');
    });

    it('rolls over year boundary', () => {
      expect(addDays('2025-12-30', 5)).toBe('2026-01-04');
    });

    it('handles leap year (Feb 29 → Mar 1 by +1)', () => {
      expect(addDays('2024-02-28', 2)).toBe('2024-03-01');
    });

    it('handles non-leap year (Feb 28 → Mar 1 by +1)', () => {
      expect(addDays('2025-02-28', 1)).toBe('2025-03-01');
    });
  });

  describe('daysBetween', () => {
    it('returns 0 for the same date', () => {
      expect(daysBetween('2025-06-15', '2025-06-15')).toBe(0);
    });

    it('returns positive for end after start', () => {
      expect(daysBetween('2025-01-01', '2025-01-10')).toBe(9);
    });

    it('returns negative for end before start', () => {
      expect(daysBetween('2025-01-10', '2025-01-01')).toBe(-9);
    });

    it('spans month boundary', () => {
      expect(daysBetween('2025-01-30', '2025-02-05')).toBe(6);
    });

    it('spans year boundary', () => {
      expect(daysBetween('2025-12-30', '2026-01-05')).toBe(6);
    });

    it('is the inverse of addDays', () => {
      const start = '2025-06-15';
      for (const delta of [-30, -7, 0, 1, 7, 365]) {
        expect(daysBetween(start, addDays(start, delta))).toBe(delta);
      }
    });
  });

  describe('addMonths', () => {
    it('keeps the same day within the month', () => {
      expect(addMonths('2025-06-15', 1)).toBe('2025-07-15');
    });

    it('rolls over the year boundary', () => {
      expect(addMonths('2025-12-10', 1)).toBe('2026-01-10');
    });

    it('clamps the day to a shorter target month', () => {
      // Jan 31 + 1mo → Feb has no 31st → clamp to Feb 28 (non-leap).
      expect(addMonths('2026-01-31', 1)).toBe('2026-02-28');
    });

    it('clamps to Feb 29 in a leap year', () => {
      expect(addMonths('2024-01-31', 1)).toBe('2024-02-29');
    });

    it('handles negative months', () => {
      expect(addMonths('2025-03-15', -1)).toBe('2025-02-15');
    });

    it('handles spans larger than a year', () => {
      expect(addMonths('2025-06-15', 14)).toBe('2026-08-15');
    });
  });
});
