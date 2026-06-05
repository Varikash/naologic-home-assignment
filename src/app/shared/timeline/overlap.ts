import { WorkOrderDocument } from '../../core/models/work-order.model';

export interface OverlapCandidate {
  workCenterId: string;
  startDate: string;
  endDate: string;
}

export function hasOverlap(
  orders: WorkOrderDocument[],
  candidate: OverlapCandidate,
  excludeId?: string,
): boolean {
  for (const order of orders) {
    if (order.docId === excludeId) continue;
    if (order.data.workCenterId !== candidate.workCenterId) continue;
    if (candidate.startDate < order.data.endDate && order.data.startDate < candidate.endDate) {
      return true;
    }
  }
  return false;
}
