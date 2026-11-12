import { motion } from 'framer-motion';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useLang } from '../i18n/LanguageContext';
import { dishTranslations } from '../i18n/dataTranslations';

interface WheelItem {
  id: string;
  label: string;
}

interface WheelProps {
  items: WheelItem[];
  onResult: (id: string) => void;
  onSpinningChange?: (spinning: boolean) => void;
}

const CENTER_X = 180;
const CENTER_Y = 200;
const WHEEL_RADIUS = 150;
const LABEL_RADIUS = 98;
const OUTER_RADIUS = 170;

const sliceColors = [
  { fill: 'fill-tomato', text: 'fill-tomato-ink' },
  { fill: 'fill-carrot', text: 'fill-carrot-ink' },
  { fill: 'fill-corn', text: 'fill-corn-ink' },
  { fill: 'fill-lettuce', text: 'fill-lettuce-ink' },
  { fill: 'fill-eggplant', text: 'fill-eggplant-ink' },
  { fill: 'fill-mint', text: 'fill-mint-ink' },
  { fill: 'fill-radish', text: 'fill-radish-ink' },
  { fill: 'fill-broccoli', text: 'fill-broccoli-ink' },
];

function normalizeAngle(angle: number): number {
  return ((angle % 360) + 360) % 360;
}

function pointOnCircle(
  radius: number,
  angle: number,
): { x: number; y: number } {
  const radians = (angle * Math.PI) / 180;

  return {
    x: CENTER_X + radius * Math.cos(radians),
    y: CENTER_Y + radius * Math.sin(radians),
  };
}

function createSlicePath(startAngle: number, endAngle: number): string {
  const start = pointOnCircle(WHEEL_RADIUS, startAngle);
  const end = pointOnCircle(WHEEL_RADIUS, endAngle);
  const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;

  return [
    `M ${CENTER_X} ${CENTER_Y}`,
    `L ${start.x} ${start.y}`,
    `A ${WHEEL_RADIUS} ${WHEEL_RADIUS} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`,
    'Z',
  ].join(' ');
}

function splitLabel(label: string, isEnglish: boolean): string[] {
  if (isEnglish) {
    const words = label.trim().split(/\s+/);
    const lines: string[] = [];

    while (words.length > 0 && lines.length < 2) {
      const lineWords: string[] = [];

      while (
        words.length > 0 &&
        [...lineWords, words[0]].join(' ').length <= 12
      ) {
        lineWords.push(words.shift()!);
      }

      if (lineWords.length === 0) {
        lines.push('…');
        break;
      }

      if (lines.length === 1 && words.length > 0) {
        while (lineWords.join(' ').length + 1 > 12) {
          lineWords.pop();
        }
        lines.push(`${lineWords.join(' ')}…`);
      } else {
        lines.push(lineWords.join(' '));
      }
    }

    return lines;
  }

  if (label.length <= 4) {
    return [label];
  }

  const trimmedLabel =
    label.length > 10 ? `${label.slice(0, 9)}…` : label;
  const splitIndex = Math.ceil(trimmedLabel.length / 2);

  return [
    trimmedLabel.slice(0, splitIndex),
    trimmedLabel.slice(splitIndex),
  ];
}

function EnglishWheelLabel({ item, centerAngle, wheelAngle, color }: {
  item: WheelItem;
  centerAngle: number;
  wheelAngle: number;
  color: string;
}) {
  const shortName = dishTranslations[item.id]?.wheelEn;
  const label = (shortName ?? item.label).trim().replace(/\s+/g, ' ');
  const [lines, setLines] = useState<string[]>([label]);
  const measurementRef = useRef<SVGTSpanElement>(null);
  const ellipsisRef = useRef<SVGTSpanElement>(null);
  const position = pointOnCircle(100, centerAngle);
  const screenAngle = normalizeAngle(centerAngle + wheelAngle);
  const isLeftHalf = screenAngle > 90 && screenAngle < 270;

  useLayoutEffect(() => {
    let cancelled = false;

    const measure = () => {
      const text = measurementRef.current;
      const ellipsis = ellipsisRef.current;
      if (cancelled || !text || !ellipsis || !label) return;

      // At r=100, an 88px line leaves room for the rim and the center button.
      // Two 16px-spaced lines also stay clear of the narrowest (45°) sector edges.
      const availableWidth = 88;
      const words = label.split(' ');
      const offsets: number[] = [];
      let offset = 0;
      for (const word of words) {
        offsets.push(offset);
        offset += word.length + 1;
      }
      const width = (start: number, end: number) => end <= start ? 0 :
        text.getSubStringLength(offsets[start], offsets[end - 1] + words[end - 1].length - offsets[start]);
      let nextLines: string[];

      if (width(0, words.length) <= availableWidth) {
        nextLines = [label];
      } else if (shortName) {
        // Default short names contain at most two complete words; never truncate them.
        nextLines = words;
      } else {
        nextLines = [];
        let start = 0;
        for (let line = 0; line < 2 && start < words.length; line += 1) {
          let end = start;
          while (end < words.length && width(start, end + 1) <= availableWidth) end += 1;

          if (end === start) {
            nextLines.push('…');
            break;
          }
          if (line === 1 && end < words.length) {
            while (end > start && width(start, end) + ellipsis.getComputedTextLength() > availableWidth) end -= 1;
            nextLines.push(words.slice(start, end).join(' ') + '…');
          } else {
            nextLines.push(words.slice(start, end).join(' '));
          }
          start = end;
        }
      }

      setLines((previous) => previous.join('\n') === nextLines.join('\n') ? previous : nextLines);
    };

    measure();
    void document.fonts.ready.then(measure);
    document.fonts.addEventListener('loadingdone', measure);
    return () => {
      cancelled = true;
      document.fonts.removeEventListener('loadingdone', measure);
    };
  }, [label, shortName]);

  return (
    <>
      <text visibility="hidden" aria-hidden="true" className="pointer-events-none text-[14px] font-semibold">
        <tspan ref={measurementRef}>{label}</tspan>
        <tspan ref={ellipsisRef}>…</tspan>
      </text>
      <text
        data-wheel-label={item.id}
        data-wheel-center={centerAngle}
        data-wheel-angle={wheelAngle}
        x={position.x}
        y={position.y}
        className={`${color} text-[14px] font-semibold`}
        dominantBaseline="middle"
        textAnchor="middle"
        transform={`rotate(${centerAngle + (isLeftHalf ? 180 : 0)} ${position.x} ${position.y})`}
        aria-label={item.label}
      >
        {/* Include the wheel's final rotation when flipping: every stopped label reads upright. */}
        <title>{item.label}</title>
        {lines.map((line, index) => (
          <tspan key={index} x={position.x} y={position.y + (index - (lines.length - 1) / 2) * 16}>
            {line}
          </tspan>
        ))}
      </text>
    </>
  );
}

export function Wheel({ items, onResult, onSpinningChange }: WheelProps) {
  const { lang, t } = useLang();
  const choices = items.slice(0, 8);
  // Repeat two or three distinct choices evenly without adjacent duplicates.
  const wheelItems = choices.length >= 2 && choices.length <= 3
    ? Array.from({ length: 6 }, (_, index) => choices[index % choices.length])
    : choices;
  const [angle, setAngle] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [isFlashing, setIsFlashing] = useState(false);
  const [winnerIndex, setWinnerIndex] = useState<number | null>(null);
  const currentAngleRef = useRef(0);
  const pendingResultRef = useRef<string | null>(null);
  const pendingWinnerIndexRef = useRef<number | null>(null);

  useEffect(() => () => onSpinningChange?.(false), [onSpinningChange]);

  if (wheelItems.length < 2) {
    return null;
  }

  const sliceAngle = 360 / wheelItems.length;
  const startAngle = -90 - sliceAngle / 2;

  const getWinningIndex = (wheelAngle: number): number => {
    // The pointer stays fixed at -90°. A clockwise wheel rotation means the
    // pointer reads the wheel's local angle of -90° minus wheelAngle.
    const localPointerAngle = normalizeAngle(-90 - wheelAngle);
    const relativeAngle = normalizeAngle(localPointerAngle - startAngle);

    return Math.floor(relativeAngle / sliceAngle) % wheelItems.length;
  };

  const handleSpin = () => {
    if (isSpinning || isFlashing) {
      return;
    }

    const turns = 4 + Math.floor(Math.random() * 3);
    const randomAngle = Math.random() * 360;
    const nextAngle = currentAngleRef.current + turns * 360 + randomAngle;
    const nextWinnerIndex = getWinningIndex(nextAngle);

    currentAngleRef.current = nextAngle;
    pendingWinnerIndexRef.current = nextWinnerIndex;
    pendingResultRef.current = wheelItems[nextWinnerIndex].id;
    onSpinningChange?.(true);
    setWinnerIndex(null);
    setIsSpinning(true);
    setAngle(nextAngle);
  };

  const handleWheelAnimationComplete = () => {
    if (!pendingResultRef.current || pendingWinnerIndexRef.current === null) {
      return;
    }

    setWinnerIndex(pendingWinnerIndexRef.current);
    setIsSpinning(false);
    setIsFlashing(true);
  };

  const handleFlashComplete = () => {
    const resultId = pendingResultRef.current;

    if (!isFlashing || !resultId) {
      return;
    }

    pendingResultRef.current = null;
    pendingWinnerIndexRef.current = null;
    setIsFlashing(false);
    onSpinningChange?.(false);

    if ('vibrate' in navigator) {
      navigator.vibrate(30);
    }

    onResult(resultId);
  };

  return (
    <div className="relative mx-auto aspect-[360/380] w-[min(calc(100vw-40px),360px)]">
      <svg
        viewBox="0 0 360 380"
        className="h-full w-full"
        role="img"
        aria-label={t('wheel.label')}
      >
        <circle
          cx={CENTER_X}
          cy={CENTER_Y}
          r={OUTER_RADIUS}
          className="fill-white stroke-line"
          strokeWidth="1"
        />

        {Array.from({ length: 24 }, (_, index) => {
          const dotAngle = -90 + (index * 360) / 24;
          const position = pointOnCircle(OUTER_RADIUS, dotAngle);

          return (
            <circle
              key={index}
              cx={position.x}
              cy={position.y}
              r="3.5"
              className={
                index % 2 === 0 ? 'fill-broccoli' : 'fill-carrot'
              }
            />
          );
        })}

        <motion.g
          animate={{ rotate: angle }}
          style={{
            transformBox: 'view-box',
            transformOrigin: `${CENTER_X}px ${CENTER_Y}px`,
          }}
          transition={{
            duration: 3.5,
            ease: [0.12, 0.8, 0.2, 1],
          }}
          onAnimationComplete={handleWheelAnimationComplete}
        >
          {wheelItems.map((item, index) => {
            const sliceStart = startAngle + index * sliceAngle;
            const sliceEnd = sliceStart + sliceAngle;
            const centerAngle = sliceStart + sliceAngle / 2;
            const labelPosition = pointOnCircle(LABEL_RADIUS, centerAngle);
            const color = sliceColors[index];
            const labelLines = splitLabel(item.label, lang === 'en');
            const isWinner = winnerIndex === index;

            return (
              <g key={`${item.id}-${index}`} data-wheel-slot={index} data-dish-id={item.id}>
                <motion.path
                  d={createSlicePath(sliceStart, sliceEnd)}
                  className={`${color.fill} stroke-white`}
                  strokeWidth="2"
                  animate={
                    isWinner && isFlashing
                      ? { opacity: [1, 0.4, 1, 0.4, 1] }
                      : { opacity: 1 }
                  }
                  transition={{
                    duration: 0.6,
                    ease: 'linear',
                  }}
                  onAnimationComplete={
                    isWinner ? handleFlashComplete : undefined
                  }
                />
                {lang === 'en' ? (
                  <EnglishWheelLabel item={item} centerAngle={centerAngle} wheelAngle={angle} color={color.text} />
                ) : (
                <text
                  x={labelPosition.x}
                  y={labelPosition.y}
                  className={`${color.text} text-[16px] font-semibold`}
                  dominantBaseline="middle"
                  textAnchor="middle"
                  transform={`rotate(${centerAngle + 90} ${labelPosition.x} ${labelPosition.y})`}
                >
                  {/* Center angle + 90° keeps the label horizontal at the top pointer. */}
                  {labelLines.length === 1 ? (
                    <tspan x={labelPosition.x} dy="0">
                      {labelLines[0]}
                    </tspan>
                  ) : (
                    <>
                      <tspan x={labelPosition.x} dy="-10">
                        {labelLines[0]}
                      </tspan>
                      <tspan x={labelPosition.x} dy="20">
                        {labelLines[1]}
                      </tspan>
                    </>
                  )}
                </text>
                )}
              </g>
            );
          })}
        </motion.g>

        <path
          d="M 164 14 L 196 14 L 180 46 Z"
          className="fill-fit stroke-white"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="3"
        />
      </svg>

      <motion.button
        type="button"
        aria-label={t('wheel.start')}
        className="absolute left-1/2 top-[52.63%] flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-4 border-broccoli bg-surface disabled:cursor-not-allowed disabled:opacity-50"
        animate={
          isSpinning || isFlashing
            ? { scale: 1 }
            : { scale: [1, 1.05, 1] }
        }
        transition={
          isSpinning || isFlashing
            ? { duration: 0.2 }
            : { duration: 2, repeat: Infinity, ease: 'easeInOut' }
        }
        disabled={isSpinning || isFlashing}
        onClick={handleSpin}
      >
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-food text-[22px] font-bold text-white">
          {t('wheel.spin')}
        </span>
      </motion.button>
    </div>
  );
}
