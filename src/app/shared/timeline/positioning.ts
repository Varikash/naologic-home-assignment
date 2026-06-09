import { WorkOrderDocument } from '../../core/models/work-order.model';
import { addDays, daysBetween } from './date-helpers';

export type ZoomLevel = 'day' | 'week' | 'month';

const MONTHS_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];
const MONTHS_LONG = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
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
      return `${MONTHS_LONG[m - 1]} ${y}`;
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
