import { useState } from 'react';
import type { AppData } from './types';
import {
  defaultDishes,
  defaultIngredients,
} from './food/foodDefaults';
import {
  defaultCardioPlans,
  defaultStrengthPlans,
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
  };
}

export function loadData(): AppData {
  try {
    const storedData = localStorage.getItem(STORAGE_KEY);

    if (!storedData) {
      return createDefaultData();
    }

    return JSON.parse(storedData) as AppData;
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