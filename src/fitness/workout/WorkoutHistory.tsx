import { ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import { useState } from "react";
import { useLang } from "../../i18n/LanguageContext";
import { workoutText } from "../../i18n/strings.workout";
import { exerciseLibrary } from "../exerciseLibrary";
import { sessionVolume } from "./workoutUtils";
import type { Session } from "./types";

interface WorkoutHistoryProps {
  sessions: Session[];
  onDelete: (id: string) => void;
  onOpenExercise: (exerciseId: string) => void;
}

function exerciseName(exerciseId: string, lang: "zh-Hant" | "en") {
  const exercise = exerciseLibrary.find((item) => item.id === exerciseId);
  return exercise?.name[lang === "zh-Hant" ? "zh" : "en"] ?? exerciseId;
}

function durationMinutes(session: Session) {
  return Math.max(
    0,
    Math.round(
      ((session.endedAt ?? session.startedAt) - session.startedAt) / 60000
    )
  );
}

export function WorkoutHistory({
  sessions,
  onDelete,
  onOpenExercise,
}: WorkoutHistoryProps) {
  const { lang } = useLang();
  const [openId, setOpenId] = useState<string | null>(null);
  const t = (key: string, values?: Record<string, number>) =>
    workoutText(lang, key, values);
  const dateFormat = new Intl.DateTimeFormat(
    lang === "zh-Hant" ? "zh-TW" : "en-US",
    { month: "short", day: "numeric", year: "numeric" }
  );
  const ordered = [...sessions].sort(
    (left, right) =>
      (right.endedAt ?? right.startedAt) - (left.endedAt ?? left.startedAt)
  );

  if (ordered.length === 0)
    return (
      <p className="rounded-[16px] bg-surface-2 p-4 text-sm text-muted">
        {t("history.empty")}
      </p>
    );

  return (
    <section className="space-y-3" aria-label={t("history.title")}>
      {ordered.map((session) => {
        const isOpen = openId === session.id;
        const completedEntries = session.entries.filter((entry) =>
          entry.sets.some((set) => set.done)
        );
        return (
          <article
            key={session.id}
            className="overflow-hidden rounded-[20px] border border-line bg-surface"
          >
            <div className="flex items-center gap-2 p-3">
              <button
                type="button"
                aria-expanded={isOpen}
                className="min-w-0 flex-1 text-left active:scale-[0.99]"
                onClick={() => setOpenId(isOpen ? null : session.id)}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-extrabold text-text">
                    {dateFormat.format(
                      new Date(session.endedAt ?? session.startedAt)
                    )}
                  </p>
                  {isOpen ? (
                    <ChevronUp size={18} className="text-muted" />
                  ) : (
                    <ChevronDown size={18} className="text-muted" />
                  )}
                </div>
                <p className="mt-1 flex flex-wrap gap-x-2 gap-y-0.5 text-xs text-muted tabular-nums">
                  <span className="whitespace-nowrap">
                    {t("minutes", { count: durationMinutes(session) })}
                  </span>
                  <span className="whitespace-nowrap">· {completedEntries.length}</span>
                  <span className="whitespace-nowrap">· {Math.round(sessionVolume(session))} kg</span>
                </p>
              </button>
              <button
                type="button"
                aria-label={t("history.delete")}
                className={
                  'flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] ' +
                  'bg-surface-2 text-muted active:scale-[0.97]'
                }
                onClick={() => onDelete(session.id)}
              >
                <Trash2 size={17} aria-hidden="true" />
              </button>
            </div>
            {isOpen && (
              <div className="space-y-3 border-t border-line px-3 py-3">
                {session.entries.map((entry) => (
                  <div key={entry.exerciseId}>
                    <button
                      type="button"
                      className="text-left text-sm font-bold text-fit active:scale-[0.97]"
                      onClick={() => onOpenExercise(entry.exerciseId)}
                    >
                      {exerciseName(entry.exerciseId, lang)}
                    </button>
                    <ul className="mt-1.5 space-y-1">
                      {entry.sets.map((set, index) => (
                        <li
                          key={index}
                          className="flex justify-between gap-2 text-xs tabular-nums text-muted"
                        >
                          <span>{index + 1}</span>
                          <span className="whitespace-nowrap">
                            {set.weightKg} kg × {set.reps}
                          </span>
                          <span className={`whitespace-nowrap ${set.done ? "text-fit" : ""}`}>
                            {set.done ? t("done") : "—"}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </article>
        );
      })}
    </section>
  );
}
