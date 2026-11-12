import { afterEach, describe, expect, it, vi } from 'vitest';
import type { MealEntry } from './types';
import { recipes } from './food/recipes';
import { createMealId, loadData, sanitizeMealLog } from './storage';
import { defaultCardioPlans } from './fitness/fitnessDefaults';

const date = '2026-11-12';
const validEntry: MealEntry = {
  id: 'meal-valid',
  dishId: 'dish-tomato-egg',
  at: 1794511800000,
  kcal: 123,
  proteinG: 17,
};

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('sanitizeMealLog', () => {
  it.each([undefined, null, false, 42, 'broken'])('rejects non-object input %s', (raw) => {
    expect(sanitizeMealLog(raw)).toEqual({});
  });

  it('rejects an array as the log container', () => {
    expect(sanitizeMealLog([validEntry])).toEqual({});
  });

  it('discards malformed date keys while preserving a valid date', () => {
    expect(sanitizeMealLog({ bad: [validEntry], '2026-1-12': [validEntry], [date]: [validEntry] }))
      .toEqual({ [date]: [validEntry] });
  });

  it('discards a day whose value is not an array', () => {
    expect(sanitizeMealLog({ [date]: 'x', '2026-11-13': [validEntry] }))
      .toEqual({ '2026-11-13': [validEntry] });
  });

  it('discards entries with missing, empty, whitespace-only or non-string dish IDs', () => {
    expect(sanitizeMealLog({ [date]: [
      { at: 123 },
      { dishId: '', at: 123 },
      { dishId: '  ', at: 123 },
      { dishId: 123, at: 123 },
      validEntry,
    ] })).toEqual({ [date]: [validEntry] });
  });

  it('discards NaN, infinite, missing and non-numeric timestamps', () => {
    expect(sanitizeMealLog({ [date]: [
      { dishId: 'dish-tomato-egg', at: Number.NaN },
      { dishId: 'dish-tomato-egg', at: Infinity },
      { dishId: 'dish-tomato-egg', at: -Infinity },
      { dishId: 'dish-tomato-egg', at: '123' },
      { dishId: 'dish-tomato-egg' },
      validEntry,
    ] })).toEqual({ [date]: [validEntry] });
  });

  it('migrates old entries with a new ID and recipe nutrient snapshots', () => {
    const oldEntry = { dishId: 'dish-tomato-egg', at: 123 };
    const result = sanitizeMealLog({ [date]: [oldEntry] });
    expect(result[date]).toEqual([{
      ...oldEntry,
      id: expect.any(String),
      kcal: recipes[oldEntry.dishId].kcal,
      proteinG: recipes[oldEntry.dishId].proteinG,
    }]);
    expect(result[date][0].id.length).toBeGreaterThan(0);
    expect(oldEntry).toEqual({ dishId: 'dish-tomato-egg', at: 123 });
  });

  it('uses zero nutrient snapshots for legacy custom dishes without recipes', () => {
    const result = sanitizeMealLog({ [date]: [{ dishId: 'dish-custom', at: 123 }] });
    expect(result[date][0]).toEqual({ dishId: 'dish-custom', at: 123, id: expect.any(String), kcal: 0, proteinG: 0 });
  });

  it.each([-1, Number.NaN, Infinity, '123', null, undefined])('replaces invalid provided nutrients (%s) with zero', (value) => {
    expect(sanitizeMealLog({ [date]: [{ ...validEntry, kcal: value, proteinG: value }] }))
      .toEqual({ [date]: [{ ...validEntry, kcal: 0, proteinG: 0 }] });
  });

  it('keeps valid snapshots instead of recalculating them from the current recipe', () => {
    expect(sanitizeMealLog({ [date]: [validEntry] })).toEqual({ [date]: [validEntry] });
  });

  it('removes days that contain no valid entries after validation', () => {
    expect(sanitizeMealLog({ [date]: [], '2026-11-13': [null, [], 1, {}] })).toEqual({});
  });

  it('keeps all good entries in order while discarding only bad entries', () => {
    const second = { ...validEntry, id: 'meal-second', at: 124 };
    expect(sanitizeMealLog({ [date]: [null, validEntry, 'bad', second] }))
      .toEqual({ [date]: [validEntry, second] });
  });

  it('gives duplicate IDs independent identities without discarding either meal', () => {
    const result = sanitizeMealLog({ [date]: [validEntry, validEntry] });
    expect(result[date]).toHaveLength(2);
    expect(new Set(result[date].map((entry) => entry.id)).size).toBe(2);
    expect(result[date].map((entry) => entry.kcal)).toEqual([123, 123]);
  });
});

describe('createMealId', () => {
  it('uses crypto.randomUUID when supported', () => {
    const randomUUID = vi.fn(() => 'uuid-from-browser');
    vi.stubGlobal('crypto', { randomUUID });
    expect(createMealId()).toBe('uuid-from-browser');
    expect(randomUUID).toHaveBeenCalledOnce();
  });

  it.each([undefined, { randomUUID: () => { throw new Error('Unavailable'); } }])('falls back when UUID generation is unavailable', (crypto) => {
    vi.stubGlobal('crypto', crypto);
    vi.spyOn(Date, 'now').mockReturnValue(1794511800000);
    vi.spyOn(Math, 'random').mockReturnValue(0.123456789);
    expect(createMealId()).toMatch(/^1794511800000-[a-z0-9]+$/);
  });
});

describe('loadData', () => {
  function mockStorage(value: string | null) {
    const storage = { getItem: vi.fn(() => value), setItem: vi.fn() };
    vi.stubGlobal('localStorage', storage);
    return storage;
  }

  it.each([null, '{invalid', 'null', '[]', '42'])('returns usable default data for invalid or missing storage: %s', (stored) => {
    mockStorage(stored);
    const data = loadData();
    expect(data.version).toBe(1);
    expect(data.dishes.length).toBeGreaterThan(0);
    expect(data.weeklyPlan).toHaveLength(7);
    expect(data.mealLog).toEqual({});
    expect(data.weeklyLog).toEqual({});
  });

  it('does not throw when reading localStorage is blocked', () => {
    vi.stubGlobal('localStorage', { getItem: () => { throw new Error('Blocked'); } });
    expect(() => loadData()).not.toThrow();
    expect(loadData().mealLog).toEqual({});
  });

  it('merges six legacy cardio plans into all 24 defaults and persists the migration', () => {
    const legacyPlans = defaultCardioPlans.filter(
      (plan) => plan.machine === 'treadmill' || plan.machine === 'stairclimber',
    );
    expect(legacyPlans).toHaveLength(6);
    const storage = mockStorage(JSON.stringify({ cardioPlans: legacyPlans }));
    const data = loadData();
    expect(data.cardioPlans).toHaveLength(24);
    expect(new Set(data.cardioPlans.map((plan) => plan.id)).size).toBe(24);
    expect(new Set(data.cardioPlans.map((plan) => plan.machine)).size).toBe(8);
    expect(data.cardioPlans).toEqual(expect.arrayContaining(defaultCardioPlans));
    expect(storage.setItem).toHaveBeenCalledWith('fitfood:v1', JSON.stringify(data));
  });

  it('preserves existing user edits when a default has the same cardio plan ID', () => {
    const edited = {
      ...defaultCardioPlans[0],
      name: 'My Edited Walk',
      minutes: 17,
      steps: ['My warm-up', 'My main set'],
    };
    mockStorage(JSON.stringify({ cardioPlans: [edited] }));
    const data = loadData();
    expect(data.cardioPlans).toHaveLength(24);
    expect(data.cardioPlans.find((plan) => plan.id === edited.id)).toEqual(edited);
  });

  it('discards unknown cardio machines while retaining valid plans', () => {
    const invalid = {
      id: 'cardio-unknown',
      machine: 'unknown-machine',
      name: 'Unsupported Machine',
      minutes: 10,
      steps: ['Unsupported step'],
    };
    const storage = mockStorage(JSON.stringify({
      cardioPlans: [defaultCardioPlans[0], invalid],
    }));
    const data = loadData();
    expect(data.cardioPlans).toHaveLength(24);
    expect(data.cardioPlans.some((plan) => plan.id === invalid.id)).toBe(false);
    expect(data.cardioPlans).toContainEqual(defaultCardioPlans[0]);
    expect(storage.setItem).toHaveBeenCalledWith('fitfood:v1', JSON.stringify(data));
  });

  it('clears missing cardio plan references without changing other weekly fields', () => {
    const weeklyPlan = [
      { weekday: 1, cardioPlanId: defaultCardioPlans[0].id, strengthFocus: 'full' },
      { weekday: 2, cardioPlanId: 'cardio-missing', strengthFocus: 'push' },
      { weekday: 0, cardioPlanId: null, strengthFocus: null },
    ];
    const storage = mockStorage(JSON.stringify({ cardioPlans: defaultCardioPlans, weeklyPlan }));
    const data = loadData();
    expect(data.weeklyPlan).toEqual([
      weeklyPlan[0],
      { ...weeklyPlan[1], cardioPlanId: null },
      weeklyPlan[2],
    ]);
    expect(storage.setItem).toHaveBeenCalledWith('fitfood:v1', JSON.stringify(data));
  });

  it('keeps custom cardio plans alongside all defaults', () => {
    const custom = {
      id: 'cardio-custom-rower',
      machine: 'rower',
      name: 'My Row',
      minutes: 9,
      steps: ['My custom rowing session'],
    };
    mockStorage(JSON.stringify({ cardioPlans: [custom] }));
    const data = loadData();
    expect(data.cardioPlans).toHaveLength(25);
    expect(data.cardioPlans[0]).toEqual(custom);
    expect(data.cardioPlans).toEqual(expect.arrayContaining(defaultCardioPlans));
  });

  it('does not duplicate cardio plans or rewrite storage after migration is complete', () => {
    const legacyPlans = defaultCardioPlans.filter(
      (plan) => plan.machine === 'treadmill' || plan.machine === 'stairclimber',
    );
    let stored = JSON.stringify({ cardioPlans: legacyPlans });
    const setItem = vi.fn((_key: string, value: string) => { stored = value; });
    vi.stubGlobal('localStorage', { getItem: () => stored, setItem });
    const first = loadData();
    const second = loadData();
    expect(first.cardioPlans).toHaveLength(24);
    expect(second).toEqual(first);
    expect(setItem).toHaveBeenCalledOnce();
  });

  it('cleans corrupt meal and weekly logs, persists the repair, and preserves unrelated data', () => {
    const customDish = { id: 'dish-custom', name: 'Custom Meal', ingredientIds: [], minutes: 7 };
    const storage = mockStorage(JSON.stringify({
      dishes: [customDish],
      mealLog: { [date]: [validEntry, { dishId: '', at: 123 }], '2026-11-13': 'x', bad: [1] },
      weeklyLog: { [date]: true, '2026-11-13': false, '2026-11-14': 1, '2026-11-15': 'true', bad: true },
    }));
    const data = loadData();
    expect(data.dishes).toEqual([customDish]);
    expect(data.mealLog).toEqual({ [date]: [validEntry] });
    expect(data.weeklyLog).toEqual({ [date]: true });
    expect(storage.getItem).toHaveBeenCalledWith('fitfood:v1');
    expect(storage.setItem).toHaveBeenCalledWith('fitfood:v1', JSON.stringify(data));
  });

  it('preserves sanitized good data even when writing the repair fails', () => {
    const storage = mockStorage(JSON.stringify({ mealLog: { [date]: [validEntry], bad: [1] } }));
    storage.setItem.mockImplementation(() => { throw new Error('Quota exceeded'); });
    expect(() => loadData()).not.toThrow();
    expect(loadData().mealLog).toEqual({ [date]: [validEntry] });
  });

  it('persists legacy migration so repeated loads retain the same generated meal ID', () => {
    let stored = JSON.stringify({ mealLog: { [date]: [{ dishId: validEntry.dishId, at: validEntry.at }] } });
    vi.stubGlobal('localStorage', {
      getItem: () => stored,
      setItem: (_key: string, value: string) => { stored = value; },
    });
    const first = loadData();
    const second = loadData();
    expect(second.mealLog).toEqual(first.mealLog);
    expect(second.mealLog[date][0].id.length).toBeGreaterThan(0);
  });
});
