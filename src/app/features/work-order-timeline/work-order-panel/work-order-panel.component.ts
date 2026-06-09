import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import {
  NgbDateParserFormatter,
  NgbDatepickerModule,
  NgbDateStruct,
} from '@ng-bootstrap/ng-bootstrap';
import { NgSelectComponent } from '@ng-select/ng-select';

import {
  WorkOrderData,
  WorkOrderDocument,
  WorkOrderStatus,
} from '../../../core/models/work-order.model';
import { addDays } from '../../../shared/timeline/date-helpers';
import { DdMmYyyyDateFormatter } from '../../../shared/timeline/dd-mm-yyyy-formatter';
import { isoToNgb, ngbToIso } from '../../../shared/timeline/ngb-date';
import { hasOverlap } from '../../../shared/timeline/overlap';

export type WorkOrderPanelState =
  | { mode: 'create'; workCenterId: string; startDate?: string }
  | { mode: 'edit'; order: WorkOrderDocument };

export type WorkOrderPanelSavePayload =
  | { mode: 'create'; data: WorkOrderData }
  | { mode: 'edit'; docId: string; data: WorkOrderData };

interface StatusOption {
  value: WorkOrderStatus;
  label: string;
}

const STATUS_OPTIONS: StatusOption[] = [
  { value: 'open', label: 'Open' },
  { value: 'in-progress', label: 'In progress' },
  { value: 'complete', label: 'Complete' },
  { value: 'blocked', label: 'Blocked' },
];

const DEFAULT_DURATION_DAYS = 7;

// FormGroup-level validator: end must be strictly after start (endDate
// is exclusive in this system, so a zero-day order is invalid).
function endAfterStartValidator(group: AbstractControl): ValidationErrors | null {
  const start = group.get('startDate')?.value as NgbDateStruct | null;
  const end = group.get('endDate')?.value as NgbDateStruct | null;
  if (!start || !end) return null;
  if (ngbToIso(end) <= ngbToIso(start)) return { endBeforeStart: true };
  return null;
}

@Component({
  selector: 'app-work-order-panel',
  standalone: true,
  imports: [ReactiveFormsModule, NgbDatepickerModule, NgSelectComponent],
  templateUrl: './work-order-panel.component.html',
  styleUrl: './work-order-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: NgbDateParserFormatter, useClass: DdMmYyyyDateFormatter }],
})
export class WorkOrderPanelComponent {
  private readonly fb = inject(FormBuilder);

  readonly state = input<WorkOrderPanelState | null>(null);
  readonly allOrders = input<WorkOrderDocument[]>([]);

  readonly cancel = output<void>();
  readonly save = output<WorkOrderPanelSavePayload>();

  readonly isOpen = computed(() => this.state() !== null);
  readonly mode = computed(() => this.state()?.mode ?? null);
  readonly submitLabel = computed(() => (this.mode() === 'edit' ? 'Save' : 'Create'));

  readonly statusOptions = STATUS_OPTIONS;
  readonly overlapError = signal(false);

  readonly form = this.fb.nonNullable.group(
    {
      name: ['', Validators.required],
      status: ['open' as WorkOrderStatus, Validators.required],
      endDate: this.fb.control<NgbDateStruct | null>(null, Validators.required),
      startDate: this.fb.control<NgbDateStruct | null>(null, Validators.required),
    },
    { validators: [endAfterStartValidator] },
  );

  constructor() {
    // Sync form to state whenever the panel opens or switches order.
    effect(() => {
      const s = this.state();
      if (!s) return;
      this.overlapError.set(false);
      if (s.mode === 'edit') {
        this.form.reset({
          name: s.order.data.name,
          status: s.order.data.status,
          startDate: isoToNgb(s.order.data.startDate),
          endDate: isoToNgb(s.order.data.endDate),
        });
      } else {
        const start = s.startDate ?? null;
        const end = start ? addDays(start, DEFAULT_DURATION_DAYS) : null;
        this.form.reset({
          name: '',
          status: 'open',
          startDate: start ? isoToNgb(start) : null,
          endDate: end ? isoToNgb(end) : null,
        });
      }
    });

    // Any field edit clears a stale overlap error from the previous attempt.
    this.form.valueChanges.subscribe(() => {
      if (this.overlapError()) this.overlapError.set(false);
    });
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.isOpen()) this.cancel.emit();
  }

  onBackdropClick(): void {
    this.cancel.emit();
  }

  onCancel(): void {
    this.cancel.emit();
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const s = this.state();
    if (!s) return;

    const value = this.form.getRawValue();
    const startIso = ngbToIso(value.startDate!);
    const endIso = ngbToIso(value.endDate!);
    const workCenterId = s.mode === 'edit' ? s.order.data.workCenterId : s.workCenterId;
    const excludeId = s.mode === 'edit' ? s.order.docId : undefined;

    if (hasOverlap(this.allOrders(), { workCenterId, startDate: startIso, endDate: endIso }, excludeId)) {
      this.overlapError.set(true);
      return;
    }

    const data: WorkOrderData = {
      name: value.name.trim(),
      status: value.status,
      workCenterId,
      startDate: startIso,
      endDate: endIso,
    };

    if (s.mode === 'edit') {
      this.save.emit({ mode: 'edit', docId: s.order.docId, data });
    } else {
      this.save.emit({ mode: 'create', data });
    }
  }
}
