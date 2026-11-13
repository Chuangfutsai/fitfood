import type { Dish, Ingredient } from '../../types';
import type { Recipe } from '../recipes';
import type { PlannedDay, ShoppingItem } from './menuTypes';

export interface ShoppingListResult {
  items: ShoppingItem[];
  seasonings: string[];
}

export function shoppingList(
  days: PlannedDay[],
  dishes: Dish[],
  ingredients: Ingredient[],
  recipes: Record<string, Recipe>,
  lang: 'zh-Hant' | 'en' = 'zh-Hant',
  translatedRecipes: Record<string, Recipe> = {},
  missingAmount = '依食譜',
): ShoppingListResult {
  const result = new Map<string, ShoppingItem>();
  const seasonings = new Set<string>();
  for (const planned of days.flatMap((day) => day.meals)) {
    const dish = dishes.find((item) => item.id === planned.dishId);
    const recipe = recipes[planned.dishId];
    if (!dish) continue;
    const displayedRecipe = lang === 'en' ? translatedRecipes[planned.dishId] : recipe;
    (displayedRecipe?.seasonings ?? recipe?.seasonings ?? []).forEach((item) => seasonings.add(item.name));
    dish.ingredientIds.forEach((ingredientId) => {
      const ingredient = ingredients.find((item) => item.id === ingredientId);
      if (!ingredient || ingredient.inStock) return;
      const sourceIndex = recipe?.ingredients.findIndex((item) => item.name === ingredient.name) ?? -1;
      const recipeItem = sourceIndex >= 0
        ? (lang === 'en' ? translatedRecipes[planned.dishId]?.ingredients[sourceIndex] : recipe?.ingredients[sourceIndex])
        : undefined;
      const current = result.get(ingredient.id) ?? { id: ingredient.id, name: ingredient.name, category: ingredient.category, needs: [] };
      current.needs.push({ dishId: dish.id, amount: recipeItem?.amount ?? missingAmount });
      result.set(ingredient.id, current);
    });
  }
  return { items: [...result.values()], seasonings: [...seasonings] };
}

export function reconcileChecked(checked: string[], items: ShoppingItem[]): string[] {
  const active = new Set(items.map((item) => item.id));
  return checked.filter((id) => active.has(id));
}

export function markIngredientsInStock(ingredients: Ingredient[], checked: string[]): Ingredient[] {
  const ids = new Set(checked);
  return ingredients.map((ingredient) => ids.has(ingredient.id) ? { ...ingredient, inStock: true } : ingredient);
}
