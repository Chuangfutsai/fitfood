import { useEffect, useId, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import type { AppData, Profile } from '../types';
import { Sheet } from '../ui/Sheet';
import { useLang } from '../i18n/LanguageContext';
import { getDailyTargets, getLocalDateKey } from '../stats';
import { exportBackup, getBackupFilename, parseBackup } from '../backup';
import type { BackupEnvelope } from '../backup';
import { deliverBackupFile } from '../ui/ErrorBoundary';

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
  const { t, formatDate } = useLang();
  const fieldId = useId();
  const [sex, setSex] = useState<Profile['sex']>('male');
  const [values, setValues] = useState<Record<Measurement, string>>({ age: '', heightCm: '', weightKg: '' });
  const [activity, setActivity] = useState<Profile['activity']>(1.2);
  const [deficit, setDeficit] = useState<Profile['deficit']>(0.2);
  const [touched, setTouched] = useState<Partial<Record<Measurement, boolean>>>({});
  const [backupPreview, setBackupPreview] = useState<BackupEnvelope | null>(null);
  const [backupError, setBackupError] = useState<string | null>(null);
  const [backupMessage, setBackupMessage] = useState<string | null>(null);
  const [undoData, setUndoData] = useState<AppData | null>(null);
  const [readingBackup, setReadingBackup] = useState(false);
  const readRequest = useRef(0);
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!undoData) return;
    const timer = setTimeout(() => setUndoData(null), 5000);
    return () => clearTimeout(timer);
  }, [undoData]);

  const readBackup = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    const request = ++readRequest.current;
    setReadingBackup(true);
    setBackupPreview(null);
    setBackupError(null);
    setBackupMessage(null);
    try {
      const result = parseBackup(await file.text());
      if (request !== readRequest.current) return;
      if (result.ok) setBackupPreview(result.backup);
      else setBackupError(`backup.error.${result.error}`);
    } catch {
      if (request === readRequest.current) setBackupError('backup.error.read');
    } finally {
      if (request === readRequest.current) setReadingBackup(false);
    }
  };

  const restoreBackup = () => {
    if (!backupPreview) return;
    try {
      // Save the current snapshot before replacing it; never write inside a state updater.
      localStorage.setItem('fitfood:v1:before-restore', JSON.stringify(data));
    } catch {
      setBackupError('backup.error.save');
      return;
    }
    const restored = backupPreview.data;
    setUndoData(data);
    setData(() => restored);
    setBackupPreview(null);
    setBackupError(null);
    setBackupMessage('backup.restored');
  };

  const downloadBackup = async () => {
    setBackupError(null);
    try {
      if (await deliverBackupFile(JSON.stringify(exportBackup(data), null, 2), getBackupFilename())) {
        setBackupMessage('backup.exported');
      }
    } catch {
      setBackupError('backup.error.export');
    }
  };

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
      <section className="mt-6 space-y-3 border-t border-line pt-5">
        <h3 className="text-lg font-bold text-text">{t('backup.title')}</h3>
        <div className="grid grid-cols-2 gap-2">
          <button type="button" onClick={downloadBackup} className="min-h-11 min-w-0 rounded-[14px] border border-line bg-surface px-3 text-sm font-semibold text-food">{t('backup.export')}</button>
          <button type="button" onClick={() => fileInput.current?.click()} className="min-h-11 min-w-0 rounded-[14px] border border-line bg-surface px-3 text-sm font-semibold text-food">{t('backup.restore')}</button>
        </div>
        <input ref={fileInput} type="file" accept=".json,application/json" aria-label={t('backup.restore')} onChange={readBackup} className="hidden" />
        {readingBackup && <p role="status" className="text-sm text-muted">{t('backup.reading')}</p>}
        {backupError && <p role="alert" className="break-words text-sm leading-6 text-tomato-ink">{t(backupError)}</p>}
        {backupPreview && (
          <div className="space-y-3 rounded-[16px] bg-surface-2 p-4 text-sm text-text">
            <h4 className="font-bold">{t('backup.preview')}</h4>
            <ul className="space-y-1">
              <li>{t('backup.mealDays', { count: Object.keys(backupPreview.data.mealLog).length })}</li>
              <li>{t('backup.workoutDays', { count: Object.keys(backupPreview.data.weeklyLog).length })}</li>
              <li>{t(backupPreview.data.profile ? 'backup.hasGoals' : 'backup.noGoals')}</li>
              <li className="break-words">{t('backup.exportedAt', { date: formatDate(new Date(backupPreview.exportedAt), { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) })}</li>
            </ul>
            <p className="text-xs leading-5 text-muted">{t('backup.replaceWarning')}</p>
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => setBackupPreview(null)} className="min-h-11 rounded-[12px] border border-line bg-surface px-2 font-semibold">{t('backup.cancel')}</button>
              <button type="button" onClick={restoreBackup} className="min-h-11 rounded-[12px] bg-food px-2 font-semibold text-white">{t('backup.confirm')}</button>
            </div>
          </div>
        )}
        {(backupMessage || undoData) && (
          <div role="status" className="flex min-h-11 items-center justify-between gap-3 rounded-[14px] bg-food/10 px-3 text-sm text-food">
            <span>{t(undoData ? 'backup.restored' : backupMessage!)}</span>
            {undoData && <button type="button" className="min-h-11 shrink-0 font-bold" onClick={() => { const previous = undoData; setData(() => previous); setUndoData(null); setBackupMessage('backup.undone'); }}>{t('backup.undo')}</button>}
          </div>
        )}
      </section>
    </Sheet>
  );
}
