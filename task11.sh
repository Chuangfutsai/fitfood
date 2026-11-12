cat > src/fitness/CardioPanel.tsx <<'EOF'
import { useRef, useState } from 'react';
import {
  Footprints,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import type { AppData, CardioMachine } from '../types';
import { Card } from '../ui/Card';

interface CardioPanelProps {
  data: AppData;
  setData: (data: AppData) => void;
}

interface MachineImageProps {
  machine: CardioMachine;
  className: string;
}

function MachineImage({ machine, className }: MachineImageProps) {
  const [hasError, setHasError] = useState(false);
  const Icon = machine === 'treadmill' ? Footprints : TrendingUp;
  const name = machine === 'treadmill' ? '跑步機' : '爬樓機';

  if (hasError) {
    return (
      <div
        className={`flex items-center justify-center bg-fit/10 ${className}`}
      >
        <Icon className="text-fit" size={36} />
      </div>
    );
  }

  return (
    <img
      src={`/fitness/${machine}.jpg`}
      alt={name}
      className={`object-cover ${className}`}
      onError={() => setHasError(true)}
    />
  );
}

export function CardioPanel(_props: CardioPanelProps) {
  const { data } = _props;
  const [machine, setMachine] = useState<CardioMachine>('treadmill');
  const [recommendedId, setRecommendedId] = useState<string | null>(null);
  const planRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const plans = data.cardioPlans.filter((plan) => plan.machine === machine);

  const recommendPlan = () => {
    if (plans.length === 0) {
      return;
    }

    const plan = plans[Math.floor(Math.random() * plans.length)];

    setRecommendedId(plan.id);

    requestAnimationFrame(() => {
      planRefs.current[plan.id]?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    });
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3">
        {(['treadmill', 'stairclimber'] as CardioMachine[]).map(
          (machineOption) => {
            const selected = machine === machineOption;
            const label =
              machineOption === 'treadmill' ? '跑步機' : '爬樓機';

            return (
              <button
                key={machineOption}
                type="button"
                className="min-w-0 text-left transition-transform active:scale-[0.97]"
                onClick={() => setMachine(machineOption)}
              >
                <Card
                  className={`h-full p-3 shadow-[0_8px_24px_rgba(15,23,42,0.06)] ${
                    selected ? 'border-2! border-fit!' : 'border border-line'
                  }`}
                >
                  <MachineImage
                    machine={machineOption}
                    className="aspect-square w-full rounded-[14px]"
                  />
                  <p className="pt-3 text-center text-[15px] font-semibold text-text">
                    {label}
                  </p>
                </Card>
              </button>
            );
          },
        )}
      </div>

      <button
        type="button"
        className="flex h-12 w-full items-center justify-center gap-2 rounded-[14px] bg-fit text-sm font-semibold text-white transition-transform active:scale-[0.97]"
        onClick={recommendPlan}
      >
        <Sparkles size={18} />
        今日推薦
      </button>

      <div className="space-y-3">
        {plans.map((plan) => {
          const recommended = plan.id === recommendedId;

          return (
            <div
              key={plan.id}
              ref={(element) => {
                planRefs.current[plan.id] = element;
              }}
            >
              <Card
                className={`relative shadow-[0_8px_24px_rgba(15,23,42,0.06)] ${
                  recommended ? 'border-2! border-fit!' : ''
                }`}
              >
                {recommended && (
                  <span className="absolute right-4 top-4 rounded-full bg-fit/10 px-2 py-1 text-xs font-medium text-fit">
                    今日推薦
                  </span>
                )}

                <div className="mb-5 flex items-start justify-between gap-3">
                  <h2 className="pr-2 text-[17px] font-bold text-text">
                    {plan.name}
                  </h2>
                  <div className="shrink-0 text-right">
                    <span className="tabular text-[28px] font-extrabold text-fit">
                      {plan.minutes}
                    </span>
                    <span className="ml-1 text-xs text-muted">分鐘</span>
                  </div>
                </div>

                <div className="space-y-0">
                  {plan.steps.map((step, index) => {
                    const isLast = index === plan.steps.length - 1;

                    return (
                      <div key={step} className="relative flex gap-3 pb-4">
                        <div className="relative flex w-3 shrink-0 justify-center">
                          <span className="z-10 mt-1 h-3 w-3 rounded-full bg-fit" />
                          {!isLast && (
                            <span className="absolute top-4 h-full w-px bg-fit/30" />
                          )}
                        </div>
                        <p className="min-w-0 text-[15px] leading-6 text-text">
                          {step}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-muted">數值為範本，請依個人體能調整</p>
    </div>
  );
}
EOF
cat > src/fitness/StrengthPanel.tsx <<'EOF'
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
EOF
npm run build 2>&1 | tail -5
