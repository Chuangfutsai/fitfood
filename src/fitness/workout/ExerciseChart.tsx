import { useLang } from "../../i18n/LanguageContext";
import { workoutText } from "../../i18n/strings.workout";
import type { ExerciseHistoryPoint } from "./workoutUtils";

interface ExerciseChartProps {
  points: ExerciseHistoryPoint[];
}

const width = 320;
const height = 184;
const padding = { top: 24, right: 18, bottom: 32, left: 38 };

export function ExerciseChart({ points }: ExerciseChartProps) {
  const { lang } = useLang();
  const t = (key: string) => workoutText(lang, key);
  const dateFormat = new Intl.DateTimeFormat(
    lang === "zh-Hant" ? "zh-TW" : "en-US",
    { month: "numeric", day: "numeric" }
  );

  if (points.length < 2)
    return (
      <section
        className="rounded-[16px] bg-surface-2 p-4"
        aria-label={t("chart.title")}
      >
        <h3 className="text-[15px] font-extrabold text-text">
          {t("chart.title")}
        </h3>
        <p className="mt-2 text-sm text-muted">{t("chart.empty")}</p>
      </section>
    );

  const weights = points.map((point) => point.weightKg);
  const low = Math.min(...weights);
  const high = Math.max(...weights);
  const spread = Math.max(1, high - low);
  const minWeight = Math.max(0, low - spread * 0.15);
  const maxWeight = high + spread * 0.15;
  const graphWidth = width - padding.left - padding.right;
  const graphHeight = height - padding.top - padding.bottom;
  const x = (index: number) =>
    padding.left + (index / (points.length - 1)) * graphWidth;
  const y = (weight: number) =>
    padding.top +
    (1 - (weight - minWeight) / (maxWeight - minWeight)) * graphHeight;
  const path = points
    .map(
      (point, index) =>
        `${index === 0 ? "M" : "L"} ${x(index)} ${y(point.weightKg)}`
    )
    .join(" ");
  const highestIndex = weights.indexOf(high);

  return (
    <section
      className="rounded-[16px] bg-surface-2 p-4"
      aria-label={t("chart.title")}
    >
      <h3 className="text-[15px] font-extrabold text-text">
        {t("chart.title")}
      </h3>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="mt-3 h-auto w-full"
        role="img"
        aria-label={t("chart.title")}
      >
        <line
          x1={padding.left}
          x2={width - padding.right}
          y1={padding.top}
          y2={padding.top}
          stroke="currentColor"
          className="text-line"
        />
        <line
          x1={padding.left}
          x2={width - padding.right}
          y1={padding.top + graphHeight}
          y2={padding.top + graphHeight}
          stroke="currentColor"
          className="text-line"
        />
        <text
          x={padding.left - 6}
          y={padding.top + 4}
          textAnchor="end"
          className="fill-muted text-[10px]"
        >
          {Math.round(maxWeight)}
        </text>
        <text
          x={padding.left - 6}
          y={padding.top + graphHeight + 4}
          textAnchor="end"
          className="fill-muted text-[10px]"
        >
          {Math.round(minWeight)}
        </text>
        <path
          d={path}
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-fit"
        />
        {points.map((point, index) => (
          <g key={`${point.endedAt}-${index}`} className="text-fit">
            <circle
              cx={x(index)}
              cy={y(point.weightKg)}
              r="4"
              fill="currentColor"
            />
            <text
              x={x(index)}
              y={height - 10}
              textAnchor="middle"
              className="fill-muted text-[9px]"
            >
              {dateFormat.format(new Date(point.endedAt))}
            </text>
          </g>
        ))}
        <text
          x={x(highestIndex)}
          y={y(high) - 9}
          textAnchor="middle"
          className="fill-fit text-[11px] font-bold"
        >
          {high} kg
        </text>
      </svg>
    </section>
  );
}
