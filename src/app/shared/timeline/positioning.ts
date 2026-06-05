import { WorkOrderDocument } from '../../core/models/work-order.model';
import { addDays, daysBetween } from './date-helpers';

export type ZoomLevel = 'day' | 'week' | 'month';

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

export const DAY_WIDTH_PX: Record<ZoomLevel, number> = {
  day: 80,
  week: 24,
  month: 6,
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
