import { Injectable, Signal, computed, signal } from '@angular/core';

import { SAMPLE_WORK_CENTERS, SAMPLE_WORK_ORDERS } from '../data/sample-data';
import { WorkCenterDocument } from '../models/work-center.model';
import { WorkOrderData, WorkOrderDocument } from '../models/work-order.model';

@Injectable({ providedIn: 'root' })
export class WorkOrderStore {
  private readonly _workCenters = signal<WorkCenterDocument[]>(SAMPLE_WORK_CENTERS);
  private readonly _workOrders = signal<WorkOrderDocument[]>(SAMPLE_WORK_ORDERS);

  readonly workCenters: Signal<WorkCenterDocument[]> = this._workCenters.asReadonly();
  readonly workOrders: Signal<WorkOrderDocument[]> = this._workOrders.asReadonly();

  readonly ordersByCenter: Signal<Map<string, WorkOrderDocument[]>> = computed(() => {
    const map = new Map<string, WorkOrderDocument[]>();
    for (const order of this._workOrders()) {
      const list = map.get(order.data.workCenterId);
      if (list) {
        list.push(order);
      } else {
        map.set(order.data.workCenterId, [order]);
      }
    }
    return map;
  });

  create(input: WorkOrderData): WorkOrderDocument {
    const doc: WorkOrderDocument = {
      docId: crypto.randomUUID(),
      docType: 'workOrder',
      data: input,
    };
    this._workOrders.update((prev) => [...prev, doc]);
    return doc;
  }

  update(docId: string, patch: Partial<WorkOrderData>): void {
    this._workOrders.update((prev) =>
      prev.map((order) =>
        order.docId === docId ? { ...order, data: { ...order.data, ...patch } } : order,
      ),
    );
  }

  delete(docId: string): void {
    this._workOrders.update((prev) => prev.filter((order) => order.docId !== docId));
  }
}
