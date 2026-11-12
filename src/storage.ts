import { useState } from 'react';
import type { AppData, MealEntry } from './types';
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

    const data: AppData = {
      ...createDefaultData(),
      ...parsedData,
      weeklyPlan: Array.isArray(parsedData.weeklyPlan)
        ? parsedData.weeklyPlan
        : defaultWeeklyPlan,
      weeklyLog: sanitizeWeeklyLog(parsedData.weeklyLog),
      mealLog: sanitizeMealLog(parsedData.mealLog),
    };

    if (
      !Array.isArray(parsedData.weeklyPlan) ||
      JSON.stringify(parsedData.weeklyLog) !== JSON.stringify(data.weeklyLog) ||
      JSON.stringify(parsedData.mealLog) !== JSON.stringify(data.mealLog)
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
