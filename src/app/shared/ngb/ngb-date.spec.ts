import { isoToNgb, ngbToIso } from './ngb-date';

describe('ngb-date', () => {
  describe('isoToNgb', () => {
    it('parses a typical ISO date', () => {
      expect(isoToNgb('2025-06-15')).toEqual({ year: 2025, month: 6, day: 15 });
    });

    it('parses single-digit month and day correctly', () => {
      expect(isoToNgb('2025-01-05')).toEqual({ year: 2025, month: 1, day: 5 });
    });

    it('keeps month 1-indexed (does not decrement like Date)', () => {
      expect(isoToNgb('2025-01-01').month).toBe(1);
      expect(isoToNgb('2025-12-31').month).toBe(12);
    });
  });

  describe('ngbToIso', () => {
    it('formats a typical NgbDateStruct', () => {
      expect(ngbToIso({ year: 2025, month: 6, day: 15 })).toBe('2025-06-15');
    });

    it('pads single-digit month and day with leading zeros', () => {
      expect(ngbToIso({ year: 2025, month: 1, day: 5 })).toBe('2025-01-05');
    });

    it('pads early years with leading zeros to 4 digits', () => {
      expect(ngbToIso({ year: 99, month: 1, day: 1 })).toBe('0099-01-01');
    });
  });

  describe('round trip', () => {
    it('iso → ngb → iso preserves the original string', () => {
      for (const iso of ['2025-01-01', '2025-06-15', '2025-12-31', '2024-02-29', '2026-11-07']) {
        expect(ngbToIso(isoToNgb(iso))).toBe(iso);
      }
    });

    it('ngb → iso → ngb preserves the original struct', () => {
      const samples: { year: number; month: number; day: number }[] = [
        { year: 2025, month: 1, day: 1 },
        { year: 2025, month: 6, day: 15 },
        { year: 2024, month: 2, day: 29 },
      ];
      for (const ngb of samples) {
        expect(isoToNgb(ngbToIso(ngb))).toEqual(ngb);
      }
    });
  });
});
