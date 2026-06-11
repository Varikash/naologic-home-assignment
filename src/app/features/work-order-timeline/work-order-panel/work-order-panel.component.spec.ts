import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { WorkOrderDocument } from '../../../core/models/work-order.model';
import {
  WorkOrderPanelComponent,
  WorkOrderPanelSavePayload,
  WorkOrderPanelState,
} from './work-order-panel.component';

const EXISTING_ORDER: WorkOrderDocument = {
  docId: 'wo-existing',
  docType: 'workOrder',
  data: {
    name: 'Existing Order',
    workCenterId: 'wc-1',
    status: 'in-progress',
    startDate: '2030-03-01',
    endDate: '2030-03-15',
  },
};

describe('WorkOrderPanelComponent', () => {
  let fixture: ComponentFixture<WorkOrderPanelComponent>;
  let component: WorkOrderPanelComponent;
  let savedPayloads: WorkOrderPanelSavePayload[];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkOrderPanelComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WorkOrderPanelComponent);
    component = fixture.componentInstance;
    savedPayloads = [];
    component.save.subscribe((payload) => savedPayloads.push(payload));
  });

  function open(state: WorkOrderPanelState, allOrders: WorkOrderDocument[] = []): void {
    fixture.componentRef.setInput('state', state);
    fixture.componentRef.setInput('allOrders', allOrders);
    fixture.detectChanges();
  }

  it('prefills create mode with the clicked range and defaults', () => {
    open({
      mode: 'create',
      workCenterId: 'wc-1',
      startDate: '2030-05-01',
      endDate: '2030-05-08',
    });

    expect(component.form.getRawValue()).toEqual({
      name: '',
      status: 'open',
      startDate: { year: 2030, month: 5, day: 1 },
      endDate: { year: 2030, month: 5, day: 8 },
    });
    expect(component.submitLabel()).toBe('Create');
  });

  it('defaults endDate to start + 7 days when only startDate is given', () => {
    open({ mode: 'create', workCenterId: 'wc-1', startDate: '2030-05-01' });

    expect(component.form.controls.endDate.value).toEqual({ year: 2030, month: 5, day: 8 });
  });

  it('prefills edit mode from the order and labels the button Save', () => {
    open({ mode: 'edit', order: EXISTING_ORDER });

    expect(component.form.getRawValue()).toEqual({
      name: 'Existing Order',
      status: 'in-progress',
      startDate: { year: 2030, month: 3, day: 1 },
      endDate: { year: 2030, month: 3, day: 15 },
    });
    expect(component.submitLabel()).toBe('Save');
  });

  it('does not save while the form is invalid', () => {
    open({ mode: 'create', workCenterId: 'wc-1', startDate: '2030-05-01' });
    component.form.controls.name.setValue('');

    component.onSubmit();

    expect(savedPayloads).toHaveLength(0);
    expect(component.form.controls.name.touched).toBe(true);
  });

  it('rejects end date not after start date', () => {
    open({ mode: 'create', workCenterId: 'wc-1', startDate: '2030-05-01' });
    component.form.patchValue({
      name: 'Order',
      endDate: { year: 2030, month: 5, day: 1 },
    });

    component.onSubmit();

    expect(component.form.hasError('endBeforeStart')).toBe(true);
    expect(savedPayloads).toHaveLength(0);
  });

  it('blocks save and shows the error when the range overlaps another order', () => {
    open(
      { mode: 'create', workCenterId: 'wc-1', startDate: '2030-03-10' },
      [EXISTING_ORDER],
    );
    component.form.controls.name.setValue('Overlapping');

    component.onSubmit();

    expect(component.overlapError()).toBe(true);
    expect(savedPayloads).toHaveLength(0);
  });

  it('clears the overlap error on any form edit', () => {
    open(
      { mode: 'create', workCenterId: 'wc-1', startDate: '2030-03-10' },
      [EXISTING_ORDER],
    );
    component.form.controls.name.setValue('Overlapping');
    component.onSubmit();
    expect(component.overlapError()).toBe(true);

    component.form.controls.name.setValue('Overlapping 2');

    expect(component.overlapError()).toBe(false);
  });

  it('emits a create payload with the trimmed name', () => {
    open({ mode: 'create', workCenterId: 'wc-1', startDate: '2030-05-01' }, [EXISTING_ORDER]);
    component.form.controls.name.setValue('  New Order  ');

    component.onSubmit();

    expect(savedPayloads).toEqual([
      {
        mode: 'create',
        data: {
          name: 'New Order',
          status: 'open',
          workCenterId: 'wc-1',
          startDate: '2030-05-01',
          endDate: '2030-05-08',
        },
      },
    ]);
  });

  it('excludes the edited order itself from the overlap check', () => {
    open({ mode: 'edit', order: EXISTING_ORDER }, [EXISTING_ORDER]);

    component.onSubmit();

    expect(component.overlapError()).toBe(false);
    expect(savedPayloads).toEqual([
      { mode: 'edit', docId: 'wo-existing', data: EXISTING_ORDER.data },
    ]);
  });

  it('emits closed on Escape only while open', () => {
    const closedSpy = vi.fn();
    component.closed.subscribe(closedSpy);

    component.onEscape();
    expect(closedSpy).not.toHaveBeenCalled();

    open({ mode: 'create', workCenterId: 'wc-1' });
    component.onEscape();
    expect(closedSpy).toHaveBeenCalledTimes(1);
  });
});
