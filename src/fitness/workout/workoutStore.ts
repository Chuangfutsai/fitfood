import { exerciseLibrary } from '../exerciseLibrary';
import type { ActiveSession, Session, WorkoutEntry, WorkoutSet, WorkoutState } from './types';

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

function validateActiveSession(value: unknown): ActiveSession | null {
  const session = validateSession(value);
  if (!session || session.endedAt !== undefined) return null;
  const item = value as Record<string, unknown>;
  if (!Array.isArray(item.pending)) return session;
  const pending = item.pending.flatMap((candidate: unknown) => {
    if (!candidate || typeof candidate !== 'object') return [];
    const entry = candidate as Record<string, unknown>;
    if (typeof entry.name !== 'string') return [];
    const name = entry.name.trim();
    if (name.length === 0 || name.length > 80) return [];
    if (typeof entry.sets !== 'number' || !Number.isInteger(entry.sets)) return [];
    if (entry.sets < 1 || entry.sets > 20) return [];
    return [{ name, sets: entry.sets }];
  });
  return { ...session, pending };
}

export function validateWorkoutState(value: unknown): WorkoutState {
  if (!value || typeof value !== 'object') return emptyWorkoutState();
  const item = value as Record<string, unknown>;
  if (item.version !== 1 || !Array.isArray(item.sessions)) return emptyWorkoutState();
  const sessions = item.sessions
    .map(validateSession)
    .filter((session): session is Session => session !== null);
  const active = item.active === null ? null : validateActiveSession(item.active);
  return {
    version: 1,
    sessions,
    active,
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

export function saveWorkoutState(state: WorkoutState): boolean {
  try {
    localStorage.setItem(WORKOUT_STORAGE_KEY, JSON.stringify(validateWorkoutState(state)));
    return true;
  } catch {
    // Keep the in-memory workout state usable when browser storage is unavailable.
    return false;
  }
}
