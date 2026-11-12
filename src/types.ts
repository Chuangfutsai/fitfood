export type IngredientCategory = 'protein' | 'veg' | 'carb' | 'other';
export interface Ingredient { id: string; name: string; category: IngredientCategory; inStock: boolean; }
export interface Dish { id: string; name: string; ingredientIds: string[]; minutes: number; }
export type CardioMachine = 'treadmill' | 'stairclimber' | 'elliptical' | 'spinbike' | 'recumbent' | 'rower' | 'airbike' | 'skierg';
export interface CardioPlan { id: string; machine: CardioMachine; name: string; minutes: number; steps: string[]; }
export type StrengthFocus = 'push' | 'pull' | 'legs' | 'full';
export interface Exercise { name: string; sets: number; reps: string; restSec: number; }
export interface StrengthPlan { id: string; focus: StrengthFocus; name: string; exercises: Exercise[]; }
export interface WeeklyDay { weekday: 0 | 1 | 2 | 3 | 4 | 5 | 6; cardioPlanId: string | null; strengthFocus: StrengthFocus | null; }
export interface MealEntry { id: string; dishId: string; at: number; kcal: number; proteinG: number; }
export interface AppData { version: 1; ingredients: Ingredient[]; dishes: Dish[]; cardioPlans: CardioPlan[]; strengthPlans: StrengthPlan[]; lastStrengthFocus: StrengthFocus | null; weeklyPlan: WeeklyDay[]; weeklyLog: Record<string, boolean>; mealLog: Record<string, MealEntry[]>; }
