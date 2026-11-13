import { useCallback, useEffect, useState } from 'react';
import type {
  AppData, CardioPlan, Dish, Ingredient, KnownDefaultIds, Meal, MealEntry, Profile,
  StrengthFocus, StrengthPlan, WeeklyDay
} from './types';
import { getMealForTime } from './stats';
import { recipes } from './food/recipes';
import {
  defaultDishes,
  defaultIngredients,
} from './food/foodDefaults';
import {
  defaultCardioPlans,
  defaultStrengthPlans,
  defaultWeeklyPlan,
} from './fitness/fitnessDefaults';

export const STORAGE_KEY = 'fitfood:v1';
export const CURRENT_SCHEMA_VERSION = 2;
const CORRUPT_STORAGE_PREFIX = `${STORAGE_KEY}:corrupt-`;
const DATE_KEY = /^\d{4}-\d{2}-\d{2}$/;
const CARDIO_MACHINES = new Set([
  'treadmill', 'stairclimber', 'elliptical', 'spinbike',
  'recumbent', 'rower', 'airbike', 'skierg',
]);
const STRENGTH_FOCUSES = new Set(['push', 'pull', 'legs', 'full']);

// Freeze the original release IDs: deriving these from current defaults would hide future additions.
const LEGACY_DEFAULT_IDS: KnownDefaultIds = {
  ingredients: [
    'ing-egg', 'ing-chicken', 'ing-chicken-thigh', 'ing-pork', 'ing-ground-pork',
    'ing-beef', 'ing-ground-beef', 'ing-pork-tenderloin', 'ing-broccoli', 'ing-bokchoy',
    'ing-cabbage', 'ing-tomato', 'ing-spinach', 'ing-pepper', 'ing-zucchini',
    'ing-carrot', 'ing-baby-corn', 'ing-cucumber', 'ing-rice', 'ing-noodle',
    'ing-sweetpotato', 'ing-potato', 'ing-pasta', 'ing-scallion', 'ing-garlic',
    'ing-onion', 'ing-ginger', 'ing-salt', 'ing-pepper-seasoning',
  ],
  dishes: [
    'dish-tomato-egg', 'dish-chicken-broccoli', 'dish-pork-cabbage', 'dish-beef-bokchoy',
    'dish-chicken-spinach', 'dish-ground-pork-zucchini', 'dish-egg-spinach', 'dish-pork-pepper',
    'dish-beef-broccoli', 'dish-chicken-tomato', 'dish-pork-baby-corn', 'dish-beef-cabbage',
    'dish-chicken-cucumber', 'dish-ground-pork-tomato', 'dish-tenderloin-broccoli',
    'dish-chicken-thigh-zucchini', 'dish-beef-carrot', 'dish-egg-pepper',
    'dish-chicken-cabbage-noodle', 'dish-pork-spinach-noodle', 'dish-beef-tomato-noodle',
    'dish-chicken-sweetpotato', 'dish-pork-potato', 'dish-beef-potato', 'dish-egg-potato',
    'dish-chicken-rice', 'dish-ground-pork-rice', 'dish-beef-onion-rice', 'dish-chicken-pasta',
    'dish-ground-pork-pasta', 'dish-beef-pasta', 'dish-egg-noodle', 'dish-chicken-bokchoy-rice',
    'dish-pork-carrot-rice', 'dish-beef-pepper-rice', 'dish-chicken-baby-corn',
    'dish-ground-pork-cabbage', 'dish-pork-zucchini', 'dish-beef-spinach', 'dish-chicken-carrot',
    'dish-pork-tomato', 'dish-beef-cucumber', 'dish-egg-tomato-noodle', 'dish-chicken-spinach-pasta',
    'dish-ground-pork-potato', 'dish-beef-zucchini', 'dish-tenderloin-pepper',
    'dish-chicken-thigh-cabbage', 'dish-beef-bokchoy-noodle', 'dish-chicken-pepper-noodle',
  ],
  cardioPlans: [
    'cardio-treadmill-12330', 'cardio-treadmill-steady', 'cardio-treadmill-interval',
    'cardio-stair-steady', 'cardio-stair-interval', 'cardio-stair-endurance',
  ],
};

export class UnsupportedDataVersionError extends Error {
  constructor() {
    super('Stored data was created by a newer FitFood version.');
    this.name = 'UnsupportedDataVersionError';
  }
}

export class InvalidAppDataError extends Error {
  constructor() { super('Invalid FitFood data.'); this.name = 'InvalidAppDataError'; }
}

type StorageIssue = 'future-version' | 'storage-unavailable' | 'invalid-data' | null;
let storageIssue: StorageIssue = null;
export function getStorageIssue(): StorageIssue { return storageIssue; }

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function nonemptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function finiteNumber(value: unknown, minimum: number): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= minimum;
}

function currentDefaultIds(): KnownDefaultIds {
  return {
    ingredients: defaultIngredients.map((item) => item.id),
    dishes: defaultDishes.map((item) => item.id),
    cardioPlans: defaultCardioPlans.map((item) => item.id),
  };
}

export const migrations = [
  {
    from: 1,
    to: 2,
    migrate: (data: Record<string, unknown>): Record<string, unknown> => ({
      ...data,
      version: 2,
      knownDefaultIds: data.knownDefaultIds ?? LEGACY_DEFAULT_IDS,
    }),
  },
] as const;

function migrateData(raw: unknown): Record<string, unknown> {
  if (!isRecord(raw)) throw new InvalidAppDataError();
  const rawVersion = raw.version === undefined ? 1 : raw.version;
  if (typeof rawVersion === 'number' && rawVersion > CURRENT_SCHEMA_VERSION) throw new UnsupportedDataVersionError();
  if (typeof rawVersion !== 'number' || !Number.isInteger(rawVersion) || rawVersion < 1)
    throw new InvalidAppDataError();
  let version: number = rawVersion;
  let data = { ...raw };
  while (version < CURRENT_SCHEMA_VERSION) {
    const migration = migrations.find((step) => step.from === version);
    if (!migration) throw new InvalidAppDataError();
    data = migration.migrate(data);
    version = migration.to;
  }
  return data;
}

export function createMealId(): string {
  try {
    if (typeof globalThis.crypto?.randomUUID === 'function') {
      return globalThis.crypto.randomUUID();
    }
  } catch {
    // Older browsers may expose randomUUID without allowing it in this context.
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

function validNutrition(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0
    ? value
    : 0;
}

function isMeal(value: unknown): value is Meal {
  return value === 'breakfast' || value === 'lunch' || value === 'dinner';
}

export function sanitizeMealLog(raw: unknown): Record<string, MealEntry[]> {
  const sanitized: Record<string, MealEntry[]> = {};

  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return sanitized;
  }

  const usedIds = new Set<string>();

  for (const [date, value] of Object.entries(raw)) {
    if (!DATE_KEY.test(date) || !Array.isArray(value)) continue;

    const entries: MealEntry[] = [];

    for (const [index, entry] of value.entries()) {
      if (!entry || typeof entry !== 'object' || Array.isArray(entry)) continue;

      const { dishId, at } = entry as Record<string, unknown>;
      if (typeof dishId !== 'string' || dishId.trim().length === 0) continue;
      if (typeof at !== 'number' || !Number.isFinite(at)) continue;

      const record = entry as Record<string, unknown>;
      const candidateId = typeof record.id === 'string' && record.id.trim()
        ? record.id
        : `legacy-${date}-${index}-${at}-${dishId}`;
      let id = candidateId;
      let suffix = 1;
      // Keep every valid entry independently removable, even if old IDs collide.
      while (usedIds.has(id)) id = `${candidateId}-${suffix++}`;
      usedIds.add(id);

      const recipe = recipes[dishId];
      entries.push({
        id,
        dishId,
        at,
        meal: isMeal(record.meal) ? record.meal : getMealForTime(new Date(at)),
        kcal: validNutrition(Object.prototype.hasOwnProperty.call(record, 'kcal')
          ? record.kcal
          : recipe?.kcal),
        proteinG: validNutrition(Object.prototype.hasOwnProperty.call(record, 'proteinG')
          ? record.proteinG
          : recipe?.proteinG),
      });
    }

    if (entries.length > 0) sanitized[date] = entries;
  }

  return sanitized;
}

function sanitizeWeeklyLog(raw: unknown): Record<string, boolean> {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};

  return Object.fromEntries(
    Object.entries(raw).filter(([date, completed]) => DATE_KEY.test(date) && completed === true),
  );
}

function mergeDefaultsById<T extends { id: string }>(items: T[], defaults: T[], knownIds: string[]): T[] {
  const records = new Map<string, T>();
  const known = new Set(knownIds);
  for (const item of items) {
    if (!records.has(item.id)) records.set(item.id, item);
  }

  // A known but absent ID means deletion, not a missed migration.
  for (const record of defaults) {
    if (!known.has(record.id) && !records.has(record.id)) records.set(record.id, record);
  }

  return [...records.values()];
}

function sanitizeIngredients(raw: unknown): Ingredient[] {
  const items = Array.isArray(raw) ? raw : defaultIngredients;
  return items.filter((item): item is Ingredient =>
    isRecord(item) && nonemptyString(item.id) && nonemptyString(item.name) &&
    ['protein', 'veg', 'carb', 'other'].includes(item.category as string) &&
    typeof item.inStock === 'boolean',
  ).map(({ id, name, category, inStock }) => ({ id, name, category, inStock }));
}

function sanitizeDishes(raw: unknown): Dish[] {
  const defaults = new Map(defaultDishes.map((dish) => [dish.id, dish]));
  const items = Array.isArray(raw) ? raw : defaultDishes;

  return items.filter((dish): dish is Dish =>
    isRecord(dish) && nonemptyString(dish.id) && nonemptyString(dish.name) &&
    finiteNumber(dish.minutes, Number.MIN_VALUE) && Array.isArray(dish.ingredientIds) &&
    dish.ingredientIds.every(nonemptyString),
  ).map((dish) => ({
    id: dish.id,
    name: dish.name,
    ingredientIds: [...dish.ingredientIds],
    minutes: dish.minutes,
    meals: Array.isArray(dish.meals) && dish.meals.length > 0 && dish.meals.every(isMeal)
      ? [...new Set(dish.meals)]
      : [...(defaults.get(dish.id)?.meals ?? ['lunch', 'dinner'])] as Meal[],
  }));
}

function sanitizeKnownDefaultIds(raw: unknown): KnownDefaultIds {
  const known = isRecord(raw) ? raw : LEGACY_DEFAULT_IDS;
  const ids = (key: keyof KnownDefaultIds): string[] => {
    const value = known[key];
    if (!Array.isArray(value)) return [...LEGACY_DEFAULT_IDS[key]];
    const valid = value.filter(nonemptyString);
    // Corrupt tracking metadata must not make original deletions look like new defaults.
    return [...new Set(valid.length === value.length ? valid : [...LEGACY_DEFAULT_IDS[key], ...valid])];
  };
  return { ingredients: ids('ingredients'), dishes: ids('dishes'), cardioPlans: ids('cardioPlans') };
}

function sanitizeProfile(raw: unknown): Profile | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const profile = raw as Record<string, unknown>;
  const inRange = (value: unknown, minimum: number, maximum: number): value is number =>
    typeof value === 'number' && Number.isFinite(value) && value >= minimum && value <= maximum;

  if (
    (profile.sex !== 'male' && profile.sex !== 'female') ||
    !inRange(profile.age, 18, 80) ||
    !inRange(profile.heightCm, 120, 220) ||
    !inRange(profile.weightKg, 35, 250) ||
    ![1.2, 1.375, 1.55, 1.725, 1.9].includes(profile.activity as number) ||
    ![0.15, 0.2].includes(profile.deficit as number)
  ) return null;

  return {
    sex: profile.sex,
    age: profile.age,
    heightCm: profile.heightCm,
    weightKg: profile.weightKg,
    activity: profile.activity as Profile['activity'],
    deficit: profile.deficit as Profile['deficit'],
  };
}

function sanitizeWeightLog(raw: unknown): Record<string, number> {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};

  return Object.fromEntries(
    Object.entries(raw).filter(([date, weight]) =>
      DATE_KEY.test(date) && typeof weight === 'number' && Number.isFinite(weight) && weight > 0,
    ),
  );
}

function sanitizeCardioPlans(raw: unknown): CardioPlan[] {
  const items = Array.isArray(raw) ? raw : defaultCardioPlans;
  return items.filter((plan): plan is CardioPlan =>
    isRecord(plan) && nonemptyString(plan.id) && nonemptyString(plan.name) &&
    CARDIO_MACHINES.has(plan.machine as string) && finiteNumber(plan.minutes, Number.MIN_VALUE) &&
    Array.isArray(plan.steps) && plan.steps.every((step: unknown) => typeof step === 'string'),
  ).map(({ id, machine, name, minutes, steps }) => ({ id, machine, name, minutes, steps: [...steps] }));
}

function sanitizeStrengthPlans(raw: unknown): StrengthPlan[] {
  const items = Array.isArray(raw) ? raw : defaultStrengthPlans;
  return items.filter((plan): plan is StrengthPlan =>
    isRecord(plan) && nonemptyString(plan.id) && nonemptyString(plan.name) &&
    STRENGTH_FOCUSES.has(plan.focus as string) && Array.isArray(plan.exercises) &&
    plan.exercises.every((exercise: unknown) =>
      isRecord(exercise) && nonemptyString(exercise.name) &&
      finiteNumber(exercise.sets, 1) && Number.isInteger(exercise.sets) &&
      nonemptyString(exercise.reps) && finiteNumber(exercise.restSec, 0),
    ),
  ).map(({ id, focus, name, exercises }) => ({
    id, focus, name,
    exercises: exercises.map(({ name: exerciseName, sets, reps, restSec }) => ({
      name: exerciseName, sets, reps, restSec
    })),
  }));
}

function sanitizeWeeklyPlan(raw: unknown): WeeklyDay[] {
  const items = Array.isArray(raw) ? raw : defaultWeeklyPlan;
  const days = new Map<number, WeeklyDay>();
  for (const day of items) {
    if (!isRecord(day) || !finiteNumber(day.weekday, 0) || !Number.isInteger(day.weekday) || day.weekday > 6) continue;
    if (days.has(day.weekday)) continue;
    days.set(day.weekday, {
      weekday: day.weekday as WeeklyDay['weekday'],
      cardioPlanId: nonemptyString(day.cardioPlanId) ? day.cardioPlanId : null,
      strengthFocus: STRENGTH_FOCUSES.has(day.strengthFocus as string) ? day.strengthFocus as StrengthFocus : null,
    });
  }
  return [...days.values()];
}

export function createDefaultData(): AppData {
  return {
    version: CURRENT_SCHEMA_VERSION,
    knownDefaultIds: currentDefaultIds(),
    ingredients: sanitizeIngredients(defaultIngredients),
    dishes: sanitizeDishes(defaultDishes),
    cardioPlans: sanitizeCardioPlans(defaultCardioPlans),
    strengthPlans: sanitizeStrengthPlans(defaultStrengthPlans),
    lastStrengthFocus: null,
    weeklyPlan: sanitizeWeeklyPlan(defaultWeeklyPlan),
    weeklyLog: {},
    mealLog: {},
    profile: null,
    weightLog: {},
  };
}

export function normalizeAppData(raw: unknown): AppData {
  const migrated = migrateData(raw);
  const known = sanitizeKnownDefaultIds(migrated.knownDefaultIds);
  // Validate every field before appending defaults introduced by newer releases.
  const validated = {
    ingredients: sanitizeIngredients(migrated.ingredients),
    dishes: sanitizeDishes(migrated.dishes),
    cardioPlans: sanitizeCardioPlans(migrated.cardioPlans),
    strengthPlans: sanitizeStrengthPlans(migrated.strengthPlans),
    weeklyPlan: sanitizeWeeklyPlan(migrated.weeklyPlan),
    lastStrengthFocus: STRENGTH_FOCUSES.has(migrated.lastStrengthFocus as string)
      ? migrated.lastStrengthFocus as StrengthFocus : null,
    weeklyLog: sanitizeWeeklyLog(migrated.weeklyLog),
    mealLog: sanitizeMealLog(migrated.mealLog),
    profile: sanitizeProfile(migrated.profile),
    weightLog: sanitizeWeightLog(migrated.weightLog),
  };
  const cardioPlans = mergeDefaultsById(
    validated.cardioPlans, sanitizeCardioPlans(defaultCardioPlans), known.cardioPlans
  );
  const cardioIds = new Set(cardioPlans.map((plan) => plan.id));
  const current = currentDefaultIds();
  return {
    version: CURRENT_SCHEMA_VERSION,
    knownDefaultIds: {
      ingredients: [...new Set([...known.ingredients, ...current.ingredients])],
      dishes: [...new Set([...known.dishes, ...current.dishes])],
      cardioPlans: [...new Set([...known.cardioPlans, ...current.cardioPlans])],
    },
    ingredients: mergeDefaultsById(validated.ingredients, sanitizeIngredients(defaultIngredients), known.ingredients),
    dishes: mergeDefaultsById(validated.dishes, sanitizeDishes(defaultDishes), known.dishes),
    cardioPlans,
    strengthPlans: validated.strengthPlans,
    lastStrengthFocus: validated.lastStrengthFocus,
    weeklyPlan: validated.weeklyPlan.map((day) => ({
      ...day,
      cardioPlanId: cardioIds.has(day.cardioPlanId ?? '') ? day.cardioPlanId : null,
    })),
    weeklyLog: validated.weeklyLog,
    mealLog: validated.mealLog,
    profile: validated.profile,
    weightLog: validated.weightLog,
  };
}

function preserveCorruptData(raw: string): void {
  const backups: { key: string; timestamp: number }[] = [];
  for (let index = 0; index < localStorage.length; index++) {
    const key = localStorage.key(index);
    if (!key?.startsWith(CORRUPT_STORAGE_PREFIX)) continue;
    const suffix = key.slice(CORRUPT_STORAGE_PREFIX.length);
    const timestamp = Number(suffix);
    if (/^\d+$/.test(suffix) && Number.isSafeInteger(timestamp)) backups.push({ key, timestamp });
  }
  backups.sort((a, b) => b.timestamp - a.timestamp);

  // StrictMode can read the same broken value twice before the first save effect.
  if (!backups[0] || localStorage.getItem(backups[0].key) !== raw) {
    const timestamp = Math.max(Date.now(), (backups[0]?.timestamp ?? 0) + 1);
    const key = `${CORRUPT_STORAGE_PREFIX}${timestamp}`;
    // Preserve the original before pruning; a failed write must retain all recoverable data.
    localStorage.setItem(key, raw);
    backups.unshift({ key, timestamp });
  }
  for (const { key } of backups.slice(3)) localStorage.removeItem(key);
}

export function loadData(): AppData {
  storageIssue = null;
  let storedData: string | null = null;
  try {
    storedData = localStorage.getItem(STORAGE_KEY);
    if (storedData === null) return createDefaultData();
    const parsedData: unknown = JSON.parse(storedData);
    const data = normalizeAppData(parsedData);
    if (JSON.stringify(parsedData) !== JSON.stringify(data)) {
      try {
        saveData(data);
      } catch (error) {
        if (error instanceof UnsupportedDataVersionError) throw error;
        // A blocked or full store must not discard valid data already read.
        storageIssue = 'storage-unavailable';
      }
    }
    return data;
  } catch (error) {
    storageIssue = error instanceof UnsupportedDataVersionError ? 'future-version'
      : error instanceof InvalidAppDataError || error instanceof SyntaxError ? 'invalid-data'
        : 'storage-unavailable';
    if (storageIssue === 'invalid-data' && storedData !== null) {
      try { preserveCorruptData(storedData); }
      catch { storageIssue = 'storage-unavailable'; }
    }
    return createDefaultData();
  }
}

export function saveData(data: AppData): void {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored !== null) {
    try {
      migrateData(JSON.parse(stored));
    } catch (error) {
      if (error instanceof UnsupportedDataVersionError) {
        storageIssue = 'future-version';
        throw error;
      }
      if (!(error instanceof InvalidAppDataError || error instanceof SyntaxError)) throw error;
      // Retry here as well: a failed load-time backup must never permit an overwrite.
      preserveCorruptData(stored);
    }
  }
  const serialized = JSON.stringify(data);
  if (stored !== serialized) localStorage.setItem(STORAGE_KEY, serialized);
}

export function useAppData() {
  const [data, setDataState] = useState<AppData>(loadData);
  const [saveError, setSaveError] = useState<Error | null>(null);

  const setData = useCallback((next: AppData | ((previous: AppData) => AppData)): void => {
    setDataState(next);
  }, []);

  useEffect(() => {
    if (storageIssue === 'future-version') return;
    try {
      // Keep state updaters pure; unchanged serialized data also skips StrictMode's repeated effect.
      saveData(data);
    } catch (error) {
      setSaveError(error instanceof Error ? error : new Error('Unable to save data.'));
    }
  }, [data]);

  if (storageIssue === 'future-version') throw new UnsupportedDataVersionError();
  if (saveError) throw saveError;

  return [data, setData] as const;
}
