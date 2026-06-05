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
- Current day indicator and fixed left panel (work center names) with horizontally scrollable timeline

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
| **Angular 21** | Application framework (standalone components, signals) |
| **TypeScript** | Strict typing |
| **SCSS** | Component and global styling |
| **Reactive Forms** | Create / Edit panel validation |
| **@ng-bootstrap/ng-bootstrap** | Date picker (`ngb-datepicker`) |
| **ng-select** | Status dropdown |
| **RxJS** | Async data flows in services |
| **Vitest** | Unit testing |

**Font:** [Circular Std](https://naologic-com-assets.naologic.com/fonts/circular-std/circular-std.css) — loaded in `index.html` to match the design system.

---

## Approach

### Component structure

```
src/app/
├── features/
│   └── work-order-timeline/
│       ├── work-order-timeline.component      # Main container
│       ├── timeline-grid/                     # Grid, header, scroll, current-day line
│       ├── work-order-bar/                    # Bar, status badge, actions menu
│       └── work-order-panel/                  # Create / Edit slide-out panel
├── core/
│   ├── models/                                # WorkCenterDocument, WorkOrderDocument
│   └── services/                              # Work order data & overlap validation
└── shared/                                    # Reusable UI pieces
```

### Key decisions

1. **Single panel for create and edit** — one component with a `create | edit` mode flag; form resets on create, pre-populates on edit.
2. **Service for data** — work centers and work orders live in an injectable service; keeps components focused on presentation and user interaction.
3. **Date positioning** — bar positions are computed from dates relative to the visible timeline range; column widths recalculate when the zoom level changes.
4. **Overlap validation** — checked on save in the service layer; the order being edited is excluded from the overlap check.

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
