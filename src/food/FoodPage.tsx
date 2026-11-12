import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Carrot,
  Clock,
  Egg,
  Salad,
  Shuffle,
  UtensilsCrossed,
} from 'lucide-react';
import type { AppData, Ingredient } from '../types';
import { Card } from '../ui/Card';
import { SegmentedTabs } from '../ui/SegmentedTabs';
import { Sheet } from '../ui/Sheet';
import { DishList } from './DishList';
import { PantryList } from './PantryList';
import { Wheel } from './Wheel';

interface FoodPageProps {
  data: AppData;
  setData: (data: AppData) => void;
}

interface DishImageProps {
  id: string;
  name: string;
  className: string;
}

type ComboResult = Record<'protein' | 'veg' | 'carb', Ingredient | null>;

const foodTabs = [
  { value: 'wheel', label: '轉盤' },
  { value: 'pantry', label: '食材' },
  { value: 'dishes', label: '菜單' },
];

const comboLabels = {
  protein: '蛋白質',
  veg: '蔬菜',
  carb: '主食',
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
  const [hasError, setHasError] = useState(false);
  const now = new Date();
  const hour = now.getHours();
  const weekdays = [
    '星期日',
    '星期一',
    '星期二',
    '星期三',
    '星期四',
    '星期五',
    '星期六',
  ];
  const dateLabel = `${now.getMonth() + 1}月${now.getDate()}日 ${weekdays[now.getDay()]}`;
  const greeting =
    hour >= 5 && hour < 11
      ? '早安'
      : hour >= 11 && hour < 14
        ? '午安'
        : hour >= 14 && hour < 18
          ? '下午好'
          : '晚安';

  if (hasError) {
    return (
      <section className="relative isolate h-[200px] w-full overflow-hidden rounded-[24px] bg-food/10">
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

        <div className="absolute left-5 top-5 z-10">
          <p className="text-xs leading-4 text-muted tabular-nums">{dateLabel}</p>
          <p className="mt-2 text-sm leading-5 text-text">
            {greeting}，今天吃什麼？
          </p>
        </div>

        <div className="absolute bottom-5 left-5 z-10 max-w-[60%]">
          <h1 className="text-[28px] font-extrabold leading-8 text-text">
            <span className="block">轉一下，</span>
            <span className="block">交給命運</span>
          </h1>
          <span className="mt-2 inline-flex rounded-full bg-surface px-3 py-1 text-xs font-bold leading-4 text-food tabular-nums">
            現在可做 {count} 道菜
          </span>
        </div>
      </section>
    );
  }

  return (
    <section className="relative h-[200px] overflow-hidden rounded-[24px]">
      <img
        src="/dishes/hero.jpg"
        alt="今日料理"
        className="h-full w-full object-cover"
        onError={() => setHasError(true)}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
      <div className="absolute bottom-5 left-5">
        <p className="text-sm text-white">今天吃什麼？</p>
        <h1 className="text-[28px] font-extrabold text-white">
          轉一下，交給命運
        </h1>
      </div>
    </section>
  );
}

export function FoodPage({ data, setData }: FoodPageProps) {
  const [activeTab, setActiveTab] = useState('wheel');
  const [wheelMode, setWheelMode] = useState<'dish' | 'combo'>('dish');
  const [shuffleKey, setShuffleKey] = useState(0);
  const [resultDishId, setResultDishId] = useState<string | null>(null);
  const [comboResult, setComboResult] = useState<ComboResult | null>(null);

  useEffect(() => {
    if (activeTab === 'wheel') {
      setShuffleKey((currentKey) => currentKey + 1);
    }
  }, [activeTab]);

  const availableDishes = useMemo(
    () =>
      data.dishes.filter(
        (dish) =>
          dish.ingredientIds.length > 0 &&
          dish.ingredientIds.every((ingredientId) =>
            data.ingredients.some(
              (ingredient) =>
                ingredient.id === ingredientId && ingredient.inStock,
            ),
          ),
      ),
    [data.dishes, data.ingredients],
  );

  const wheelDishes = useMemo(() => {
    const shuffled = [...availableDishes].sort(() => Math.random() - 0.5);

    return shuffled.slice(0, 8);
  }, [availableDishes, shuffleKey]);

  const resultDish =
    data.dishes.find((dish) => dish.id === resultDishId) ?? null;

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
        options={foodTabs}
        value={activeTab}
        onChange={setActiveTab}
        accent="food"
      />

      {activeTab === 'pantry' && (
        <PantryList data={data} setData={setData} />
      )}

      {activeTab === 'dishes' && <DishList data={data} setData={setData} />}

      {activeTab === 'wheel' && (
        <section className="space-y-5">
          <div className="grid grid-cols-2 gap-2 rounded-full bg-surface-2 p-1">
            <button
              type="button"
              className={`h-11 rounded-full text-sm font-semibold transition-transform active:scale-[0.97] ${
                wheelMode === 'dish'
                  ? 'bg-food text-white'
                  : 'border border-line bg-surface text-muted'
              }`}
              onClick={() => setWheelMode('dish')}
            >
              抽菜色
            </button>
            <button
              type="button"
              className={`h-11 rounded-full text-sm font-semibold transition-transform active:scale-[0.97] ${
                wheelMode === 'combo'
                  ? 'bg-food text-white'
                  : 'border border-line bg-surface text-muted'
              }`}
              onClick={() => setWheelMode('combo')}
            >
              抽組合
            </button>
          </div>

          {wheelMode === 'dish' && (
            <>
              {wheelDishes.length >= 2 ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs text-muted">
                      從 {availableDishes.length} 道可做的菜中隨機選{' '}
                      {wheelDishes.length} 道
                    </p>
                    <button
                      type="button"
                      className="flex h-11 shrink-0 items-center gap-1 text-sm font-medium text-food transition-transform active:scale-[0.97]"
                      onClick={shuffleWheel}
                    >
                      <Shuffle size={16} />
                      重新洗牌
                    </button>
                  </div>
                  <Wheel
                    items={wheelDishes.map((dish) => ({
                      id: dish.id,
                      label: dish.name,
                    }))}
                    onResult={setResultDishId}
                  />
                </div>
              ) : (
                <Card className="space-y-4 shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
                  <p className="text-[15px] font-medium text-text">
                    現有食材能做的菜不夠
                  </p>
                  <button
                    type="button"
                    className="h-11 rounded-[14px] bg-food px-4 text-sm font-semibold text-white transition-transform active:scale-[0.97]"
                    onClick={() => setActiveTab('pantry')}
                  >
                    去勾選食材
                  </button>
                </Card>
              )}
            </>
          )}

          {wheelMode === 'combo' && (
            <div className="space-y-5">
              <button
                type="button"
                className="h-12 w-full rounded-[14px] bg-food text-sm font-semibold text-white transition-transform active:scale-[0.97]"
                onClick={drawCombo}
              >
                抽一組
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
                        <p className="mb-2 text-xs text-muted">
                          {comboLabels[category]}
                        </p>
                        <p
                          className={`break-words text-[15px] font-bold ${
                            ingredient ? 'text-text' : 'text-muted'
                          }`}
                        >
                          {ingredient?.name ?? '沒有庫存'}
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
        title="抽菜色結果"
      >
        {resultDish && (
          <div className="space-y-5">
            <DishImage
              key={resultDish.id}
              id={resultDish.id}
              name={resultDish.name}
              className="aspect-square w-full rounded-[20px]"
            />
            <div className="space-y-2">
              <h2 className="text-[24px] font-bold text-text">
                {resultDish.name}
              </h2>
              <p className="flex items-center gap-1 text-sm text-muted">
                <Clock size={16} />
                {resultDish.minutes} 分鐘
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {resultDish.ingredientIds.map((ingredientId) => {
                const ingredient = data.ingredients.find(
                  (item) => item.id === ingredientId,
                );

                if (!ingredient) {
                  return null;
                }

                return (
                  <span
                    key={ingredient.id}
                    className="rounded-full bg-food/10 px-3 py-2 text-sm text-food"
                  >
                    {ingredient.name}
                  </span>
                );
              })}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                className="h-12 rounded-[14px] border border-line bg-surface text-sm font-semibold text-text transition-transform active:scale-[0.97]"
                onClick={() => setResultDishId(null)}
              >
                再轉一次
              </button>
              <button
                type="button"
                className="h-12 rounded-[14px] bg-food text-sm font-semibold text-white transition-transform active:scale-[0.97]"
                onClick={() => setResultDishId(null)}
              >
                就吃這個
              </button>
            </div>
          </div>
        )}
      </Sheet>
    </main>
  );
}
