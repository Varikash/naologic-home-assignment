import { WorkCenterDocument } from '../models/work-center.model';
import { WorkOrderDocument } from '../models/work-order.model';

const TODAY = new Date();

function isoOffset(days: number): string {
  const d = new Date(TODAY);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

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

export const SAMPLE_WORK_ORDERS: WorkOrderDocument[] = [
  {
    docId: 'wo-001',
    docType: 'workOrder',
    data: {
      name: 'Aluminum Profile Batch #312',
      workCenterId: 'wc-extrusion-line-a',
      status: 'complete',
      startDate: isoOffset(-14),
      endDate: isoOffset(-7),
    },
  },
  {
    docId: 'wo-002',
    docType: 'workOrder',
    data: {
      name: 'PVC Tubing Run',
      workCenterId: 'wc-extrusion-line-a',
      status: 'in-progress',
      startDate: isoOffset(-3),
      endDate: isoOffset(5),
    },
  },
  {
    docId: 'wo-003',
    docType: 'workOrder',
    data: {
      name: 'Precision Housing #A-44',
      workCenterId: 'wc-cnc-machine-1',
      status: 'open',
      startDate: isoOffset(7),
      endDate: isoOffset(14),
    },
  },
  {
    docId: 'wo-004',
    docType: 'workOrder',
    data: {
      name: 'Gearbox Assembly Run 17',
      workCenterId: 'wc-assembly-station',
      status: 'blocked',
      startDate: isoOffset(-5),
      endDate: isoOffset(3),
    },
  },
  {
    docId: 'wo-005',
    docType: 'workOrder',
    data: {
      name: 'Motor Mount Sub-assembly',
      workCenterId: 'wc-assembly-station',
      status: 'open',
      startDate: isoOffset(10),
      endDate: isoOffset(21),
    },
  },
  {
    docId: 'wo-006',
    docType: 'workOrder',
    data: {
      name: 'Batch QC — Shipment 88',
      workCenterId: 'wc-quality-control',
      status: 'in-progress',
      startDate: isoOffset(-2),
      endDate: isoOffset(5),
    },
  },
  {
    docId: 'wo-007',
    docType: 'workOrder',
    data: {
      name: 'Export Crate Prep — EU',
      workCenterId: 'wc-packaging-line',
      status: 'complete',
      startDate: isoOffset(-20),
      endDate: isoOffset(-10),
    },
  },
  {
    docId: 'wo-008',
    docType: 'workOrder',
    data: {
      name: 'Customer Order #7741',
      workCenterId: 'wc-packaging-line',
      status: 'blocked',
      startDate: isoOffset(4),
      endDate: isoOffset(12),
    },
  },
];
