import { ChangeDetectionStrategy, Component, output } from '@angular/core';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-actions-menu',
  standalone: true,
  imports: [NgbDropdownModule],
  templateUrl: './actions-menu.component.html',
  styleUrl: './actions-menu.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActionsMenuComponent {
  readonly editClick = output<void>();
  readonly deleteClick = output<void>();
}
