import { exerciseLibrary } from '../exerciseLibrary';
import type { Session, WorkoutEntry, WorkoutSet, WorkoutState } from './types';

export const WORKOUT_STORAGE_KEY = 'fitfood:workouts:v1';

const knownExerciseIds = new Set(exerciseLibrary.map((exercise) => exercise.id));

function emptyWorkoutState(): WorkoutState {
  return { version: 1, sessions: [], active: null };
}

function isNonNegativeNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0;
}

function validateSet(value: unknown): WorkoutSet | null {
  if (!value || typeof value !== 'object') return null;
  const item = value as Record<string, unknown>;
  if (!isNonNegativeNumber(item.weightKg) || !isNonNegativeNumber(item.reps)) return null;
  if (typeof item.done !== 'boolean') return null;
  return { weightKg: item.weightKg, reps: item.reps, done: item.done };
}

function validateEntry(value: unknown): WorkoutEntry | null {
  if (!value || typeof value !== 'object') return null;
  const item = value as Record<string, unknown>;
  if (typeof item.exerciseId !== 'string' || !knownExerciseIds.has(item.exerciseId)) return null;
  if (!Array.isArray(item.sets)) return null;
  const sets = item.sets.map(validateSet).filter((set): set is WorkoutSet => set !== null);
  if (item.sets.length > 0 && sets.length === 0) return null;
  return {
    exerciseId: item.exerciseId,
    sets,
  };
}

function validateSession(value: unknown): Session | null {
  if (!value || typeof value !== 'object') return null;
  const item = value as Record<string, unknown>;
  if (typeof item.id !== 'string' || item.id.length === 0) return null;
  if (!isNonNegativeNumber(item.startedAt) || !Array.isArray(item.entries)) return null;
  if (item.endedAt !== undefined && !isNonNegativeNumber(item.endedAt)) return null;
  if (item.restEndsAt !== undefined && !isNonNegativeNumber(item.restEndsAt)) return null;
  const entries = item.entries
    .map(validateEntry)
    .filter((entry): entry is WorkoutEntry => entry !== null);
  return {
    id: item.id,
    startedAt: item.startedAt,
    ...(item.endedAt === undefined ? {} : { endedAt: item.endedAt }),
    ...(item.restEndsAt === undefined ? {} : { restEndsAt: item.restEndsAt }),
    entries,
  };
}

export function validateWorkoutState(value: unknown): WorkoutState {
  if (!value || typeof value !== 'object') return emptyWorkoutState();
  const item = value as Record<string, unknown>;
  if (item.version !== 1 || !Array.isArray(item.sessions)) return emptyWorkoutState();
  const sessions = item.sessions
    .map(validateSession)
    .filter((session): session is Session => session !== null);
  const active = item.active === null ? null : validateSession(item.active);
  return {
    version: 1,
    sessions,
    active: active && active.endedAt === undefined ? active : null,
  };
}

export function loadWorkoutState(): WorkoutState {
  try {
    const raw = localStorage.getItem(WORKOUT_STORAGE_KEY);
    return raw ? validateWorkoutState(JSON.parse(raw)) : emptyWorkoutState();
  } catch {
    return emptyWorkoutState();
  }
}

export function saveWorkoutState(state: WorkoutState): void {
  try {
    localStorage.setItem(WORKOUT_STORAGE_KEY, JSON.stringify(validateWorkoutState(state)));
  } catch {
    // Keep the in-memory workout state usable when browser storage is unavailable.
  }
}
