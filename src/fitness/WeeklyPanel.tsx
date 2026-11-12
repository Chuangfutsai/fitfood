import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, ChevronDown } from 'lucide-react';
import type { AppData, StrengthFocus } from '../types';
import { Card } from '../ui/Card';
import { useLang } from '../i18n/LanguageContext';

interface WeeklyPanelProps {
  data: AppData;
  setData: (data: AppData) => void;
}

const strengthLabels: Record<StrengthFocus, string> = {
  push: 'weekly.strength.push',
  pull: 'weekly.strength.pull',
  legs: 'weekly.strength.legs',
  full: 'weekly.strength.full',
};

function getLocalDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export function WeeklyPanel({ data, setData }: WeeklyPanelProps) {
  const { lang, t, tCardio, tExercise, formatDate } = useLang();
  const [today, setToday] = useState(() => new Date());
  const [expandedDate, setExpandedDate] = useState<string | null>(null);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    const scheduleNextDay = () => {
      const now = new Date();
      const midnight = new Date(now);
      midnight.setHours(24, 0, 0, 0);
      timer = setTimeout(updateToday, midnight.getTime() - now.getTime() + 100);
    };

    const updateToday = () => {
      clearTimeout(timer);
      setToday(new Date());
      scheduleNextDay();
    };

    scheduleNextDay();
    window.addEventListener('focus', updateToday);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('focus', updateToday);
    };
  }, []);

  const todayKey = getLocalDateKey(today);
  const monday = new Date(today);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));

  const week = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(monday);
    // Calendar-day arithmetic keeps the local week correct across DST changes.
    date.setDate(monday.getDate() + index);
    const schedule = data.weeklyPlan.find(
      (day) => day.weekday === date.getDay(),
    );
    const cardioPlanId = schedule?.cardioPlanId ?? null;
    const strengthFocus = schedule?.strengthFocus ?? null;

    return {
      date,
      key: getLocalDateKey(date),
      cardioPlanId,
      strengthFocus,
      isRestDay: cardioPlanId === null && strengthFocus === null,
    };
  });

  const trainingDays = week.filter((day) => !day.isRestDay);
  const completedDays = trainingDays.filter(
    (day) => data.weeklyLog[day.key] === true,
  ).length;
  const progress =
    trainingDays.length === 0 ? 0 : (completedDays / trainingDays.length) * 100;

  const toggleCompleted = (dateKey: string) => {
    setData({
      ...data,
      weeklyLog: {
        ...data.weeklyLog,
        [dateKey]: data.weeklyLog[dateKey] !== true,
      },
    });
  };

  return (
    <div className="space-y-5">
      <Card className="shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
        <div className="space-y-4">
          <h2 className="text-[24px] font-extrabold leading-8 text-text">
            {t('weekly.completedLabel')}{' '}
            <span className="whitespace-nowrap text-fit tabular-nums">
              {t('weekly.completedDays', { count: completedDays, total: trainingDays.length })}
            </span>
          </h2>
          <div
            role="progressbar"
            aria-label={t('weekly.progressLabel')}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(progress)}
            aria-valuetext={t('weekly.progressValue', { count: completedDays, total: trainingDays.length })}
            className="h-3 overflow-hidden rounded-full bg-surface-2"
          >
            <motion.div
              className="h-full rounded-full bg-fit"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
            />
          </div>
        </div>
      </Card>

      <div className="space-y-2">
        {week.map((day) => {
          const isToday = day.key === todayKey;
          const completed = data.weeklyLog[day.key] === true;
          const expanded = expandedDate === day.key;
          const weekday = formatDate(day.date, { weekday: lang === 'en' ? 'short' : 'narrow' });
          const cardioPlan = data.cardioPlans.find(
            (plan) => plan.id === day.cardioPlanId,
          );
          const strengthPlan = data.strengthPlans.find(
            (plan) => plan.focus === day.strengthFocus,
          );
          const translatedCardio = cardioPlan ? tCardio(cardioPlan) : null;
          const detailsId = `weekly-details-${day.key}`;

          return (
            <Card
              key={day.key}
              className={`shadow-[0_8px_24px_rgba(15,23,42,0.06)] ${
                isToday ? 'border-2! border-fit!' : ''
              }`}
            >
              {isToday && (
                <div className="mb-2 flex justify-end">
                  <span className="max-w-full truncate rounded-full bg-fit/10 px-2 py-1 text-xs font-bold text-fit">
                    {t('weekly.today')}
                  </span>
                </div>
              )}

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  aria-label={t('weekly.detailsLabel', { date: formatDate(day.date) })}
                  aria-expanded={expanded}
                  aria-controls={detailsId}
                  className="flex min-h-11 min-w-0 flex-1 items-center gap-3 rounded-[14px] text-left transition-transform active:scale-[0.97]"
                  onClick={() =>
                    setExpandedDate((current) =>
                      current === day.key ? null : day.key,
                    )
                  }
                >
                  <span className="flex w-10 shrink-0 flex-col items-center gap-1">
                    <span className={`${lang === 'en' ? 'text-[16px]' : 'text-[24px]'} max-w-full truncate font-bold text-text`}>{weekday}</span>
                    <span className="text-xs text-muted tabular-nums">
                      {formatDate(day.date, { month: 'numeric', day: 'numeric' })}
                    </span>
                    <ChevronDown
                      aria-hidden="true"
                      size={16}
                      className={`text-muted transition-transform ${expanded ? 'rotate-180' : ''}`}
                    />
                  </span>
                  <span className="flex min-w-0 flex-1 flex-wrap gap-2">
                    {day.cardioPlanId !== null && (
                      <span className="max-w-full truncate rounded-[12px] bg-fit/10 px-3 py-2 text-xs font-medium leading-5 text-fit">
                        {translatedCardio
                          ? `${translatedCardio.name} · ${t('unit.minuteShort', { count: translatedCardio.minutes })}`
                          : t('weekly.cardioMissing')}
                      </span>
                    )}
                    {day.strengthFocus !== null && (
                      <span className="max-w-full truncate rounded-[12px] bg-surface-2 px-3 py-2 text-xs font-medium text-text">
                        {t(strengthLabels[day.strengthFocus])}
                      </span>
                    )}
                    {day.isRestDay && (
                      <span className="truncate text-[15px] text-muted">{t('weekly.restDay')}</span>
                    )}
                  </span>
                </button>

                {!day.isRestDay && (
                  <button
                    type="button"
                    aria-label={t('weekly.completeLabel', { date: formatDate(day.date) })}
                    aria-pressed={completed}
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-transform active:scale-[0.97] ${
                      completed
                        ? 'bg-fit text-white'
                        : 'border-2 border-line text-muted'
                    }`}
                    onClick={() => toggleCompleted(day.key)}
                  >
                    {completed && <Check aria-hidden="true" size={20} strokeWidth={2} />}
                  </button>
                )}
              </div>

              <div id={detailsId} hidden={!expanded}>
                <div className="mt-4 space-y-4 border-t border-line pt-4">
                  {day.cardioPlanId !== null && (
                    <section className="space-y-3">
                      <h3 className="text-[15px] font-semibold text-fit">{t('weekly.cardioHeading')}</h3>
                      {translatedCardio ? (
                        <ol>
                          {translatedCardio.steps.map((step, index) => (
                            <li
                              key={`${translatedCardio.id}-${index}`}
                              className="relative flex gap-3 pb-4 last:pb-0"
                            >
                              <span className="relative flex w-3 shrink-0 justify-center">
                                <span className="relative z-10 mt-2 h-2 w-2 rounded-full bg-fit" />
                                {index < translatedCardio.steps.length - 1 && (
                                  <span className="absolute top-3 -bottom-3 w-px bg-fit/30" />
                                )}
                              </span>
                              <p className="min-w-0 text-[15px] leading-6 text-text">
                                {step}
                              </p>
                            </li>
                          ))}
                        </ol>
                      ) : (
                        <p className="text-sm text-muted">{t('weekly.cardioMissingDetail')}</p>
                      )}
                    </section>
                  )}

                  {day.strengthFocus !== null && (
                    <section className="space-y-3">
                      <h3 className="text-[15px] font-semibold text-text">
                        {t(strengthLabels[day.strengthFocus])}
                      </h3>
                      {strengthPlan ? (
                        <ul className="divide-y divide-line">
                          {strengthPlan.exercises.map((exercise, index) => (
                            <li
                              key={`${strengthPlan.id}-${index}`}
                              className="flex items-start justify-between gap-3 py-3"
                            >
                              <p className="min-w-0 flex-1 break-words text-[15px] font-medium text-text">
                                {tExercise(exercise.name)}
                              </p>
                              <div className="w-24 shrink-0 text-right">
                                <p className="text-[15px] font-bold text-text tabular-nums">
                                  {exercise.sets} × {tExercise(exercise.reps)}
                                </p>
                                <p className="mt-1 text-xs text-muted tabular-nums">
                                  {t('strength.rest', { count: exercise.restSec })}
                                </p>
                              </div>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-muted">{t('weekly.strengthMissing')}</p>
                      )}
                    </section>
                  )}

                  {day.isRestDay && (
                    <p className="text-[15px] text-muted">{t('weekly.restDetail')}</p>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <p className="text-xs text-muted">{t('weekly.disclaimer')}</p>
    </div>
  );
}
