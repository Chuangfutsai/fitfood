import { afterEach, describe, expect, it, vi } from 'vitest';
import type { MealEntry } from './types';
import { recipes } from './food/recipes';
import { createMealId, loadData, sanitizeMealLog } from './storage';
import { defaultCardioPlans } from './fitness/fitnessDefaults';
import { defaultDishes, defaultIngredients } from './food/foodDefaults';

const date = '2026-11-12';
const validEntry: MealEntry = {
  id: 'meal-valid',
  dishId: 'dish-tomato-egg',
  at: 1794511800000,
  kcal: 123,
  proteinG: 17,
  meal: 'lunch',
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
    const oldEntry = { dishId: 'dish-tomato-egg', at: new Date(2026, 10, 12, 8).getTime() };
    const result = sanitizeMealLog({ [date]: [oldEntry] });
    expect(result[date]).toEqual([{
      ...oldEntry,
      id: expect.any(String),
      kcal: recipes[oldEntry.dishId].kcal,
      proteinG: recipes[oldEntry.dishId].proteinG,
      meal: 'breakfast',
    }]);
    expect(result[date][0].id.length).toBeGreaterThan(0);
    expect(oldEntry).toEqual({ dishId: 'dish-tomato-egg', at: new Date(2026, 10, 12, 8).getTime() });
  });

  it('uses zero nutrient snapshots for legacy custom dishes without recipes', () => {
    const at = new Date(2026, 10, 12, 19).getTime();
    const result = sanitizeMealLog({ [date]: [{ dishId: 'dish-custom', at }] });
    expect(result[date][0]).toEqual({ dishId: 'dish-custom', at, id: expect.any(String), kcal: 0, proteinG: 0, meal: 'dinner' });
  });

  it.each([
    [10, 29, 'breakfast'],
    [10, 30, 'lunch'],
    [15, 59, 'lunch'],
    [16, 0, 'dinner'],
  ] as const)('infers a missing meal at %i:%i as %s using local time', (hour, minute, meal) => {
    const at = new Date(2026, 10, 12, hour, minute).getTime();
    const result = sanitizeMealLog({ [date]: [{ dishId: 'dish-custom', at }] });
    expect(result[date][0].meal).toBe(meal);
  });

  it.each([undefined, null, '', 'snack', 1, ['lunch']])('repairs an invalid meal value (%s) from the recorded time', (meal) => {
    const at = new Date(2026, 10, 12, 18).getTime();
    const result = sanitizeMealLog({ [date]: [{ ...validEntry, at, meal }] });
    expect(result[date][0]).toEqual({ ...validEntry, at, meal: 'dinner' });
  });

  it('preserves a selected meal even when it differs from the timestamp default', () => {
    const entry = { ...validEntry, at: new Date(2026, 10, 12, 18).getTime(), meal: 'breakfast' };
    expect(sanitizeMealLog({ [date]: [entry] })).toEqual({ [date]: [entry] });
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
    expect(data.profile).toBeNull();
    expect(data.weightLog).toEqual({});
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
    expect(data.dishes).toContainEqual({ ...customDish, meals: ['lunch', 'dinner'] });
    expect(data.dishes).toHaveLength(defaultDishes.length + 1);
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

  it('adds the five missing breakfast ingredients and dishes without losing saved edits or stock flags', () => {
    const newIngredientIds = new Set(['ing-toast', 'ing-oats', 'ing-cheese', 'ing-greek-yogurt', 'ing-banana']);
    const newDishIds = new Set([
      'dish-spinach-omelette', 'dish-cheese-omelette', 'dish-chicken-egg-toast',
      'dish-tomato-egg-toast', 'dish-yogurt-banana-oats',
    ]);
    const ingredients = defaultIngredients
      .filter((ingredient) => !newIngredientIds.has(ingredient.id))
      .map((ingredient) => ({ ...ingredient, inStock: false }));
    const dishes = defaultDishes.filter((dish) => !newDishIds.has(dish.id));
    const editedIngredient = { ...ingredients[0], name: 'My Ingredient' };
    ingredients[0] = editedIngredient;
    const editedDish = { ...dishes[0], name: 'My Recipe', minutes: 99 };
    dishes[0] = editedDish;
    const storage = mockStorage(JSON.stringify({ ingredients, dishes }));
    const data = loadData();
    expect(data.ingredients).toHaveLength(34);
    expect(data.dishes).toHaveLength(55);
    expect(data.ingredients.find((ingredient) => ingredient.id === editedIngredient.id)).toEqual(editedIngredient);
    expect(data.ingredients.filter((ingredient) => !newIngredientIds.has(ingredient.id)).every((ingredient) => !ingredient.inStock)).toBe(true);
    expect(data.ingredients.filter((ingredient) => newIngredientIds.has(ingredient.id)).every((ingredient) => ingredient.inStock)).toBe(true);
    expect(data.dishes.find((dish) => dish.id === editedDish.id)).toEqual(editedDish);
    expect(new Set(data.ingredients.map((ingredient) => ingredient.id)).size).toBe(34);
    expect(new Set(data.dishes.map((dish) => dish.id)).size).toBe(55);
    expect(storage.setItem).toHaveBeenCalledWith('fitfood:v1', JSON.stringify(data));
  });

  it('fills legacy default meals from their default tags and gives custom dishes lunch and dinner', () => {
    const breakfast = defaultDishes.find((dish) => dish.id === 'dish-egg-potato')!;
    const { meals: _meals, ...legacyDish } = breakfast;
    const custom = { id: 'dish-my-own', name: 'My Dish', ingredientIds: ['ing-egg'], minutes: 8 };
    mockStorage(JSON.stringify({ dishes: [legacyDish, custom] }));
    const data = loadData();
    expect(data.dishes.find((dish) => dish.id === legacyDish.id)).toEqual(breakfast);
    expect(data.dishes.find((dish) => dish.id === custom.id)).toEqual({ ...custom, meals: ['lunch', 'dinner'] });
  });

  it('preserves custom dishes, ingredients and valid explicit meal choices', () => {
    const customIngredient = { id: 'ing-custom', name: 'Custom Ingredient', category: 'other', inStock: false };
    const editedDish = { ...defaultDishes[0], meals: ['dinner'] };
    const customDish = { id: 'dish-custom', name: 'Custom Dish', ingredientIds: [customIngredient.id], minutes: 8, meals: ['breakfast'] };
    mockStorage(JSON.stringify({ ingredients: [customIngredient], dishes: [editedDish, customDish] }));
    const data = loadData();
    expect(data.ingredients[0]).toEqual(customIngredient);
    expect(data.dishes.slice(0, 2)).toEqual([editedDish, customDish]);
  });

  it.each([null, [], ['snack'], 'breakfast'])('repairs invalid dish meal tags (%s)', (meals) => {
    const dish = defaultDishes[0];
    mockStorage(JSON.stringify({ dishes: [{ ...dish, meals }] }));
    expect(loadData().dishes.find((entry) => entry.id === dish.id)?.meals).toEqual(dish.meals);
  });

  const validProfile = {
    sex: 'female', age: 32, heightCm: 165, weightKg: 62, activity: 1.55, deficit: 0.15,
  };

  it('preserves a valid profile and dated weight history', () => {
    mockStorage(JSON.stringify({ profile: validProfile, weightLog: { [date]: 62, '2026-11-11': 62.4 } }));
    const data = loadData();
    expect(data.profile).toEqual(validProfile);
    expect(data.weightLog).toEqual({ [date]: 62, '2026-11-11': 62.4 });
  });

  it.each([
    ['sex', 'other'], ['sex', null], ['age', 17], ['age', 81], ['age', '32'],
    ['heightCm', 119], ['heightCm', 221], ['heightCm', null],
    ['weightKg', 34], ['weightKg', 251], ['weightKg', Infinity],
    ['activity', 1.5], ['activity', '1.55'], ['deficit', 0.25], ['deficit', '0.15'],
  ])('invalidates the entire profile when %s is %s', (field, value) => {
    const storage = mockStorage(JSON.stringify({ profile: { ...validProfile, [field]: value } }));
    const data = loadData();
    expect(data.profile).toBeNull();
    expect(storage.setItem).toHaveBeenCalledWith('fitfood:v1', JSON.stringify(data));
  });

  it.each(Object.keys(validProfile))('invalidates the entire profile when %s is missing', (field) => {
    const profile = { ...validProfile } as Record<string, unknown>;
    delete profile[field];
    mockStorage(JSON.stringify({ profile }));
    expect(loadData().profile).toBeNull();
  });

  it.each([
    { ...validProfile, sex: 'male', age: 18, heightCm: 120, weightKg: 35, activity: 1.2, deficit: 0.2 },
    { ...validProfile, age: 80, heightCm: 220, weightKg: 250, activity: 1.9 },
  ])('accepts inclusive profile bounds', (profile) => {
    mockStorage(JSON.stringify({ profile }));
    expect(loadData().profile).toEqual(profile);
  });

  it('discards corrupt weight entries while retaining valid history', () => {
    mockStorage(JSON.stringify({ weightLog: { [date]: 62, bad: 61, '2026-11-11': '62', '2026-11-10': -1, '2026-11-09': null } }));
    expect(loadData().weightLog).toEqual({ [date]: 62 });
  });
});
