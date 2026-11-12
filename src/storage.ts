import { useState } from 'react';
import type { AppData } from './types';
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

    return {
      ...createDefaultData(),
      ...parsedData,
      weeklyPlan: Array.isArray(parsedData.weeklyPlan)
        ? parsedData.weeklyPlan
        : defaultWeeklyPlan,
      weeklyLog:
        parsedData.weeklyLog &&
        typeof parsedData.weeklyLog === 'object' &&
        !Array.isArray(parsedData.weeklyLog)
          ? parsedData.weeklyLog
          : {},
    };
  } catch {
    return createDefaultData();
  }
}

export function saveData(data: AppData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function useAppData() {
  const [data, setDataState] = useState<AppData>(loadData);

  const setData = (nextData: AppData): void => {
    setDataState(nextData);
    saveData(nextData);
  };

  return [data, setData] as const;
}
