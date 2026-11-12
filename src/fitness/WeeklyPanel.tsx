import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, ChevronDown } from 'lucide-react';
import type { AppData, StrengthFocus } from '../types';
import { Card } from '../ui/Card';

interface WeeklyPanelProps {
  data: AppData;
  setData: (data: AppData) => void;
}

const weekdayLabels = ['日', '一', '二', '三', '四', '五', '六'];

const strengthLabels: Record<StrengthFocus, string> = {
  push: '推日重訓',
  pull: '拉日重訓',
  legs: '腿部重訓',
  full: '全身重訓',
};

function getLocalDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export function WeeklyPanel({ data, setData }: WeeklyPanelProps) {
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
            本週已完成{' '}
            <span className="whitespace-nowrap text-fit tabular-nums">
              {completedDays} / {trainingDays.length} 天
            </span>
          </h2>
          <div
            role="progressbar"
            aria-label="本週訓練完成進度"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(progress)}
            aria-valuetext={`已完成 ${completedDays} / ${trainingDays.length} 天`}
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
          const weekday = weekdayLabels[day.date.getDay()];
          const cardioPlan = data.cardioPlans.find(
            (plan) => plan.id === day.cardioPlanId,
          );
          const strengthPlan = data.strengthPlans.find(
            (plan) => plan.focus === day.strengthFocus,
          );
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
                  <span className="rounded-full bg-fit/10 px-2 py-1 text-xs font-bold text-fit">
                    今天
                  </span>
                </div>
              )}

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  aria-label={`星期${weekday} ${day.date.getMonth() + 1}/${day.date.getDate()}訓練詳情`}
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
                    <span className="text-[24px] font-bold text-text">{weekday}</span>
                    <span className="text-xs text-muted tabular-nums">
                      {day.date.getMonth() + 1}/{day.date.getDate()}
                    </span>
                    <ChevronDown
                      aria-hidden="true"
                      size={16}
                      className={`text-muted transition-transform ${expanded ? 'rotate-180' : ''}`}
                    />
                  </span>
                  <span className="flex min-w-0 flex-1 flex-wrap gap-2">
                    {day.cardioPlanId !== null && (
                      <span className="rounded-[12px] bg-fit/10 px-3 py-2 text-xs font-medium leading-5 text-fit">
                        {cardioPlan
                          ? `${cardioPlan.name} · ${cardioPlan.minutes} 分`
                          : '找不到有氧課表'}
                      </span>
                    )}
                    {day.strengthFocus !== null && (
                      <span className="rounded-[12px] bg-surface-2 px-3 py-2 text-xs font-medium text-text">
                        {strengthLabels[day.strengthFocus]}
                      </span>
                    )}
                    {day.isRestDay && (
                      <span className="text-[15px] text-muted">休息日</span>
                    )}
                  </span>
                </button>

                {!day.isRestDay && (
                  <button
                    type="button"
                    aria-label={`星期${weekday} ${day.date.getMonth() + 1}/${day.date.getDate()}訓練完成`}
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
                      <h3 className="text-[15px] font-semibold text-fit">有氧訓練</h3>
                      {cardioPlan ? (
                        <ol>
                          {cardioPlan.steps.map((step, index) => (
                            <li
                              key={`${cardioPlan.id}-${index}`}
                              className="relative flex gap-3 pb-4 last:pb-0"
                            >
                              <span className="relative flex w-3 shrink-0 justify-center">
                                <span className="relative z-10 mt-2 h-2 w-2 rounded-full bg-fit" />
                                {index < cardioPlan.steps.length - 1 && (
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
                        <p className="text-sm text-muted">找不到此有氧課表。</p>
                      )}
                    </section>
                  )}

                  {day.strengthFocus !== null && (
                    <section className="space-y-3">
                      <h3 className="text-[15px] font-semibold text-text">
                        {strengthLabels[day.strengthFocus]}
                      </h3>
                      {strengthPlan ? (
                        <ul className="divide-y divide-line">
                          {strengthPlan.exercises.map((exercise, index) => (
                            <li
                              key={`${strengthPlan.id}-${index}`}
                              className="flex items-start justify-between gap-3 py-3"
                            >
                              <p className="min-w-0 flex-1 text-[15px] font-medium text-text">
                                {exercise.name}
                              </p>
                              <div className="w-24 shrink-0 text-right">
                                <p className="text-[15px] font-bold text-text tabular-nums">
                                  {exercise.sets} × {exercise.reps}
                                </p>
                                <p className="mt-1 text-xs text-muted tabular-nums">
                                  休息 {exercise.restSec} 秒
                                </p>
                              </div>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-muted">找不到此重訓課表。</p>
                      )}
                    </section>
                  )}

                  {day.isRestDay && (
                    <p className="text-[15px] text-muted">休息日，今天沒有安排訓練。</p>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <p className="text-xs text-muted">排程為範本，請依個人體能調整</p>
    </div>
  );
}
