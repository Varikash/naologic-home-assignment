import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import {
  WORK_ORDER_STATUS_LABELS,
  WorkOrderStatus,
} from '../../../core/models/work-order.model';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [],
  templateUrl: './status-badge.component.html',
  styleUrl: './status-badge.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatusBadgeComponent {
  readonly status = input.required<WorkOrderStatus>();

  readonly label = computed(() => WORK_ORDER_STATUS_LABELS[this.status()]);
  readonly modifierClass = computed(() => `badge--${this.status()}`);
}
