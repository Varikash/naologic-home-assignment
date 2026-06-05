import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgSelectComponent } from '@ng-select/ng-select';

import { WorkOrderDocument } from '../../core/models/work-order.model';
import { WorkOrderStore } from '../../core/services/work-order.store';
import { today } from '../../shared/timeline/date-helpers';
import {
  ZoomLevel,
  columnsForViewport,
  findColumnIndex,
  rangeForZoom,
} from '../../shared/timeline/positioning';
import { TimelineGridComponent } from './timeline-grid/timeline-grid.component';
import { TimelineHeaderComponent } from './timeline-header/timeline-header.component';

interface ZoomOption {
  value: ZoomLevel;
  label: string;
}

@Component({
  selector: 'app-work-order-timeline',
  standalone: true,
  imports: [FormsModule, NgSelectComponent, TimelineHeaderComponent, TimelineGridComponent],
  templateUrl: './work-order-timeline.component.html',
  styleUrl: './work-order-timeline.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkOrderTimelineComponent {
  private readonly store = inject(WorkOrderStore);

  readonly today = signal(today());
  readonly zoom = signal<ZoomLevel>('day');

  readonly viewport = computed(() => rangeForZoom(this.today(), this.zoom()));
  readonly columns = computed(() => columnsForViewport(this.viewport()));
  readonly currentColumnIndex = computed(() =>
    findColumnIndex(this.columns(), this.today()),
  );

  readonly workCenters = this.store.workCenters;
  readonly ordersByCenter = this.store.ordersByCenter;

  readonly zoomOptions: ZoomOption[] = [
    { value: 'day', label: 'Day' },
    { value: 'week', label: 'Week' },
    { value: 'month', label: 'Month' },
  ];

  onEditOrder(order: WorkOrderDocument): void {
    // Stage 7 wires this to the slide-out panel; logged for now so the
    // dropdown is verifiable end-to-end during stage 5.
    console.log('[work-order-timeline] edit', order);
  }

  onDeleteOrder(order: WorkOrderDocument): void {
    this.store.delete(order.docId);
  }
}
