import { useLang } from '../../i18n/LanguageContext';
import { workoutText } from '../../i18n/strings.workout';

interface RestTimerProps {
  remaining: number;
  onAdjust: (seconds: number) => void;
  onSkip: () => void;
}

export function RestTimer({ remaining, onAdjust, onSkip }: RestTimerProps) {
  const { lang } = useLang();
  const t = (key: string, values?: Record<string, string | number>) => workoutText(lang, key, values);
  const timerClass = [
    'fixed inset-x-0 z-50 mx-auto flex max-w-[480px] items-center justify-between gap-2',
    'border border-line bg-surface p-3 shadow-[0_8px_24px_rgba(15,23,42,0.06)]',
  ].join(' ');
  return (
    <div className={timerClass} style={{ bottom: 'calc(64px + env(safe-area-inset-bottom))' }}>
      <span className="shrink-0 text-sm font-bold tabular-nums text-text">
        {t('rest')} {t('rest.seconds', { count: remaining })}
      </span>
      <div className="flex gap-1">
        <button
          type="button"
          aria-label={t('rest.decrease')}
          className="min-h-11 min-w-11 text-fit active:scale-[0.97]"
          onClick={() => onAdjust(-15)}
        >
          -15
        </button>
        <button
          type="button"
          aria-label={t('rest.increase')}
          className="min-h-11 min-w-11 text-fit active:scale-[0.97]"
          onClick={() => onAdjust(15)}
        >
          +15
        </button>
        <button
          type="button"
          className="min-h-11 rounded-[14px] bg-fit px-3 text-sm font-semibold text-white active:scale-[0.97]"
          onClick={onSkip}
        >
          {t('skip')}
        </button>
      </div>
    </div>
  );
}
