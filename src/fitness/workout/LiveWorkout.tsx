import { Check, Plus, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { StrengthPlan } from "../../types";
import { useLang } from "../../i18n/LanguageContext";
import { workoutText } from "../../i18n/strings.workout";
import { Sheet } from "../../ui/Sheet";
import { exerciseLibrary } from "../exerciseLibrary";
import { ExercisePicker } from "./ExercisePicker";
import { ExerciseChart } from "./ExerciseChart";
import { RestTimer } from "./RestTimer";
import { WorkoutSummary } from "./WorkoutSummary";
import type { ActiveSession, WorkoutEntry, WorkoutSet, WorkoutState } from "./types";
import { loadWorkoutState, saveWorkoutState } from "./workoutStore";
import {
  completedSetCount,
  exerciseMaxHistory,
  firstTimeExercises,
  latestSetForExercise,
  normalizeWorkoutInput,
  parseWorkoutInput,
  personalRecords,
  remainingRestSeconds,
  shouldAnnounceRestEnd,
} from "./workoutUtils";

interface Props {
  plan: StrengthPlan | null;
  onClose: () => void;
}

const compactButtonClass = [
  "min-h-11 shrink-0 rounded-[14px] bg-surface-2 px-3 text-sm font-semibold text-fit",
  "active:scale-[0.97]",
].join(" ");
const inputClass = [
  "h-11 min-w-0 rounded-[14px] bg-surface-2 px-3 text-sm text-text outline-none",
  "focus:ring-2 focus:ring-fit",
].join(" ");
const iconButtonClass = [
  "flex h-11 w-11 items-center justify-center rounded-[14px] bg-surface-2 text-muted",
  "active:scale-[0.97]",
].join(" ");
const removeButtonClass = [
  "flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] text-muted",
  "active:scale-[0.97]",
].join(" ");
const addButtonClass = [
  "flex h-12 w-full items-center justify-center gap-2 rounded-[14px] bg-surface-2 text-sm",
  "font-semibold text-fit active:scale-[0.97]",
].join(" ");

function exerciseIdForName(name: string): string | null {
  const normalized = name.trim().toLocaleLowerCase();
  const exercise = exerciseLibrary.find(
    (item) =>
      item.name.zh.toLocaleLowerCase() === normalized ||
      item.name.en.toLocaleLowerCase() === normalized
  );
  return exercise?.id ?? null;
}

function blankSet(previous: WorkoutSet | null): WorkoutSet {
  return previous
    ? { weightKg: previous.weightKg, reps: previous.reps, done: false }
    : {
        weightKg: 0,
        reps: 0,
        done: false,
      };
}

function createEntries(
  plan: StrengthPlan,
  sessions: ReturnType<typeof loadWorkoutState>["sessions"]
): WorkoutEntry[] {
  return plan.exercises.flatMap((item) => {
    const exerciseId = exerciseIdForName(item.name);
    if (!exerciseId) return [];
    const previous = latestSetForExercise(sessions, exerciseId);
    return [
      {
        exerciseId,
        sets: Array.from({ length: item.sets }, () => blankSet(previous)),
      },
    ];
  });
}

export function ExerciseDetailsSheet({
  exerciseId,
  sessions,
  onClose,
}: {
  exerciseId: string | null;
  sessions: WorkoutState["sessions"];
  onClose: () => void;
}) {
  const { lang } = useLang();
  const t = (key: string) => workoutText(lang, key);
  const exercise = exerciseLibrary.find((item) => item.id === exerciseId);
  const language = lang === "en" ? "en" : "zh";
  return (
    <Sheet open={exercise !== undefined} onClose={onClose} title={t("exercise.details")}>
      {exercise && (
        <div className="space-y-5">
          <section>
            <h3 className="text-lg font-extrabold text-text">{exercise.name[language]}</h3>
            <h4 className="mt-4 text-sm font-bold text-text">{t("muscles")}</h4>
            <p className="mt-1 text-sm text-muted">
              {exercise.primaryMuscles.map((muscle) => muscle[language]).join(lang === "en" ? ", " : "、")}
            </p>
            <h4 className="mt-3 text-sm font-bold text-text">{t("muscles.secondary")}</h4>
            <p className="mt-1 text-sm text-muted">
              {exercise.secondaryMuscles.map((muscle) => muscle[language]).join(lang === "en" ? ", " : "、")}
            </p>
          </section>
          <section>
            <h4 className="text-sm font-bold text-text">{t("steps")}</h4>
            <ol className="mt-2 list-decimal space-y-2 pl-5 text-sm text-muted">
              {exercise.steps[language].map((step) => <li key={step}>{step}</li>)}
            </ol>
          </section>
          <section>
            <h4 className="text-sm font-bold text-text">{t("mistakes")}</h4>
            <ul className="mt-2 list-disc space-y-2 pl-5 text-sm text-muted">
              {exercise.mistakes[language].map((mistake) => <li key={mistake}>{mistake}</li>)}
            </ul>
          </section>
          <ExerciseChart points={exerciseMaxHistory(sessions, exercise.id)} />
        </div>
      )}
    </Sheet>
  );
}

function WorkoutNumberInput({ value, field, label, onChange }: {
  value: number;
  field: "weightKg" | "reps";
  label: string;
  onChange: (value: number) => void;
}) {
  const [draft, setDraft] = useState(String(value));
  const focused = useRef(false);
  useEffect(() => {
    if (!focused.current) setDraft(String(value));
  }, [value]);
  return (
    <input
      aria-label={label}
      inputMode={field === "weightKg" ? "decimal" : "numeric"}
      value={draft}
      onFocus={() => { focused.current = true; }}
      onChange={(event) => {
        const text = event.target.value;
        const parsed = parseWorkoutInput(text, field);
        if (parsed === null) return;
        setDraft(text);
        onChange(parsed);
      }}
      onBlur={() => {
        focused.current = false;
        setDraft(normalizeWorkoutInput(draft, field));
      }}
      className={inputClass}
    />
  );
}

export function LiveWorkout({ plan, onClose }: Props) {
  const { lang } = useLang();
  const t = (key: string, values?: Record<string, string | number>) =>
    workoutText(lang, key, values);
  const [state, setState] = useState(loadWorkoutState);
  const latestState = useRef(state);
  const [now, setNow] = useState(Date.now());
  const [pickerOpen, setPickerOpen] = useState(false);
  const [mappingIndex, setMappingIndex] = useState<number | null>(null);
  const [discardOpen, setDiscardOpen] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);
  const [summary, setSummary] = useState<{
    session: WorkoutState["sessions"][number]; records: ReturnType<typeof personalRecords>;
    firstTimeIds: string[];
  } | null>(null);
  const [detailsId, setDetailsId] = useState<string | null>(null);
  const [restFinished, setRestFinished] = useState(false);
  const restFinishedTimer = useRef<number | null>(null);
  const dirty = useRef(false);
  const [removal, setRemoval] = useState<{ index: number; expiresAt: number } | null>(null);
  const observedRest = useRef<{ endAt: number; at: number } | null>(null);
  const active = state.active;
  const unmatched = active?.pending ?? [];

  const updateState = (update: (current: WorkoutState) => WorkoutState) => {
    const next = update(latestState.current);
    latestState.current = next;
    setState(next);
    dirty.current = true;
  };
  useEffect(() => {
    if (!dirty.current) return;
    dirty.current = false;
    setSaveFailed(!saveWorkoutState(state));
  }, [state]);
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    const visibilityChanged = () => {
      observedRest.current = null;
      setNow(Date.now());
    };
    document.addEventListener("visibilitychange", visibilityChanged);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", visibilityChanged);
    };
  }, []);
  useEffect(() => {
    const endAt = active?.restEndsAt;
    const currentTime = Date.now();
    if (endAt === undefined || document.visibilityState !== "visible") {
      observedRest.current = null;
      return;
    }
    if (endAt > currentTime) {
      observedRest.current = { endAt, at: currentTime };
      return;
    }
    const observedAt = observedRest.current?.endAt === endAt ? observedRest.current.at : null;
    observedRest.current = null;
    if (shouldAnnounceRestEnd(endAt, currentTime, observedAt)) navigator.vibrate?.(150);
    if (observedAt === null) {
      if (restFinishedTimer.current !== null) window.clearTimeout(restFinishedTimer.current);
      setRestFinished(true);
      restFinishedTimer.current = window.setTimeout(() => setRestFinished(false), 3000);
    }
    updateState((current) => {
      const currentActive = current.active;
      if (!currentActive || currentActive.restEndsAt !== endAt)
        return current;
      return {
        ...current,
        active: { ...currentActive, restEndsAt: undefined },
      };
    });
  }, [active?.restEndsAt, now]);
  useEffect(() => () => {
    if (restFinishedTimer.current !== null) window.clearTimeout(restFinishedTimer.current);
  }, []);
  useEffect(() => {
    if (!removal) return;
    const timer = window.setTimeout(() => setRemoval(null), Math.max(0, removal.expiresAt - Date.now()));
    return () => window.clearTimeout(timer);
  }, [removal]);

  const updateActive = (
    update: (session: ActiveSession) => ActiveSession
  ) => {
    updateState((current) =>
      current.active ? { ...current, active: update(current.active) } : current
    );
  };
  const startWorkout = (usePlan: boolean) => {
    const startedAt = Date.now();
    updateState((current) => ({
      ...current,
      active: {
        id: String(startedAt),
        startedAt,
        entries: usePlan && plan ? createEntries(plan, current.sessions) : [],
        ...(usePlan && plan ? {
          pending: plan.exercises
            .filter((item) => !exerciseIdForName(item.name))
            .map(({ name, sets }) => ({ name, sets })),
        } : {}),
      },
    }));
  };
  const addExercise = (exerciseId: string) => {
    const previous = latestSetForExercise(latestState.current.sessions, exerciseId);
    updateActive((session) => {
      const pending = mappingIndex === null ? undefined : session.pending?.[mappingIndex];
      if (mappingIndex !== null && !pending) return session;
      return {
        ...session,
        ...(pending ? { pending: session.pending?.filter((_, index) => index !== mappingIndex) } : {}),
        entries: [
          ...session.entries,
          { exerciseId, sets: Array.from({ length: pending?.sets ?? 1 }, () => blankSet(previous)) },
        ],
      };
    });
    setMappingIndex(null);
    setPickerOpen(false);
  };
  const finishWorkout = (discard = false) => {
    const current = latestState.current;
    if (!current.active) return;
    if (!discard && completedSetCount(current.active) === 0) {
      setDiscardOpen(true);
      return;
    }
    const { pending: _pending, ...session } = current.active;
    const discardEmpty = discard && completedSetCount(current.active) === 0;
    const next: WorkoutState = {
      ...current,
      active: null,
      sessions: discardEmpty ? current.sessions : [
        { ...session, endedAt: Date.now(), restEndsAt: undefined },
        ...current.sessions,
      ],
    };
    if (!saveWorkoutState(next)) {
      setSaveFailed(true);
      return;
    }
    const finished = next.sessions[0];
    latestState.current = next;
    setState(next);
    if (discardEmpty) onClose();
    else if (finished) {
      setSummary({
        session: finished,
        records: personalRecords(finished, current.sessions),
        firstTimeIds: firstTimeExercises(finished, current.sessions),
      });
    }
  };

  if (summary) {
    return <WorkoutSummary {...summary} onClose={onClose} />;
  }

  if (!active)
    return (
      <div className="space-y-3">
        {plan && (
          <button
            type="button"
            onClick={() => startWorkout(true)}
            className="h-12 w-full rounded-[14px] bg-fit text-sm font-semibold text-white active:scale-[0.97]"
          >
            {t("plan")}
          </button>
        )}
        <button
          type="button"
          onClick={() => startWorkout(false)}
          className="h-12 w-full rounded-[14px] bg-surface-2 text-sm font-semibold text-text active:scale-[0.97]"
        >
          {t("blank")}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="h-11 w-full rounded-[14px] bg-surface-2 text-sm font-semibold text-text active:scale-[0.97]"
        >
          {t("close")}
        </button>
      </div>
    );

  const remaining = active.restEndsAt
    ? remainingRestSeconds(active.restEndsAt, now)
    : 0;
  const restVisible = active.restEndsAt !== undefined && remaining > 0;
  const addedIds = active.entries.map((entry) => entry.exerciseId);
  const setValue = (
    entryIndex: number,
    setIndex: number,
    field: "weightKg" | "reps",
    value: number
  ) => {
    updateActive((session) => ({
      ...session,
      entries: session.entries.map((entry, index) =>
        index !== entryIndex
          ? entry
          : {
              ...entry,
              sets: entry.sets.map((set, index) =>
                index !== setIndex ? set : {
                  ...set,
                  [field]: value,
                  done: field === "reps" && value === 0 ? false : set.done,
                }
              ),
            }
      ),
    }));
  };

  return (
    <div className={`space-y-4 ${restVisible ? "pb-44" : "pb-8"}`}>
      {saveFailed && <p role="alert" className="text-sm text-fit">{t("save.error")}</p>}
      {unmatched.length > 0 && (
        <section className="space-y-2 rounded-[20px] border border-line bg-surface p-4">
          <h2 className="text-sm font-bold text-text">
            {t("unmatched.title")}
          </h2>
          {unmatched.map((item, pendingIndex) => (
            <div
              key={`${item.name}-${pendingIndex}`}
              className="space-y-2 rounded-[14px] bg-surface-2 p-3"
            >
              <p className="min-w-0 break-words text-sm text-muted">
                {item.name}
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setMappingIndex(pendingIndex);
                    setPickerOpen(true);
                  }}
                  className={compactButtonClass}
                >
                  {t("unmatched.map")}
                </button>
                <button
                  type="button"
                  onClick={() => updateActive((session) => ({
                    ...session,
                    pending: session.pending?.filter((_, index) => index !== pendingIndex),
                  }))}
                  className={compactButtonClass}
                >
                  {t("unmatched.skip")}
                </button>
              </div>
            </div>
          ))}
        </section>
      )}
      {active.entries.map((entry, entryIndex) => {
        const exercise = exerciseLibrary.find(
          (item) => item.id === entry.exerciseId
        );
        if (!exercise) return null;
        const previous = latestSetForExercise(state.sessions, entry.exerciseId);
        return (
          <section
            key={`${entry.exerciseId}-${entryIndex}`}
            className="space-y-3 rounded-[20px] border border-line bg-surface p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <button
                  type="button"
                  onClick={() => setDetailsId(entry.exerciseId)}
                  className="min-h-11 break-words text-left text-base font-bold text-text active:scale-[0.97]"
                >
                  {lang === "en" ? exercise.name.en : exercise.name.zh}
                </button>
                {previous && (
                  <p className="mt-1 text-xs text-muted">
                    {t("last", {
                      weight: previous.weightKg,
                      reps: previous.reps,
                    })}
                  </p>
                )}
              </div>
              <button
                type="button"
                aria-label={t(removal?.index === entryIndex ? "remove.confirm" : "remove")}
                onClick={() => {
                  const hasCompleted = latestState.current.active?.entries[entryIndex]?.sets.some((set) => set.done);
                  if (hasCompleted && (removal?.index !== entryIndex || removal.expiresAt <= Date.now())) {
                    setRemoval({ index: entryIndex, expiresAt: Date.now() + 3000 });
                    return;
                  }
                  setRemoval(null);
                  updateActive((session) => ({
                    ...session,
                    entries: session.entries.filter(
                      (_, index) => index !== entryIndex
                    ),
                  }));
                }}
                className={removal?.index === entryIndex ? compactButtonClass : removeButtonClass}
              >
                {removal?.index === entryIndex ? t("remove.confirm") : <Trash2 size={18} />}
              </button>
            </div>
            <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_44px_44px] gap-2 text-xs text-muted">
              <span>{t("weight")}</span>
              <span>{t("reps")}</span>
              <span className="sr-only">{t("done")}</span>
              <span className="sr-only">{t("delete")}</span>
            </div>
            {entry.sets.map((set, setIndex) => (
              <div
                key={setIndex}
                className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_44px_44px] gap-2"
              >
                <WorkoutNumberInput
                  label={t("weight")}
                  field="weightKg"
                  value={set.weightKg}
                  onChange={(value) => setValue(entryIndex, setIndex, "weightKg", value)}
                />
                <WorkoutNumberInput
                  label={t("reps")}
                  field="reps"
                  value={set.reps}
                  onChange={(value) => setValue(entryIndex, setIndex, "reps", value)}
                />
                <button
                  type="button"
                  aria-label={t(set.reps === 0 ? "done.disabled" : "done")}
                  aria-pressed={set.done}
                  disabled={set.reps === 0}
                  onClick={() => {
                    setDiscardOpen(false);
                    updateActive((session) => {
                      if (session.entries[entryIndex].sets[setIndex].reps === 0) return session;
                      const done =
                        !session.entries[entryIndex].sets[setIndex].done;
                      return {
                        ...session,
                        ...(done
                          ? { restEndsAt: Date.now() + exercise.restSec * 1000 }
                          : {}),
                        entries: session.entries.map((item, index) =>
                          index !== entryIndex
                            ? item
                            : {
                                ...item,
                                sets: item.sets.map((current, index) =>
                                  index !== setIndex
                                    ? current
                                    : { ...current, done }
                                ),
                              }
                        ),
                      };
                    });
                  }}
                  className={[
                    "flex h-11 w-11 items-center justify-center rounded-[14px]",
                    "active:scale-[0.97] disabled:opacity-50",
                    set.done ? "bg-ok text-white" : "bg-surface-2 text-muted",
                  ].join(" ")}
                >
                  <Check size={18} />
                </button>
                <button
                  type="button"
                  aria-label={t("delete")}
                  onClick={() =>
                    updateActive((session) => ({
                      ...session,
                      entries: session.entries.map((item, index) =>
                        index !== entryIndex
                          ? item
                          : {
                              ...item,
                              sets: item.sets.filter(
                                (_, index) => index !== setIndex
                              ),
                            }
                      ),
                    }))
                  }
                  className={iconButtonClass}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() =>
                updateActive((session) => ({
                  ...session,
                  entries: session.entries.map((item, index) =>
                    index !== entryIndex
                      ? item
                      : {
                          ...item,
                          sets: [
                            ...item.sets,
                            {
                              ...(item.sets.at(-1) ?? blankSet(previous)),
                              done: false,
                            },
                          ],
                        }
                  ),
                }))
              }
              className="flex min-h-11 items-center gap-2 text-sm font-semibold text-fit active:scale-[0.97]"
            >
              <Plus size={18} />
              {t("addSet")}
            </button>
          </section>
        );
      })}
      <button
        type="button"
        onClick={() => {
          setMappingIndex(null);
          setPickerOpen(true);
        }}
        className={addButtonClass}
      >
        <Plus size={18} />
        {t("add")}
      </button>
      <button
        type="button"
        onClick={() => finishWorkout()}
        className="h-12 w-full rounded-[14px] bg-fit text-sm font-semibold text-white active:scale-[0.97]"
      >
        {t("finish")}
      </button>
      {discardOpen && (
        <section role="alert" className="space-y-3 rounded-[20px] border border-line bg-surface p-4">
          <p className="text-sm font-semibold text-text">{t("finish.empty")}</p>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => finishWorkout(true)} className={compactButtonClass}>
              {t("finish.discard")}
            </button>
            <button type="button" onClick={() => setDiscardOpen(false)} className={compactButtonClass}>
              {t("finish.continue")}
            </button>
          </div>
        </section>
      )}
      {restVisible && !pickerOpen && (
        <RestTimer
          remaining={remaining}
          onAdjust={(seconds) =>
            updateActive((session) => ({
              ...session,
              restEndsAt: Math.max(
                Date.now(),
                (session.restEndsAt ?? Date.now()) + seconds * 1000
              ),
            }))
          }
          onSkip={() =>
            updateActive((session) => ({ ...session, restEndsAt: undefined }))
          }
        />
      )}
      {restFinished && (
        <p
          role="status"
          className={
            'fixed inset-x-0 z-50 mx-auto max-w-[480px] border border-line bg-surface p-3 ' +
            'text-sm font-semibold text-fit shadow-[0_8px_24px_rgba(15,23,42,0.06)]'
          }
          style={{ bottom: "calc(64px + env(safe-area-inset-bottom))" }}
        >
          {t("rest.finished")}
        </p>
      )}
      <Sheet
        open={pickerOpen}
        onClose={() => {
          setPickerOpen(false);
          setMappingIndex(null);
        }}
        title={t("picker.title")}
      >
        <ExercisePicker addedIds={mappingIndex === null ? addedIds : []} onAdd={addExercise} />
      </Sheet>
      <ExerciseDetailsSheet
        exerciseId={detailsId}
        sessions={state.sessions}
        onClose={() => setDetailsId(null)}
      />
    </div>
  );
}
