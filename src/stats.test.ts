import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import type { AppData, MealEntry, WeeklyDay } from './types';
import { getLocalDateKey, getStreak, getTodayNutrition } from './stats';

function makeData(overrides: Partial<AppData> = {}): AppData {
  const weeklyPlan: WeeklyDay[] = ([0, 1, 2, 3, 4, 5, 6] as const).map((weekday) => ({
    weekday,
    cardioPlanId: weekday === 0 ? null : 'cardio-test',
    strengthFocus: null,
  }));

  return {
    version: 1,
    ingredients: [],
    dishes: [],
    cardioPlans: [],
    strengthPlans: [],
    lastStrengthFocus: null,
    weeklyPlan,
    weeklyLog: {},
    mealLog: {},
    ...overrides,
  };
}

function completedDates(...dates: string[]): Record<string, boolean> {
  return Object.fromEntries(dates.map((date) => [date, true]));
}

beforeAll(() => {
  vi.stubEnv('TZ', 'America/Los_Angeles');
});

afterAll(() => {
  vi.unstubAllEnvs();
});

describe('getStreak', () => {
  it('counts three consecutive completed training days', () => {
    const data = makeData({ weeklyLog: completedDates('2026-11-10', '2026-11-11', '2026-11-12') });
    expect(getStreak(data, new Date(2026, 10, 12))).toBe(3);
  });

  it('skips a rest day between completed training days', () => {
    const data = makeData({ weeklyLog: completedDates('2026-11-06', '2026-11-07', '2026-11-09') });
    expect(getStreak(data, new Date(2026, 10, 9))).toBe(3);
  });

  it('starts yesterday when today has not been completed', () => {
    const data = makeData({ weeklyLog: completedDates('2026-11-10', '2026-11-11') });
    expect(getStreak(data, new Date(2026, 10, 12))).toBe(2);
  });

  it('stops at a missed training day', () => {
    const data = makeData({ weeklyLog: completedDates('2026-11-10', '2026-11-12') });
    expect(getStreak(data, new Date(2026, 10, 12))).toBe(1);
  });

  it('does not count future check-ins', () => {
    const data = makeData({ weeklyLog: completedDates('2026-11-12', '2026-11-13', '2026-11-14') });
    expect(getStreak(data, new Date(2026, 10, 12))).toBe(1);
  });

  it('does not count a checked rest day as a training day', () => {
    const data = makeData({ weeklyLog: completedDates('2026-11-06', '2026-11-07', '2026-11-08') });
    expect(getStreak(data, new Date(2026, 10, 8))).toBe(2);
  });

  it('returns zero for an all-rest or empty schedule', () => {
    const data = makeData({ weeklyLog: completedDates('2026-11-12') });
    const allRest = data.weeklyPlan.map((day) => ({ ...day, cardioPlanId: null, strengthFocus: null }));
    expect(getStreak({ ...data, weeklyPlan: allRest }, new Date(2026, 10, 12))).toBe(0);
    expect(getStreak({ ...data, weeklyPlan: [] }, new Date(2026, 10, 12))).toBe(0);
  });

  it('uses the current schedule when deciding which days are rest days', () => {
    const data = makeData({ weeklyLog: completedDates('2026-11-10', '2026-11-12') });
    data.weeklyPlan = data.weeklyPlan.map((day) => day.weekday === 3 ? { ...day, cardioPlanId: null } : day);
    expect(getStreak(data, new Date(2026, 10, 12))).toBe(2);
  });

  it('walks local calendar dates across daylight saving time without changing today', () => {
    const data = makeData({ weeklyLog: completedDates('2026-03-07', '2026-03-08', '2026-03-09') });
    data.weeklyPlan = data.weeklyPlan.map((day) => ({ ...day, cardioPlanId: 'cardio-test' }));
    const today = new Date(2026, 2, 9, 0, 30);
    const timestamp = today.getTime();
    expect(getStreak(data, today)).toBe(3);
    expect(today.getTime()).toBe(timestamp);
  });

  it('returns zero for an invalid date', () => {
    expect(getStreak(makeData(), new Date(Number.NaN))).toBe(0);
  });
});

describe('getLocalDateKey', () => {
  it('uses the local date rather than the UTC date near midnight', () => {
    expect(getLocalDateKey(new Date('2026-11-13T07:30:00.000Z'))).toBe('2026-11-12');
  });
});

describe('getTodayNutrition', () => {
  const snapshot: MealEntry = {
    id: 'meal-first',
    dishId: 'dish-tomato-egg',
    at: new Date(2026, 10, 12, 12, 30).getTime(),
    kcal: 123,
    proteinG: 17,
  };

  it('sums snapshots including repeated meals and deleted dishes without consulting recipes', () => {
    const data = makeData({
      mealLog: {
        '2026-11-12': [
          snapshot,
          { ...snapshot, id: 'meal-second', kcal: 234, proteinG: 23 },
          { ...snapshot, id: 'meal-deleted', dishId: 'deleted-dish', kcal: 345, proteinG: 31 },
        ],
      },
    });
    expect(getTodayNutrition(data, new Date(2026, 10, 12))).toEqual({ kcal: 702, proteinG: 71, meals: 3 });
  });

  it('excludes records from other dates and rolls over at local midnight', () => {
    const data = makeData({
      mealLog: {
        '2026-11-11': [{ ...snapshot, id: 'yesterday', kcal: 999, proteinG: 99 }],
        '2026-11-12': [snapshot],
        '2026-11-13': [{ ...snapshot, id: 'tomorrow', kcal: 456, proteinG: 45 }],
      },
    });
    expect(getTodayNutrition(data, new Date(2026, 10, 12, 23, 59, 59))).toEqual({ kcal: 123, proteinG: 17, meals: 1 });
    expect(getTodayNutrition(data, new Date(2026, 10, 13, 0, 0, 0))).toEqual({ kcal: 456, proteinG: 45, meals: 1 });
  });

  it('returns empty totals when today has no records', () => {
    expect(getTodayNutrition(makeData(), new Date(2026, 10, 12))).toEqual({ kcal: 0, proteinG: 0, meals: 0 });
  });
});
