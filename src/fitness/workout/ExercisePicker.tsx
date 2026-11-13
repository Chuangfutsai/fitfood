import { Check, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useLang } from '../../i18n/LanguageContext';
import { workoutText } from '../../i18n/strings.workout';
import { exerciseLibrary, type Equipment, type Focus } from '../exerciseLibrary';

interface ExercisePickerProps {
  addedIds: string[];
  onAdd: (exerciseId: string) => void;
}

const focuses: Array<Focus | 'all'> = ['all', 'push', 'pull', 'legs', 'core'];
const equipment: Array<Equipment | 'all'> = [
  'all', 'barbell', 'dumbbell', 'machine', 'cable', 'bodyweight', 'kettlebell',
];

export function ExercisePicker({ addedIds, onAdd }: ExercisePickerProps) {
  const { lang } = useLang();
  const t = (key: string) => workoutText(lang, key);
  const [query, setQuery] = useState('');
  const [focus, setFocus] = useState<Focus | 'all'>('all');
  const [tool, setTool] = useState<Equipment | 'all'>('all');
  const exercises = useMemo(() => exerciseLibrary.filter((exercise) => {
    const search = query.trim().toLocaleLowerCase();
    const queryMatch = !search || exercise.name.zh.toLowerCase().includes(search)
      || exercise.name.en.toLowerCase().includes(search);
    return queryMatch && (focus === 'all' || exercise.focus === focus)
      && (tool === 'all' || exercise.equipment === tool);
  }), [focus, query, tool]);

  return <div className="space-y-4">
    <label className="flex h-11 items-center gap-2 rounded-[14px] bg-surface-2 px-3 text-muted">
      <Search size={18} />
      <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t('search')}
        className="min-w-0 flex-1 bg-transparent text-sm text-text outline-none" />
    </label>
    <div className="flex gap-2 overflow-x-auto pb-1">
      {focuses.map((value) => <button key={value} type="button" aria-pressed={focus === value}
        onClick={() => setFocus(value)}
        className={`min-h-11 shrink-0 rounded-full px-3 text-sm font-semibold ${
          focus === value ? 'bg-fit text-white' : 'bg-surface-2 text-muted'
        }`}>
        {t(value === 'all' ? 'all' : `focus.${value}`)}
      </button>)}
    </div>
    <div className="flex gap-2 overflow-x-auto pb-1">
      {equipment.map((value) => <button key={value} type="button" aria-pressed={tool === value}
        onClick={() => setTool(value)}
        className={`min-h-11 shrink-0 rounded-full px-3 text-sm font-semibold ${
          tool === value ? 'bg-fit text-white' : 'bg-surface-2 text-muted'
        }`}>
        {t(value === 'all' ? 'all' : `equipment.${value}`)}
      </button>)}
    </div>
    {exercises.length === 0 && <p role="status" className="py-4 text-sm text-muted">{t('picker.empty')}</p>}
    <div className="divide-y divide-line">
      {exercises.map((exercise) => {
        const added = addedIds.includes(exercise.id);
        return <button key={exercise.id} type="button" disabled={added} onClick={() => onAdd(exercise.id)}
          className="flex min-h-14 w-full items-center justify-between gap-3 py-3 text-left disabled:opacity-50">
          <span className="min-w-0 flex-1"><span className="block break-words text-sm font-semibold text-text">
            {lang === 'en' ? exercise.name.en : exercise.name.zh}
          </span><span className="block text-xs text-muted">{t(`equipment.${exercise.equipment}`)}</span></span>
          {added && <Check className="shrink-0 text-ok" size={18} aria-label={t('picker.added')} />}
        </button>;
      })}
    </div>
  </div>;
}
