import { WorkOrderDocument } from '../../core/models/work-order.model';
import { addDays, addMonths, daysBetween } from './date-helpers';

export type ZoomLevel = 'day' | 'week' | 'month';

const MONTHS_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

/**
 * Viewport describes a horizontal window of the timeline.
 * `startDate` inclusive, `endDate` exclusive — matches the half-open
 * convention used in `overlap.ts` (touching dates do not overlap).
 * `dayWidth` is the px width of a single day; the entire grid is laid out
 * by multiplying day offsets by this constant.
 */
export interface Viewport {
  startDate: string;
  endDate: string;
  dayWidth: number;
  zoom: ZoomLevel;
}

export interface BarGeometry {
  left: number;
  width: number;
}

// Target on-screen width of a single timeline column. Day columns span one
// day, so dayWidth == this. Week columns span 7 days, so dayWidth = target/7
// yields exactly this. Month columns span a whole calendar month (28–31 days),
// so with a constant dayWidth their width varies around the target (a 30-day
// month lands exactly on it); this is intentional — bars share the same
// dayWidth, so they stay aligned with the columns.
const TARGET_COLUMN_PX = 115;

export const DAY_WIDTH_PX: Record<ZoomLevel, number> = {
  day: TARGET_COLUMN_PX,
  week: TARGET_COLUMN_PX / 7,
  month: TARGET_COLUMN_PX / 30,
};

export const RANGE_HALF_DAYS: Record<ZoomLevel, number> = {
  day: 14,
  week: 60,
  month: 180,
};

export function rangeForZoom(todayIso: string, zoom: ZoomLevel): Viewport {
  const half = RANGE_HALF_DAYS[zoom];
  return {
    startDate: addDays(todayIso, -half),
    endDate: addDays(todayIso, half + 1),
    dayWidth: DAY_WIDTH_PX[zoom],
    zoom,
  };
}

// Breathing room added beyond the outermost order so edge bars (and their
// three-dot menus) aren't flush against the scroll boundary.
const PAD_DAYS: Record<ZoomLevel, number> = {
  day: 3,
  week: 7,
  month: 31,
};

function alignToColumnStart(iso: string, zoom: ZoomLevel): string {
  switch (zoom) {
    case 'day':
      return iso;
    case 'week':
      return startOfWeekSunday(iso);
    case 'month':
      return startOfMonth(iso);
  }
}

/**
 * The full horizontal extent the grid must render so every order is reachable
 * by scrolling. Spans the union of the centered range (`rangeForZoom`) and
 * every order's date range, padded a little on each side. Without this, a bar
 * extending past the centered window is clipped by the grid's `overflow:
 * hidden`, hiding its trailing controls.
 *
 * The start is snapped to a column boundary so bars and columns share an
 * origin (bar `left` 0 == first column's left edge). The viewport stays
 * centered on today visually via an initial scroll, not by clamping the range.
 */
export function contentViewport(
  todayIso: string,
  zoom: ZoomLevel,
  orders: WorkOrderDocument[],
): Viewport {
  const base = rangeForZoom(todayIso, zoom);
  let start = base.startDate;
  let end = base.endDate;
  for (const order of orders) {
    if (order.data.startDate < start) start = order.data.startDate;
    if (order.data.endDate > end) end = order.data.endDate;
  }
  return {
    ...base,
    startDate: alignToColumnStart(addDays(start, -PAD_DAYS[zoom]), zoom),
    endDate: addDays(end, PAD_DAYS[zoom]),
  };
}

/**
 * Default end date for an order created from the timeline, sized to one period
 * of the current zoom: a day, a week, or a calendar month. The start may be any
 * day, so the span is measured from that day (e.g. month = same day next month).
 */
export function defaultOrderEnd(startIso: string, zoom: ZoomLevel): string {
  switch (zoom) {
    case 'day':
      return addDays(startIso, 1);
    case 'week':
      return addDays(startIso, 7);
    case 'month':
      return addMonths(startIso, 1);
  }
}

/**
 * Order range for a click/hover at `cursorIso`, sized to one period of the
 * zoom and *centered* on the cursor (start shifted back half a period), so the
 * cursor sits in the middle of the create ghost rather than at its left edge.
 */
export function centeredOrderRange(
  cursorIso: string,
  zoom: ZoomLevel,
): { startDate: string; endDate: string } {
  const span = daysBetween(cursorIso, defaultOrderEnd(cursorIso, zoom));
  const startDate = addDays(cursorIso, -Math.floor(span / 2));
  return { startDate, endDate: defaultOrderEnd(startDate, zoom) };
}

export function viewportWidth(viewport: Viewport): number {
  return daysBetween(viewport.startDate, viewport.endDate) * viewport.dayWidth;
}

export function dateToX(iso: string, viewport: Viewport): number {
  return daysBetween(viewport.startDate, iso) * viewport.dayWidth;
}

export function xToDate(x: number, viewport: Viewport): string {
  const days = Math.floor(x / viewport.dayWidth);
  return addDays(viewport.startDate, days);
}

export function barGeometry(order: WorkOrderDocument, viewport: Viewport): BarGeometry {
  const left = dateToX(order.data.startDate, viewport);
  const right = dateToX(order.data.endDate, viewport);
  return { left, width: right - left };
}

export interface TimelineColumn {
  label: string;
  startDate: string;
  endDate: string;
  left: number;
  width: number;
}

function dayOfWeek(iso: string): number {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

function startOfWeekSunday(iso: string): string {
  return addDays(iso, -dayOfWeek(iso));
}

function startOfMonth(iso: string): string {
  const [y, m] = iso.split('-').map(Number);
  return `${y}-${String(m).padStart(2, '0')}-01`;
}

function startOfNextMonth(iso: string): string {
  const [y, m] = iso.split('-').map(Number);
  if (m === 12) return `${y + 1}-01-01`;
  return `${y}-${String(m + 1).padStart(2, '0')}-01`;
}

export function formatColumnLabel(startDate: string, zoom: ZoomLevel): string {
  const [y, m, d] = startDate.split('-').map(Number);
  switch (zoom) {
    case 'day':
      return `${MONTHS_SHORT[m - 1]} ${d}, ${y}`;
    case 'week':
      return `Week of ${MONTHS_SHORT[m - 1]} ${d}`;
    case 'month':
      return `${MONTHS_SHORT[m - 1]} ${y}`;
  }
}

export function columnsForViewport(viewport: Viewport): TimelineColumn[] {
  const cols: TimelineColumn[] = [];
  let cursor: string;
  let next: (iso: string) => string;
  switch (viewport.zoom) {
    case 'day':
      cursor = viewport.startDate;
      next = (iso) => addDays(iso, 1);
      break;
    case 'week':
      cursor = startOfWeekSunday(viewport.startDate);
      next = (iso) => addDays(iso, 7);
      break;
    case 'month':
      cursor = startOfMonth(viewport.startDate);
      next = startOfNextMonth;
      break;
  }
  while (cursor < viewport.endDate) {
    const colEnd = next(cursor);
    const left = dateToX(cursor, viewport);
    const width = dateToX(colEnd, viewport) - left;
    cols.push({
      label: formatColumnLabel(cursor, viewport.zoom),
      startDate: cursor,
      endDate: colEnd,
      left,
      width,
    });
    cursor = colEnd;
  }
  return cols;
}

export function findColumnIndex(columns: TimelineColumn[], iso: string): number {
  return columns.findIndex((c) => c.startDate <= iso && iso < c.endDate);
}
