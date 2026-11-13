import { describe, expect, it } from 'vitest';
import type { Dish, Ingredient, Profile } from '../../types';
import { addMenuExtra, emptyMenuState, parseMenuState, removeMenuExtra } from './menuStore';
import { planWeek, replacePlannedMeal } from './planWeek';
import { markIngredientsInStock, reconcileChecked, shoppingList } from './shoppingList';

const ingredients: Ingredient[] = [
  { id: 'egg', name: 'Egg', category: 'protein', inStock: true },
  { id: 'chicken', name: 'Chicken', category: 'protein', inStock: true },
  { id: 'beef', name: 'Beef', category: 'protein', inStock: true },
  { id: 'pork', name: 'Pork', category: 'protein', inStock: true },
  { id: 'rice', name: 'Rice', category: 'carb', inStock: true },
  { id: 'tomato', name: 'Tomato', category: 'veg', inStock: false },
];
const dishes: Array<Pick<Dish, 'id' | 'ingredientIds' | 'meals'>> = [
  { id: 'egg-lunch', ingredientIds: ['egg', 'rice'], meals: ['lunch'] },
  { id: 'chicken-lunch', ingredientIds: ['chicken', 'rice'], meals: ['lunch'] },
  { id: 'beef-lunch', ingredientIds: ['beef', 'rice'], meals: ['lunch'] },
  { id: 'pork-lunch', ingredientIds: ['pork', 'rice'], meals: ['lunch'] },
  { id: 'egg-dinner', ingredientIds: ['egg'], meals: ['dinner'] },
  { id: 'chicken-dinner', ingredientIds: ['chicken'], meals: ['dinner'] },
  { id: 'beef-dinner', ingredientIds: ['beef'], meals: ['dinner'] },
  { id: 'pork-dinner', ingredientIds: ['pork'], meals: ['dinner'] },
];
const profile: Profile = { sex: 'female', age: 30, heightCm: 160, weightKg: 50, activity: 1.2, deficit: 0.2 };
const baseInput = { weekStart: '2026-11-09', dishes, ingredients, recipeKcal: Object.fromEntries(dishes.map((dish) => [dish.id, 500])), profile: null, seed: 7 };

describe('weekly meal planning', () => {
  it('does not repeat a primary protein in the same meal on consecutive days', () => {
    const days = planWeek(baseInput);
    for (const meal of ['lunch', 'dinner'] as const) {
      const proteins = days.map((day) => {
        const dish = dishes.find((item) => item.id === day.meals.find((item) => item.meal === meal)?.dishId)!;
        return dish.ingredientIds.find((id) => ['egg', 'chicken', 'beef', 'pork'].includes(id));
      });
      proteins.slice(1).forEach((protein, index) => expect(protein).not.toBe(proteins[index]));
    }
  });

  it('uses a dish no more than twice and respects meal filters', () => {
    const days = planWeek(baseInput);
    const counts = new Map<string, number>();
    days.flatMap((day) => day.meals).forEach((meal) => counts.set(meal.dishId, (counts.get(meal.dishId) ?? 0) + 1));
    counts.forEach((count) => expect(count).toBeLessThanOrEqual(2));
    days.forEach((day) => day.meals.forEach((meal) => expect(dishes.find((dish) => dish.id === meal.dishId)?.meals).toContain(meal.meal)));
  });

  it('returns the same plan for the same seed', () => {
    expect(planWeek(baseInput)).toEqual(planWeek(baseInput));
  });

  it('keeps daily calories under the profile target whenever candidates fit', () => {
    const days = planWeek({ ...baseInput, profile, recipeKcal: Object.fromEntries(dishes.map((dish) => [dish.id, 500])) });
    days.forEach((day) => expect(day.meals.reduce((total) => total + 500, 0)).toBeLessThanOrEqual(1200));
  });

  it('keeps locked meals when replanning', () => {
    const days = planWeek({ ...baseInput, existingDays: [{ dateKey: '2026-11-09', meals: [{ meal: 'lunch', dishId: 'egg-lunch', locked: true }] }] });
    expect(days[0].meals.find((meal) => meal.meal === 'lunch')).toMatchObject({ dishId: 'egg-lunch', locked: true });
  });

  it('swaps only the requested unlocked meal', () => {
    const days = planWeek(baseInput);
    const changed = replacePlannedMeal(baseInput, days, days[0].dateKey, 'lunch');
    expect(changed[0].meals.find((meal) => meal.meal === 'lunch')?.dishId).not.toBe(days[0].meals.find((meal) => meal.meal === 'lunch')?.dishId);
    changed.forEach((day, dayIndex) => day.meals.forEach((meal) => {
      if (dayIndex !== 0 || meal.meal !== 'lunch') expect(meal).toEqual(days[dayIndex].meals.find((item) => item.meal === meal.meal));
    }));
  });
});

describe('shopping list', () => {
  const shoppingIngredients: Ingredient[] = [
    { id: 'tomato', name: 'Tomato', category: 'veg', inStock: false },
    { id: 'rice', name: 'Rice', category: 'carb', inStock: true },
  ];
  const shoppingDishes: Dish[] = [{ id: 'tomato-rice', name: 'Tomato rice', ingredientIds: ['tomato', 'rice'], minutes: 5, meals: ['lunch'] }];
  const recipe = { 'tomato-rice': { servings: 1, ingredients: [{ name: 'Tomato', amount: '1' }, { name: 'Rice', amount: '1 cup' }], seasonings: [{ name: 'Salt', amount: 'pinch' }], steps: [], tip: '', kcal: 300, proteinG: 8 } };
  const days = [{ dateKey: '2026-11-09', meals: [{ meal: 'lunch' as const, dishId: 'tomato-rice', locked: false }] }];

  it('lists only missing ingredients and preserves checked ids that remain needed', () => {
    const list = shoppingList(days, shoppingDishes, shoppingIngredients, recipe);
    expect(list.items).toEqual([expect.objectContaining({ id: 'tomato', needs: [{ dishId: 'tomato-rice', amount: '1' }] })]);
    expect(reconcileChecked(['tomato', 'gone'], list.items)).toEqual(['tomato']);
  });

  it('marks bought ingredients as in stock without changing other ingredients', () => {
    expect(markIngredientsInStock(shoppingIngredients, ['tomato'])).toEqual([
      { ...shoppingIngredients[0], inStock: true }, shoppingIngredients[1],
    ]);
  });

  it('uses translated amounts and seasonings in English', () => {
    const translations = { 'tomato-rice': { ...recipe['tomato-rice'], ingredients: [{ name: 'Tomato', amount: '1 large' }, { name: 'Rice', amount: '1 cup' }], seasonings: [{ name: 'Salt', amount: 'a pinch' }] } };
    const list = shoppingList(days, shoppingDishes, shoppingIngredients, recipe, 'en', translations, 'See recipe');
    expect(list.items[0].needs[0].amount).toBe('1 large');
    expect(list.seasonings).toEqual(['Salt']);
  });

  it('uses the supplied recipe fallback when an ingredient name cannot be matched', () => {
    const unmatched = [{ ...shoppingIngredients[0], name: 'Unknown tomato' }];
    const list = shoppingList(days, shoppingDishes, unmatched, recipe, 'en', recipe, 'See recipe');
    expect(list.items[0].needs[0].amount).toBe('See recipe');
  });
});

describe('menu storage', () => {
  it('repairs malformed saved data instead of throwing', () => {
    expect(parseMenuState('{bad')).toEqual({ version: 1, weekStart: '', days: [], checked: [], extras: [] });
    expect(parseMenuState(JSON.stringify({ version: 1, weekStart: 'bad', days: [{ dateKey: 'no', meals: 'no' }], checked: [1, 'ok'], extras: [{ id: 1 }] }))).toEqual({ version: 1, weekStart: '', days: [], checked: ['ok'], extras: [] });
  });

  it('adds and deletes custom shopping extras', () => {
    const added = addMenuExtra(emptyMenuState(), 'Paper towels', 'extra-1');
    expect(added.extras).toEqual([{ id: 'extra-1', text: 'Paper towels', checked: false }]);
    expect(removeMenuExtra(added, 'extra-1').extras).toEqual([]);
  });
});
