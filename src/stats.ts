import type { AppData, Dish } from './types';

export function getLocalDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

// Count completed training days using the current weekly schedule; rest days do not break the streak.
export function getStreak(data: AppData, today: Date): number {
  const trainingWeekdays = new Set(
    Array.from({ length: 7 }, (_, weekday) => weekday).filter((weekday) => {
      const day = data.weeklyPlan.find((entry) => entry.weekday === weekday);
      return day !== undefined && (day.cardioPlanId !== null || day.strengthFocus !== null);
    }),
  );

  if (trainingWeekdays.size === 0 || !Number.isFinite(today.getTime())) {
    return 0;
  }

  const date = new Date(today);
  // Walk local calendar days at noon so DST does not shift the date key.
  date.setHours(12, 0, 0, 0);
  if (data.weeklyLog[getLocalDateKey(date)] !== true) {
    date.setDate(date.getDate() - 1);
  }

  let streak = 0;
  while (true) {
    if (trainingWeekdays.has(date.getDay())) {
      if (data.weeklyLog[getLocalDateKey(date)] !== true) {
        break;
      }
      streak += 1;
    }
    date.setDate(date.getDate() - 1);
  }

  return streak;
}

export function getTodayNutrition(
  data: AppData,
  today: Date,
): { kcal: number; proteinG: number; meals: number } {
  const entries = data.mealLog[getLocalDateKey(today)] ?? [];

  return entries.reduce(
    (total, entry) => {
      return {
        kcal: total.kcal + entry.kcal,
        proteinG: total.proteinG + entry.proteinG,
        meals: total.meals + 1,
      };
    },
    { kcal: 0, proteinG: 0, meals: 0 },
  );
}

export function getAvailableDishes(data: AppData): Dish[] {
  return data.dishes.filter(
    (dish) =>
      dish.ingredientIds.length > 0 &&
      dish.ingredientIds.every((ingredientId) =>
        data.ingredients.some(
          (ingredient) =>
            ingredient.id === ingredientId && ingredient.inStock,
        ),
      ),
  );
}
