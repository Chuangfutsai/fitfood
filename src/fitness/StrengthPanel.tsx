import { useEffect, useState } from 'react';
import {
  Check,
  ChevronDown,
} from 'lucide-react';
import type {
  AppData,
  Exercise,
  StrengthFocus,
  StrengthPlan,
} from '../types';
import { Card } from '../ui/Card';
import { Sheet } from '../ui/Sheet';
import { useLang } from '../i18n/LanguageContext';
import { workoutText } from '../i18n/strings.workout';
import { ExerciseDetailsSheet, LiveWorkout } from './workout/LiveWorkout';
import { WorkoutHistory } from './workout/WorkoutHistory';
import { loadWorkoutState, saveWorkoutState } from './workout/workoutStore';
import type { Session } from './workout/types';
import { removeSession, restoreSession } from './workout/workoutUtils';

interface StrengthPanelProps {
  data: AppData;
  setData: (data: AppData) => void;
}

const focusLabels: Record<StrengthFocus, string> = {
  push: 'strength.focus.push',
  pull: 'strength.focus.pull',
  legs: 'strength.focus.legs',
  full: 'strength.focus.full',
};

function getTodayFocus(lastFocus: StrengthFocus | null): StrengthFocus {
  if (lastFocus === 'push') {
    return 'pull';
  }

  if (lastFocus === 'pull') {
    return 'legs';
  }

  return 'push';
}

function estimateMinutes(exercises: Exercise[]): number {
  const totalSeconds = exercises.reduce(
    (sum, exercise) =>
      sum + exercise.sets * (60 + exercise.restSec),
    0,
  );

  return Math.max(1, Math.ceil(totalSeconds / 60));
}

interface ExerciseListProps {
  exercises: Exercise[];
}

function ExerciseList({ exercises }: ExerciseListProps) {
  const { t, tExercise } = useLang();
  return (
    <div className="divide-y divide-line">
      {exercises.map((exercise, index) => (
        <div
          key={`${exercise.name}-${index}`}
          className="flex items-center justify-between gap-4 py-4"
        >
          <div className="flex min-w-0 items-center gap-3">
            <span className="tabular text-sm font-bold text-fit">
              {String(index + 1).padStart(2, '0')}
            </span>
            <p className="min-w-0 break-words text-[16px] font-semibold text-text">
              {tExercise(exercise.name)}
            </p>
          </div>
          <div className="shrink-0 text-right">
            <p className="tabular text-[20px] font-bold text-text">
              {exercise.sets} × {tExercise(exercise.reps)}
            </p>
            <p className="text-xs text-muted">
              {t('strength.rest', { count: exercise.restSec })}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

interface OtherPlanProps {
  plan: StrengthPlan;
  open: boolean;
  onToggle: () => void;
}

function OtherPlan({ plan, open, onToggle }: OtherPlanProps) {
  const { t, tExercise } = useLang();
  return (
    <Card className="shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
      <button
        type="button"
        className="flex min-h-11 w-full items-center justify-between gap-3 text-left"
        onClick={onToggle}
      >
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-text">
            {t('strength.focusPlan', { focus: t(focusLabels[plan.focus]) })}
          </p>
          <p className="mt-1 truncate text-xs text-muted">{tExercise(plan.name)}</p>
        </div>
        <ChevronDown
          className={`shrink-0 text-muted transition-transform ${
            open ? 'rotate-180' : ''
          }`}
          size={20}
        />
      </button>
      {open && <ExerciseList exercises={plan.exercises} />}
    </Card>
  );
}

export function StrengthPanel({ data, setData }: StrengthPanelProps) {
  const { lang, t } = useLang();
  const todayFocus = getTodayFocus(data.lastStrengthFocus);
  const todayPlan =
    data.strengthPlans.find((plan) => plan.focus === todayFocus) ?? null;
  const [completedFocus, setCompletedFocus] =
    useState<StrengthFocus | null>(null);
  const [openPlanId, setOpenPlanId] = useState<string | null>(null);
  const [workoutOpen, setWorkoutOpen] = useState(false);
  const [hasActiveWorkout, setHasActiveWorkout] = useState(
    () => loadWorkoutState().active !== null,
  );
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historySessions, setHistorySessions] = useState<Session[]>([]);
  const [detailsId, setDetailsId] = useState<string | null>(null);
  const [removed, setRemoved] = useState<{ session: Session; index: number } | null>(null);

  useEffect(() => {
    if (!removed) return;
    const timer = window.setTimeout(() => setRemoved(null), 5000);
    return () => window.clearTimeout(timer);
  }, [removed]);

  const tWorkout = (key: string) => workoutText(lang, key);
  const refreshWorkoutState = () => {
    const fresh = loadWorkoutState();
    setHasActiveWorkout(fresh.active !== null);
    setHistorySessions(fresh.sessions);
    return fresh;
  };
  const openHistory = () => {
    refreshWorkoutState();
    setHistoryOpen(true);
  };
  const deleteSession = (id: string) => {
    const fresh = refreshWorkoutState();
    const result = removeSession(fresh.sessions, id);
    if (!result.removed || !saveWorkoutState({ ...fresh, sessions: result.sessions })) return;
    setHistorySessions(result.sessions);
    setRemoved({ session: result.removed, index: result.index });
  };
  const undoDelete = () => {
    if (!removed) return;
    const fresh = refreshWorkoutState();
    const sessions = restoreSession(fresh.sessions, removed.session, removed.index);
    if (!saveWorkoutState({ ...fresh, sessions })) return;
    setHistorySessions(sessions);
    setRemoved(null);
  };

  const isCompleted = completedFocus === todayFocus;
  const otherPlans = data.strengthPlans.filter(
    (plan) => plan.focus !== todayFocus,
  );
  const totalSets = todayPlan?.exercises.reduce(
    (sum, exercise) => sum + exercise.sets,
    0,
  );
  const estimatedMinutes = todayPlan
    ? estimateMinutes(todayPlan.exercises)
    : 0;

  const completeWorkout = () => {
    setData({
      ...data,
      lastStrengthFocus: todayFocus,
    });
    setCompletedFocus(todayFocus);
  };

  return (
    <div className="space-y-5">
      {workoutOpen ? (
        <LiveWorkout
          plan={todayPlan}
          onClose={() => {
            setWorkoutOpen(false);
            refreshWorkoutState();
          }}
        />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              className={
                'flex h-12 w-full items-center justify-center rounded-[14px] bg-fit text-sm font-semibold text-white'
              }
              onClick={() => setWorkoutOpen(true)}
            >
              {tWorkout(hasActiveWorkout ? 'resume' : 'start')}
            </button>
            <button
              type="button"
              className={
                'flex h-12 w-full items-center justify-center rounded-[14px] bg-surface-2 ' +
                'text-sm font-semibold text-text'
              }
              onClick={openHistory}
            >
              {tWorkout('history')}
            </button>
          </div>
          {removed && (
            <div role="status" className="flex items-center justify-between gap-3 rounded-[14px] bg-surface-2 p-3">
              <span className="text-sm font-semibold text-text">{tWorkout('history.deleted')}</span>
              <button type="button" className="min-h-11 text-sm font-bold text-fit" onClick={undoDelete}>
                {tWorkout('undo')}
              </button>
            </div>
          )}
      {todayPlan ? (
        <>
          <Card className="space-y-4 shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
            <p className="text-sm text-muted">{t('fitness.recommended')}</p>
            <h2 className="text-[36px] font-extrabold text-fit">
              {t(focusLabels[todayFocus])}
            </h2>
            <div className="flex flex-wrap gap-2">
              <span className="max-w-full truncate rounded-full bg-fit/10 px-3 py-2 text-sm text-fit">
                {t('strength.exerciseCount', { count: todayPlan.exercises.length })}
              </span>
              <span className="tabular max-w-full truncate rounded-full bg-fit/10 px-3 py-2 text-sm text-fit">
                {t('strength.estimatedMinutes', { count: estimatedMinutes })}
              </span>
              <span className="tabular max-w-full truncate rounded-full bg-fit/10 px-3 py-2 text-sm text-fit">
                {t('unit.sets', { count: totalSets ?? 0 })}
              </span>
            </div>
          </Card>

          <Card className="shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
            <ExerciseList exercises={todayPlan.exercises} />
          </Card>

          <button
            type="button"
            className={`flex h-12 w-full items-center justify-center gap-2 rounded-[14px] text-sm font-semibold
              transition-transform active:scale-[0.97] ${
              isCompleted
                ? 'bg-surface-2 text-muted'
                : 'bg-fit text-white'
            }`}
            disabled={isCompleted}
            onClick={completeWorkout}
          >
            <Check size={18} />
            <span className="truncate">{t(isCompleted ? 'strength.completed' : 'strength.complete')}</span>
          </button>
        </>
      ) : (
        <Card className="shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
          <p className="text-[15px] text-muted">{t('strength.empty')}</p>
        </Card>
      )}

      <section className="space-y-3">
        <h2 className="text-[17px] font-bold text-text">{t('strength.otherPlans')}</h2>
        {otherPlans.map((plan) => (
          <OtherPlan
            key={plan.id}
            plan={plan}
            open={openPlanId === plan.id}
            onToggle={() =>
              setOpenPlanId((currentId) =>
                currentId === plan.id ? null : plan.id,
              )
            }
          />
        ))}
      </section>

      <p className="text-xs text-muted">{t('fitness.disclaimer')}</p>
        </>
      )}
      <Sheet open={historyOpen} onClose={() => setHistoryOpen(false)} title={tWorkout('history.title')}>
        <WorkoutHistory
          sessions={historySessions}
          onDelete={deleteSession}
          onOpenExercise={setDetailsId}
        />
      </Sheet>
      <ExerciseDetailsSheet
        exerciseId={detailsId}
        sessions={historySessions}
        onClose={() => setDetailsId(null)}
      />
    </div>
  );
}
