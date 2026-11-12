import { useEffect, useState } from 'react';
import { Trash2, UtensilsCrossed } from 'lucide-react';
import type { AppData, MealEntry } from '../types';
import { Card } from '../ui/Card';
import { useLang } from '../i18n/LanguageContext';
import { getLocalDateKey, getTodayNutrition } from '../stats';

export interface MealNotice {
  messageKey: string;
  undo: () => void;
}

interface TodayMealsProps {
  data: AppData;
  setData: (next: AppData | ((previous: AppData) => AppData)) => void;
  onNotice: (notice: MealNotice) => void;
}

function MealImage({ dishId, name }: { dishId: string; name: string }) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-food/10">
        <UtensilsCrossed size={20} className="text-food" aria-hidden="true" />
      </div>
    );
  }

  return (
    <img
      src={`/dishes/${dishId}.jpg`}
      alt={name}
      className="h-10 w-10 shrink-0 rounded-[12px] object-cover"
      onError={() => setHasError(true)}
    />
  );
}

export function TodayMeals({ data, setData, onNotice }: TodayMealsProps) {
  const { t, tDish, formatDate } = useLang();
  const [today, setToday] = useState(() => new Date());

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    const scheduleNextDay = () => {
      const now = new Date();
      const midnight = new Date(now);
      midnight.setHours(24, 0, 0, 0);
      timer = setTimeout(updateToday, midnight.getTime() - now.getTime() + 100);
    };

    const updateToday = () => {
      clearTimeout(timer);
      setToday(new Date());
      scheduleNextDay();
    };

    scheduleNextDay();
    window.addEventListener('focus', updateToday);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('focus', updateToday);
    };
  }, []);

  const todayKey = getLocalDateKey(today);
  const entries = data.mealLog[todayKey] ?? [];
  const nutrition = getTodayNutrition(data, today);

  const removeMeal = (entry: MealEntry, index: number) => {
    const dateKey = todayKey;
    const beforeIds = entries.slice(0, index).map((meal) => meal.id);
    const afterIds = entries.slice(index + 1).map((meal) => meal.id);

    setData((previous) => {
      const meals = previous.mealLog[dateKey] ?? [];
      if (!meals.some((meal) => meal.id === entry.id)) return previous;

      const remaining = meals.filter((meal) => meal.id !== entry.id);
      const mealLog = { ...previous.mealLog };
      if (remaining.length > 0) mealLog[dateKey] = remaining;
      else delete mealLog[dateKey];
      return { ...previous, mealLog };
    });

    onNotice({
      messageKey: 'food.meals.deleted',
      undo: () => {
        setData((previous) => {
          const meals = previous.mealLog[dateKey] ?? [];
          if (meals.some((meal) => meal.id === entry.id)) return previous;

          // Surviving neighbors preserve the original order after other edits.
          const nextIndex = meals.findIndex((meal) => afterIds.includes(meal.id));
          let previousIndex = -1;
          for (let position = meals.length - 1; position >= 0; position -= 1) {
            if (beforeIds.includes(meals[position].id)) {
              previousIndex = position;
              break;
            }
          }
          const insertAt = nextIndex >= 0
            ? nextIndex
            : previousIndex >= 0
              ? previousIndex + 1
              : Math.min(index, meals.length);
          const restored = [...meals];
          restored.splice(insertAt, 0, entry);

          return {
            ...previous,
            mealLog: { ...previous.mealLog, [dateKey]: restored },
          };
        });
      },
    });
  };

  return (
    <Card className="shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-[16px] font-bold text-text">{t('food.meals.title')}</h2>
        {entries.length > 0 && (
          <p className="ml-auto max-w-full text-right text-xs text-muted tabular-nums">
            {t('food.meals.total', { kcal: nutrition.kcal, g: nutrition.proteinG })}
          </p>
        )}
      </div>

      {entries.length === 0 ? (
        <p className="mt-3 text-sm leading-6 text-muted">{t('food.meals.empty')}</p>
      ) : (
        <ul className="mt-3 divide-y divide-line">
          {entries.map((entry, index) => {
            const dish = data.dishes.find((item) => item.id === entry.dishId);
            const name = tDish(dish ?? {
              id: entry.dishId,
              name: t('food.meals.deletedDish'),
            });
            const recordedAt = new Date(entry.at);
            const validTime = Number.isFinite(recordedAt.getTime());

            return (
              <li key={entry.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                <MealImage dishId={entry.dishId} name={name} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-text">{name}</p>
                  <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted tabular-nums">
                    <time dateTime={validTime ? recordedAt.toISOString() : undefined}>
                      {validTime
                        ? formatDate(recordedAt, { hour: '2-digit', minute: '2-digit' })
                        : t('food.meals.timeUnknown')}
                    </time>
                    <span>{t('food.meals.kcal', { kcal: entry.kcal })}</span>
                  </div>
                </div>
                <button
                  type="button"
                  aria-label={t('food.meals.remove', { name })}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] text-muted transition-transform active:scale-[0.97]"
                  onClick={() => removeMeal(entry, index)}
                >
                  <Trash2 size={18} aria-hidden="true" />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
