import { useEffect, useId, useState } from 'react';
import type { AppData, Profile } from '../types';
import { Sheet } from '../ui/Sheet';
import { useLang } from '../i18n/LanguageContext';
import { getDailyTargets, getLocalDateKey } from '../stats';

interface GoalSheetProps {
  open: boolean;
  onClose: () => void;
  data: AppData;
  setData: (next: AppData | ((previous: AppData) => AppData)) => void;
}

const activityLevels = [1.2, 1.375, 1.55, 1.725, 1.9] as const;
const measurements = ['age', 'heightCm', 'weightKg'] as const;
type Measurement = typeof measurements[number];

export function GoalSheet({ open, onClose, data, setData }: GoalSheetProps) {
  const { t } = useLang();
  const fieldId = useId();
  const [sex, setSex] = useState<Profile['sex']>('male');
  const [values, setValues] = useState<Record<Measurement, string>>({ age: '', heightCm: '', weightKg: '' });
  const [activity, setActivity] = useState<Profile['activity']>(1.2);
  const [deficit, setDeficit] = useState<Profile['deficit']>(0.2);
  const [touched, setTouched] = useState<Partial<Record<Measurement, boolean>>>({});

  useEffect(() => {
    if (!open) return;
    const profile = data.profile;
    setSex(profile?.sex ?? 'male');
    setValues({ age: profile ? String(profile.age) : '', heightCm: profile ? String(profile.heightCm) : '', weightKg: profile ? String(profile.weightKg) : '' });
    setActivity(profile?.activity ?? 1.2);
    setDeficit(profile?.deficit ?? 0.2);
    setTouched({});
  }, [open, data.profile]);

  const limits = { age: [18, 80], heightCm: [120, 220], weightKg: [35, 250] } as const;
  const errors = Object.fromEntries(measurements.map((field) => {
    const value = Number(values[field]);
    const [min, max] = limits[field];
    const error = values[field].trim() === '' || !Number.isFinite(value)
      ? 'goals.required'
      : field === 'age' && value < 18
        ? 'goals.adultsOnly'
        : value < min || value > max
          ? `goals.error.${field}`
          : null;
    return [field, error];
  })) as Record<Measurement, string | null>;
  const valid = measurements.every((field) => errors[field] === null);
  const profile: Profile = { sex, age: Number(values.age), heightCm: Number(values.heightCm), weightKg: Number(values.weightKg), activity, deficit };
  const targets = valid ? getDailyTargets(profile) : null;

  const save = () => {
    if (!valid) return;
    const dateKey = getLocalDateKey(new Date());
    setData((previous) => ({ ...previous, profile, weightLog: { ...previous.weightLog, [dateKey]: profile.weightKg } }));
    onClose();
  };

  return (
    <Sheet open={open} onClose={onClose} title={t('goals.title')}>
      <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); save(); }} noValidate>
        <fieldset className="space-y-2">
          <legend className="text-sm font-semibold text-text">{t('goals.sex')}</legend>
          <div className="grid grid-cols-2 gap-2">
            {(['male', 'female'] as const).map((value) => (
              <button key={value} type="button" aria-pressed={sex === value} onClick={() => setSex(value)} className={`h-11 rounded-[14px] border text-sm font-semibold ${sex === value ? 'border-food bg-food text-white' : 'border-line bg-surface text-muted'}`}>
                {t(`goals.sex.${value}`)}
              </button>
            ))}
          </div>
        </fieldset>

        <div className="grid grid-cols-3 gap-2">
          {measurements.map((field) => {
            const showError = errors[field] && (touched[field] || values[field] !== '');
            return (
              <div key={field} className="min-w-0 space-y-1.5">
                <label htmlFor={`${fieldId}-${field}`} className="block text-xs font-semibold text-text">{t(`goals.${field}`)}</label>
                <input
                  id={`${fieldId}-${field}`}
                  type="number"
                  inputMode={field === 'age' ? 'numeric' : 'decimal'}
                  step={field === 'age' ? '1' : 'any'}
                  min={limits[field][0]}
                  max={limits[field][1]}
                  value={values[field]}
                  onChange={(event) => setValues((previous) => ({ ...previous, [field]: event.target.value }))}
                  onBlur={() => setTouched((previous) => ({ ...previous, [field]: true }))}
                  aria-invalid={Boolean(showError)}
                  aria-describedby={showError ? `${fieldId}-${field}-error` : undefined}
                  className={`h-11 w-full min-w-0 rounded-[12px] border bg-surface px-2 text-base text-text tabular-nums outline-none focus:border-food ${showError ? 'border-tomato-ink' : 'border-line'}`}
                />
                {showError && <p id={`${fieldId}-${field}-error`} className="break-words text-xs leading-4 text-tomato-ink">{t(errors[field]!)}</p>}
              </div>
            );
          })}
        </div>

        <fieldset className="space-y-2">
          <legend className="text-sm font-semibold text-text">{t('goals.activity')}</legend>
          <div className="space-y-1">
            {activityLevels.map((value, index) => (
              <label key={value} className={`flex min-h-11 cursor-pointer items-center gap-3 rounded-[12px] border px-3 py-2 text-xs leading-5 ${activity === value ? 'border-food bg-food/10 text-food' : 'border-line text-text'}`}>
                <input type="radio" name={`${fieldId}-activity`} value={value} checked={activity === value} onChange={() => setActivity(value)} className="h-4 w-4 shrink-0 accent-food" />
                <span>{t(`goals.activity.${index}`)}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="space-y-2">
          <legend className="text-sm font-semibold text-text">{t('goals.deficit')}</legend>
          <div className="grid grid-cols-2 gap-2">
            {([0.15, 0.2] as const).map((value) => (
              <button key={value} type="button" aria-pressed={deficit === value} onClick={() => setDeficit(value)} className={`h-11 min-w-0 truncate rounded-[14px] border px-2 text-sm font-semibold ${deficit === value ? 'border-food bg-food text-white' : 'border-line bg-surface text-muted'}`}>
                {t(value === 0.15 ? 'goals.gentle' : 'goals.standard')}
              </button>
            ))}
          </div>
        </fieldset>

        <div aria-live="polite" className="grid grid-cols-3 gap-2 rounded-[16px] bg-food/10 p-3 text-food">
          {(['bmr', 'kcal', 'proteinG'] as const).map((key) => (
            <div key={key} className="min-w-0 space-y-1">
              <p className="text-[11px] leading-4">{t(`goals.result.${key}`)}</p>
              <p className="text-lg font-bold tabular-nums">{targets ? Math.round(targets[key]) : t('goals.pending')}</p>
              <p className="text-[10px]">{t(key === 'proteinG' ? 'goals.grams' : 'goals.kcalUnit')}</p>
            </div>
          ))}
        </div>
        <p className="text-xs leading-5 text-muted">{t('goals.disclaimer')}</p>
        <button type="submit" disabled={!valid} className="h-12 w-full rounded-[14px] bg-food text-sm font-semibold text-white disabled:bg-surface-2 disabled:text-muted">
          {t('goals.save')}
        </button>
      </form>
    </Sheet>
  );
}
