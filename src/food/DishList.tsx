import { useMemo, useState } from 'react';
import {
  BookOpen,
  Clock,
  Lightbulb,
  Search,
  TvMinimal,
  UtensilsCrossed,
  CirclePlay,
} from 'lucide-react';
import type { AppData, Dish, IngredientCategory } from '../types';
import { Card } from '../ui/Card';
import { Sheet } from '../ui/Sheet';
import { useLang } from '../i18n/LanguageContext';
import { recipeTranslations } from '../i18n/dataTranslations';
import { recipes } from './recipes';

interface DishListProps {
  data: AppData;
  setData: (data: AppData) => void;
}

const categoryGroups: {
  category: IngredientCategory;
  label: string;
}[] = [
  { category: 'protein', label: 'category.protein' },
  { category: 'veg', label: 'category.veg' },
  { category: 'carb', label: 'category.carb' },
  { category: 'other', label: 'category.other' },
];

interface DishImageProps {
  dish: Dish;
  className: string;
}

function DishImage({ dish, className }: DishImageProps) {
  const { tDish } = useLang();
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
      alt={tDish(dish)}
      className={`object-cover ${className}`}
      onError={() => setHasError(true)}
    />
  );
}

export function DishList({ data, setData }: DishListProps) {
  const { lang, t, tDish, tIngredient } = useLang();
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
    tDish(dish).toLocaleLowerCase().includes(query.toLocaleLowerCase()) ||
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
          meals: ['lunch', 'dinner'],
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
          placeholder={t('dishes.search')}
          className="h-12 w-full rounded-[14px] border border-line bg-surface py-3 pl-11 pr-4
            text-[15px] text-text shadow-[0_8px_24px_rgba(15,23,42,0.06)]
            outline-none placeholder:text-muted"
          onChange={(event) => setQuery(event.target.value)}
        />
      </label>

      {filteredDishes.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted">{t('dishes.empty')}</p>
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
                  <span
                    className="absolute right-3 top-3 z-10 max-w-[calc(100%-24px)] break-words rounded-full
                      bg-surface-2 px-2 py-1 text-xs text-muted"
                  >
                    {t('dishes.missing')}
                  </span>
                )}
                <Card className="h-full shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
                  <DishImage
                    dish={dish}
                    className="aspect-square w-full rounded-[14px]"
                  />
                  <div className="space-y-2 pt-3">
                    <h2 className="break-words text-[15px] font-bold text-text">
                      {tDish(dish)}
                    </h2>
                    <p className="flex items-center gap-1 text-xs text-muted">
                      <Clock size={14} />
                      {t('unit.minutes', { count: dish.minutes })}
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
        className="flex h-12 w-full items-center justify-center rounded-[14px] bg-food
          text-sm font-semibold text-white transition-transform active:scale-[0.97]"
        onClick={() => setIsAdding(true)}
      >
        {t('dishes.addButton')}
      </button>

      <Sheet
        open={selectedDish !== null}
        onClose={() => setSelectedDish(null)}
        title={selectedDish ? tDish(selectedDish) : t('dishes.details')}
      >
        {selectedDish && (() => {
          const sourceRecipe = recipes[selectedDish.id];
          const recipe = lang === 'en'
            ? recipeTranslations[selectedDish.id] ?? sourceRecipe
            : sourceRecipe;
          const tutorials = [
            {
              key: 'youtube', Icon: CirclePlay,
              href: 'https://www.youtube.com/results?search_query=' +
                encodeURIComponent(t('recipe.searchMethod', { name: tDish(selectedDish) }))
            },
            {
              key: 'bilibili', Icon: TvMinimal,
              href: 'https://search.bilibili.com/all?keyword=' +
                encodeURIComponent(t('recipe.chineseMethod', { name: selectedDish.name }))
            },
            {
              key: 'icook', Icon: BookOpen,
              href: 'https://icook.tw/search/' + encodeURIComponent(selectedDish.name) + '/'
            },
            {
              key: 'google', Icon: Search,
              href: 'https://www.google.com/search?q=' +
                encodeURIComponent(t('recipe.searchRecipe', { name: tDish(selectedDish) }))
            },
          ];

          return (
          <div className="space-y-5">
            <DishImage
              dish={selectedDish}
              className="aspect-square w-full rounded-[20px]"
            />
            <div className="space-y-2">
              <h3 className="break-words text-[24px] font-bold text-text">
                {tDish(selectedDish)}
              </h3>
              <p className="flex flex-wrap items-center gap-1 text-sm text-muted">
                <Clock size={16} />
                {t('unit.minutes', { count: selectedDish.minutes })}
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
                          <span
                            className={missing
                              ? 'min-w-0 break-words text-muted line-through'
                              : 'min-w-0 break-words text-text'}
                          >
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
                        <span
                          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full
                            bg-food text-sm font-bold text-white tabular-nums"
                        >
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
                  {selectedDish.ingredientIds.map((ingredientId) => {
                    const ingredient = data.ingredients.find((item) => item.id === ingredientId);
                    const inStock = ingredient?.inStock === true;

                    return (
                      <span
                        key={ingredientId}
                        className={'max-w-full break-words rounded-full px-3 py-2 text-sm ' +
                          (inStock ? 'bg-food/10 text-food' : 'bg-surface-2 text-muted line-through')}
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
                    className="flex min-h-11 min-w-0 items-center gap-2 rounded-[14px] border border-line
                      bg-surface px-3 py-2 text-sm font-medium text-text transition-transform
                      active:scale-[0.97]"
                  >
                    <Icon size={18} className="shrink-0 text-food" aria-hidden="true" />
                    <span className="min-w-0 break-words">{t('recipe.' + key)}</span>
                  </a>
                ))}
              </div>
            </section>
            <button
              type="button"
              className="h-11 text-sm font-medium text-muted underline transition-transform active:scale-[0.97]"
              onClick={() => deleteDish(selectedDish.id)}
            >
              {t('dishes.delete')}
            </button>
          </div>
          );
        })()}
      </Sheet>

      <Sheet
        open={isAdding}
        onClose={() => setIsAdding(false)}
        title={t('dishes.addTitle')}
      >
        <div className="space-y-5">
          <label className="block space-y-2">
            <span className="text-sm font-medium text-text">{t('dishes.name')}</span>
            <input
              type="text"
              value={name}
              placeholder={t('dishes.namePlaceholder')}
              className="h-12 w-full rounded-[14px] border border-line bg-bg px-4 text-[15px]
                text-text outline-none placeholder:text-muted"
              onChange={(event) => setName(event.target.value)}
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-text">{t('dishes.cookingTime')}</span>
            <input
              type="number"
              min="1"
              value={minutes}
              className="h-12 w-full rounded-[14px] border border-line bg-bg px-4 text-[15px] text-text outline-none"
              onChange={(event) => setMinutes(event.target.value)}
            />
          </label>

          <div className="space-y-4">
            <p className="text-sm font-medium text-text">{t('dishes.ingredients')}</p>
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
                    {t(group.label)}
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
                          className={`min-h-11 max-w-full break-words rounded-full border px-3 py-2 text-sm
                            transition-transform active:scale-[0.97] ${
                            selected
                              ? 'border-food bg-food text-white'
                              : 'border-line bg-surface-2 text-muted'
                          }`}
                          onClick={() => toggleIngredient(ingredient.id)}
                        >
                          {tIngredient(ingredient)}
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
            className="h-12 w-full rounded-[14px] bg-food text-sm font-semibold text-white
              transition-transform active:scale-[0.97] disabled:cursor-not-allowed
              disabled:bg-surface-2 disabled:text-muted"
            disabled={!name.trim() || selectedIngredientIds.length === 0}
            onClick={addDish}
          >
            {t('common.add')}
          </button>
        </div>
      </Sheet>
    </div>
  );
}
