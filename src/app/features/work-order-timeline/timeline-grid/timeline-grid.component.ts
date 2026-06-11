import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';

import { WorkCenterDocument } from '../../../core/models/work-center.model';
import { WorkOrderDocument } from '../../../core/models/work-order.model';
import {
  centeredOrderRange,
  dateToX,
  defaultOrderEnd,
  TimelineColumn,
  Viewport,
  xToDate,
} from '../../../shared/timeline/positioning';
import { WorkOrderBarComponent } from '../work-order-bar/work-order-bar.component';

export interface CreateOrderRequest {
  workCenterId: string;
  startDate: string;
  endDate: string;
}

// "Click to add dates" label width; exposed to SCSS via the `--ghost-label-width` host binding.
const GHOST_LABEL_WIDTH_PX = 130;

@Component({
  selector: 'app-timeline-grid',
  standalone: true,
  imports: [WorkOrderBarComponent],
  templateUrl: './timeline-grid.component.html',
  styleUrl: './timeline-grid.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[style.--ghost-label-width.px]': 'ghostLabelWidthPx',
  },
})
export class TimelineGridComponent {
  protected readonly ghostLabelWidthPx = GHOST_LABEL_WIDTH_PX;

  readonly columns = input.required<TimelineColumn[]>();
  readonly currentColumnIndex = input.required<number>();
  readonly workCenters = input.required<WorkCenterDocument[]>();
  readonly viewport = input.required<Viewport>();
  readonly ordersByCenter = input.required<Map<string, WorkOrderDocument[]>>();

  readonly editOrder = output<WorkOrderDocument>();
  readonly deleteOrder = output<WorkOrderDocument>();
  readonly createOrder = output<CreateOrderRequest>();

  // Click-to-create ghost: day-granular so an order can start mid-column.
  private readonly hoverCenterId = signal<string | null>(null);
  private readonly hoverStartDate = signal<string | null>(null);

  readonly ghostGeometry = computed(() => {
    const start = this.hoverStartDate();
    if (!start) return null;
    const viewport = this.viewport();
    const left = dateToX(start, viewport);
    const right = dateToX(defaultOrderEnd(start, viewport.zoom), viewport);
    return {
      left,
      width: right - left,
      labelAlignStart: left < GHOST_LABEL_WIDTH_PX / 2,
    };
  });

  ordersFor(workCenterId: string): WorkOrderDocument[] {
    return this.ordersByCenter().get(workCenterId) ?? [];
  }

  showsGhost(workCenterId: string): boolean {
    return this.hoverCenterId() === workCenterId && this.hoverStartDate() !== null;
  }

  onCellsMouseMove(event: MouseEvent, workCenterId: string): void {
    if ((event.target as HTMLElement).closest('app-work-order-bar')) {
      this.clearGhost();
      return;
    }
    const cells = event.currentTarget as HTMLElement;
    const x = event.clientX - cells.getBoundingClientRect().left;
    const viewport = this.viewport();
    const { startDate } = centeredOrderRange(xToDate(x, viewport), viewport.zoom);
    this.hoverCenterId.set(workCenterId);
    this.hoverStartDate.set(startDate);
  }

  onCellsMouseLeave(): void {
    this.clearGhost();
  }

  onCellsClick(event: MouseEvent, workCenterId: string): void {
    // Only empty grid space opens the create panel; bars handle their own clicks.
    if ((event.target as HTMLElement).closest('app-work-order-bar')) return;

    const cells = event.currentTarget as HTMLElement;
    const x = event.clientX - cells.getBoundingClientRect().left;
    const viewport = this.viewport();
    const { startDate, endDate } = centeredOrderRange(xToDate(x, viewport), viewport.zoom);
    this.createOrder.emit({ workCenterId, startDate, endDate });
  }

  clearGhost(): void {
    this.hoverCenterId.set(null);
    this.hoverStartDate.set(null);
  }
}
