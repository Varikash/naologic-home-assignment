import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

import { WorkCenterDocument } from '../../../core/models/work-center.model';
import { WorkOrderDocument } from '../../../core/models/work-order.model';
import { TimelineColumn, Viewport, xToDate } from '../../../shared/timeline/positioning';
import { WorkOrderBarComponent } from '../work-order-bar/work-order-bar.component';

export interface CreateOrderRequest {
  workCenterId: string;
  startDate: string;
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
  readonly columns = input.required<TimelineColumn[]>();
  readonly currentColumnIndex = input.required<number>();
  readonly workCenters = input.required<WorkCenterDocument[]>();
  readonly viewport = input.required<Viewport>();
  readonly ordersByCenter = input.required<Map<string, WorkOrderDocument[]>>();

  readonly editOrder = output<WorkOrderDocument>();
  readonly deleteOrder = output<WorkOrderDocument>();
  readonly createOrder = output<CreateOrderRequest>();

  // Per work center, the set of column indices any order touches. Cells in
  // these columns suppress the click-to-create ghost — since the ghost is
  // cell-sized, a cell even partially covered by an order is considered
  // occupied so the preview never bleeds around a bar.
  readonly occupiedColumns = computed(() => {
    const cols = this.columns();
    const map = new Map<string, Set<number>>();
    for (const [workCenterId, orders] of this.ordersByCenter()) {
      const occupied = new Set<number>();
      for (const order of orders) {
        const { startDate, endDate } = order.data;
        cols.forEach((col, i) => {
          if (startDate < col.endDate && endDate > col.startDate) occupied.add(i);
        });
      }
      map.set(workCenterId, occupied);
    }
    return map;
  });

  ordersFor(workCenterId: string): WorkOrderDocument[] {
    return this.ordersByCenter().get(workCenterId) ?? [];
  }

  isOccupied(workCenterId: string, columnIndex: number): boolean {
    return this.occupiedColumns().get(workCenterId)?.has(columnIndex) ?? false;
  }

  onCellsClick(event: MouseEvent, workCenterId: string): void {
    // Clicks on a work order bar (or its three-dot menu) have their own
    // handling — only empty grid space opens the create panel.
    if ((event.target as HTMLElement).closest('app-work-order-bar')) return;

    const cells = event.currentTarget as HTMLElement;
    const x = event.clientX - cells.getBoundingClientRect().left;
    const startDate = xToDate(x, this.viewport());
    this.createOrder.emit({ workCenterId, startDate });
  }
}
