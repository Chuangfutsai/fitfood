import { exerciseLibrary } from '../exerciseLibrary';
import type { ActiveSession, Session, WorkoutEntry, WorkoutSet, WorkoutState } from './types';

export const WORKOUT_STORAGE_KEY = 'fitfood:workouts:v1';
export const WORKOUT_REPLACED_EVENT = 'fitfood:workouts-replaced';
const corruptPrefix = `${WORKOUT_STORAGE_KEY}:corrupt-`;

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
  let raw: string | null;
  try {
    raw = localStorage.getItem(WORKOUT_STORAGE_KEY);
  } catch {
    return emptyWorkoutState();
  }
  if (!raw) return emptyWorkoutState();
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object' || (parsed as { version?: unknown }).version !== 1) {
      backupCorruptWorkout(raw);
      return emptyWorkoutState();
    }
    return validateWorkoutState(parsed);
  } catch {
    backupCorruptWorkout(raw);
    return emptyWorkoutState();
  }
}

function backupCorruptWorkout(raw: string): void {
  try {
    const corruptKeys = getCorruptKeys();
    const latestKey = corruptKeys.at(-1);
    if (latestKey && localStorage.getItem(latestKey) === raw) return;
    const key = `${corruptPrefix}${Date.now()}`;
    localStorage.setItem(key, raw);
    for (const oldKey of getCorruptKeys().slice(0, -3)) localStorage.removeItem(oldKey);
  } catch {
    // Never alter the source value when its backup cannot be written.
  }
}

function getCorruptKeys(): string[] {
  const keys: string[] = [];
  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index);
    if (key?.startsWith(corruptPrefix)) keys.push(key);
  }
  return keys.sort();
}

function isVersionOneJson(raw: string): boolean {
  try {
    const value = JSON.parse(raw) as unknown;
    return !!value && typeof value === 'object' && (value as { version?: unknown }).version === 1;
  } catch {
    return false;
  }
}

function hasCorruptBackup(raw: string): boolean {
  return getCorruptKeys().some((key) => localStorage.getItem(key) === raw);
}

export function saveWorkoutState(state: WorkoutState): boolean {
  try {
    const current = localStorage.getItem(WORKOUT_STORAGE_KEY);
    if (current && !isVersionOneJson(current) && !hasCorruptBackup(current)) {
      backupCorruptWorkout(current);
      if (!hasCorruptBackup(current)) return false;
    }
    localStorage.setItem(WORKOUT_STORAGE_KEY, JSON.stringify(validateWorkoutState(state)));
    return true;
  } catch {
    // Keep the in-memory workout state usable when browser storage is unavailable.
    return false;
  }
}

export function replaceWorkoutState(state: unknown): WorkoutState {
  const workout = validateWorkoutState(state);
  if (!saveWorkoutState(workout)) throw new Error('Unable to replace workout state');
  if (typeof window !== 'undefined') window.dispatchEvent(new Event(WORKOUT_REPLACED_EVENT));
  return workout;
}
