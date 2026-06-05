import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

import { WorkOrderDocument } from '../../../core/models/work-order.model';
import { Viewport, barGeometry } from '../../../shared/timeline/positioning';
import { ActionsMenuComponent } from '../../../shared/ui/actions-menu/actions-menu.component';
import { StatusBadgeComponent } from '../../../shared/ui/status-badge/status-badge.component';

// Minimum bar width to show the trailing controls. Below these thresholds
// the bar still conveys status through its background color, but inline
// chrome is dropped to keep the name legible (and avoid layouts that
// can't fit any text at all).
const MIN_WIDTH_FOR_BADGE_PX = 110;
const MIN_WIDTH_FOR_ACTIONS_PX = 70;

@Component({
  selector: 'app-work-order-bar',
  standalone: true,
  imports: [StatusBadgeComponent, ActionsMenuComponent],
  templateUrl: './work-order-bar.component.html',
  styleUrl: './work-order-bar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkOrderBarComponent {
  readonly order = input.required<WorkOrderDocument>();
  readonly viewport = input.required<Viewport>();

  readonly editClick = output<WorkOrderDocument>();
  readonly deleteClick = output<WorkOrderDocument>();

  readonly geometry = computed(() => barGeometry(this.order(), this.viewport()));
  readonly modifierClass = computed(() => `bar--${this.order().data.status}`);

  readonly showBadge = computed(() => this.geometry().width >= MIN_WIDTH_FOR_BADGE_PX);
  readonly showActions = computed(() => this.geometry().width >= MIN_WIDTH_FOR_ACTIONS_PX);

  onEdit(): void {
    this.editClick.emit(this.order());
  }

  onDelete(): void {
    this.deleteClick.emit(this.order());
  }
}
