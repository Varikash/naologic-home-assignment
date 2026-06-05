import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { WorkCenterDocument } from '../../../core/models/work-center.model';
import { WorkOrderDocument } from '../../../core/models/work-order.model';
import { TimelineColumn, Viewport } from '../../../shared/timeline/positioning';
import { WorkOrderBarComponent } from '../work-order-bar/work-order-bar.component';

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

  ordersFor(workCenterId: string): WorkOrderDocument[] {
    return this.ordersByCenter().get(workCenterId) ?? [];
  }
}
