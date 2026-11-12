export type IngredientCategory = 'protein' | 'veg' | 'carb' | 'other';
export interface Ingredient { id: string; name: string; category: IngredientCategory; inStock: boolean; }
export interface Dish { id: string; name: string; ingredientIds: string[]; minutes: number; }
export type CardioMachine = 'treadmill' | 'stairclimber';
export interface CardioPlan { id: string; machine: CardioMachine; name: string; minutes: number; steps: string[]; }
export type StrengthFocus = 'push' | 'pull' | 'legs' | 'full';
export interface Exercise { name: string; sets: number; reps: string; restSec: number; }
export interface StrengthPlan { id: string; focus: StrengthFocus; name: string; exercises: Exercise[]; }
export interface AppData { version: 1; ingredients: Ingredient[]; dishes: Dish[]; cardioPlans: CardioPlan[]; strengthPlans: StrengthPlan[]; lastStrengthFocus: StrengthFocus | null; }