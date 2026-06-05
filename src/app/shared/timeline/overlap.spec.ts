import { WorkOrderDocument } from '../../core/models/work-order.model';
import { hasOverlap } from './overlap';

function makeOrder(
  docId: string,
  workCenterId: string,
  startDate: string,
  endDate: string,
): WorkOrderDocument {
  return {
    docId,
    docType: 'workOrder',
    data: { name: docId, workCenterId, status: 'open', startDate, endDate },
  };
}

describe('hasOverlap', () => {
  const wcA = 'wc-a';
  const wcB = 'wc-b';

  it('returns false when no orders exist', () => {
    expect(hasOverlap([], { workCenterId: wcA, startDate: '2025-01-01', endDate: '2025-01-05' })).toBe(false);
  });

  it('returns false for orders on a different work center', () => {
    const orders = [makeOrder('1', wcB, '2025-01-01', '2025-01-10')];
    expect(hasOverlap(orders, { workCenterId: wcA, startDate: '2025-01-01', endDate: '2025-01-10' })).toBe(false);
  });

  it('returns false when candidate is strictly before existing', () => {
    const orders = [makeOrder('1', wcA, '2025-01-10', '2025-01-15')];
    expect(hasOverlap(orders, { workCenterId: wcA, startDate: '2025-01-01', endDate: '2025-01-05' })).toBe(false);
  });

  it('returns false when candidate is strictly after existing', () => {
    const orders = [makeOrder('1', wcA, '2025-01-01', '2025-01-05')];
    expect(hasOverlap(orders, { workCenterId: wcA, startDate: '2025-01-10', endDate: '2025-01-15' })).toBe(false);
  });

  it('treats touching dates (end of A == start of B) as non-overlapping', () => {
    const orders = [makeOrder('1', wcA, '2025-01-01', '2025-01-10')];
    expect(hasOverlap(orders, { workCenterId: wcA, startDate: '2025-01-10', endDate: '2025-01-15' })).toBe(false);
  });

  it('treats touching dates (end of B == start of A) as non-overlapping', () => {
    const orders = [makeOrder('1', wcA, '2025-01-10', '2025-01-15')];
    expect(hasOverlap(orders, { workCenterId: wcA, startDate: '2025-01-01', endDate: '2025-01-10' })).toBe(false);
  });

  it('detects partial overlap (candidate starts inside existing)', () => {
    const orders = [makeOrder('1', wcA, '2025-01-01', '2025-01-10')];
    expect(hasOverlap(orders, { workCenterId: wcA, startDate: '2025-01-05', endDate: '2025-01-15' })).toBe(true);
  });

  it('detects partial overlap (candidate ends inside existing)', () => {
    const orders = [makeOrder('1', wcA, '2025-01-10', '2025-01-20')];
    expect(hasOverlap(orders, { workCenterId: wcA, startDate: '2025-01-05', endDate: '2025-01-15' })).toBe(true);
  });

  it('detects when candidate is fully inside existing', () => {
    const orders = [makeOrder('1', wcA, '2025-01-01', '2025-01-31')];
    expect(hasOverlap(orders, { workCenterId: wcA, startDate: '2025-01-10', endDate: '2025-01-20' })).toBe(true);
  });

  it('detects when candidate fully engulfs existing', () => {
    const orders = [makeOrder('1', wcA, '2025-01-10', '2025-01-20')];
    expect(hasOverlap(orders, { workCenterId: wcA, startDate: '2025-01-01', endDate: '2025-01-31' })).toBe(true);
  });

  it('detects overlap among many orders on the same center', () => {
    const orders = [
      makeOrder('1', wcA, '2025-01-01', '2025-01-05'),
      makeOrder('2', wcA, '2025-01-10', '2025-01-15'),
      makeOrder('3', wcA, '2025-01-20', '2025-01-25'),
    ];
    expect(hasOverlap(orders, { workCenterId: wcA, startDate: '2025-01-12', endDate: '2025-01-14' })).toBe(true);
  });

  it('ignores the order with matching excludeId (edit mode, unchanged dates)', () => {
    const orders = [makeOrder('1', wcA, '2025-01-01', '2025-01-10')];
    expect(hasOverlap(orders, { workCenterId: wcA, startDate: '2025-01-01', endDate: '2025-01-10' }, '1')).toBe(false);
  });

  it('still detects overlap with a different order when excludeId is set', () => {
    const orders = [
      makeOrder('1', wcA, '2025-01-01', '2025-01-10'),
      makeOrder('2', wcA, '2025-01-15', '2025-01-20'),
    ];
    expect(hasOverlap(orders, { workCenterId: wcA, startDate: '2025-01-05', endDate: '2025-01-16' }, '2')).toBe(true);
  });
});
