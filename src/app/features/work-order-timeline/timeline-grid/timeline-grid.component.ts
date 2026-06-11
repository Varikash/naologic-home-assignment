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

@Component({
  selector: 'app-timeline-grid',
  standalone: true,
  imports: [WorkOrderBarComponent],
  templateUrl: './timeline-grid.component.html',
  styleUrl: './timeline-grid.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimelineGridComponent {
  private static readonly GHOST_LABEL_HALF_WIDTH_PX = 65;

  readonly columns = input.required<TimelineColumn[]>();
  readonly currentColumnIndex = input.required<number>();
  readonly workCenters = input.required<WorkCenterDocument[]>();
  readonly viewport = input.required<Viewport>();
  readonly ordersByCenter = input.required<Map<string, WorkOrderDocument[]>>();

  readonly editOrder = output<WorkOrderDocument>();
  readonly deleteOrder = output<WorkOrderDocument>();
  readonly createOrder = output<CreateOrderRequest>();

  // Click-to-create ghost: which row it's in, and the day under the cursor it
  // snaps to. Day-granular (not column-snapped) so an order can start mid-month.
  private readonly hoverCenterId = signal<string | null>(null);
  private readonly hoverStartDate = signal<string | null>(null);

  // Pixel geometry of the ghost for the hovered row: left edge at the snapped
  // start day, width = one period of the current zoom (day / week / month).
  readonly ghostGeometry = computed(() => {
    const start = this.hoverStartDate();
    if (!start) return null;
    const viewport = this.viewport();
    const left = dateToX(start, viewport);
    const right = dateToX(defaultOrderEnd(start, viewport.zoom), viewport);
    return {
      left,
      width: right - left,
      labelAlignStart: left < TimelineGridComponent.GHOST_LABEL_HALF_WIDTH_PX,
    };
  });

  ordersFor(workCenterId: string): WorkOrderDocument[] {
    return this.ordersByCenter().get(workCenterId) ?? [];
  }

  showsGhost(workCenterId: string): boolean {
    return this.hoverCenterId() === workCenterId && this.hoverStartDate() !== null;
  }

  onCellsMouseMove(event: MouseEvent, workCenterId: string): void {
    // Over an existing bar the cursor has its own affordance — hide the ghost.
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
    // Clicks on a work order bar (or its three-dot menu) have their own
    // handling — only empty grid space opens the create panel.
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
