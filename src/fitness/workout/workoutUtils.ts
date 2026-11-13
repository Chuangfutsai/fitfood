import type { Session, WorkoutSet } from './types';

export interface PersonalRecord {
  exerciseId: string;
  maxWeight: number;
  oneRm: number;
}

export interface ExerciseHistoryPoint {
  endedAt: number;
  weightKg: number;
}

export interface RemovedSession {
  sessions: Session[];
  removed: Session | null;
  index: number;
}

export function epleyOneRm(weightKg: number, reps: number): number {
  return weightKg > 0 && reps > 0 ? weightKg * (1 + reps / 30) : 0;
}

export function sessionVolume(session: Pick<Session, 'entries'>): number {
  return session.entries.reduce((total, entry) => {
    return total + entry.sets.reduce((entryTotal, set) => {
      return entryTotal + (set.done ? set.weightKg * set.reps : 0);
    }, 0);
  }, 0);
}

export function completedSetCount(session: Pick<Session, 'entries'>): number {
  return session.entries.reduce((total, entry) => {
    return total + entry.sets.filter((set) => set.done).length;
  }, 0);
}

export function latestSetForExercise(sessions: Session[], exerciseId: string): WorkoutSet | null {
  const ordered = [...sessions].sort((left, right) => (right.endedAt ?? -1) - (left.endedAt ?? -1));
  for (const session of ordered) {
    const sets = session.entries.find((entry) => entry.exerciseId === exerciseId)?.sets ?? [];
    const latest = sets.filter((set) => set.done).at(-1);
    if (latest) return latest;
  }
  return null;
}

export function personalRecords(current: Session, history: Session[]): PersonalRecord[] {
  return current.entries.flatMap((entry) => {
    const completed = entry.sets.filter((set) => set.done);
    if (completed.length === 0) return [];
    const maxWeight = Math.max(...completed.map((set) => set.weightKg));
    const oneRm = Math.max(...completed.map((set) => epleyOneRm(set.weightKg, set.reps)));
    const previous = history.flatMap((session) => {
      return session.entries
        .filter((item) => item.exerciseId === entry.exerciseId)
        .flatMap((item) => item.sets.filter((set) => set.done));
    });
    const priorWeight = Math.max(0, ...previous.map((set) => set.weightKg));
    const priorOneRm = Math.max(0, ...previous.map((set) => epleyOneRm(set.weightKg, set.reps)));
    return maxWeight > priorWeight || (maxWeight === priorWeight && oneRm > priorOneRm)
      ? [{ exerciseId: entry.exerciseId, maxWeight, oneRm }]
      : [];
  });
}

export function remainingRestSeconds(endAt: number, now = Date.now()): number {
  return Math.max(0, Math.ceil((endAt - now) / 1000));
}

export function exerciseMaxHistory(
  sessions: Session[],
  exerciseId: string,
  limit = 10,
): ExerciseHistoryPoint[] {
  return sessions
    .flatMap((session) => {
      if (session.endedAt === undefined) return [];
      const sets = session.entries
        .filter((entry) => entry.exerciseId === exerciseId)
        .flatMap((entry) => entry.sets.filter((set) => set.done));
      return sets.length === 0
        ? []
        : [{ endedAt: session.endedAt, weightKg: Math.max(...sets.map((set) => set.weightKg)) }];
    })
    .sort((left, right) => left.endedAt - right.endedAt)
    .slice(-Math.max(0, limit));
}

export function removeSession(sessions: Session[], id: string): RemovedSession {
  const index = sessions.findIndex((session) => session.id === id);
  if (index < 0) return { sessions, removed: null, index: -1 };
  return {
    sessions: [...sessions.slice(0, index), ...sessions.slice(index + 1)],
    removed: sessions[index],
    index,
  };
}

export function restoreSession(sessions: Session[], session: Session, index: number): Session[] {
  const insertionIndex = Math.min(Math.max(0, index), sessions.length);
  return [...sessions.slice(0, insertionIndex), session, ...sessions.slice(insertionIndex)];
}
