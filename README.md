# Work Order Schedule Timeline

Interactive timeline component for a manufacturing ERP system. Visualizes work orders across multiple work centers with create, edit, and delete functionality.

**Repository:** [github.com/Varikash/naologic-home-assignment](https://github.com/Varikash/naologic-home-assignment)

**Design reference:** [Sketch file](https://www.sketch.com/s/d56a77de-9753-45a8-af7a-d93a42276667)

---

## Features

- Timeline grid with **Day / Week / Month** zoom levels
- Work order bars with status indicators (Open, In Progress, Complete, Blocked)
- Create / Edit slide-out panel with reactive form validation
- Three-dot actions menu (Edit / Delete) on each work order bar
- Overlap detection — error when work orders overlap on the same work center
- Current-period indicator (highlighted column + pill in the header) and a fixed left panel (work center names) with a horizontally scrollable timeline
- Click-to-create affordance — hovering an empty cell shows a ghost placeholder; clicking opens the Create panel pre-filled with that date

---

## Getting Started

### Prerequisites

- Node.js 20+
- npm 10+

### Install dependencies

```bash
npm install
```

### Run the development server

```bash
npm start
```

Open [http://localhost:4200](http://localhost:4200) in your browser.

### Build for production

```bash
npm run build
```

### Run unit tests

```bash
npm test
```

---

## Tech Stack

| Library | Purpose |
|---------|---------|
| **Angular 21** | Application framework — standalone components, signals, `OnPush` everywhere |
| **TypeScript (strict)** | Strict typing, including `strictTemplates` |
| **SCSS** | Component and global styling; design tokens as CSS custom properties |
| **Reactive Forms** | Create / Edit panel (`FormGroup` + cross-field validator) |
| **@ng-bootstrap/ng-bootstrap** | Date pickers (`ngb-datepicker`) and the actions dropdown (`NgbDropdown`) |
| **@ng-select/ng-select** | Status dropdown and the Timescale selector |
| **bootstrap (CSS)** | Required by ng-bootstrap for datepicker / dropdown styling |
| **@angular/localize** | Polyfill required by ng-bootstrap's datepicker navigation (`i18n` aria markers) |
| **Vitest** | Unit testing of the pure logic modules |

> **State management:** application state lives in a signal-based store (`WorkOrderStore`); RxJS is not used for data flow. Components are `OnPush` and read signals directly.

**Font:** [Circular Std](https://naologic-com-assets.naologic.com/fonts/circular-std/circular-std.css) — loaded in `index.html` to match the design system.

> **Angular 21:** the test asks for "Angular 17+"; this project uses **21** to lean on first-class signals and the modern standalone/control-flow APIs.

---

## Approach

### Component structure

```
src/app/
├── features/
│   └── work-order-timeline/
│       ├── work-order-timeline.component      # Container: viewport/zoom signals, panel state
│       ├── timeline-header/                    # Column header row + current-period pill
│       ├── timeline-grid/                      # Work-center rows, cells, click-to-create
│       ├── work-order-bar/                     # Positioned bar (badge + actions menu)
│       └── work-order-panel/                   # Create / Edit slide-out (Reactive Form)
├── core/
│   ├── models/                                 # document / work-center / work-order types
│   ├── data/                                   # sample-data.ts (hardcoded, dates relative to today)
│   └── services/                               # work-order.store.ts (signal-based)
└── shared/
    ├── timeline/                               # Pure, unit-tested logic — no DOM, no signals:
    │                                           #   positioning, overlap, date-helpers,
    │                                           #   ngb-date, mm-dd-yyyy-formatter
    └── ui/                                      # status-badge, actions-menu
```

### Key decisions

1. **Single panel for create and edit** — one component with a discriminated `create | edit` state; the form pre-populates on edit and defaults `endDate = startDate + 7 days` on create.
2. **Signal-based store** — `WorkOrderStore` holds work centers and orders as signals with immutable updates; `ordersByCenter` is a `computed`. Components stay presentational.
3. **px-from-viewport positioning** — a `Viewport { startDate, endDate, dayWidth, zoom }` drives `barGeometry()`; bars are `position: absolute` with `left`/`width` from date math. Changing zoom only swaps the viewport — geometry recomputes reactively via signals. (CSS grid was rejected: harder to test and to place fractional bars.)
4. **Overlap validation as a single source of truth** — `hasOverlap()` is a pure function in `shared/timeline/overlap.ts`, used by the panel on submit (excluding the edited order). `endDate` is **exclusive** throughout (overlap + positioning), so touching dates do not count as an overlap.
5. **Pure logic is isolated and tested** — positioning, overlap, date math and the ngb-date mapper have no DOM/signal dependencies and are covered by **73 Vitest unit tests** (boundary cases: leap years, month/year rollover, touching dates, edit-mode exclusion).
6. **Sticky left column** via `position: sticky; left: 0` inside a single scroll container — no two-container scroll sync.

### Data model

Documents follow a consistent shape:

```typescript
interface WorkCenterDocument {
  docId: string;
  docType: 'workCenter';
  data: { name: string };
}

interface WorkOrderDocument {
  docId: string;
  docType: 'workOrder';
  data: {
    name: string;
    workCenterId: string;
    status: 'open' | 'in-progress' | 'complete' | 'blocked';
    startDate: string; // ISO, e.g. "2025-01-15"
    endDate: string;
  };
}
```

Sample data includes 5+ work centers, 8+ work orders, all four status types, and at least one work center with multiple non-overlapping orders.

---

## Interactions

| Action | Result |
|--------|--------|
| Click empty timeline area | Open Create panel; start date pre-filled from click position |
| Three-dot menu → Edit | Open Edit panel with existing data |
| Three-dot menu → Delete | Remove the work order |
| Click outside panel / Cancel | Close panel without saving |
| Create / Save | Validate, save, close panel |
| Change Timescale | Switch Day / Week / Month zoom level |
| Horizontal scroll | Scroll timeline (left panel stays fixed) |

---

## Deliberate deviations

Conscious choices where the implementation differs from the literal spec or the Sketch file — called out since pixel-perfect fidelity is part of the evaluation:

- **Three timescales, not four.** The Sketch dropdown shows Hour / Day / Week / Month; the task asks for Day / Week / Month, so **Hour is intentionally omitted**.
- **Field order in the panel.** Fields follow the design — Name → Status → **End date → Start date** (End above Start), which differs from the order listed in the task text.
- **Date input format `MM.DD.YYYY`** (dots), matching the Sketch placeholders, via a custom `NgbDateParserFormatter`.
- **Status dropdown is plain text**, not colored badges — the selected option is marked only by indigo text, per the design.
- **Default status `Open`** on create.
- **Current-period indicator** is a highlighted column + header pill (per the later Day/Week/Month screens), not a single vertical "today" line.

---

## Demo

<!-- Replace with your Loom link before submission -->
**Loom video:** _pending_

The demo covers all zoom levels, create / edit / delete flows, overlap error scenario, and a brief code walkthrough.

---

## Bonus Features

<!-- Check off items as they are implemented -->

- [ ] localStorage persistence
- [ ] Smooth panel / bar animations
- [ ] Keyboard navigation (Tab, Escape)
- [ ] Infinite horizontal scroll
- [ ] "Today" button
- [ ] Tooltip on bar hover
- [ ] Automated test suite
- [ ] Accessibility (ARIA, focus management)

---

## License

Private — Naologic frontend technical test submission.
