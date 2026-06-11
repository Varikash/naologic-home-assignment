import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterRenderEffect,
  computed,
  effect,
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

// Fixed left column width; exposed to SCSS via the `--timeline-sticky-col` host binding.
const STICKY_COLUMN_PX = 380;

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
  host: {
    '[style.--timeline-sticky-col.px]': 'stickyColumnPx',
  },
})
export class WorkOrderTimelineComponent {
  private readonly store = inject(WorkOrderStore);

  protected readonly stickyColumnPx = STICKY_COLUMN_PX;
  private readonly todayIso = today();

  readonly zoom = signal<ZoomLevel>('month');
  readonly panelState = signal<WorkOrderPanelState | null>(null);

  readonly zoomOptions: ZoomOption[] = [
    { value: 'day', label: 'Day' },
    { value: 'week', label: 'Week' },
    { value: 'month', label: 'Month' },
  ];

  private readonly scrollContainer =
    viewChild<ElementRef<HTMLElement>>('scrollContainer');
  private readonly timelineGrid = viewChild(TimelineGridComponent);

  // Visible grid width; lets the content stretch to fill wide monitors.
  private readonly gridWidth = signal(0);

  readonly workCenters = this.store.workCenters;
  readonly workOrders = this.store.workOrders;
  readonly ordersByCenter = this.store.ordersByCenter;

  readonly viewport = computed(() =>
    contentViewport(this.todayIso, this.zoom(), this.workOrders(), this.gridWidth()),
  );
  readonly columns = computed(() => columnsForViewport(this.viewport()));
  readonly currentColumnIndex = computed(() =>
    findColumnIndex(this.columns(), this.todayIso),
  );

  constructor() {
    effect((onCleanup) => {
      const el = this.scrollContainer()?.nativeElement;
      if (!el) return;
      const measure = () => this.gridWidth.set(el.clientWidth - STICKY_COLUMN_PX);
      measure();
      // ResizeObserver is absent in some test environments.
      if (typeof ResizeObserver === 'undefined') return;
      const observer = new ResizeObserver(measure);
      observer.observe(el);
      onCleanup(() => observer.disconnect());
    });

    // Center today on first render and on zoom change. Order edits also
    // recompute the viewport but must not yank the scroll — only `zoom` is tracked.
    afterRenderEffect(() => {
      this.zoom();
      const el = this.scrollContainer()?.nativeElement;
      if (!el) return;
      const viewport = untracked(this.viewport);
      const todayX = dateToX(this.todayIso, viewport);
      const visibleGridWidth = el.clientWidth - STICKY_COLUMN_PX;
      el.scrollLeft = Math.max(0, todayX - visibleGridWidth / 2);
    });
  }

  onTimelineScroll(): void {
    this.timelineGrid()?.clearGhost();
  }

  onEditOrder(order: WorkOrderDocument): void {
    this.panelState.set({ mode: 'edit', order });
  }

  onCreateOrder(request: CreateOrderRequest): void {
    this.panelState.set({
      mode: 'create',
      workCenterId: request.workCenterId,
      startDate: request.startDate,
      endDate: request.endDate,
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
