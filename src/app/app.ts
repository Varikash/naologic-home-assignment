import { ChangeDetectionStrategy, Component } from '@angular/core';

import { WorkOrderTimelineComponent } from './features/work-order-timeline/work-order-timeline.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [WorkOrderTimelineComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {}
