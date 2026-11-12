import { motion } from 'framer-motion';
import { useRef, useState } from 'react';

interface WheelItem {
  id: string;
  label: string;
}

interface WheelProps {
  items: WheelItem[];
  onResult: (id: string) => void;
}

const CENTER = 180;
const RADIUS = 140;
const LABEL_RADIUS = 96;

function normalizeAngle(angle: number): number {
  return ((angle % 360) + 360) % 360;
}

function pointOnCircle(radius: number, angle: number) {
  const radians = (angle * Math.PI) / 180;

  return {
    x: CENTER + radius * Math.cos(radians),
    y: CENTER + radius * Math.sin(radians),
  };
}

function createSlicePath(startAngle: number, endAngle: number): string {
  const start = pointOnCircle(RADIUS, startAngle);
  const end = pointOnCircle(RADIUS, endAngle);
  const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;

  return [
    `M ${CENTER} ${CENTER}`,
    `L ${start.x} ${start.y}`,
    `A ${RADIUS} ${RADIUS} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`,
    'Z',
  ].join(' ');
}

export function Wheel({ items, onResult }: WheelProps) {
  const wheelItems = items.slice(0, 12);
  const [angle, setAngle] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const currentAngleRef = useRef(0);
  const pendingResultRef = useRef<string | null>(null);

  if (wheelItems.length < 2) {
    return null;
  }

  const sliceAngle = 360 / wheelItems.length;
  const startAngle = -90 - sliceAngle / 2;

  const getWinningIndex = (wheelAngle: number): number => {
    // The pointer is fixed at -90°. Rotating the wheel clockwise by wheelAngle
    // means the pointer reads the wheel's local angle of -90° - wheelAngle.
    const localPointerAngle = normalizeAngle(-90 - wheelAngle);
    const relativeAngle = normalizeAngle(localPointerAngle - startAngle);

    return Math.floor(relativeAngle / sliceAngle) % wheelItems.length;
  };

  const handleSpin = () => {
    if (isSpinning) {
      return;
    }

    const turns = 4 + Math.floor(Math.random() * 3);
    const randomAngle = Math.random() * 360;
    const nextAngle = currentAngleRef.current + turns * 360 + randomAngle;
    const winningIndex = getWinningIndex(nextAngle);

    currentAngleRef.current = nextAngle;
    pendingResultRef.current = wheelItems[winningIndex].id;
    setIsSpinning(true);
    setAngle(nextAngle);
  };

  const handleAnimationComplete = () => {
    const resultId = pendingResultRef.current;

    if (!resultId) {
      return;
    }

    pendingResultRef.current = null;
    setIsSpinning(false);

    if ('vibrate' in navigator) {
      navigator.vibrate(30);
    }

    onResult(resultId);
  };

  return (
    <div className="relative mx-auto aspect-square w-[min(calc(100vw-40px),360px)]">
      <svg
        viewBox="0 0 360 360"
        className="h-full w-full"
        role="img"
        aria-label="菜色轉盤"
      >
        <circle
          cx={CENTER}
          cy={CENTER}
          r={RADIUS + 4}
          className="fill-none stroke-food opacity-30 blur-sm"
          strokeWidth="5"
        />
        <motion.g
          animate={{ rotate: angle }}
          style={{
            transformBox: 'view-box',
            transformOrigin: `${CENTER}px ${CENTER}px`,
          }}
          transition={{
            duration: 3.5,
            ease: [0.12, 0.8, 0.2, 1],
          }}
          onAnimationComplete={handleAnimationComplete}
        >
          {wheelItems.map((item, index) => {
            const sliceStart = startAngle + index * sliceAngle;
            const sliceEnd = sliceStart + sliceAngle;
            const labelAngle = sliceStart + sliceAngle / 2;
            const labelPosition = pointOnCircle(LABEL_RADIUS, labelAngle);
            const label =
              item.label.length > 6
                ? `${item.label.slice(0, 6)}…`
                : item.label;

            return (
              <g key={item.id}>
                <path
                  d={createSlicePath(sliceStart, sliceEnd)}
                  className={
                    index % 2 === 0 ? 'fill-food/20' : 'fill-surface-2'
                  }
                />
                <path
                  d={createSlicePath(sliceStart, sliceEnd)}
                  className="fill-none stroke-line"
                  strokeWidth="1"
                />
                <text
                  x={labelPosition.x}
                  y={labelPosition.y}
                  className="fill-text text-[13px]"
                  dominantBaseline="middle"
                  textAnchor="middle"
                  transform={`rotate(${labelAngle} ${labelPosition.x} ${labelPosition.y})`}
                >
                  {label}
                </text>
              </g>
            );
          })}
          <circle
            cx={CENTER}
            cy={CENTER}
            r={RADIUS}
            className="fill-none stroke-food"
            strokeWidth="2"
          />
        </motion.g>
        <path
          d="M 168 12 L 192 12 L 180 38 Z"
          className="fill-food drop-shadow-[0_0_8px] drop-shadow-food/70"
        />
      </svg>

      <button
        type="button"
        className="absolute left-1/2 top-1/2 flex h-[72px] w-[72px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-food text-lg font-bold text-bg shadow-[0_0_24px] shadow-food/35 transition-transform active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50"
        disabled={isSpinning}
        onClick={handleSpin}
      >
        轉
      </button>
    </div>
  );
}
