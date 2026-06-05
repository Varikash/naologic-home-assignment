import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { WorkOrderStatus } from '../../../core/models/work-order.model';

const STATUS_LABELS: Record<WorkOrderStatus, string> = {
  open: 'Open',
  'in-progress': 'In progress',
  complete: 'Complete',
  blocked: 'Blocked',
};

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

  readonly label = computed(() => STATUS_LABELS[this.status()]);
  readonly modifierClass = computed(() => `badge--${this.status()}`);
}
