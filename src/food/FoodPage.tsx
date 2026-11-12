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
  TvMinimal,
  UtensilsCrossed,
  CirclePlay,
} from 'lucide-react';
import type { AppData, Ingredient } from '../types';
import { Card } from '../ui/Card';
import { SegmentedTabs } from '../ui/SegmentedTabs';
import { Sheet } from '../ui/Sheet';
import { DishList } from './DishList';
import { PantryList } from './PantryList';
import { Wheel } from './Wheel';
import { LanguageButton, useLang } from '../i18n/LanguageContext';
import { recipeTranslations } from '../i18n/dataTranslations';
import { recipes } from './recipes';
import { getAvailableDishes, getLocalDateKey } from '../stats';
import { createMealId } from '../storage';
import { TodayMeals } from './TodayMeals';
import type { MealNotice } from './TodayMeals';

interface FoodPageProps {
  data: AppData;
  setData: (next: AppData | ((previous: AppData) => AppData)) => void;
}

interface DishImageProps {
  id: string;
  name: string;
  className: string;
}

type ComboResult = Record<'protein' | 'veg' | 'carb', Ingredient | null>;

const foodTabs = [
  { value: 'wheel', label: 'food.tab.wheel' },
  { value: 'pantry', label: 'food.tab.pantry' },
  { value: 'dishes', label: 'food.tab.dishes' },
];

const comboLabels = {
  protein: 'category.protein',
  veg: 'category.veg',
  carb: 'category.carb',
};

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

function HeroCard({ count }: { count: number }) {
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

  if (hasError) {
    return (
      <section className="relative isolate h-[200px] w-full overflow-hidden rounded-[24px] bg-food/10">
        <LanguageButton accent="food" SheetComponent={Sheet} />
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

        <div className="absolute left-5 top-5 z-10 max-w-[calc(100%-88px)]">
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

export function FoodPage({ data, setData }: FoodPageProps) {
  const { lang, t, tDish, tIngredient } = useLang();
  const [activeTab, setActiveTab] = useState('wheel');
  const [wheelMode, setWheelMode] = useState<'dish' | 'combo'>('dish');
  const [shuffleKey, setShuffleKey] = useState(0);
  const [wheelBusy, setWheelBusy] = useState(false);
  const [resultDishId, setResultDishId] = useState<string | null>(null);
  const [comboResult, setComboResult] = useState<ComboResult | null>(null);
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
    () => getAvailableDishes(data),
    [data.dishes, data.ingredients],
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

  const drawCombo = () => {
    const pickIngredient = (
      category: 'protein' | 'veg' | 'carb',
    ): Ingredient | null => {
      const choices = data.ingredients.filter(
        (ingredient) =>
          ingredient.category === category && ingredient.inStock,
      );

      if (choices.length === 0) {
        return null;
      }

      return choices[Math.floor(Math.random() * choices.length)];
    };

    setComboResult({
      protein: pickIngredient('protein'),
      veg: pickIngredient('veg'),
      carb: pickIngredient('carb'),
    });
  };

  return (
    <main className="space-y-5 px-5 pt-[calc(env(safe-area-inset-top)+20px)]">
      <HeroCard count={availableDishes.length} />

      <SegmentedTabs
        options={foodTabs.map((tab) => ({ ...tab, label: t(tab.label) }))}
        value={activeTab}
        onChange={setActiveTab}
        accent="food"
      />

      {activeTab === 'pantry' && (
        <PantryList data={data} setData={setData} />
      )}

      {activeTab === 'dishes' && <DishList data={data} setData={setData} />}

      {activeTab === 'wheel' && (
        <section className={wheelMode === 'dish' ? 'space-y-4' : 'space-y-5'}>
          <div className="grid grid-cols-2 gap-2 rounded-full bg-surface-2 p-1">
            <button
              type="button"
              className={`h-11 min-w-0 truncate rounded-full px-2 text-sm font-semibold transition-transform active:scale-[0.97] ${
                wheelMode === 'dish'
                  ? 'bg-food text-white'
                  : 'border border-line bg-surface text-muted'
              }`}
              onClick={() => setWheelMode('dish')}
            >
              {t('food.mode.dish')}
            </button>
            <button
              type="button"
              className={`h-11 min-w-0 truncate rounded-full px-2 text-sm font-semibold transition-transform active:scale-[0.97] ${
                wheelMode === 'combo'
                  ? 'bg-food text-white'
                  : 'border border-line bg-surface text-muted'
              }`}
              onClick={() => setWheelMode('combo')}
            >
              {t('food.mode.combo')}
            </button>
          </div>

          {wheelMode === 'dish' && (
            <>
              <TodayMeals data={data} setData={setData} onNotice={setMealNotice} />
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
            </>
          )}

          {wheelMode === 'combo' && (
            <div className="space-y-5">
              <button
                type="button"
                className="h-12 w-full rounded-[14px] bg-food text-sm font-semibold text-white transition-transform active:scale-[0.97]"
                onClick={drawCombo}
              >
                {t('food.combo.draw')}
              </button>

              {comboResult && (
                <div className="grid grid-cols-3 gap-2">
                  {(Object.keys(comboLabels) as Array<
                    keyof typeof comboLabels
                  >).map((category) => {
                    const ingredient = comboResult[category];

                    return (
                      <Card
                        key={category}
                        className="min-w-0 p-3 shadow-[0_8px_24px_rgba(15,23,42,0.06)]"
                      >
                        <p className="mb-2 truncate text-xs text-muted">
                          {t(comboLabels[category])}
                        </p>
                        <p
                          className={`break-words text-[15px] font-bold ${
                            ingredient ? 'text-text' : 'text-muted'
                          }`}
                        >
                          {ingredient ? tIngredient(ingredient) : t('food.combo.empty')}
                        </p>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </section>
      )}

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
