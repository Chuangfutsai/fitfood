import { createContext, useContext } from 'react';
import type { CardioPlan, Dish, Ingredient } from '../types';

export type Language = 'zh-Hant' | 'en';

export interface LanguageValue {
  lang: Language;
  setLang: (language: Language) => void;
  t: (key: string, values?: Record<string, string | number>) => string;
  tDish: (dish: Pick<Dish, 'id' | 'name'>) => string;
  tIngredient: (ingredient: Pick<Ingredient, 'id' | 'name'>) => string;
  tCardio: (plan: CardioPlan) => CardioPlan;
  tExercise: (name: string) => string;
  formatDate: (date: Date, options?: Intl.DateTimeFormatOptions) => string;
}

// Keep context identity independent of translation modules during hot updates.
export const LanguageContext = createContext<LanguageValue | null>(null);

export function useLang(): LanguageValue {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLang must be used within LanguageProvider');
  return context;
}
