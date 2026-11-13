import { Check, X } from "lucide-react";
import { useLang } from "../../i18n/LanguageContext";
import { workoutText } from "../../i18n/strings.workout";
import { exerciseLibrary } from "../exerciseLibrary";
import { completedSetCount, epleyOneRm, sessionVolume } from "./workoutUtils";
import type { PersonalRecord } from "./workoutUtils";
import type { Session } from "./types";

interface WorkoutSummaryProps {
  session: Session;
  records: PersonalRecord[];
  firstTimeIds: string[];
  onClose: () => void;
}

function exerciseName(exerciseId: string, lang: "zh-Hant" | "en") {
  const exercise = exerciseLibrary.find((item) => item.id === exerciseId);
  return exercise?.name[lang === "zh-Hant" ? "zh" : "en"] ?? exerciseId;
}

export function WorkoutSummary({
  session,
  records,
  firstTimeIds,
  onClose,
}: WorkoutSummaryProps) {
  const { lang } = useLang();
  const t = (key: string, values?: Record<string, number>) =>
    workoutText(lang, key, values);
  const duration = Math.max(
    0,
    Math.round(
      ((session.endedAt ?? session.startedAt) - session.startedAt) / 60000
    )
  );
  const firstTime = new Set(firstTimeIds);
  const recordIds = new Set(records.map((record) => record.exerciseId));
  const firstTimeOnly = session.entries
    .filter(
      (entry) =>
        firstTime.has(entry.exerciseId) && !recordIds.has(entry.exerciseId)
    )
    .map((entry) => {
      const completed = entry.sets.filter((set) => set.done);
      return {
        exerciseId: entry.exerciseId,
        maxWeight: Math.max(0, ...completed.map((set) => set.weightKg)),
        oneRm: Math.max(
          0,
          ...completed.map((set) => epleyOneRm(set.weightKg, set.reps))
        ),
      };
    });
  const achievements = [...records, ...firstTimeOnly];

  return (
    <section className="space-y-4" aria-label={t("summary.title")}>
      <header className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-fit">{t("summary.title")}</p>
          <h2 className="mt-1 text-2xl font-extrabold text-text">
            {t("summary.title")}
          </h2>
        </div>
        <button
          type="button"
          aria-label={t("close")}
          className={
            'flex h-11 w-11 items-center justify-center rounded-[14px] bg-surface-2 ' +
            'text-muted active:scale-[0.97]'
          }
          onClick={onClose}
        >
          <X size={20} aria-hidden="true" />
        </button>
      </header>

      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-[14px] bg-fit/10 p-3">
          <p className="text-[11px] font-semibold text-muted">
            {t("summary.duration")}
          </p>
          <p className="mt-1 text-lg font-extrabold text-text">
            {t("minutes", { count: duration })}
          </p>
        </div>
        <div className="rounded-[14px] bg-fit/10 p-3">
          <p className="text-[11px] font-semibold text-muted">
            {t("summary.sets")}
          </p>
          <p className="mt-1 text-lg font-extrabold tabular-nums text-text">
            {completedSetCount(session)}
          </p>
        </div>
        <div className="rounded-[14px] bg-fit/10 p-3">
          <p className="text-[11px] font-semibold text-muted">
            {t("summary.volume")}
          </p>
          <p className="mt-1 text-lg font-extrabold tabular-nums text-text">
            {Math.round(sessionVolume(session))} kg
          </p>
        </div>
      </div>

      <div>
        <h3 className="text-[15px] font-extrabold text-text">
          {t("summary.records")}
        </h3>
        {achievements.length === 0 ? (
          <p className="mt-2 rounded-[14px] bg-surface-2 p-3 text-sm text-muted">
            {t("summary.noRecords")}
          </p>
        ) : (
          <ul className="mt-2 space-y-2">
            {achievements.map((record) => (
              <li
                key={record.exerciseId}
                className="flex items-center gap-3 rounded-[14px] bg-surface-2 p-3"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-fit text-white">
                  <Check size={17} aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-text">
                    {exerciseName(record.exerciseId, lang)}
                  </p>
                  <p className="mt-0.5 text-xs text-muted tabular-nums">
                    {record.maxWeight} kg · 1RM {Math.round(record.oneRm)} kg
                  </p>
                </div>
                {firstTime.has(record.exerciseId) && (
                  <span className="shrink-0 rounded-full bg-fit/10 px-2 py-1 text-[11px] font-bold text-fit">
                    {t("summary.firstTime")}
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
