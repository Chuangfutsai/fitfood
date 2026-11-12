import { useMemo, useState } from 'react';
import {
  Clock,
  Search,
  UtensilsCrossed,
} from 'lucide-react';
import type { AppData, Dish, IngredientCategory } from '../types';
import { Card } from '../ui/Card';
import { Sheet } from '../ui/Sheet';

interface DishListProps {
  data: AppData;
  setData: (data: AppData) => void;
}

const categoryGroups: {
  category: IngredientCategory;
  label: string;
}[] = [
  { category: 'protein', label: '蛋白質' },
  { category: 'veg', label: '蔬菜' },
  { category: 'carb', label: '主食' },
  { category: 'other', label: '調味配料' },
];

interface DishImageProps {
  dish: Dish;
  className: string;
}

function DishImage({ dish, className }: DishImageProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div
        className={`flex items-center justify-center bg-food/10 ${className}`}
      >
        <UtensilsCrossed className="text-food" size={28} />
      </div>
    );
  }

  return (
    <img
      src={`/dishes/${dish.id}.jpg`}
      alt={dish.name}
      className={`object-cover ${className}`}
      onError={() => setHasError(true)}
    />
  );
}

export function DishList({ data, setData }: DishListProps) {
  const [query, setQuery] = useState('');
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [minutes, setMinutes] = useState('20');
  const [selectedIngredientIds, setSelectedIngredientIds] = useState<string[]>(
    [],
  );

  const ingredientsById = useMemo(
    () => new Map(data.ingredients.map((ingredient) => [ingredient.id, ingredient])),
    [data.ingredients],
  );

  const filteredDishes = data.dishes.filter((dish) =>
    dish.name.toLocaleLowerCase().includes(query.toLocaleLowerCase()),
  );

  const hasMissingIngredient = (dish: Dish) =>
    dish.ingredientIds.some(
      (ingredientId) => ingredientsById.get(ingredientId)?.inStock !== true,
    );

  const deleteDish = (id: string) => {
    setData({
      ...data,
      dishes: data.dishes.filter((dish) => dish.id !== id),
    });
    setSelectedDish(null);
  };

  const toggleIngredient = (id: string) => {
    setSelectedIngredientIds((currentIds) =>
      currentIds.includes(id)
        ? currentIds.filter((ingredientId) => ingredientId !== id)
        : [...currentIds, id],
    );
  };

  const addDish = () => {
    const trimmedName = name.trim();

    if (!trimmedName || selectedIngredientIds.length === 0) {
      return;
    }

    setData({
      ...data,
      dishes: [
        ...data.dishes,
        {
          id: `dish-${Date.now()}`,
          name: trimmedName,
          ingredientIds: selectedIngredientIds,
          minutes: Math.max(1, Number(minutes) || 1),
        },
      ],
    });
    setName('');
    setMinutes('20');
    setSelectedIngredientIds([]);
    setIsAdding(false);
  };

  return (
    <div className="space-y-5">
      <label className="relative block">
        <Search
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted"
          size={18}
        />
        <input
          type="search"
          value={query}
          placeholder="搜尋菜色"
          className="h-12 w-full rounded-[14px] border border-line bg-surface py-3 pl-11 pr-4 text-[15px] text-text shadow-[0_8px_24px_rgba(15,23,42,0.06)] outline-none placeholder:text-muted"
          onChange={(event) => setQuery(event.target.value)}
        />
      </label>

      {filteredDishes.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted">找不到菜色</p>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {filteredDishes.map((dish) => {
            const missingIngredient = hasMissingIngredient(dish);

            return (
              <button
                key={dish.id}
                type="button"
                className={`relative min-w-0 text-left transition-transform active:scale-[0.97] ${
                  missingIngredient ? 'opacity-60' : ''
                }`}
                onClick={() => setSelectedDish(dish)}
              >
                {missingIngredient && (
                  <span className="absolute right-3 top-3 z-10 rounded-full bg-surface-2 px-2 py-1 text-xs text-muted">
                    缺食材
                  </span>
                )}
                <Card className="h-full shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
                  <DishImage
                    dish={dish}
                    className="aspect-square w-full rounded-[14px]"
                  />
                  <div className="space-y-2 pt-3">
                    <h2 className="line-clamp-2 text-[15px] font-bold text-text">
                      {dish.name}
                    </h2>
                    <p className="flex items-center gap-1 text-xs text-muted">
                      <Clock size={14} />
                      {dish.minutes} 分鐘
                    </p>
                  </div>
                </Card>
              </button>
            );
          })}
        </div>
      )}

      <button
        type="button"
        className="flex h-12 w-full items-center justify-center rounded-[14px] bg-food text-sm font-semibold text-white transition-transform active:scale-[0.97]"
        onClick={() => setIsAdding(true)}
      >
        ＋ 新增菜色
      </button>

      <Sheet
        open={selectedDish !== null}
        onClose={() => setSelectedDish(null)}
        title={selectedDish?.name ?? '菜色詳情'}
      >
        {selectedDish && (
          <div className="space-y-5">
            <DishImage
              dish={selectedDish}
              className="aspect-square w-full rounded-[20px]"
            />
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-text">
                {selectedDish.name}
              </h3>
              <p className="flex items-center gap-1 text-sm text-muted">
                <Clock size={16} />
                {selectedDish.minutes} 分鐘
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedDish.ingredientIds.map((ingredientId) => {
                const ingredient = ingredientsById.get(ingredientId);
                const inStock = ingredient?.inStock === true;

                return (
                  <span
                    key={ingredientId}
                    className={`rounded-full px-3 py-2 text-sm ${
                      inStock
                        ? 'bg-food/10 text-food'
                        : 'bg-surface-2 text-muted line-through'
                    }`}
                  >
                    {ingredient?.name ?? '已刪除食材'}
                  </span>
                );
              })}
            </div>
            <button
              type="button"
              className="h-11 text-sm font-medium text-muted underline transition-transform active:scale-[0.97]"
              onClick={() => deleteDish(selectedDish.id)}
            >
              刪除這道菜
            </button>
          </div>
        )}
      </Sheet>

      <Sheet
        open={isAdding}
        onClose={() => setIsAdding(false)}
        title="新增菜色"
      >
        <div className="space-y-5">
          <label className="block space-y-2">
            <span className="text-sm font-medium text-text">菜名</span>
            <input
              type="text"
              value={name}
              placeholder="例如：番茄炒蛋"
              className="h-12 w-full rounded-[14px] border border-line bg-bg px-4 text-[15px] text-text outline-none placeholder:text-muted"
              onChange={(event) => setName(event.target.value)}
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-text">烹飪時間</span>
            <input
              type="number"
              min="1"
              value={minutes}
              className="h-12 w-full rounded-[14px] border border-line bg-bg px-4 text-[15px] text-text outline-none"
              onChange={(event) => setMinutes(event.target.value)}
            />
          </label>

          <div className="space-y-4">
            <p className="text-sm font-medium text-text">食材</p>
            {categoryGroups.map((group) => {
              const ingredients = data.ingredients.filter(
                (ingredient) => ingredient.category === group.category,
              );

              if (ingredients.length === 0) {
                return null;
              }

              return (
                <section key={group.category} className="space-y-2">
                  <h3 className="text-xs font-medium text-muted">
                    {group.label}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {ingredients.map((ingredient) => {
                      const selected = selectedIngredientIds.includes(
                        ingredient.id,
                      );

                      return (
                        <button
                          key={ingredient.id}
                          type="button"
                          className={`min-h-11 rounded-full border px-3 py-2 text-sm transition-transform active:scale-[0.97] ${
                            selected
                              ? 'border-food bg-food text-white'
                              : 'border-line bg-surface-2 text-muted'
                          }`}
                          onClick={() => toggleIngredient(ingredient.id)}
                        >
                          {ingredient.name}
                        </button>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>

          <button
            type="button"
            className="h-12 w-full rounded-[14px] bg-food text-sm font-semibold text-white transition-transform active:scale-[0.97] disabled:cursor-not-allowed disabled:bg-surface-2 disabled:text-muted"
            disabled={!name.trim() || selectedIngredientIds.length === 0}
            onClick={addDish}
          >
            加入
          </button>
        </div>
      </Sheet>
    </div>
  );
}
