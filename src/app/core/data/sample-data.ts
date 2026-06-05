import { WorkCenterDocument } from '../models/work-center.model';
import { WorkOrderDocument } from '../models/work-order.model';
import { addDays, today } from '../../shared/timeline/date-helpers';

const TODAY = today();
const isoOffset = (days: number): string => addDays(TODAY, days);

export const SAMPLE_WORK_CENTERS: WorkCenterDocument[] = [
  {
    docId: 'wc-extrusion-line-a',
    docType: 'workCenter',
    data: { name: 'Extrusion Line A' },
  },
  {
    docId: 'wc-cnc-machine-1',
    docType: 'workCenter',
    data: { name: 'CNC Machine 1' },
  },
  {
    docId: 'wc-assembly-station',
    docType: 'workCenter',
    data: { name: 'Assembly Station' },
  },
  {
    docId: 'wc-quality-control',
    docType: 'workCenter',
    data: { name: 'Quality Control' },
  },
  {
    docId: 'wc-packaging-line',
    docType: 'workCenter',
    data: { name: 'Packaging Line' },
  },
];

// Mix of medium (~2 weeks) and long (~1-2 months) campaigns so the timeline
// has substance on every zoom level. Date offsets are relative to today
// — the demo is always "live" and centered on the current day.
export const SAMPLE_WORK_ORDERS: WorkOrderDocument[] = [
  {
    docId: 'wo-001',
    docType: 'workOrder',
    data: {
      name: 'Aluminum Profile Batch #312',
      workCenterId: 'wc-extrusion-line-a',
      status: 'complete',
      startDate: isoOffset(-45),
      endDate: isoOffset(-20),
    },
  },
  {
    docId: 'wo-002',
    docType: 'workOrder',
    data: {
      name: 'PVC Tubing Long Run',
      workCenterId: 'wc-extrusion-line-a',
      status: 'in-progress',
      startDate: isoOffset(-10),
      endDate: isoOffset(20),
    },
  },
  {
    docId: 'wo-003',
    docType: 'workOrder',
    data: {
      name: 'Polyethylene Liner Series',
      workCenterId: 'wc-extrusion-line-a',
      status: 'open',
      startDate: isoOffset(25),
      endDate: isoOffset(60),
    },
  },
  {
    docId: 'wo-004',
    docType: 'workOrder',
    data: {
      name: 'Bracket Set — Q3 Build',
      workCenterId: 'wc-cnc-machine-1',
      status: 'complete',
      startDate: isoOffset(-35),
      endDate: isoOffset(-15),
    },
  },
  {
    docId: 'wo-005',
    docType: 'workOrder',
    data: {
      name: 'Precision Housing #A-44',
      workCenterId: 'wc-cnc-machine-1',
      status: 'open',
      startDate: isoOffset(7),
      endDate: isoOffset(35),
    },
  },
  {
    docId: 'wo-006',
    docType: 'workOrder',
    data: {
      name: 'Gearbox Assembly Run 17',
      workCenterId: 'wc-assembly-station',
      status: 'blocked',
      startDate: isoOffset(-10),
      endDate: isoOffset(5),
    },
  },
  {
    docId: 'wo-007',
    docType: 'workOrder',
    data: {
      name: 'Motor Mount Sub-assembly',
      workCenterId: 'wc-assembly-station',
      status: 'open',
      startDate: isoOffset(12),
      endDate: isoOffset(45),
    },
  },
  {
    docId: 'wo-008',
    docType: 'workOrder',
    data: {
      name: 'Batch QC — Shipment 88',
      workCenterId: 'wc-quality-control',
      status: 'in-progress',
      startDate: isoOffset(-5),
      endDate: isoOffset(15),
    },
  },
  {
    docId: 'wo-009',
    docType: 'workOrder',
    data: {
      name: 'Annual Compliance Audit',
      workCenterId: 'wc-quality-control',
      status: 'open',
      startDate: isoOffset(30),
      endDate: isoOffset(55),
    },
  },
  {
    docId: 'wo-010',
    docType: 'workOrder',
    data: {
      name: 'Export Crate Prep — EU',
      workCenterId: 'wc-packaging-line',
      status: 'complete',
      startDate: isoOffset(-50),
      endDate: isoOffset(-25),
    },
  },
  {
    docId: 'wo-011',
    docType: 'workOrder',
    data: {
      name: 'Customer Order #7741',
      workCenterId: 'wc-packaging-line',
      status: 'blocked',
      startDate: isoOffset(-5),
      endDate: isoOffset(18),
    },
  },
  {
    docId: 'wo-012',
    docType: 'workOrder',
    data: {
      name: 'Holiday Run Campaign',
      workCenterId: 'wc-packaging-line',
      status: 'open',
      startDate: isoOffset(28),
      endDate: isoOffset(75),
    },
  },
];
