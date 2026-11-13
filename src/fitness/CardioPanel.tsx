import { useRef, useState } from 'react';
import {
  Footprints,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import type { AppData, CardioMachine } from '../types';
import { Card } from '../ui/Card';
import { useLang } from '../i18n/LanguageContext';

interface CardioPanelProps {
  data: AppData;
  setData: (data: AppData) => void;
}

interface MachineImageProps {
  machine: CardioMachine;
  className: string;
}

const machines: CardioMachine[] = [
  'treadmill',
  'stairclimber',
  'elliptical',
  'spinbike',
  'recumbent',
  'rower',
  'airbike',
  'skierg',
];

function MachineImage({ machine, className }: MachineImageProps) {
  const { t } = useLang();
  const [hasError, setHasError] = useState(false);
  const Icon = machine === 'treadmill' ? Footprints : TrendingUp;
  const name = t(`cardio.machine.${machine}`);

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
  const { t, tCardio } = useLang();
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
      <div
        role="group"
        aria-label={t('cardio.chooseMachine')}
        className="flex snap-x snap-mandatory gap-6 overflow-x-auto pb-2"
      >
        {machines.map(
          (machineOption) => {
            const selected = machine === machineOption;
            const label = t(`cardio.machine.${machineOption}`);

            return (
              <button
                key={machineOption}
                type="button"
                className="basis-[38%] shrink-0 snap-start text-left transition-transform active:scale-[0.97]"
                aria-pressed={selected}
                onClick={() => setMachine(machineOption)}
              >
                <Card
                  className={`h-full p-2! shadow-[0_8px_24px_rgba(15,23,42,0.06)] ${
                    selected ? 'border-2! border-fit!' : 'border border-line'
                  }`}
                >
                  <MachineImage
                    machine={machineOption}
                    className="aspect-square w-full rounded-[14px]"
                  />
                  <p className="mt-2 line-clamp-2 h-10 text-center text-sm font-semibold leading-5 text-text">
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
        className="flex h-12 w-full items-center justify-center gap-2 rounded-[14px]
          bg-fit text-sm font-semibold text-white transition-transform active:scale-[0.97]"
        onClick={recommendPlan}
      >
        <Sparkles size={18} />
        <span>{t('cardio.recommend')}</span>
      </button>

      <div className="space-y-3">
        {plans.map((plan) => {
          const recommended = plan.id === recommendedId;
          const translatedPlan = tCardio(plan);

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
                  <span className={
                    'absolute right-4 top-4 max-w-[calc(100%-32px)] rounded-full ' +
                    'bg-fit/10 px-2 py-1 text-xs font-medium text-fit'
                  }>
                    {t('fitness.recommended')}
                  </span>
                )}

                <div className={`mb-5 flex items-start justify-between gap-3 ${recommended ? 'pt-7' : ''}`}>
                  <h2 className="min-w-0 break-words pr-2 text-[17px] font-bold text-text">
                    {translatedPlan.name}
                  </h2>
                  <div className="shrink-0 text-right">
                    <span className="tabular text-[28px] font-extrabold text-fit">
                      {plan.minutes}
                    </span>
                    <span className="ml-1 text-xs text-muted">{t('unit.minutesLabel')}</span>
                  </div>
                </div>

                <div className="space-y-0">
                  {translatedPlan.steps.map((step, index) => {
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

      <p className="text-xs text-muted">{t('fitness.disclaimer')}</p>
    </div>
  );
}
