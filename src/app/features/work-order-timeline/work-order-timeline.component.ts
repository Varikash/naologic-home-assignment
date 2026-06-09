import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterRenderEffect,
  computed,
  inject,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgSelectComponent } from '@ng-select/ng-select';

import { WorkOrderDocument } from '../../core/models/work-order.model';
import { WorkOrderStore } from '../../core/services/work-order.store';
import { today } from '../../shared/timeline/date-helpers';
import {
  ZoomLevel,
  columnsForViewport,
  contentViewport,
  dateToX,
  findColumnIndex,
} from '../../shared/timeline/positioning';
import {
  CreateOrderRequest,
  TimelineGridComponent,
} from './timeline-grid/timeline-grid.component';
import { TimelineHeaderComponent } from './timeline-header/timeline-header.component';
import {
  WorkOrderPanelComponent,
  WorkOrderPanelSavePayload,
  WorkOrderPanelState,
} from './work-order-panel/work-order-panel.component';

interface ZoomOption {
  value: ZoomLevel;
  label: string;
}

@Component({
  selector: 'app-work-order-timeline',
  standalone: true,
  imports: [
    FormsModule,
    NgSelectComponent,
    TimelineHeaderComponent,
    TimelineGridComponent,
    WorkOrderPanelComponent,
  ],
  templateUrl: './work-order-timeline.component.html',
  styleUrl: './work-order-timeline.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkOrderTimelineComponent {
  private readonly store = inject(WorkOrderStore);

  // Width of the fixed left work-center column (matches `.grid__sticky` /
  // `.header__sticky` in SCSS); excluded when centering the scroll on today.
  private static readonly STICKY_COLUMN_PX = 220;

  readonly today = signal(today());
  readonly zoom = signal<ZoomLevel>('month');

  private readonly scrollContainer =
    viewChild<ElementRef<HTMLElement>>('scrollContainer');

  readonly workCenters = this.store.workCenters;
  readonly workOrders = this.store.workOrders;
  readonly ordersByCenter = this.store.ordersByCenter;

  readonly viewport = computed(() =>
    contentViewport(this.today(), this.zoom(), this.workOrders()),
  );
  readonly columns = computed(() => columnsForViewport(this.viewport()));
  readonly currentColumnIndex = computed(() =>
    findColumnIndex(this.columns(), this.today()),
  );

  constructor() {
    // Keep today centered in the visible timeline on first render and whenever
    // the zoom changes (which rebuilds the content range). Order edits also
    // recompute the viewport but must NOT yank the scroll, so only `zoom` is
    // tracked here — the viewport is read untracked.
    afterRenderEffect(() => {
      this.zoom();
      const el = this.scrollContainer()?.nativeElement;
      if (!el) return;
      const viewport = untracked(this.viewport);
      const todayX = dateToX(this.today(), viewport);
      const visibleGridWidth =
        el.clientWidth - WorkOrderTimelineComponent.STICKY_COLUMN_PX;
      el.scrollLeft = Math.max(0, todayX - visibleGridWidth / 2);
    });
  }

  readonly panelState = signal<WorkOrderPanelState | null>(null);

  readonly zoomOptions: ZoomOption[] = [
    { value: 'day', label: 'Day' },
    { value: 'week', label: 'Week' },
    { value: 'month', label: 'Month' },
  ];

  onEditOrder(order: WorkOrderDocument): void {
    this.panelState.set({ mode: 'edit', order });
  }

  onCreateOrder(request: CreateOrderRequest): void {
    this.panelState.set({
      mode: 'create',
      workCenterId: request.workCenterId,
      startDate: request.startDate,
    });
  }

  onDeleteOrder(order: WorkOrderDocument): void {
    this.store.delete(order.docId);
  }

  onPanelCancel(): void {
    this.panelState.set(null);
  }

  onPanelSave(payload: WorkOrderPanelSavePayload): void {
    if (payload.mode === 'create') {
      this.store.create(payload.data);
    } else {
      this.store.update(payload.docId, payload.data);
    }
    this.panelState.set(null);
  }
}
