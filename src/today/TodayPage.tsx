import { useEffect, useState } from 'react';
import { Check, Flame, Plus, UtensilsCrossed } from 'lucide-react';
import type { AppData, Meal } from '../types';
import { Card } from '../ui/Card';
import { useLang } from '../i18n/LanguageContext';
import { getDailyTargets, getLocalDateKey, getStreak, getTodayNutrition } from '../stats';
import { useTodayText } from './useTodayText';
import { useMenuStore } from '../food/menu/menuStore';

interface TodayPageProps {
  data: AppData;
  setData: (next: AppData | ((previous: AppData) => AppData)) => void;
  onOpenFood: () => void;
}

function useTodayDate() {
  const [today, setToday] = useState(() => new Date());

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const update = () => {
      window.clearTimeout(timer);
      setToday(new Date());
      const now = new Date();
      const midnight = new Date(now);
      midnight.setHours(24, 0, 0, 0);
      timer = window.setTimeout(update, midnight.getTime() - now.getTime() + 100);
    };
    update();
    window.addEventListener('focus', update);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('focus', update);
    };
  }, []);

  return today;
}

function CalorieRing({ eaten, target, label, remainingLabel, overLabel }: { eaten: number; target: number; label: string; remainingLabel: string; overLabel: string }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const ratio = Math.min(eaten / target, 1);
  const isOver = eaten > target;
  const remaining = Math.abs(target - eaten);

  return (
    <div className="relative flex h-[148px] w-[148px] items-center justify-center">
      <svg viewBox="0 0 128 128" className="h-full w-full -rotate-90" role="img" aria-label={label}>
        <circle cx="64" cy="64" r={radius} fill="none" stroke="currentColor" strokeWidth="10" className="text-surface-2" />
        <circle cx="64" cy="64" r={radius} fill="none" stroke="currentColor" strokeWidth="10" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={circumference * (1 - ratio)} className={`transition-[stroke-dashoffset] duration-500 ${isOver ? 'text-tomato-ink' : 'text-food'}`} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center tabular-nums">
        <span className="text-[26px] font-extrabold leading-7 text-text">{remaining}</span>
        <span className={`text-[11px] font-semibold ${isOver ? 'text-tomato-ink' : 'text-muted'}`}>{isOver ? overLabel : remainingLabel}</span>
        <span className="mt-1 text-[10px] text-muted">kcal</span>
      </div>
    </div>
  );
}

function MealImage({ dishId, name, planned = false }: { dishId: string | undefined; name: string; planned?: boolean }) {
  const [failed, setFailed] = useState(false);
  if (!dishId) return <Plus size={24} aria-hidden="true" />;
  if (failed) return <UtensilsCrossed size={21} aria-hidden="true" className="text-food" />;
  return <img src={`/dishes/${dishId}.jpg`} alt={name} className={`h-12 w-12 rounded-[14px] object-cover ${planned ? 'opacity-50' : ''}`} onError={() => setFailed(true)} />;
}

const mealOrder: Meal[] = ['breakfast', 'lunch', 'dinner'];

function currentMondayKey(date: Date) {
  const monday = new Date(date);
  monday.setHours(12, 0, 0, 0);
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
  return getLocalDateKey(monday);
}

export function TodayPage({ data, setData, onOpenFood }: TodayPageProps) {
  const today = useTodayDate();
  const { formatDate, t, tCardio, tDish } = useLang();
  const tt = useTodayText();
  const { menu } = useMenuStore();
  const todayKey = getLocalDateKey(today);
  const nutrition = getTodayNutrition(data, today);
  const targets = data.profile ? getDailyTargets(data.profile) : null;
  const schedule = data.weeklyPlan.find((day) => day.weekday === today.getDay());
  const cardio = data.cardioPlans.find((plan) => plan.id === schedule?.cardioPlanId);
  const strength = data.strengthPlans.find((plan) => plan.focus === schedule?.strengthFocus);
  const cardioName = cardio ? tCardio(cardio).name : null;
  const strengthName = strength ? t('strength.focusPlan', { focus: t(`strength.focus.${strength.focus}`) }) : null;
  const isRestDay = !schedule || (schedule.cardioPlanId === null && schedule.strengthFocus === null);
  const completed = data.weeklyLog[todayKey] === true;
  const streak = getStreak(data, today);
  const hour = today.getHours();
  const greeting = hour < 11 ? tt('today.greeting.morning') : hour < 18 ? tt('today.greeting.afternoon') : tt('today.greeting.evening');
  const entries = data.mealLog[todayKey] ?? [];
  const meals = mealOrder.map((meal) => [...entries].reverse().find((entry) => entry.meal === meal));
  const plannedMeals = menu.weekStart === currentMondayKey(today)
    ? menu.days.find((day) => day.dateKey === todayKey)?.meals ?? []
    : [];
  const recentDays = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - 6 + index);
    return { date, key: getLocalDateKey(date) };
  });

  const toggleCompleted = () => {
    setData((previous) => {
      const weeklyLog = { ...previous.weeklyLog };
      if (weeklyLog[todayKey]) delete weeklyLog[todayKey];
      else weeklyLog[todayKey] = true;
      return { ...previous, weeklyLog };
    });
  };

  return (
    <main className="space-y-3 px-5 pt-[calc(env(safe-area-inset-top)+16px)]">
      <header className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-muted tabular-nums">{formatDate(today)}</p>
          <h1 className="mt-1 text-[28px] font-extrabold leading-8 text-text">{greeting}</h1>
        </div>
        <div className="flex items-center gap-1 rounded-full bg-fit/10 px-3 py-2 text-xs font-bold text-fit tabular-nums">
          <Flame size={16} aria-hidden="true" fill="currentColor" />
          {streak === 0 ? tt('today.streakStart') : tt('today.streak', { count: streak })}
        </div>
      </header>

      <Card className="p-3! shadow-[0_8px_24px_rgba(15,23,42,0.06)]" accent="food">
        {targets ? (
          <div className="flex items-center justify-between gap-3">
            <CalorieRing eaten={nutrition.kcal} target={targets.kcal} label={tt('today.calories')} remainingLabel={tt('today.remaining')} overLabel={tt('today.over')} />
            <div className="min-w-0 flex-1 space-y-3">
              <div>
                <p className="text-sm font-bold text-text">{tt('today.calories')}</p>
                <p className="mt-1 text-xs text-muted tabular-nums">{nutrition.kcal} / {targets.kcal} kcal</p>
              </div>
              <div>
                <div className="mb-1 flex items-center justify-between gap-2 text-xs">
                  <span className="font-semibold text-text">{tt('today.protein')}</span>
                  <span className="text-muted tabular-nums">{nutrition.proteinG} / {targets.proteinG} g</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-surface-2">
                  <div className="h-full rounded-full bg-food transition-[width]" style={{ width: `${Math.min(100, nutrition.proteinG / targets.proteinG * 100)}%` }} />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <button type="button" onClick={onOpenFood} className="flex min-h-[148px] w-full items-center gap-4 rounded-[14px] text-left transition-transform active:scale-[0.97]">
            <div className="flex h-[118px] w-[118px] shrink-0 items-center justify-center rounded-full border-[10px] border-food/20 text-food"><Plus size={30} aria-hidden="true" /></div>
            <div>
              <p className="text-[18px] font-extrabold text-text">{tt('today.goal')}</p>
              <p className="mt-2 text-sm leading-5 text-muted">{tt('today.goalHint')}</p>
            </div>
          </button>
        )}
      </Card>

      <section>
        <h2 className="mb-2 text-[15px] font-extrabold text-text">{tt('today.meals')}</h2>
        <div className="grid grid-cols-3 gap-2">
          {mealOrder.map((meal, index) => {
            const entry = meals[index];
            const planned = entry ? undefined : plannedMeals.find((item) => item.meal === meal);
            const dish = entry ? data.dishes.find((item) => item.id === entry.dishId) : undefined;
            const plannedDish = planned ? data.dishes.find((item) => item.id === planned.dishId) : undefined;
            const name = entry
              ? tDish(dish ?? { id: entry.dishId, name: tt('today.addMeal') })
              : planned
                ? tDish(plannedDish ?? { id: planned.dishId, name: tt('today.addMeal') })
                : tt('today.addMeal');
            return (
              <button key={meal} type="button" onClick={onOpenFood} className="flex min-h-[76px] flex-col items-center justify-center rounded-[16px] border border-line bg-surface px-2 text-center shadow-[0_8px_24px_rgba(15,23,42,0.04)] transition-transform active:scale-[0.97]">
                <span className={`flex h-12 w-12 items-center justify-center rounded-[14px] ${entry || planned ? 'bg-surface-2' : 'bg-food/10 text-food'}`}><MealImage dishId={entry?.dishId ?? planned?.dishId} name={name} planned={Boolean(planned)} /></span>
                <span className="mt-1 w-full truncate text-[11px] font-semibold text-text">{entry ? name : planned ? tt('today.planned') : t(`meal.${meal}`)}</span>
              </button>
            );
          })}
        </div>
      </section>

      <Card className="p-3! shadow-[0_8px_24px_rgba(15,23,42,0.06)]" accent="fit">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-[15px] font-extrabold text-text">{tt('today.training')}</h2>
            {isRestDay ? <p className="mt-1 text-xs text-muted">{tt('today.restHint')}</p> : <div className="mt-1 space-y-0.5 text-xs text-muted">{cardioName && <p className="truncate"><span className="font-semibold text-fit">{tt('today.cardio')} · </span>{cardioName}</p>}{strengthName && <p className="truncate"><span className="font-semibold text-fit">{tt('today.strength')} · </span>{strengthName}</p>}</div>}
          </div>
          {isRestDay ? <span className="shrink-0 rounded-full bg-surface-2 px-3 py-2 text-xs font-bold text-muted">{tt('today.rest')}</span> : (
            // TODO(T4): Open the detailed workout-record flow when it is integrated.
            <button type="button" aria-pressed={completed} onClick={toggleCompleted} className={`flex h-11 shrink-0 items-center gap-1.5 rounded-[14px] px-3 text-xs font-bold text-white transition-transform active:scale-[0.97] ${completed ? 'bg-ok' : 'bg-fit'}`}>
              {completed && <Check size={16} aria-hidden="true" />}{completed ? tt('today.checkedIn') : tt('today.checkIn')}
            </button>
          )}
        </div>
      </Card>

      <section className="pb-2">
        <h2 className="mb-2 text-[15px] font-extrabold text-text">{tt('today.recent')}</h2>
        <div className="flex justify-between rounded-[16px] bg-surface px-3 py-2 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
          {recentDays.map(({ date, key }) => <div key={key} className="flex flex-col items-center gap-1 text-[10px] text-muted"><span>{formatDate(date, { weekday: 'narrow' })}</span><span className={`h-2.5 w-2.5 rounded-full ${data.weeklyLog[key] ? 'bg-fit' : 'bg-surface-2'}`} /></div>)}
        </div>
      </section>
    </main>
  );
}
