import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';

import { SAMPLE_WORK_CENTERS, SAMPLE_WORK_ORDERS } from '../data/sample-data';
import { WorkOrderData } from '../models/work-order.model';
import { WorkOrderStore } from './work-order.store';

const NEW_ORDER: WorkOrderData = {
  name: 'Test Order',
  workCenterId: 'wc-extrusion-line-a',
  status: 'open',
  startDate: '2030-01-01',
  endDate: '2030-01-10',
};

describe('WorkOrderStore', () => {
  function setup(): WorkOrderStore {
    TestBed.configureTestingModule({});
    return TestBed.inject(WorkOrderStore);
  }

  it('exposes the sample data', () => {
    const store = setup();
    expect(store.workCenters()).toEqual(SAMPLE_WORK_CENTERS);
    expect(store.workOrders()).toEqual(SAMPLE_WORK_ORDERS);
  });

  it('groups orders by work center', () => {
    const store = setup();
    const byCenter = store.ordersByCenter();
    const total = [...byCenter.values()].reduce((sum, list) => sum + list.length, 0);
    expect(total).toBe(store.workOrders().length);
    for (const [centerId, orders] of byCenter) {
      expect(orders.every((o) => o.data.workCenterId === centerId)).toBe(true);
    }
  });

  it('create appends a new document with a generated docId', () => {
    const store = setup();
    const before = store.workOrders().length;

    const doc = store.create(NEW_ORDER);

    expect(doc.docId).toBeTruthy();
    expect(doc.docType).toBe('workOrder');
    expect(store.workOrders()).toHaveLength(before + 1);
    expect(store.workOrders().at(-1)).toEqual(doc);
  });

  it('update patches only the targeted order', () => {
    const store = setup();
    const doc = store.create(NEW_ORDER);
    const others = store.workOrders().filter((o) => o.docId !== doc.docId);

    store.update(doc.docId, { name: 'Renamed', status: 'blocked' });

    const updated = store.workOrders().find((o) => o.docId === doc.docId)!;
    expect(updated.data).toEqual({ ...NEW_ORDER, name: 'Renamed', status: 'blocked' });
    expect(store.workOrders().filter((o) => o.docId !== doc.docId)).toEqual(others);
  });

  it('delete removes the order', () => {
    const store = setup();
    const doc = store.create(NEW_ORDER);

    store.delete(doc.docId);

    expect(store.workOrders().some((o) => o.docId === doc.docId)).toBe(false);
  });

  it('ordersByCenter recomputes after mutations', () => {
    const store = setup();
    const doc = store.create(NEW_ORDER);
    expect(store.ordersByCenter().get(NEW_ORDER.workCenterId)).toContainEqual(doc);

    store.delete(doc.docId);
    expect(store.ordersByCenter().get(NEW_ORDER.workCenterId) ?? []).not.toContainEqual(doc);
  });
});
