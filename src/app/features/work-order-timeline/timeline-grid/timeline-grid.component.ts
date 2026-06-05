import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { WorkCenterDocument } from '../../../core/models/work-center.model';
import { TimelineColumn } from '../../../shared/timeline/positioning';

@Component({
  selector: 'app-timeline-grid',
  standalone: true,
  imports: [],
  templateUrl: './timeline-grid.component.html',
  styleUrl: './timeline-grid.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimelineGridComponent {
  readonly columns = input.required<TimelineColumn[]>();
  readonly currentColumnIndex = input.required<number>();
  readonly workCenters = input.required<WorkCenterDocument[]>();
}
