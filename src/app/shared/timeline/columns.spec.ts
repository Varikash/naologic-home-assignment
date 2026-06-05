import {
  Viewport,
  columnsForViewport,
  findColumnIndex,
  formatColumnLabel,
} from './positioning';

describe('formatColumnLabel', () => {
  it('day → "Mon D, YYYY"', () => {
    expect(formatColumnLabel('2026-03-05', 'day')).toBe('Mar 5, 2026');
    expect(formatColumnLabel('2026-01-01', 'day')).toBe('Jan 1, 2026');
    expect(formatColumnLabel('2026-12-31', 'day')).toBe('Dec 31, 2026');
  });

  it('week → "Week of Mon D"', () => {
    expect(formatColumnLabel('2026-02-08', 'week')).toBe('Week of Feb 8');
    expect(formatColumnLabel('2026-03-01', 'week')).toBe('Week of Mar 1');
  });

  it('month → "MonthName YYYY"', () => {
    expect(formatColumnLabel('2026-01-01', 'month')).toBe('January 2026');
    expect(formatColumnLabel('2026-12-01', 'month')).toBe('December 2026');
  });
});

describe('columnsForViewport — day zoom', () => {
  const v: Viewport = {
    startDate: '2026-03-01',
    endDate: '2026-03-05',
    dayWidth: 80,
    zoom: 'day',
  };

  it('emits one column per day in the half-open range', () => {
    const cols = columnsForViewport(v);
    expect(cols.length).toBe(4);
    expect(cols.map((c) => c.startDate)).toEqual([
      '2026-03-01', '2026-03-02', '2026-03-03', '2026-03-04',
    ]);
  });

  it('lays each column out at left = index × dayWidth, width = dayWidth', () => {
    const cols = columnsForViewport(v);
    expect(cols[0]).toMatchObject({ left: 0, width: 80 });
    expect(cols[1]).toMatchObject({ left: 80, width: 80 });
    expect(cols[3]).toMatchObject({ left: 240, width: 80 });
  });

  it('uses the day label format', () => {
    expect(columnsForViewport(v)[0].label).toBe('Mar 1, 2026');
  });
});

describe('columnsForViewport — week zoom', () => {
  it('aligns columns to Sunday — viewport.startDate already a Sunday', () => {
    // Feb 8, 2026 is a Sunday.
    const v: Viewport = {
      startDate: '2026-02-08',
      endDate: '2026-03-01',
      dayWidth: 10,
      zoom: 'week',
    };
    const cols = columnsForViewport(v);
    expect(cols.map((c) => c.startDate)).toEqual([
      '2026-02-08', '2026-02-15', '2026-02-22',
    ]);
    expect(cols.every((c) => c.width === 70)).toBe(true);
    expect(cols[0].left).toBe(0);
  });

  it('shifts the first column back when viewport.startDate is mid-week', () => {
    // Feb 5, 2026 is Thursday → previous Sunday is Feb 1.
    const v: Viewport = {
      startDate: '2026-02-05',
      endDate: '2026-02-22',
      dayWidth: 10,
      zoom: 'week',
    };
    const cols = columnsForViewport(v);
    expect(cols[0].startDate).toBe('2026-02-01');
    expect(cols[0].label).toBe('Week of Feb 1');
    // Feb 1 is 4 days before viewport.startDate → left = -40.
    expect(cols[0].left).toBe(-40);
  });

  it('extends the last column past viewport.endDate when endDate is mid-week', () => {
    const v: Viewport = {
      startDate: '2026-02-08',
      endDate: '2026-02-25',
      dayWidth: 10,
      zoom: 'week',
    };
    const cols = columnsForViewport(v);
    // Last column: Feb 22 – Mar 1, extending 4 days past viewport.endDate.
    expect(cols[cols.length - 1]).toMatchObject({
      startDate: '2026-02-22',
      endDate: '2026-03-01',
    });
  });
});

describe('columnsForViewport — month zoom', () => {
  it('aligns columns to the 1st of each month', () => {
    const v: Viewport = {
      startDate: '2026-02-15',
      endDate: '2026-04-10',
      dayWidth: 2,
      zoom: 'month',
    };
    const cols = columnsForViewport(v);
    expect(cols.map((c) => c.startDate)).toEqual([
      '2026-02-01', '2026-03-01', '2026-04-01',
    ]);
    expect(cols.map((c) => c.label)).toEqual([
      'February 2026', 'March 2026', 'April 2026',
    ]);
  });

  it('spans the year boundary', () => {
    const v: Viewport = {
      startDate: '2025-12-15',
      endDate: '2026-02-10',
      dayWidth: 2,
      zoom: 'month',
    };
    const cols = columnsForViewport(v);
    expect(cols.map((c) => c.startDate)).toEqual([
      '2025-12-01', '2026-01-01', '2026-02-01',
    ]);
    expect(cols.map((c) => c.label)).toEqual([
      'December 2025', 'January 2026', 'February 2026',
    ]);
  });

  it('uses real month lengths for column widths', () => {
    const v: Viewport = {
      startDate: '2024-02-01',
      endDate: '2024-04-01',
      dayWidth: 1,
      zoom: 'month',
    };
    const cols = columnsForViewport(v);
    // 2024 is a leap year → February = 29 days.
    expect(cols[0].width).toBe(29);
    expect(cols[1].width).toBe(31);
  });
});

describe('findColumnIndex', () => {
  const v: Viewport = {
    startDate: '2026-03-01',
    endDate: '2026-03-05',
    dayWidth: 80,
    zoom: 'day',
  };
  const cols = columnsForViewport(v);

  it('returns the index of the column containing the date', () => {
    expect(findColumnIndex(cols, '2026-03-02')).toBe(1);
    expect(findColumnIndex(cols, '2026-03-04')).toBe(3);
  });

  it('returns -1 when no column contains the date', () => {
    expect(findColumnIndex(cols, '2026-04-01')).toBe(-1);
    expect(findColumnIndex(cols, '2026-02-15')).toBe(-1);
  });

  it('treats endDate as exclusive (column end belongs to the next column)', () => {
    const weekV: Viewport = {
      startDate: '2026-02-08',
      endDate: '2026-02-22',
      dayWidth: 10,
      zoom: 'week',
    };
    const weekCols = columnsForViewport(weekV);
    // Feb 15 is exactly the boundary between weeks 0 and 1 → belongs to week 1.
    expect(findColumnIndex(weekCols, '2026-02-15')).toBe(1);
  });
});
