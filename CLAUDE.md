# Work Order Schedule Timeline — Project Spec

> Dry requirements extract from `FE-technical-test.md`.
> Full spec: `./FE-technical-test.md` | Working plan (local only): `./PLAN.md`

## Goal

Build an interactive **Work Order Schedule Timeline** for a manufacturing ERP: visualize, create, edit, delete work orders across work centers.

**Design:** https://www.sketch.com/s/d56a77de-9753-45a8-af7a-d93a42276667  
**Font:** Circular Std (`https://naologic-com-assets.naologic.com/fonts/circular-std/circular-std.css`)

---

## Stack (mandatory)

- Angular **17+** (project uses **21**) — **standalone components**
- TypeScript **strict**
- **SCSS** only
- **Reactive Forms** (`FormGroup`, `FormControl`, `Validators`) — required for create/edit panel
- **@ng-select/ng-select** — status dropdown (mandatory)
- **@ng-bootstrap/ng-bootstrap** — `ngb-datepicker` (mandatory)
- **Signals** — OK for UI state, store, computed values
- **Do NOT** replace Reactive Forms with signal forms

## Coding conventions

- Angular way: no `setTimeout`, no direct `window`/`document` hacks
- Prefer `ChangeDetectionStrategy.OnPush` + signals
- Services for data and overlap validation
- Match Sketch designs pixel-perfect (colors, spacing, typography)
- Additional libraries allowed if they don't replace ng-select / ngb-datepicker

---

## Must implement

### Timeline grid
- Left column: work center names — **fixed** (no horizontal scroll)
- Right: timeline grid — **horizontally scrollable**
- Timescale dropdown: **Day** (default) | **Week** | **Month** — same data, different scale
- Current day: vertical indicator line
- Row hover highlight
- Initial range: centered on **today** (Day ≈ ±2 weeks, Week ≈ ±2 months, Month ≈ ±6 months)

### Work order bars
- Horizontal bar: name + status badge (pill) + three-dot menu (Edit / Delete)
- Position: `startDate` → left edge, `endDate` → right edge
- Statuses & colors: `open` (blue), `in-progress` (blue/purple), `complete` (green), `blocked` (yellow/orange)
- Multiple orders per work center row — **must not overlap**

### Create / Edit panel (single component, mode: `create` | `edit`)
- Slides in from right; click outside or Cancel → close
- **Create:** click empty timeline → pre-fill start date from click; end date default = start + 7 days
- **Edit:** via three-dot → Edit; pre-populate fields; button "Save" not "Create"
- Header: "Work Order Details" (both modes)

| Field | Control |
|-------|---------|
| Work Order Name | text, required |
| Status | ng-select, default `open` |
| Start Date | ngb-datepicker, required |
| End Date | ngb-datepicker, required |

### Validation (on Create/Save)
- All fields required
- End date > start date
- No overlap on same work center (exclude current order when editing)
- On overlap → show error, do not save

### Interactions
| Action | Result |
|--------|--------|
| Click empty timeline | Create panel, start date from click |
| ⋮ → Edit | Edit panel |
| ⋮ → Delete | Delete order |
| Timescale change | Recalculate columns / header |
| Horizontal scroll | Timeline only, left panel fixed |

---

## Data model

```typescript
interface WorkCenterDocument {
  docId: string;
  docType: 'workCenter';
  data: { name: string };
}

type WorkOrderStatus = 'open' | 'in-progress' | 'complete' | 'blocked';

interface WorkOrderDocument {
  docId: string;
  docType: 'workOrder';
  data: {
    name: string;
    workCenterId: string;
    status: WorkOrderStatus;
    startDate: string; // ISO "YYYY-MM-DD"
    endDate: string;
  };
}
```

### Sample data (hardcoded)
- ≥ 5 work centers (realistic names)
- ≥ 8 work orders, all 4 statuses
- ≥ 1 work center with multiple **non-overlapping** orders
- Orders spanning different date ranges

---

## Suggested architecture

```
src/app/
├── core/models/          # document types
├── core/data/            # sample-data.ts
├── core/services/        # WorkOrderStore (signals), overlap util
├── shared/timeline/      # positioning.ts, overlap.ts, ngb-date helpers
└── features/work-order-timeline/
    ├── work-order-timeline.component
    ├── timeline-grid/
    ├── work-order-bar/
    └── work-order-panel/   # Reactive Form, create|edit mode
```

---

## Deliverables

1. Runnable app (`npm start` / `ng serve`)
2. Pixel-perfect UI vs Sketch
3. Sample data
4. README (setup + approach + libraries)
5. Loom demo 5–10 min
6. Public GitHub repo

## Bonus (optional, not required for core)

localStorage, animations, keyboard (Escape close), infinite scroll, Today button, bar tooltip, tests, a11y

## Out of scope / don't

- NgRx unless clearly needed
- Material / Tailwind instead of SCSS matching Sketch
- Template-driven forms for the panel
- Overlapping orders on same work center
