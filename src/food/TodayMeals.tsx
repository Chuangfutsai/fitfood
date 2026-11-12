import { useEffect, useId, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, ChevronDown, Trash2, UtensilsCrossed } from 'lucide-react';
import type { AppData, MealEntry } from '../types';
import { Card } from '../ui/Card';
import { useLang } from '../i18n/LanguageContext';
import { getCalorieStatus, getDailyTargets, getLocalDateKey, getTodayNutrition } from '../stats';

export interface MealNotice {
  messageKey: string;
  undo: () => void;
}

interface TodayMealsProps {
  data: AppData;
  setData: (next: AppData | ((previous: AppData) => AppData)) => void;
  onNotice: (notice: MealNotice) => void;
  onOpenGoals: () => void;
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

export function TodayMeals({ data, setData, onNotice, onOpenGoals }: TodayMealsProps) {
  const { t, tDish, formatDate } = useLang();
  const [today, setToday] = useState(() => new Date());
  const [expanded, setExpanded] = useState(false);
  const listId = useId();

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
  const hasEntries = entries.length > 0;
  const isExpanded = expanded && hasEntries;
  const targets = data.profile ? getDailyTargets(data.profile) : null;
  const calorieStatus = targets ? getCalorieStatus(nutrition.kcal, targets.kcal) : 'food';
  const calorieColor = { food: 'bg-food', fit: 'bg-fit', tomato: 'bg-tomato' }[calorieStatus];
  const calorieText = { food: 'text-food', fit: 'text-fit', tomato: 'text-tomato-ink' }[calorieStatus];

  useEffect(() => {
    setExpanded(false);
  }, [todayKey, hasEntries]);

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
    <Card className="overflow-hidden p-0! shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
      <button
        type="button"
        aria-expanded={isExpanded}
        aria-controls={listId}
        disabled={!hasEntries}
        className="flex h-9 w-full items-center gap-2 px-3 text-left text-xs leading-4 transition-transform enabled:active:scale-[0.97]"
        onClick={() => setExpanded((previous) => !previous)}
      >
        <span className="shrink-0 font-bold text-text">{t('food.meals.title')}</span>
        <span className="min-w-0 flex-1 truncate text-right text-muted tabular-nums">
          {hasEntries
            ? targets
              ? calorieStatus === 'tomato'
                ? `${t(entries.length === 1 ? 'food.meals.countOne' : 'food.meals.count', { count: entries.length })} · ${t('goals.over', { count: nutrition.kcal - targets.kcal })}`
                : t(entries.length === 1 ? 'food.meals.countOne' : 'food.meals.count', { count: entries.length })
              : t(entries.length === 1 ? 'food.meals.summaryOne' : 'food.meals.summary', { n: entries.length, kcal: nutrition.kcal, g: nutrition.proteinG })
            : t('food.meals.notRecorded')}
        </span>
        <ChevronDown
          size={14}
          aria-hidden="true"
          className={`shrink-0 text-muted transition-transform duration-150 ${isExpanded ? 'rotate-180' : ''} ${hasEntries ? '' : 'opacity-40'}`}
        />
      </button>
      {targets ? (
        <div className="space-y-1 px-3 pb-2 text-[10px] leading-3 tabular-nums">
          <div className="flex items-center gap-2">
            <span className={`w-[48%] shrink-0 truncate ${calorieText}`}>
              {t('goals.caloriesProgress', { eaten: nutrition.kcal, target: targets.kcal })}
            </span>
            <div
              role="progressbar"
              aria-label={t('goals.calories')}
              aria-valuemin={0}
              aria-valuemax={targets.kcal}
              aria-valuenow={Math.min(nutrition.kcal, targets.kcal)}
              aria-valuetext={t('goals.caloriesProgress', { eaten: nutrition.kcal, target: targets.kcal })}
              className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-surface-2"
            >
              <div className={`h-full rounded-full transition-[width] ${calorieColor}`} style={{ width: `${Math.min(100, nutrition.kcal / targets.kcal * 100)}%` }} />
            </div>
          </div>
          <div className="flex items-center gap-2 text-muted">
            <span className="flex w-[48%] shrink-0 items-center gap-1">
              <span className="truncate">{t('goals.proteinProgress', { eaten: nutrition.proteinG, target: targets.proteinG })}</span>
              {nutrition.proteinG >= targets.proteinG && <Check size={12} className="shrink-0 text-ok" aria-label={t('goals.proteinMet')} />}
            </span>
            <div
              role="progressbar"
              aria-label={t('goals.proteinProgress', { eaten: nutrition.proteinG, target: targets.proteinG })}
              aria-valuemin={0}
              aria-valuemax={targets.proteinG}
              aria-valuenow={Math.min(nutrition.proteinG, targets.proteinG)}
              className="h-1 min-w-0 flex-1 overflow-hidden rounded-full bg-surface-2"
            >
              <div className="h-full rounded-full bg-food transition-[width]" style={{ width: `${Math.min(100, nutrition.proteinG / targets.proteinG * 100)}%` }} />
            </div>
          </div>
        </div>
      ) : (
        <button type="button" onClick={onOpenGoals} className="block h-10 w-full truncate px-3 pb-2 text-left text-xs font-medium text-food">
          {t('goals.invitation')}
        </button>
      )}

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            id={listId}
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="overflow-hidden"
          >
        <ul className="divide-y divide-line px-3 pb-3">
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
                    <span className="rounded-full bg-food/10 px-2 text-food">{t(`meal.${entry.meal}`)}</span>
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
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
