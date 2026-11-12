import type { AppData, Dish, Meal, Profile } from './types';

export function getLocalDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export function getMealForTime(date: Date): Meal {
  const minutes = date.getHours() * 60 + date.getMinutes();
  if (minutes < 10 * 60 + 30) return 'breakfast';
  if (minutes < 16 * 60) return 'lunch';
  return 'dinner';
}

export function getBMR(profile: Profile): number {
  return 10 * profile.weightKg + 6.25 * profile.heightCm - 5 * profile.age
    + (profile.sex === 'male' ? 5 : -161);
}

export function getDailyTargets(profile: Profile): { bmr: number; kcal: number; proteinG: number } {
  const bmr = getBMR(profile);
  const minimumKcal = profile.sex === 'male' ? 1500 : 1200;

  return {
    bmr,
    kcal: Math.max(minimumKcal, Math.round(bmr * profile.activity * (1 - profile.deficit))),
    proteinG: Math.round(1.6 * profile.weightKg),
  };
}

export function getCalorieStatus(consumed: number, target: number): 'food' | 'fit' | 'tomato' {
  if (consumed > target) return 'tomato';
  if (consumed >= target * 0.9) return 'fit';
  return 'food';
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
