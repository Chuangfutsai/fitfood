import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  BookOpen,
  Carrot,
  Check,
  Clock,
  Egg,
  Lightbulb,
  Salad,
  Search,
  Shuffle,
  Target,
  TvMinimal,
  UtensilsCrossed,
  CirclePlay,
  ClipboardList,
  LockKeyhole,
  Plus,
  ShoppingCart,
  Trash2,
} from 'lucide-react';
import type { AppData, Meal } from '../types';
import { Card } from '../ui/Card';
import { SegmentedTabs } from '../ui/SegmentedTabs';
import { Sheet } from '../ui/Sheet';
import { DishList } from './DishList';
import { PantryList } from './PantryList';
import { Wheel } from './Wheel';
import { LanguageButton, useLang } from '../i18n/LanguageContext';
import { recipeTranslations } from '../i18n/dataTranslations';
import { recipes } from './recipes';
import { getAvailableDishes, getLocalDateKey, getMealForTime } from '../stats';
import { createMealId } from '../storage';
import { TodayMeals } from './TodayMeals';
import type { MealNotice } from './TodayMeals';
import { GoalSheet } from './GoalSheet';
import { addMenuExtra, removeMenuExtra, useMenuStore } from './menu/menuStore';
import { planWeek, replacePlannedMeal } from './menu/planWeek';
import { markIngredientsInStock, reconcileChecked, shoppingList } from './menu/shoppingList';
import type { PlannedDay } from './menu/menuTypes';
import { useMenuText } from './menu/useMenuText';

interface FoodPageProps {
  data: AppData;
  setData: (next: AppData | ((previous: AppData) => AppData)) => void;
}

interface DishImageProps {
  id: string;
  name: string;
  className: string;
}

const foodTabs = [
  { value: 'wheel', label: 'food.tab.wheel' },
  { value: 'menu', label: 'menu.tab.week' },
  { value: 'pantry', label: 'food.tab.pantry' },
  { value: 'dishes', label: 'food.tab.dishes' },
];

function DishImage({ id, name, className }: DishImageProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div
        className={`flex items-center justify-center bg-food/10 ${className}`}
      >
        <UtensilsCrossed className="text-food" size={32} />
      </div>
    );
  }

  return (
    <img
      src={`/dishes/${id}.jpg`}
      alt={name}
      className={`object-cover ${className}`}
      onError={() => setHasError(true)}
    />
  );
}

function HeroCard({ count, onOpenGoals }: { count: number; onOpenGoals: () => void }) {
  const { lang, t, formatDate } = useLang();
  const [hasError, setHasError] = useState(false);
  const now = new Date();
  const hour = now.getHours();
  const dateLabel = formatDate(now);
  const greeting =
    hour >= 5 && hour < 11
      ? t('greeting.morning')
      : hour >= 11 && hour < 14
        ? t('greeting.noon')
        : hour >= 14 && hour < 18
          ? t('greeting.afternoon')
          : t('greeting.evening');
  const goalButton = (
    <button
      type="button"
      aria-label={t('goals.open')}
      onClick={onOpenGoals}
      className="absolute right-[64px] top-3 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-surface/90 text-food"
    >
      <Target size={20} aria-hidden="true" />
    </button>
  );

  if (hasError) {
    return (
      <section className="relative isolate h-[200px] w-full overflow-hidden rounded-[24px] bg-food/10">
        <LanguageButton accent="food" SheetComponent={Sheet} />
        {goalButton}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <motion.div
            className="absolute -right-10 -top-3 flex h-[140px] w-[140px] items-center justify-center rounded-full bg-tomato"
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 3.6, repeat: Infinity, ease: 'easeInOut', delay: 0 }}
          >
            <Carrot className="text-white" size={32} strokeWidth={2} />
          </motion.div>
          <motion.div
            className="absolute -right-6 top-[100px] flex h-24 w-24 items-center justify-center rounded-full bg-corn"
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
          >
            <Egg className="text-white" size={32} strokeWidth={2} />
          </motion.div>
          <motion.div
            className="absolute right-9 top-[72px] flex h-[72px] w-[72px] items-center justify-center rounded-full bg-lettuce"
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
          >
            <Salad className="text-white" size={32} strokeWidth={2} />
          </motion.div>
        </div>

        <div className="absolute left-5 top-5 z-10 max-w-[calc(100%-128px)]">
          <p className="text-xs leading-4 text-muted tabular-nums">{dateLabel}</p>
          <p className="mt-2 truncate text-sm leading-5 text-text">
            {t('food.hero.greeting', { greeting })}
          </p>
        </div>

        <div className="absolute bottom-5 left-5 z-10 max-w-[60%]">
          <h1 className={`${lang === 'en' ? 'text-[24px]' : 'text-[28px]'} font-extrabold leading-8 text-text`}>
            <span className="block">{t('food.hero.titleFirst')}</span>
            <span className="block">{t('food.hero.titleSecond')}</span>
          </h1>
          <span className="mt-2 inline-block max-w-full truncate rounded-full bg-surface px-3 py-1 text-xs font-bold leading-4 text-food tabular-nums">
            {t('food.hero.available', { count })}
          </span>
        </div>
      </section>
    );
  }

  return (
    <section className="relative h-[200px] overflow-hidden rounded-[24px]">
      <LanguageButton accent="food" SheetComponent={Sheet} />
      {goalButton}
      <img
        src="/dishes/hero.jpg"
        alt={t('food.hero.alt')}
        className="h-full w-full object-cover"
        onError={() => setHasError(true)}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
      <div className="absolute bottom-5 left-5 max-w-[calc(100%-40px)]">
        <p className="text-sm text-white">{t('food.hero.question')}</p>
        <h1 className={`${lang === 'en' ? 'text-[24px]' : 'text-[28px]'} font-extrabold text-white`}>
          {t('food.hero.title')}
        </h1>
      </div>
    </section>
  );
}

function currentMondayKey() {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() - ((date.getDay() + 6) % 7));
  return getLocalDateKey(date);
}

function WeeklyMenu({ data, setData, onOpenDish }: {
  data: AppData;
  setData: FoodPageProps['setData'];
  onOpenDish: (id: string) => void;
}) {
  const { lang, t, tDish, tIngredient, formatDate } = useLang();
  const mt = useMenuText();
  const { menu, setMenu } = useMenuStore();
  const [view, setView] = useState<'menu' | 'shopping'>('menu');
  const [includeBreakfast, setIncludeBreakfast] = useState(false);
  const [extraText, setExtraText] = useState('');
  const [notice, setNotice] = useState<string | null>(null);
  const [undoPurchase, setUndoPurchase] = useState<(() => void) | null>(null);
  const weekStart = menu.weekStart || currentMondayKey();
  const recipeKcal = useMemo(() => Object.fromEntries(Object.entries(recipes).map(([id, recipe]) => [id, recipe.kcal])), []);
  const plannerInput = useMemo(() => ({
    weekStart,
    dishes: data.dishes,
    ingredients: data.ingredients,
    recipeKcal,
    profile: data.profile,
    includeBreakfast,
  }), [weekStart, data.dishes, data.ingredients, recipeKcal, data.profile, includeBreakfast]);
  const list = useMemo(() => shoppingList(
    menu.days,
    data.dishes,
    data.ingredients,
    recipes,
    lang,
    recipeTranslations,
    mt('menu.shopping.seeRecipe'),
  ), [menu.days, data.dishes, data.ingredients, lang, mt]);
  const today = getLocalDateKey(new Date());

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => { setNotice(null); setUndoPurchase(null); }, 5000);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const setDays = (days: PlannedDay[]) => {
    const nextList = shoppingList(days, data.dishes, data.ingredients, recipes, lang, recipeTranslations, mt('menu.shopping.seeRecipe'));
    setMenu((previous) => ({ ...previous, weekStart, days, checked: reconcileChecked(previous.checked, nextList.items) }));
  };
  const createPlan = () => setDays(planWeek({ ...plannerInput, existingDays: menu.days, seed: Date.now() }));
  const toggleLock = (dateKey: string, meal: Meal) => setDays(menu.days.map((day) => day.dateKey === dateKey
    ? { ...day, meals: day.meals.map((item) => item.meal === meal ? { ...item, locked: !item.locked } : item) }
    : day));
  const swapMeal = (dateKey: string, meal: Meal) => setDays(replacePlannedMeal({ ...plannerInput, seed: Date.now() }, menu.days, dateKey, meal));
  const toggleChecked = (id: string) => setMenu((previous) => ({
    ...previous,
    checked: previous.checked.includes(id) ? previous.checked.filter((item) => item !== id) : [...previous.checked, id],
  }));
  const addExtra = () => {
    const text = extraText.trim();
    if (!text) return;
    setMenu((previous) => addMenuExtra(previous, text, `extra-${Date.now()}`));
    setExtraText('');
  };
  const markBought = () => {
    const checked = new Set(menu.checked);
    if (checked.size === 0) return;
    const priorIngredients = data.ingredients;
    const priorChecked = menu.checked;
    setData((previous) => ({ ...previous, ingredients: markIngredientsInStock(previous.ingredients, [...checked]) }));
    setMenu((previous) => ({ ...previous, checked: [] }));
    setNotice(mt('menu.shopping.doneNotice'));
    setUndoPurchase(() => () => {
      setData((previous) => ({ ...previous, ingredients: priorIngredients }));
      setMenu((previous) => ({ ...previous, checked: priorChecked }));
    });
  };
  const copyList = async () => {
    const text = list.items.map((item) => `${tIngredient(item)}${lang === 'en' ? ': ' : '：'}${item.needs.map((need) => `${tDish(data.dishes.find((dish) => dish.id === need.dishId) ?? { id: need.dishId, name: need.dishId })} ${need.amount}`).join(lang === 'en' ? '; ' : '、')}`).join('\n');
    try {
      if (navigator.share) await navigator.share({ title: mt('menu.view.shopping'), text });
      else await navigator.clipboard.writeText(text);
      setNotice(mt('menu.shopping.copied'));
    } catch {
      // A cancelled native share sheet should not interrupt menu planning.
    }
  };

  if (menu.days.length === 0) {
    return (
      <Card className="space-y-4 py-8 text-center shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
        <ClipboardList className="mx-auto text-food" size={40} aria-hidden="true" />
        <div className="space-y-1"><h2 className="text-xl font-bold text-text">{mt('menu.empty.title')}</h2><p className="text-sm leading-6 text-muted">{mt('menu.empty.body')}</p></div>
        <label className="mx-auto flex min-h-11 w-fit items-center gap-2 text-sm text-text"><input type="checkbox" checked={includeBreakfast} onChange={(event) => setIncludeBreakfast(event.target.checked)} />{mt('menu.breakfast')}</label>
        <button type="button" className="mx-auto h-12 rounded-[14px] bg-food px-5 text-sm font-semibold text-white active:scale-[0.97]" onClick={createPlan}>{mt('menu.plan')}</button>
      </Card>
    );
  }

  return (
    <section className="space-y-4">
      <div className="flex gap-2">
        <button type="button" onClick={() => setView('menu')} className={`min-h-11 flex-1 rounded-[14px] text-sm font-semibold ${view === 'menu' ? 'bg-food text-white' : 'bg-surface-2 text-muted'}`}>{mt('menu.view.menu')}</button>
        <button type="button" onClick={() => setView('shopping')} className={`min-h-11 flex-1 rounded-[14px] text-sm font-semibold ${view === 'shopping' ? 'bg-food text-white' : 'bg-surface-2 text-muted'}`}>{mt('menu.view.shopping')}</button>
      </div>
      {view === 'menu' ? <>
        <div className="flex items-center justify-between gap-3">
          <label className="flex min-h-11 items-center gap-2 text-sm text-text"><input type="checkbox" checked={includeBreakfast} onChange={(event) => setIncludeBreakfast(event.target.checked)} />{mt('menu.breakfast')}</label>
          <button type="button" className="min-h-11 rounded-[14px] border border-line px-3 text-sm font-semibold text-food" onClick={createPlan}>{mt('menu.replan')}</button>
        </div>
        <div className="space-y-3">{menu.days.map((day) => {
          const date = new Date(`${day.dateKey}T12:00:00`);
          const kcal = day.meals.reduce((sum, item) => sum + (recipes[item.dishId]?.kcal ?? 0), 0);
          return <Card key={day.dateKey} className={`space-y-3 ${day.dateKey === today ? 'ring-2 ring-food/30' : ''}`}>
            <div className="flex items-center justify-between gap-2"><div><h3 className="font-bold text-text">{mt(`menu.weekday.${(date.getDay() + 6) % 7}`)}</h3><p className="text-xs text-muted">{formatDate(date, { month: 'numeric', day: 'numeric' })}{day.dateKey === today ? ` · ${mt('menu.today')}` : ''}</p></div><div className="text-right text-xs font-semibold text-food">{mt('menu.kcal', { count: kcal })}{day.overTarget && <p className="mt-1 text-tomato">{mt('menu.overTarget')}</p>}</div></div>
            {day.meals.map((planned) => {
              const dish = data.dishes.find((item) => item.id === planned.dishId);
              if (!dish) return null;
              return <div key={planned.meal} className="flex items-center gap-3 border-t border-line pt-3"><DishImage id={dish.id} name={tDish(dish)} className="h-14 w-14 shrink-0 rounded-[12px]" /><button type="button" className="min-w-0 flex-1 text-left" onClick={() => onOpenDish(dish.id)}><p className="text-xs text-muted">{t(`meal.${planned.meal}`)}</p><p className="truncate text-sm font-semibold text-text">{tDish(dish)}</p>{planned.overTarget && <p className="text-xs text-tomato">{mt('menu.overTarget')}</p>}</button><div className="flex shrink-0 gap-1"><button aria-label={planned.locked ? mt('menu.unlock') : mt('menu.lock')} type="button" className={`flex h-10 w-10 items-center justify-center rounded-full ${planned.locked ? 'bg-food/10 text-food' : 'bg-surface-2 text-muted'}`} onClick={() => toggleLock(day.dateKey, planned.meal)}><LockKeyhole size={16} /></button><button type="button" className="min-h-10 rounded-[10px] bg-surface-2 px-2 text-xs font-semibold text-food" onClick={() => swapMeal(day.dateKey, planned.meal)}>{mt('menu.swap')}</button></div></div>;
            })}
          </Card>;
        })}</div>
      </> : <div className="space-y-4">
        <div className="flex gap-2"><button type="button" className="flex min-h-11 flex-1 items-center justify-center gap-1 rounded-[14px] border border-line text-sm font-semibold text-food" onClick={() => void copyList()}><ShoppingCart size={17} />{mt('menu.shopping.copy')}</button><button type="button" disabled={menu.checked.length === 0} className="min-h-11 flex-1 rounded-[14px] bg-food text-sm font-semibold text-white disabled:opacity-40" onClick={markBought}>{mt('menu.shopping.done')}</button></div>
        {(['protein', 'veg', 'carb', 'other'] as const).map((category) => {
          const items = list.items.filter((item) => item.category === category);
          if (items.length === 0) return null;
          return <Card key={category} className="space-y-2"><h3 className="font-bold text-text">{t(`category.${category}`)}</h3>{items.map((item) => <label key={item.id} className="flex min-h-11 items-start gap-3 border-t border-line py-2"><input className="mt-1" type="checkbox" checked={menu.checked.includes(item.id)} onChange={() => toggleChecked(item.id)} /><span className="min-w-0"><span className={`block text-sm font-semibold ${menu.checked.includes(item.id) ? 'text-muted line-through' : 'text-text'}`}>{tIngredient(item)}</span><span className="block text-xs leading-5 text-muted">{mt('menu.shopping.needs')}{item.needs.map((need) => `${tDish(data.dishes.find((dish) => dish.id === need.dishId) ?? { id: need.dishId, name: need.dishId })} ${need.amount}`).join('、')}</span></span></label>)}</Card>;
        })}
        {list.items.length === 0 && <Card className="text-center text-sm text-muted">{mt('menu.shopping.empty')}</Card>}
        <Card className="space-y-2"><h3 className="font-bold text-text">{mt('menu.shopping.confirmed')}</h3>{list.seasonings.length > 0 ? <p className="text-sm leading-6 text-muted">{list.seasonings.join('、')}</p> : <p className="text-sm text-muted">—</p>}</Card>
        <Card className="space-y-3"><h3 className="font-bold text-text">{mt('menu.shopping.extras')}</h3>{menu.extras.map((extra) => <div key={extra.id} className="flex items-center gap-2"><input type="checkbox" checked={extra.checked} onChange={() => setMenu((previous) => ({ ...previous, extras: previous.extras.map((item) => item.id === extra.id ? { ...item, checked: !item.checked } : item) }))} /><span className={`min-w-0 flex-1 text-sm ${extra.checked ? 'text-muted line-through' : 'text-text'}`}>{extra.text}</span><button type="button" aria-label={mt('menu.shopping.delete')} className="flex h-10 w-10 items-center justify-center text-muted" onClick={() => setMenu((previous) => removeMenuExtra(previous, extra.id))}><Trash2 size={17} /></button></div>)}<div className="flex gap-2"><input value={extraText} onChange={(event) => setExtraText(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') addExtra(); }} className="min-w-0 flex-1 rounded-[12px] border border-line bg-surface px-3 text-sm text-text" placeholder={mt('menu.shopping.placeholder')} /><button type="button" aria-label={mt('menu.shopping.add')} onClick={addExtra} className="flex h-11 w-11 items-center justify-center rounded-[12px] bg-food text-white"><Plus size={18} /></button></div></Card>
      </div>}
      {notice && <div role="status" className="fixed inset-x-5 bottom-[calc(env(safe-area-inset-bottom)+80px)] z-[70] mx-auto max-w-[440px] rounded-[14px] border border-line bg-surface px-4 py-3 text-sm font-medium text-text shadow-lg">{notice} {undoPurchase && <button type="button" className="ml-2 text-food" onClick={() => { undoPurchase(); setUndoPurchase(null); setNotice(null); }}>{mt('menu.shopping.undo')}</button>}</div>}
    </section>
  );
}

export function FoodPage({ data, setData }: FoodPageProps) {
  const { lang, t, tDish, tIngredient } = useLang();
  const mt = useMenuText();
  const [activeTab, setActiveTab] = useState('wheel');
  const [meal, setMeal] = useState<Meal>(() => getMealForTime(new Date()));
  const [goalsOpen, setGoalsOpen] = useState(false);
  const [shuffleKey, setShuffleKey] = useState(0);
  const [wheelBusy, setWheelBusy] = useState(false);
  const [resultDishId, setResultDishId] = useState<string | null>(null);
  const [mealNotice, setMealNotice] = useState<MealNotice | null>(null);
  const [acceptedMealId, setAcceptedMealId] = useState<string | null>(null);
  const mealAcceptedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!mealNotice) return;
    const timer = setTimeout(() => setMealNotice(null), 5000);
    return () => clearTimeout(timer);
  }, [mealNotice]);

  useEffect(() => {
    if (activeTab === 'wheel') {
      setShuffleKey((currentKey) => currentKey + 1);
    }
  }, [activeTab]);

  const availableDishes = useMemo(
    () => getAvailableDishes(data).filter((dish) => dish.meals.includes(meal)),
    [data.dishes, data.ingredients, meal],
  );
  const [stockHintBefore, stockHintAfter] = t(
    availableDishes.length === 1 ? 'food.wheel.stockHintOne' : 'food.wheel.stockHint',
    { count: availableDishes.length },
  ).split('{pantry}');

  const wheelDishes = useMemo(() => {
    const shuffled = [...availableDishes].sort(() => Math.random() - 0.5);

    return shuffled.slice(0, 8);
  }, [availableDishes, shuffleKey]);

  const resultDish =
    data.dishes.find((dish) => dish.id === resultDishId) ?? null;

  const openDish = (id: string) => {
    mealAcceptedRef.current = null;
    setAcceptedMealId(null);
    setResultDishId(id);
  };

  const recordMeal = () => {
    if (!resultDish || mealAcceptedRef.current) return;
    const at = Date.now();
    const dateKey = getLocalDateKey(new Date(at));
    const recipe = recipes[resultDish.id];
    const entry = {
      id: createMealId(),
      dishId: resultDish.id,
      at,
      meal,
      kcal: recipe?.kcal ?? 0,
      proteinG: recipe?.proteinG ?? 0,
    };
    // Lock synchronously before React renders so rapid taps record only once.
    mealAcceptedRef.current = entry.id;
    setAcceptedMealId(entry.id);

    setData((previous) => ({
      ...previous,
      mealLog: {
        ...previous.mealLog,
        [dateKey]: [...(previous.mealLog[dateKey] ?? []), entry],
      },
    }));
    setMealNotice({
      messageKey: 'food.mealRecorded',
      undo: () => {
        setData((previous) => {
          const mealLog = { ...previous.mealLog };
          const entries = (mealLog[dateKey] ?? []).filter((meal) => meal.id !== entry.id);
          if (entries.length > 0) mealLog[dateKey] = entries;
          else delete mealLog[dateKey];
          return { ...previous, mealLog };
        });
        if (mealAcceptedRef.current === entry.id) {
          mealAcceptedRef.current = null;
          setAcceptedMealId(null);
        }
      },
    });
  };

  const shuffleWheel = () => {
    setShuffleKey((currentKey) => currentKey + 1);
  };

  return (
    <main className="space-y-5 px-5 pt-[calc(env(safe-area-inset-top)+20px)]">
      <HeroCard count={availableDishes.length} onOpenGoals={() => setGoalsOpen(true)} />

      <SegmentedTabs
        options={foodTabs.map((tab) => ({ ...tab, label: tab.value === 'menu' ? mt(tab.label) : t(tab.label) }))}
        value={activeTab}
        onChange={setActiveTab}
        accent="food"
      />

      {activeTab === 'pantry' && (
        <PantryList data={data} setData={setData} />
      )}

      {activeTab === 'dishes' && <DishList data={data} setData={setData} />}

      {activeTab === 'menu' && <WeeklyMenu data={data} setData={setData} onOpenDish={openDish} />}

      {activeTab === 'wheel' && (
        <section className="space-y-4">
          <div className={wheelBusy ? 'pointer-events-none opacity-60' : undefined} aria-disabled={wheelBusy}>
            <SegmentedTabs
              options={(['breakfast', 'lunch', 'dinner'] as const).map((value) => ({ value, label: t(`meal.${value}`) }))}
              value={meal}
              onChange={(value) => { if (!wheelBusy) setMeal(value as Meal); }}
              accent="food"
            />
          </div>
          <TodayMeals data={data} setData={setData} onNotice={setMealNotice} onOpenGoals={() => setGoalsOpen(true)} />
          <div className="space-y-2">
            {availableDishes.length >= 9 ? (
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs text-muted">
                  {t('food.wheel.selection', { count: availableDishes.length, selected: wheelDishes.length })}
                </p>
                <button
                  type="button"
                  className="flex h-11 shrink-0 items-center gap-1 text-sm font-medium text-food transition-transform active:scale-[0.97] disabled:opacity-50"
                  onClick={shuffleWheel}
                  disabled={wheelBusy}
                >
                  <Shuffle size={16} />
                  <span className="truncate">{t('food.wheel.shuffle')}</span>
                </button>
              </div>
            ) : availableDishes.length > 0 ? (
              <p className="whitespace-nowrap text-xs leading-5 text-muted">
                {stockHintBefore}
                <button
                  type="button"
                  className="inline-flex min-h-11 min-w-11 items-center justify-center font-semibold text-food underline underline-offset-2"
                  onClick={() => setActiveTab('pantry')}
                >
                  {t('food.wheel.pantryLink')}
                </button>
                {stockHintAfter}
              </p>
            ) : null}
            {wheelDishes.length >= 2 ? (
              <Wheel
                items={wheelDishes.map((dish) => ({
                  id: dish.id,
                  label: tDish(dish),
                }))}
                onResult={openDish}
                onSpinningChange={setWheelBusy}
              />
            ) : wheelDishes.length === 1 ? (
              <Card className="space-y-4 shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
                <div className="flex items-center gap-4">
                  <DishImage
                    key={wheelDishes[0].id}
                    id={wheelDishes[0].id}
                    name={tDish(wheelDishes[0])}
                    className="h-24 w-24 shrink-0 rounded-[16px]"
                  />
                  <div className="min-w-0 flex-1 space-y-1">
                    <h2 className="break-words text-[18px] font-bold text-text">{tDish(wheelDishes[0])}</h2>
                    <p className="text-sm text-muted tabular-nums">
                      {recipes[wheelDishes[0].id]
                        ? t('recipe.energy', { count: recipes[wheelDishes[0].id].kcal })
                        : t('food.wheel.unknownEnergy')}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  className="h-12 w-full rounded-[14px] bg-food px-4 text-sm font-semibold text-white transition-transform active:scale-[0.97]"
                  onClick={() => openDish(wheelDishes[0].id)}
                >
                  {t('food.result.accept')}
                </button>
              </Card>
            ) : (
            <Card className="space-y-4 shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
              <p className="text-[15px] font-medium text-text">
                {t('food.wheel.empty')}
              </p>
              <button
                type="button"
                className="h-11 rounded-[14px] bg-food px-4 text-sm font-semibold text-white transition-transform active:scale-[0.97]"
                onClick={() => setActiveTab('pantry')}
              >
                {t('food.wheel.pantry')}
              </button>
            </Card>
            )}
          </div>
        </section>
      )}

      <GoalSheet open={goalsOpen} onClose={() => setGoalsOpen(false)} data={data} setData={setData} />
      <Sheet
        open={resultDish !== null}
        onClose={() => setResultDishId(null)}
        title={t('food.result.title')}
      >
        {resultDish && (() => {
          const sourceRecipe = recipes[resultDish.id];
          const recipe = lang === 'en'
            ? recipeTranslations[resultDish.id] ?? sourceRecipe
            : sourceRecipe;
          const tutorials = [
            { key: 'youtube', Icon: CirclePlay, href: 'https://www.youtube.com/results?search_query=' + encodeURIComponent(t('recipe.searchMethod', { name: tDish(resultDish) })) },
            { key: 'bilibili', Icon: TvMinimal, href: 'https://search.bilibili.com/all?keyword=' + encodeURIComponent(t('recipe.chineseMethod', { name: resultDish.name })) },
            { key: 'icook', Icon: BookOpen, href: 'https://icook.tw/search/' + encodeURIComponent(resultDish.name) + '/' },
            { key: 'google', Icon: Search, href: 'https://www.google.com/search?q=' + encodeURIComponent(t('recipe.searchRecipe', { name: tDish(resultDish) })) },
          ];

          return (
          <div className="space-y-5">
            <DishImage
              key={resultDish.id}
              id={resultDish.id}
              name={tDish(resultDish)}
              className="aspect-square w-full rounded-[20px]"
            />
            <div className="space-y-2">
              <h3 className="break-words text-[24px] font-bold text-text">
                {tDish(resultDish)}
              </h3>
              <p className="flex flex-wrap items-center gap-1 text-sm text-muted">
                <Clock size={16} />
                {t('unit.minutes', { count: resultDish.minutes })}
                {recipe && <span className="ml-2">{t('recipe.servings', { count: recipe.servings })}</span>}
              </p>
              {recipe && (
                <div className="flex flex-wrap gap-2">
                  <span className="max-w-full rounded-full bg-food/10 px-3 py-1 text-xs text-food tabular-nums">
                    {t('recipe.energy', { count: recipe.kcal })}
                  </span>
                  <span className="max-w-full rounded-full bg-food/10 px-3 py-1 text-xs text-food tabular-nums">
                    {t('recipe.protein', { count: recipe.proteinG })}
                  </span>
                </div>
              )}
            </div>

            {recipe ? (
              <>
                <section className="space-y-2">
                  <h4 className="text-[17px] font-bold text-text">{t('recipe.ingredients')}</h4>
                  <ul className="divide-y divide-line">
                    {recipe.ingredients.map((item, index) => {
                      const originalName = sourceRecipe?.ingredients[index]?.name ?? item.name;
                      const stockedIngredient = data.ingredients.find((ingredient) => ingredient.name === originalName);
                      const missing = stockedIngredient?.inStock !== true;

                      return (
                        <li key={originalName} className="grid grid-cols-2 gap-3 py-2 text-sm leading-6">
                          <span className={missing ? 'min-w-0 break-words text-muted line-through' : 'min-w-0 break-words text-text'}>
                            {item.name}
                          </span>
                          <span className="min-w-0 break-words text-right text-muted">{item.amount}</span>
                        </li>
                      );
                    })}
                  </ul>
                </section>

                <section className="space-y-2">
                  <h4 className="text-[17px] font-bold text-text">{t('recipe.seasonings')}</h4>
                  <ul className="divide-y divide-line">
                    {recipe.seasonings.map((item) => (
                      <li key={item.name} className="grid grid-cols-2 gap-3 py-2 text-sm leading-6">
                        <span className="min-w-0 break-words text-text">{item.name}</span>
                        <span className="min-w-0 break-words text-right text-muted">{item.amount}</span>
                      </li>
                    ))}
                  </ul>
                </section>

                <section className="space-y-3">
                  <h4 className="text-[17px] font-bold text-text">{t('recipe.steps')}</h4>
                  <ol className="space-y-4">
                    {recipe.steps.map((step, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-food text-sm font-bold text-white tabular-nums">
                          {index + 1}
                        </span>
                        <p className="min-w-0 flex-1 break-words text-[15px] leading-7 text-text">{step}</p>
                      </li>
                    ))}
                  </ol>
                </section>

                <section className="flex items-start gap-3 rounded-[20px] bg-food/10 p-4">
                  <Lightbulb size={22} className="shrink-0 text-food" aria-hidden="true" />
                  <div className="min-w-0 space-y-1">
                    <h4 className="text-sm font-bold text-food">{t('recipe.tip')}</h4>
                    <p className="break-words text-sm leading-6 text-text">{recipe.tip}</p>
                  </div>
                </section>
              </>
            ) : (
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {resultDish.ingredientIds.map((ingredientId) => {
                    const ingredient = data.ingredients.find((item) => item.id === ingredientId);
                    const inStock = ingredient?.inStock === true;

                    return (
                      <span
                        key={ingredientId}
                        className={'max-w-full truncate rounded-full px-3 py-2 text-sm ' + (inStock ? 'bg-food/10 text-food' : 'bg-surface-2 text-muted line-through')}
                      >
                        {ingredient ? tIngredient(ingredient) : t('dishes.deletedIngredient')}
                      </span>
                    );
                  })}
                </div>
                <p className="text-sm text-muted">{t('recipe.missing')}</p>
              </div>
            )}

            <section className="space-y-3">
              <h4 className="text-[17px] font-bold text-text">{t('recipe.tutorials')}</h4>
              <div className="grid grid-cols-2 gap-2">
                {tutorials.map(({ key, Icon, href }) => (
                  <a
                    key={key}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex min-h-11 min-w-0 items-center gap-2 rounded-[14px] border border-line bg-surface px-3 py-2 text-sm font-medium text-text transition-transform active:scale-[0.97]"
                  >
                    <Icon size={18} className="shrink-0 text-food" aria-hidden="true" />
                    <span className="min-w-0 truncate">{t('recipe.' + key)}</span>
                  </a>
                ))}
              </div>
            </section>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                className="h-12 min-w-0 truncate rounded-[14px] border border-line bg-surface px-2 text-sm font-semibold text-text transition-transform active:scale-[0.97]"
                onClick={() => setResultDishId(null)}
              >
                {t('food.result.again')}
              </button>
              <button
                type="button"
                className={`flex h-12 min-w-0 items-center justify-center gap-1 rounded-[14px] px-2 text-sm font-semibold text-white transition-transform active:scale-[0.97] ${acceptedMealId ? 'bg-ok' : 'bg-food'}`}
                onClick={recordMeal}
                disabled={acceptedMealId !== null}
              >
                {acceptedMealId && <Check size={18} className="shrink-0" aria-hidden="true" />}
                <span className="truncate">{t(acceptedMealId ? 'food.result.added' : 'food.result.accept')}</span>
              </button>
            </div>
          </div>
          );
        })()}
      </Sheet>
      <AnimatePresence>
        {mealNotice && (
          <motion.div
            role="status"
            aria-live="polite"
            className="pointer-events-none fixed inset-x-5 bottom-[calc(env(safe-area-inset-bottom)+80px)] z-[70] mx-auto flex max-w-[440px] items-center justify-between gap-3 rounded-[14px] border border-line bg-surface px-4 py-2 text-sm font-medium text-text shadow-[0_8px_24px_rgba(15,23,42,0.06)]"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.18 }}
          >
            <span className="min-w-0">{t(mealNotice.messageKey)}</span>
            <button
              type="button"
              className="pointer-events-auto min-h-11 min-w-11 shrink-0 text-food transition-transform active:scale-[0.97]"
              onClick={() => {
                mealNotice.undo();
                setMealNotice(null);
              }}
            >
              {t('food.meals.undo')}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
