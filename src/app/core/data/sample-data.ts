import { WorkCenterDocument } from '../models/work-center.model';
import { WorkOrderDocument } from '../models/work-order.model';
import { addDays, addMonths, today } from '../../shared/timeline/date-helpers';

const TODAY = today();
const isoOffset = (days: number): string => addDays(TODAY, days);
const isoEndAfterMonths = (startDays: number, months: number): string =>
  addMonths(isoOffset(startDays), months);

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

// Offsets are relative to today so the demo stays centered on the current day.
export const SAMPLE_WORK_ORDERS: WorkOrderDocument[] = [
  {
    docId: 'wo-001',
    docType: 'workOrder',
    data: {
      name: 'Aluminum Profile Batch #312',
      workCenterId: 'wc-extrusion-line-a',
      status: 'complete',
      startDate: isoOffset(-360),
      endDate: isoEndAfterMonths(-360, 4),
    },
  },
  {
    docId: 'wo-002',
    docType: 'workOrder',
    data: {
      name: 'PVC Tubing Long Run',
      workCenterId: 'wc-extrusion-line-a',
      status: 'in-progress',
      startDate: isoOffset(-210),
      endDate: isoEndAfterMonths(-210, 4),
    },
  },
  {
    docId: 'wo-003',
    docType: 'workOrder',
    data: {
      name: 'Polyethylene Liner Series',
      workCenterId: 'wc-extrusion-line-a',
      status: 'open',
      startDate: isoOffset(-60),
      endDate: isoEndAfterMonths(-60, 4),
    },
  },
  {
    docId: 'wo-004',
    docType: 'workOrder',
    data: {
      name: 'Bracket Set — Q3 Build',
      workCenterId: 'wc-cnc-machine-1',
      status: 'complete',
      startDate: isoOffset(-400),
      endDate: isoEndAfterMonths(-400, 4),
    },
  },
  {
    docId: 'wo-005',
    docType: 'workOrder',
    data: {
      name: 'Precision Housing #A-44',
      workCenterId: 'wc-cnc-machine-1',
      status: 'open',
      startDate: isoOffset(-110),
      endDate: isoEndAfterMonths(-110, 4),
    },
  },
  {
    docId: 'wo-006',
    docType: 'workOrder',
    data: {
      name: 'Gearbox Assembly Run 17',
      workCenterId: 'wc-assembly-station',
      status: 'blocked',
      startDate: isoOffset(-95),
      endDate: isoEndAfterMonths(-95, 4),
    },
  },
  {
    docId: 'wo-007',
    docType: 'workOrder',
    data: {
      name: 'Motor Mount Sub-assembly',
      workCenterId: 'wc-assembly-station',
      status: 'open',
      startDate: isoOffset(55),
      endDate: isoEndAfterMonths(55, 4),
    },
  },
  {
    docId: 'wo-008',
    docType: 'workOrder',
    data: {
      name: 'Batch QC — Shipment 88',
      workCenterId: 'wc-quality-control',
      status: 'in-progress',
      startDate: isoOffset(-75),
      endDate: isoEndAfterMonths(-75, 4),
    },
  },
  {
    docId: 'wo-009',
    docType: 'workOrder',
    data: {
      name: 'Annual Compliance Audit',
      workCenterId: 'wc-quality-control',
      status: 'open',
      startDate: isoOffset(65),
      endDate: isoEndAfterMonths(65, 4),
    },
  },
  {
    docId: 'wo-010',
    docType: 'workOrder',
    data: {
      name: 'Export Crate Prep — EU',
      workCenterId: 'wc-packaging-line',
      status: 'complete',
      startDate: isoOffset(-520),
      endDate: isoEndAfterMonths(-520, 4),
    },
  },
  {
    docId: 'wo-011',
    docType: 'workOrder',
    data: {
      name: 'Customer Order #7741',
      workCenterId: 'wc-packaging-line',
      status: 'blocked',
      startDate: isoOffset(-370),
      endDate: isoEndAfterMonths(-370, 4),
    },
  },
  {
    docId: 'wo-012',
    docType: 'workOrder',
    data: {
      name: 'Holiday Run Campaign',
      workCenterId: 'wc-packaging-line',
      status: 'open',
      startDate: isoOffset(-90),
      endDate: isoEndAfterMonths(-90, 4),
    },
  },
];
