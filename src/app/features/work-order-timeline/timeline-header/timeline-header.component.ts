import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { TimelineColumn, ZoomLevel } from '../../../shared/timeline/positioning';

@Component({
  selector: 'app-timeline-header',
  standalone: true,
  imports: [],
  templateUrl: './timeline-header.component.html',
  styleUrl: './timeline-header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimelineHeaderComponent {
  readonly columns = input.required<TimelineColumn[]>();
  readonly currentColumnIndex = input.required<number>();
  readonly zoom = input.required<ZoomLevel>();

  protected readonly pillText = computed(() => {
    switch (this.zoom()) {
      case 'day':
        return 'Current day';
      case 'week':
        return 'Current week';
      case 'month':
        return 'Current month';
    }
  });
}
