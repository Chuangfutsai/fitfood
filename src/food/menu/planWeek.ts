import { getDailyTargets } from '../../stats';
import type { Ingredient, Meal } from '../../types';
import type { PlanWeekInput, PlannedDay, PlannedMeal } from './menuTypes';

const dayMs = 24 * 60 * 60 * 1000;

function seededRandom(seed: number) {
  let value = seed >>> 0;
  return () => {
    value += 0x6D2B79F5;
    let next = value;
    next = Math.imul(next ^ (next >>> 15), next | 1);
    next ^= next + Math.imul(next ^ (next >>> 7), next | 61);
    return ((next ^ (next >>> 14)) >>> 0) / 4294967296;
  };
}

export function weekDateKeys(weekStart: string): string[] {
  const start = new Date(`${weekStart}T12:00:00`);
  if (Number.isNaN(start.getTime())) return [];
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(start.getTime() + index * dayMs);
    return `${date.getFullYear()}-${
      String(date.getMonth() + 1).padStart(2, '0')
    }-${String(date.getDate()).padStart(2, '0')}`;
  });
}

function primaryProteins(ingredientIds: string[], ingredients: Ingredient[]) {
  const proteinIds = new Set(
    ingredients
      .filter((ingredient) => ingredient.category === 'protein')
      .map((ingredient) => ingredient.id)
  );
  return ingredientIds.filter((id) => proteinIds.has(id));
}

function dishIsAvailable(ingredientIds: string[], ingredients: Ingredient[]) {
  return ingredientIds.length > 0
    && ingredientIds.every((id) => ingredients.some(
      (ingredient) => ingredient.id === id && ingredient.inStock
    ));
}

function chooseDish(
  meal: Meal,
  previousProteinIds: Set<string>,
  dishCounts: Map<string, number>,
  usedKcal: number,
  input: PlanWeekInput,
  random: () => number,
  excludedDishId?: string,
) {
  const target = input.profile ? getDailyTargets(input.profile).kcal : undefined;
  const candidates = input.dishes.filter((dish) =>
    dish.meals.includes(meal)
    && dishIsAvailable(dish.ingredientIds, input.ingredients)
    && (dishCounts.get(dish.id) ?? 0) < 2
    && dish.id !== excludedDishId
    && !primaryProteins(dish.ingredientIds, input.ingredients).some((id) => previousProteinIds.has(id)),
  );
  if (candidates.length === 0) return undefined;

  const underTarget = target === undefined
    ? candidates
    : candidates.filter((dish) => usedKcal + (input.recipeKcal[dish.id] ?? 0) <= target);
  const pool = underTarget.length > 0 ? underTarget : candidates;
  const sorted = [...pool].sort((a, b) => {
    const aGap = target === undefined ? 0 : Math.abs(target - usedKcal - (input.recipeKcal[a.id] ?? 0));
    const bGap = target === undefined ? 0 : Math.abs(target - usedKcal - (input.recipeKcal[b.id] ?? 0));
    return aGap - bGap || a.id.localeCompare(b.id);
  });
  const bestGap = target === undefined ? 0 : Math.abs(target - usedKcal - (input.recipeKcal[sorted[0].id] ?? 0));
  const similarlyGood = sorted.filter((dish) => target === undefined
    || Math.abs(target - usedKcal - (input.recipeKcal[dish.id] ?? 0)) === bestGap);
  return similarlyGood[Math.floor(random() * similarlyGood.length)] ?? sorted[0];
}

/** Pure, deterministic weekly planner. Locked meals from existingDays are never replaced. */
export function planWeek(input: PlanWeekInput): PlannedDay[] {
  const random = seededRandom(input.seed ?? 1);
  const mealOrder: Meal[] = input.includeBreakfast ? ['breakfast', 'lunch', 'dinner'] : ['lunch', 'dinner'];
  const existing = new Map((input.existingDays ?? []).map((day) => [day.dateKey, day]));
  const counts = new Map<string, number>();
  const result: PlannedDay[] = [];
  const priorByMeal = new Map<Meal, Set<string>>();

  for (const dateKey of weekDateKeys(input.weekStart)) {
    const previous = existing.get(dateKey);
    const dayMeals: PlannedMeal[] = [];
    let dayKcal = 0;
    for (const meal of mealOrder) {
      const locked = previous?.meals.find((item) => item.meal === meal && item.locked);
      if (locked && input.dishes.some((dish) => dish.id === locked.dishId)) {
        dayMeals.push({ ...locked });
        counts.set(locked.dishId, (counts.get(locked.dishId) ?? 0) + 1);
        const dish = input.dishes.find((item) => item.id === locked.dishId)!;
        priorByMeal.set(meal, new Set(primaryProteins(dish.ingredientIds, input.ingredients)));
        dayKcal += input.recipeKcal[dish.id] ?? 0;
        continue;
      }
      const dish = chooseDish(meal, priorByMeal.get(meal) ?? new Set(), counts, dayKcal, input, random);
      if (!dish) continue;
      const kcal = input.recipeKcal[dish.id] ?? 0;
      const overTarget = input.profile !== null && dayKcal + kcal > getDailyTargets(input.profile).kcal;
      dayMeals.push({ meal, dishId: dish.id, locked: false, ...(overTarget ? { overTarget: true } : {}) });
      counts.set(dish.id, (counts.get(dish.id) ?? 0) + 1);
      priorByMeal.set(meal, new Set(primaryProteins(dish.ingredientIds, input.ingredients)));
      dayKcal += kcal;
    }
    result.push({
      dateKey,
      meals: dayMeals,
      ...(input.profile && dayKcal > getDailyTargets(input.profile).kcal
        ? { overTarget: true }
        : {})
    });
  }
  return result;
}

/** Replaces one unlocked (or explicitly requested) slot without changing any other slot. */
export function replacePlannedMeal(
  input: PlanWeekInput,
  days: PlannedDay[],
  dateKey: string,
  meal: Meal
): PlannedDay[] {
  const dayIndex = days.findIndex((day) => day.dateKey === dateKey);
  if (dayIndex < 0) return days;
  const current = days[dayIndex].meals.find((item) => item.meal === meal);
  if (!current || current.locked) return days;
  const counts = new Map<string, number>();
  days.flatMap((day) => day.meals)
    .filter((item) => item !== current)
    .forEach((item) => counts.set(item.dishId, (counts.get(item.dishId) ?? 0) + 1));
  const dayKcal = days[dayIndex].meals
    .filter((item) => item.meal !== meal)
    .reduce((sum, item) => sum + (input.recipeKcal[item.dishId] ?? 0), 0);
  const previousDay = days[dayIndex - 1];
  const previousDish = previousDay?.meals.find((item) => item.meal === meal)?.dishId;
  const nextDay = days[dayIndex + 1];
  const nextDish = nextDay?.meals.find((item) => item.meal === meal)?.dishId;
  const previousProteinIds = new Set(previousDish
    ? primaryProteins(input.dishes.find((dish) => dish.id === previousDish)?.ingredientIds ?? [], input.ingredients)
    : []);
  if (nextDish) primaryProteins(
    input.dishes.find((dish) => dish.id === nextDish)?.ingredientIds ?? [],
    input.ingredients
  ).forEach((id) => previousProteinIds.add(id));
  const alternateDish = chooseDish(
    meal,
    previousProteinIds,
    counts,
    dayKcal,
    input,
    seededRandom((input.seed ?? 1) + 101),
    current.dishId
  );
  if (!alternateDish) return days;
  const kcal = input.recipeKcal[alternateDish.id] ?? 0;
  const overTarget = input.profile !== null && dayKcal + kcal > getDailyTargets(input.profile).kcal;
  const alternate: PlannedMeal = {
    meal,
    dishId: alternateDish.id,
    locked: false,
    ...(overTarget ? { overTarget: true } : {})
  };
  return days.map((day) => {
    if (day.dateKey !== dateKey) return day;
    const meals = day.meals.map((item) => item.meal === meal ? { ...alternate, locked: false } : item);
    const total = meals.reduce((sum, item) => sum + (input.recipeKcal[item.dishId] ?? 0), 0);
    const dayOverTarget = input.profile !== null && total > getDailyTargets(input.profile).kcal;
    return { ...day, meals, ...(dayOverTarget ? { overTarget: true } : { overTarget: undefined }) };
  });
}
