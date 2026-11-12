import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import type { AppData, IngredientCategory } from '../types';
import { Card } from '../ui/Card';
import { Sheet } from '../ui/Sheet';
import { useLang } from '../i18n/LanguageContext';

interface PantryListProps {
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

export function PantryList({ data, setData }: PantryListProps) {
  const { t, tIngredient } = useLang();
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState<IngredientCategory>('protein');

  const inStockCount = data.ingredients.filter(
    (ingredient) => ingredient.inStock,
  ).length;

  const toggleIngredient = (id: string) => {
    setData({
      ...data,
      ingredients: data.ingredients.map((ingredient) =>
        ingredient.id === id
          ? { ...ingredient, inStock: !ingredient.inStock }
          : ingredient,
      ),
    });
  };

  const deleteIngredient = (id: string) => {
    setData({
      ...data,
      ingredients: data.ingredients.filter((ingredient) => ingredient.id !== id),
      dishes: data.dishes.map((dish) => ({
        ...dish,
        ingredientIds: dish.ingredientIds.filter(
          (ingredientId) => ingredientId !== id,
        ),
      })),
    });
  };

  const addIngredient = () => {
    const trimmedName = name.trim();

    if (!trimmedName) {
      return;
    }

    setData({
      ...data,
      ingredients: [
        ...data.ingredients,
        {
          id: `ing-${Date.now()}`,
          name: trimmedName,
          category,
          inStock: true,
        },
      ],
    });
    setName('');
    setCategory('protein');
    setIsAdding(false);
  };

  return (
    <div className="space-y-5">
      <p className="text-sm text-muted">
        {t('pantry.stockCount', { count: inStockCount, total: data.ingredients.length })}
      </p>

      {categoryGroups.map((group) => {
        const ingredients = data.ingredients.filter(
          (ingredient) => ingredient.category === group.category,
        );

        return (
          <section key={group.category} className="space-y-2">
            <h2 className="text-sm font-semibold text-text">{t(group.label)}</h2>
            <Card className="shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
              <div className="divide-y divide-line">
                {ingredients.length === 0 ? (
                  <p className="py-3 text-sm text-muted">{t('pantry.empty')}</p>
                ) : (
                  ingredients.map((ingredient) => (
                    <div
                      key={ingredient.id}
                      className="flex min-h-11 items-center gap-3 py-2"
                    >
                      <p className="min-w-0 flex-1 truncate text-[15px] text-text">
                        {tIngredient(ingredient)}
                      </p>
                      <button
                        type="button"
                        aria-label={t('pantry.delete', { name: tIngredient(ingredient) })}
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] text-muted transition-transform active:scale-[0.97]"
                        onClick={() => deleteIngredient(ingredient.id)}
                      >
                        <Trash2 size={18} />
                      </button>
                      <button
                        type="button"
                        aria-label={t('pantry.stockStatus', { name: tIngredient(ingredient) })}
                        aria-pressed={ingredient.inStock}
                        className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${
                          ingredient.inStock ? 'bg-food' : 'bg-surface-2'
                        }`}
                        onClick={() => toggleIngredient(ingredient.id)}
                      >
                        <span
                          className={`absolute left-0 top-1 h-5 w-5 rounded-full bg-surface shadow-[0_2px_6px_rgba(15,23,42,0.12)] transition-transform ${
                            ingredient.inStock
                              ? 'translate-x-6'
                              : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </section>
        );
      })}

      <button
        type="button"
        className="flex h-12 w-full items-center justify-center truncate rounded-[14px] bg-food text-sm font-semibold text-white transition-transform active:scale-[0.97]"
        onClick={() => setIsAdding(true)}
      >
        {t('pantry.addButton')}
      </button>

      <Sheet
        open={isAdding}
        onClose={() => setIsAdding(false)}
        title={t('pantry.addTitle')}
      >
        <div className="space-y-5">
          <label className="block space-y-2">
            <span className="text-sm font-medium text-text">{t('common.name')}</span>
            <input
              type="text"
              value={name}
              placeholder={t('pantry.namePlaceholder')}
              className="h-12 w-full rounded-[14px] border border-line bg-bg px-4 text-[15px] text-text outline-none placeholder:text-muted"
              onChange={(event) => setName(event.target.value)}
            />
          </label>

          <div className="space-y-2">
            <p className="text-sm font-medium text-text">{t('pantry.category')}</p>
            <div className="grid grid-cols-2 gap-2">
              {categoryGroups.map((group) => {
                const selected = category === group.category;

                return (
                  <button
                    key={group.category}
                    type="button"
                    className={`h-11 min-w-0 truncate rounded-[14px] border px-2 text-sm font-medium transition-transform active:scale-[0.97] ${
                      selected
                        ? 'border-food bg-food text-white'
                        : 'border-line bg-surface-2 text-muted'
                    }`}
                    onClick={() => setCategory(group.category)}
                  >
                    {t(group.label)}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="button"
            className="h-12 w-full rounded-[14px] bg-food text-sm font-semibold text-white transition-transform active:scale-[0.97] disabled:cursor-not-allowed disabled:bg-surface-2 disabled:text-muted"
            disabled={!name.trim()}
            onClick={addIngredient}
          >
            {t('common.add')}
          </button>
        </div>
      </Sheet>
    </div>
  );
}
