import { useState } from 'react';
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

interface StrengthPanelProps {
  data: AppData;
  setData: (data: AppData) => void;
}

const focusLabels: Record<StrengthFocus, string> = {
  push: '推',
  pull: '拉',
  legs: '腿',
  full: '全身',
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
            <p className="min-w-0 text-[16px] font-semibold text-text">
              {exercise.name}
            </p>
          </div>
          <div className="shrink-0 text-right">
            <p className="tabular text-[20px] font-bold text-text">
              {exercise.sets} × {exercise.reps}
            </p>
            <p className="text-xs text-muted">
              休息 {exercise.restSec} 秒
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
  return (
    <Card className="shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
      <button
        type="button"
        className="flex min-h-11 w-full items-center justify-between gap-3 text-left"
        onClick={onToggle}
      >
        <div>
          <p className="text-sm font-semibold text-text">
            {focusLabels[plan.focus]}日課表
          </p>
          <p className="mt-1 text-xs text-muted">{plan.name}</p>
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
  const todayFocus = getTodayFocus(data.lastStrengthFocus);
  const todayPlan =
    data.strengthPlans.find((plan) => plan.focus === todayFocus) ?? null;
  const [completedFocus, setCompletedFocus] =
    useState<StrengthFocus | null>(null);
  const [openPlanId, setOpenPlanId] = useState<string | null>(null);

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
      {todayPlan ? (
        <>
          <Card className="space-y-4 shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
            <p className="text-sm text-muted">今日推薦</p>
            <h2 className="text-[36px] font-extrabold text-fit">
              {focusLabels[todayFocus]}
            </h2>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-fit/10 px-3 py-2 text-sm text-fit">
                {todayPlan.exercises.length} 個動作
              </span>
              <span className="tabular rounded-full bg-fit/10 px-3 py-2 text-sm text-fit">
                約 {estimatedMinutes} 分鐘
              </span>
              <span className="tabular rounded-full bg-fit/10 px-3 py-2 text-sm text-fit">
                {totalSets} 組
              </span>
            </div>
          </Card>

          <Card className="shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
            <ExerciseList exercises={todayPlan.exercises} />
          </Card>

          <button
            type="button"
            className={`flex h-12 w-full items-center justify-center gap-2 rounded-[14px] text-sm font-semibold transition-transform active:scale-[0.97] ${
              isCompleted
                ? 'bg-surface-2 text-muted'
                : 'bg-fit text-white'
            }`}
            disabled={isCompleted}
            onClick={completeWorkout}
          >
            <Check size={18} />
            {isCompleted ? '已完成 ✓' : '完成今天的訓練'}
          </button>
        </>
      ) : (
        <Card className="shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
          <p className="text-[15px] text-muted">尚無今日推薦課表</p>
        </Card>
      )}

      <section className="space-y-3">
        <h2 className="text-[17px] font-bold text-text">其他課表</h2>
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

      <p className="text-xs text-muted">數值為範本，請依個人體能調整</p>
    </div>
  );
}
