import { CalendarDays, ChefHat, Dumbbell } from 'lucide-react';
import { useLang } from '../i18n/LanguageContext';

interface BottomNavProps {
  tab: 'today' | 'food' | 'fit';
  onChange: (tab: 'today' | 'food' | 'fit') => void;
}

const tabStyles = {
  today: {
    active: 'text-food',
    glow: 'bg-food/30',
  },
  food: {
    active: 'text-food',
    glow: 'bg-food/30',
  },
  fit: {
    active: 'text-fit',
    glow: 'bg-fit/30',
  },
};

export function BottomNav({ tab, onChange }: BottomNavProps) {
  const { t } = useLang();
  const todaySelected = tab === 'today';
  const foodSelected = tab === 'food';
  const fitSelected = tab === 'fit';

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/80 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-lg">
        <button
          type="button"
          className={`relative flex h-full flex-1 flex-col items-center justify-center gap-1 text-xs font-medium transition-transform active:scale-[0.97] ${
            todaySelected ? tabStyles.today.active : 'text-muted'
          }`}
          onClick={() => onChange('today')}
        >
          {todaySelected && <span className={`pointer-events-none absolute top-3 h-8 w-8 rounded-full blur-xl ${tabStyles.today.glow}`} />}
          <CalendarDays className="relative" size={22} />
          <span className="relative max-w-full px-2 text-center leading-4">{t('today.nav')}</span>
        </button>
        <button
          type="button"
          className={`relative flex h-full flex-1 flex-col items-center justify-center gap-1 text-xs font-medium transition-transform active:scale-[0.97] ${
            foodSelected ? tabStyles.food.active : 'text-muted'
          }`}
          onClick={() => onChange('food')}
        >
          {foodSelected && (
            <span
              className={`pointer-events-none absolute top-3 h-8 w-8 rounded-full blur-xl ${tabStyles.food.glow}`}
            />
          )}
          <ChefHat className="relative" size={22} />
          <span className="relative max-w-full px-2 text-center leading-4">{t('nav.food')}</span>
        </button>
        <button
          type="button"
          className={`relative flex h-full flex-1 flex-col items-center justify-center gap-1 text-xs font-medium transition-transform active:scale-[0.97] ${
            fitSelected ? tabStyles.fit.active : 'text-muted'
          }`}
          onClick={() => onChange('fit')}
        >
          {fitSelected && (
            <span
              className={`pointer-events-none absolute top-3 h-8 w-8 rounded-full blur-xl ${tabStyles.fit.glow}`}
            />
          )}
          <Dumbbell className="relative" size={22} />
          <span className="relative max-w-full px-2 text-center leading-4">{t('nav.fit')}</span>
        </button>
      </div>
    </nav>
  );
}
