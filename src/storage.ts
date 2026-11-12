import { useState } from 'react';
import type { AppData, CardioPlan, Dish, Meal, MealEntry, Profile } from './types';
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

const STORAGE_KEY = 'fitfood:v1';
const DATE_KEY = /^\d{4}-\d{2}-\d{2}$/;
const CARDIO_MACHINES = new Set([
  'treadmill', 'stairclimber', 'elliptical', 'spinbike',
  'recumbent', 'rower', 'airbike', 'skierg',
]);

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

    for (const entry of value) {
      if (!entry || typeof entry !== 'object' || Array.isArray(entry)) continue;

      const { dishId, at } = entry as Record<string, unknown>;
      if (typeof dishId !== 'string' || dishId.trim().length === 0) continue;
      if (typeof at !== 'number' || !Number.isFinite(at)) continue;

      const record = entry as Record<string, unknown>;
      const candidateId = typeof record.id === 'string' && record.id.trim()
        ? record.id
        : createMealId();
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

function mergeDefaultsById<T extends { id: string }>(raw: unknown, defaults: T[]): T[] {
  const records = new Map<string, T>();

  if (Array.isArray(raw)) {
    for (const record of raw) {
      if (!record || typeof record !== 'object' || Array.isArray(record)) continue;
      if (typeof record.id !== 'string' || !record.id.trim()) continue;
      if (!records.has(record.id)) records.set(record.id, record as T);
    }
  }

  // Preserve saved stock flags, custom records and edits; append only missing IDs.
  for (const record of defaults) {
    if (!records.has(record.id)) records.set(record.id, record);
  }

  return [...records.values()];
}

function mergeDishes(raw: unknown): Dish[] {
  const defaults = new Map(defaultDishes.map((dish) => [dish.id, dish]));

  return mergeDefaultsById(raw, defaultDishes).map((dish) => ({
    ...dish,
    meals: Array.isArray(dish.meals) && dish.meals.length > 0 && dish.meals.every(isMeal)
      ? [...new Set(dish.meals)]
      : [...(defaults.get(dish.id)?.meals ?? ['lunch', 'dinner'])] as Meal[],
  }));
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

function mergeCardioPlans(raw: unknown): CardioPlan[] {
  const plans = new Map<string, CardioPlan>();

  if (Array.isArray(raw)) {
    for (const plan of raw) {
      if (!plan || typeof plan !== 'object' || Array.isArray(plan)) continue;
      if (typeof plan.id !== 'string' || !plan.id.trim()) continue;
      if (typeof plan.machine !== 'string' || !CARDIO_MACHINES.has(plan.machine)) continue;
      if (!plans.has(plan.id)) plans.set(plan.id, plan as CardioPlan);
    }
  }

  // Existing plans win by ID; new defaults are appended without replacing edits.
  for (const plan of defaultCardioPlans) {
    if (!plans.has(plan.id)) plans.set(plan.id, plan);
  }

  return [...plans.values()];
}

function createDefaultData(): AppData {
  return {
    version: 1,
    ingredients: defaultIngredients,
    dishes: defaultDishes,
    cardioPlans: defaultCardioPlans,
    strengthPlans: defaultStrengthPlans,
    lastStrengthFocus: null,
    weeklyPlan: defaultWeeklyPlan,
    weeklyLog: {},
    mealLog: {},
    profile: null,
    weightLog: {},
  };
}

export function loadData(): AppData {
  try {
    const storedData = localStorage.getItem(STORAGE_KEY);

    if (!storedData) {
      return createDefaultData();
    }

    const parsedData = JSON.parse(storedData) as Partial<AppData> | null;

    if (!parsedData || typeof parsedData !== 'object' || Array.isArray(parsedData)) {
      return createDefaultData();
    }

    const cardioPlans = mergeCardioPlans(parsedData.cardioPlans);
    const cardioPlanIds = new Set(cardioPlans.map((plan) => plan.id));
    const weeklyPlan = Array.isArray(parsedData.weeklyPlan)
      ? parsedData.weeklyPlan
      : defaultWeeklyPlan;

    const data: AppData = {
      ...createDefaultData(),
      ...parsedData,
      ingredients: mergeDefaultsById(parsedData.ingredients, defaultIngredients),
      dishes: mergeDishes(parsedData.dishes),
      cardioPlans,
      weeklyPlan: weeklyPlan.map((day) => ({
        ...day,
        cardioPlanId: cardioPlanIds.has(day?.cardioPlanId ?? '') ? day.cardioPlanId : null,
      })),
      weeklyLog: sanitizeWeeklyLog(parsedData.weeklyLog),
      mealLog: sanitizeMealLog(parsedData.mealLog),
      profile: sanitizeProfile(parsedData.profile),
      weightLog: sanitizeWeightLog(parsedData.weightLog),
    };

    if (
      JSON.stringify(parsedData.ingredients) !== JSON.stringify(data.ingredients) ||
      JSON.stringify(parsedData.dishes) !== JSON.stringify(data.dishes) ||
      JSON.stringify(parsedData.cardioPlans) !== JSON.stringify(data.cardioPlans) ||
      JSON.stringify(parsedData.weeklyPlan) !== JSON.stringify(data.weeklyPlan) ||
      JSON.stringify(parsedData.weeklyLog) !== JSON.stringify(data.weeklyLog) ||
      JSON.stringify(parsedData.mealLog) !== JSON.stringify(data.mealLog) ||
      JSON.stringify(parsedData.profile) !== JSON.stringify(data.profile) ||
      JSON.stringify(parsedData.weightLog) !== JSON.stringify(data.weightLog)
    ) {
      try {
        saveData(data);
      } catch {
        // A blocked or full store must not discard valid data already read.
      }
    }

    return data;
  } catch {
    return createDefaultData();
  }
}

export function saveData(data: AppData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function useAppData() {
  const [data, setDataState] = useState<AppData>(loadData);

  const setData = (next: AppData | ((previous: AppData) => AppData)): void => {
    setDataState((previous) => {
      const nextData = typeof next === 'function' ? next(previous) : next;
      saveData(nextData);
      return nextData;
    });
  };

  return [data, setData] as const;
}
