import { currentMonthRange, today } from '@/app/(dashboard)/reports/_components/useReport';

describe('report date helpers', () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  /**
   * Regression: these used toISOString(), which converts to UTC first. Anywhere behind UTC the
   * first of the month came back as the last day of the previous month, so every report opened on
   * a silently wrong period.
   */
  it('returns the local first and last day of the month, not UTC-shifted ones', () => {
    jest.useFakeTimers().setSystemTime(new Date(2026, 8, 5, 2, 0, 0)); // 5 Sep 2026, 02:00 local

    expect(currentMonthRange()).toEqual({ from: '2026-09-01', to: '2026-09-30' });
  });

  it('handles a February in a leap year', () => {
    jest.useFakeTimers().setSystemTime(new Date(2028, 1, 10, 2, 0, 0));

    expect(currentMonthRange()).toEqual({ from: '2028-02-01', to: '2028-02-29' });
  });

  it('handles December rolling into the next year', () => {
    jest.useFakeTimers().setSystemTime(new Date(2026, 11, 20, 23, 30, 0));

    expect(currentMonthRange()).toEqual({ from: '2026-12-01', to: '2026-12-31' });
  });

  it('reports today in local time', () => {
    jest.useFakeTimers().setSystemTime(new Date(2026, 0, 1, 1, 0, 0));

    expect(today()).toBe('2026-01-01');
  });
});
