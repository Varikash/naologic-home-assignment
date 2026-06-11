import { NaoDocument } from './document.model';

export type WorkOrderStatus = 'open' | 'in-progress' | 'complete' | 'blocked';

export const WORK_ORDER_STATUS_LABELS: Record<WorkOrderStatus, string> = {
  open: 'Open',
  'in-progress': 'In progress',
  complete: 'Complete',
  blocked: 'Blocked',
};

export interface WorkOrderData {
  name: string;
  workCenterId: string;
  status: WorkOrderStatus;
  startDate: string;
  endDate: string;
}

export type WorkOrderDocument = NaoDocument<'workOrder', WorkOrderData>;
