import { WorkOrderDocument } from '../../core/models/work-order.model';
import {
  DAY_WIDTH_PX,
  RANGE_HALF_DAYS,
  Viewport,
  barGeometry,
  dateToX,
  rangeForZoom,
  viewportWidth,
  xToDate,
} from './positioning';

function makeOrder(startDate: string, endDate: string): WorkOrderDocument {
  return {
    docId: 'wo-test',
    docType: 'workOrder',
    data: { name: 'test', workCenterId: 'wc-a', status: 'open', startDate, endDate },
  };
}

const dayViewport: Viewport = {
  startDate: '2025-01-01',
  endDate: '2025-01-11',
  dayWidth: 80,
  zoom: 'day',
};

describe('rangeForZoom', () => {
  const today = '2025-06-15';

  it('centers Day zoom at ±14 days around today (exclusive end)', () => {
    const v = rangeForZoom(today, 'day');
    expect(v.startDate).toBe('2025-06-01');
    expect(v.endDate).toBe('2025-06-30');
    expect(v.dayWidth).toBe(DAY_WIDTH_PX.day);
    expect(v.zoom).toBe('day');
  });

  it('centers Week zoom at ±60 days around today', () => {
    const v = rangeForZoom(today, 'week');
    expect(v.startDate).toBe('2025-04-16');
    expect(v.endDate).toBe('2025-08-15');
    expect(v.dayWidth).toBe(DAY_WIDTH_PX.week);
  });

  it('centers Month zoom at ±180 days around today', () => {
    const v = rangeForZoom(today, 'month');
    expect(v.startDate).toBe('2024-12-17');
    expect(v.endDate).toBe('2025-12-13');
    expect(v.dayWidth).toBe(DAY_WIDTH_PX.month);
  });

  it('spans (2 * half + 1) days for every zoom', () => {
    for (const zoom of ['day', 'week', 'month'] as const) {
      const v = rangeForZoom(today, zoom);
      const expected = 2 * RANGE_HALF_DAYS[zoom] + 1;
      expect(viewportWidth(v) / v.dayWidth).toBe(expected);
    }
  });
});

describe('dateToX', () => {
  it('returns 0 at viewport start', () => {
    expect(dateToX('2025-01-01', dayViewport)).toBe(0);
  });

  it('returns dayWidth for one day past start', () => {
    expect(dateToX('2025-01-02', dayViewport)).toBe(80);
  });

  it('returns viewport width at viewport end (exclusive)', () => {
    expect(dateToX('2025-01-11', dayViewport)).toBe(viewportWidth(dayViewport));
  });

  it('returns a negative value for a date before the viewport', () => {
    expect(dateToX('2024-12-30', dayViewport)).toBe(-160);
  });

  it('scales by dayWidth on different zoom levels', () => {
    const weekViewport = { ...dayViewport, dayWidth: DAY_WIDTH_PX.week, zoom: 'week' as const };
    expect(dateToX('2025-01-08', weekViewport)).toBe(7 * DAY_WIDTH_PX.week);
  });
});

describe('xToDate', () => {
  it('returns the viewport start at x = 0', () => {
    expect(xToDate(0, dayViewport)).toBe('2025-01-01');
  });

  it('returns the next day at x = dayWidth', () => {
    expect(xToDate(80, dayViewport)).toBe('2025-01-02');
  });

  it('floors mid-day clicks to the start of that day', () => {
    expect(xToDate(40, dayViewport)).toBe('2025-01-01');
    expect(xToDate(79, dayViewport)).toBe('2025-01-01');
    expect(xToDate(159, dayViewport)).toBe('2025-01-02');
  });

  it('floors negative x to the day before viewport start', () => {
    expect(xToDate(-1, dayViewport)).toBe('2024-12-31');
    expect(xToDate(-80, dayViewport)).toBe('2024-12-31');
    expect(xToDate(-81, dayViewport)).toBe('2024-12-30');
  });

  it('is the floor-inverse of dateToX', () => {
    for (const iso of ['2025-01-01', '2025-01-05', '2025-01-10']) {
      expect(xToDate(dateToX(iso, dayViewport), dayViewport)).toBe(iso);
    }
  });
});

describe('barGeometry', () => {
  it('returns the correct left and width for an order inside the viewport', () => {
    const order = makeOrder('2025-01-03', '2025-01-07');
    expect(barGeometry(order, dayViewport)).toEqual({ left: 160, width: 320 });
  });

  it('returns left = 0 and full-day width for an order starting at viewport start', () => {
    const order = makeOrder('2025-01-01', '2025-01-02');
    expect(barGeometry(order, dayViewport)).toEqual({ left: 0, width: 80 });
  });

  it('returns negative left for an order starting before the viewport (caller clips)', () => {
    const order = makeOrder('2024-12-30', '2025-01-05');
    expect(barGeometry(order, dayViewport)).toEqual({ left: -160, width: 6 * 80 });
  });

  it('returns left past viewport end for an order after the viewport', () => {
    const order = makeOrder('2025-01-20', '2025-01-25');
    const geo = barGeometry(order, dayViewport);
    expect(geo.left).toBe(19 * 80);
    expect(geo.width).toBe(5 * 80);
  });

  it('width never depends on viewport position, only on dayWidth × duration', () => {
    const order = makeOrder('2025-01-03', '2025-01-10');
    const shifted: Viewport = { ...dayViewport, startDate: '2024-12-25', endDate: '2025-01-04' };
    expect(barGeometry(order, dayViewport).width).toBe(barGeometry(order, shifted).width);
  });

  it('scales width with dayWidth on different zooms', () => {
    const order = makeOrder('2025-01-03', '2025-01-10');
    const weekViewport: Viewport = { ...dayViewport, dayWidth: DAY_WIDTH_PX.week, zoom: 'week' };
    const monthViewport: Viewport = { ...dayViewport, dayWidth: DAY_WIDTH_PX.month, zoom: 'month' };
    expect(barGeometry(order, weekViewport).width).toBe(7 * DAY_WIDTH_PX.week);
    expect(barGeometry(order, monthViewport).width).toBe(7 * DAY_WIDTH_PX.month);
  });
});
