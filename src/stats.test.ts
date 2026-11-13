import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import type { AppData, MealEntry, Profile, WeeklyDay } from './types';
import {
  getBMR,
  getCalorieStatus,
  getDailyTargets,
  getLocalDateKey,
  getMealForTime,
  getStreak,
  getTodayNutrition,
  shuffle,
} from './stats';

describe('shuffle', () => {
  it('returns a new permutation without changing the original array', () => {
    const original = Object.freeze([1, 2, 3, 4]);
    const shuffled = shuffle(original, () => 0);
    expect(original).toEqual([1, 2, 3, 4]);
    expect(shuffled).not.toBe(original);
    expect([...shuffled].sort()).toEqual([...original].sort());
  });

  it('uses the supplied random values in Fisher-Yates order', () => {
    const values = [0.25, 0.9, 0];
    let call = 0;
    expect(shuffle([1, 2, 3, 4], () => values[call++])).toEqual([4, 1, 3, 2]);
    expect(call).toBe(3);
  });

  it('distributes three elements across all six permutations', () => {
    const counts = new Map<string, number>();
    for (let trial = 0; trial < 60_000; trial += 1) {
      const key = shuffle([1, 2, 3]).join('');
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    expect(counts.size).toBe(6);
    for (const count of counts.values()) {
      expect(count).toBeGreaterThanOrEqual(9_500);
      expect(count).toBeLessThanOrEqual(10_500);
    }
  });

  it('handles empty and single-element arrays', () => {
    expect(shuffle([])).toEqual([]);
    expect(shuffle([42])).toEqual([42]);
  });
});

function makeData(overrides: Partial<AppData> = {}): AppData {
  const weeklyPlan: WeeklyDay[] = ([0, 1, 2, 3, 4, 5, 6] as const).map((weekday) => ({
    weekday,
    cardioPlanId: weekday === 0 ? null : 'cardio-test',
    strengthFocus: null,
  }));

  return {
    version: 2,
    knownDefaultIds: { ingredients: [], dishes: [], cardioPlans: [] },
    ingredients: [],
    dishes: [],
    cardioPlans: [],
    strengthPlans: [],
    lastStrengthFocus: null,
    weeklyPlan,
    weeklyLog: {},
    mealLog: {},
    profile: null,
    weightLog: {},
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

describe('getMealForTime', () => {
  it.each([
    [10, 29, 'breakfast'],
    [10, 30, 'lunch'],
    [15, 59, 'lunch'],
    [16, 0, 'dinner'],
  ] as const)('classifies local time %i:%i as %s', (hour, minute, meal) => {
    expect(getMealForTime(new Date(2026, 10, 12, hour, minute))).toBe(meal);
  });

  it('uses the local clock when the UTC date is already tomorrow', () => {
    expect(getMealForTime(new Date('2026-11-13T07:30:00.000Z'))).toBe('dinner');
  });
});

const baseProfile: Profile = {
  sex: 'male',
  age: 30,
  heightCm: 180,
  weightKg: 80,
  activity: 1.55,
  deficit: 0.2,
};

describe('getBMR', () => {
  it.each([
    { sex: 'male', age: 30, heightCm: 180, weightKg: 80, expected: 1780 },
    { sex: 'male', age: 45, heightCm: 175, weightKg: 70, expected: 1573.75 },
    { sex: 'female', age: 30, heightCm: 165, weightKg: 60, expected: 1320.25 },
    { sex: 'female', age: 50, heightCm: 170, weightKg: 90, expected: 1551.5 },
  ] as const)('calculates $sex BMR at $age years, $heightCm cm, $weightKg kg', ({ expected, ...profile }) => {
    expect(getBMR({ ...baseProfile, ...profile })).toBe(expected);
  });
});

describe('getDailyTargets', () => {
  it('applies activity and the standard deficit before rounding calories', () => {
    expect(getDailyTargets(baseProfile)).toEqual({ bmr: 1780, kcal: 2207, proteinG: 128 });
  });

  it('supports the gentle deficit and rounds protein to whole grams', () => {
    const targets = getDailyTargets({ ...baseProfile, weightKg: 70.4, deficit: 0.15 });
    expect(targets).toEqual({ bmr: 1684, kcal: 2219, proteinG: 113 });
  });

  it.each([
    ['male', 1500],
    ['female', 1200],
  ] as const)('applies the %s calorie floor of %i', (sex, kcal) => {
    const profile: Profile = { ...baseProfile, sex, age: 80, heightCm: 120, weightKg: 35, activity: 1.2 };
    expect(getDailyTargets(profile).kcal).toBe(kcal);
  });
});

describe('getCalorieStatus', () => {
  it.each([
    [89, 'food'],
    [90, 'fit'],
    [100, 'fit'],
    [101, 'tomato'],
  ] as const)('uses %s percent to select %s', (percent, status) => {
    expect(getCalorieStatus(percent * 20, 2000)).toBe(status);
  });

  it('turns red immediately above the target rather than rounding the percentage down', () => {
    expect(getCalorieStatus(2000.1, 2000)).toBe('tomato');
  });
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
    meal: 'lunch',
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
