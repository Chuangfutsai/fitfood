import type { Dish, Ingredient, Meal, Profile } from '../../types';

export interface PlannedMeal {
  meal: Meal;
  dishId: string;
  locked: boolean;
  overTarget?: boolean;
}

export interface PlannedDay {
  dateKey: string;
  meals: PlannedMeal[];
  overTarget?: boolean;
}

export interface MenuExtra {
  id: string;
  text: string;
  checked: boolean;
}

export interface MenuState {
  version: 1;
  weekStart: string;
  days: PlannedDay[];
  checked: string[];
  extras: MenuExtra[];
}

export interface PlanWeekInput {
  weekStart: string;
  dishes: Array<Pick<Dish, 'id' | 'ingredientIds' | 'meals'>>;
  ingredients: Ingredient[];
  recipeKcal: Record<string, number | undefined>;
  profile: Profile | null;
  includeBreakfast?: boolean;
  seed?: number;
  existingDays?: PlannedDay[];
}

export interface ShoppingNeed {
  dishId: string;
  amount: string;
}

export interface ShoppingItem {
  id: string;
  name: string;
  category: Ingredient['category'];
  needs: ShoppingNeed[];
}
