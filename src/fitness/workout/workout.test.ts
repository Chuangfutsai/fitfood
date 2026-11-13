import { beforeEach, describe, expect, it } from 'vitest';
import { loadWorkoutState, saveWorkoutState, validateWorkoutState, WORKOUT_STORAGE_KEY } from './workoutStore';
import type { Session, WorkoutSet } from './types';
import {
  epleyOneRm,
  exerciseMaxHistory,
  firstTimeExercises,
  isValidWorkoutInput,
  latestSetForExercise,
  normalizeWorkoutInput,
  parseWorkoutInput,
  personalRecords,
  remainingRestSeconds,
  removeSession,
  restoreSession,
  sessionVolume,
  shouldAnnounceRestEnd,
} from './workoutUtils';

const exerciseId = 'machine-chest-press';
let values: Record<string, string> = {};

function completedSet(weightKg: number, reps: number): WorkoutSet {
  return { weightKg, reps, done: true };
}

function session(id: string, endedAt: number | undefined, sets: WorkoutSet[]): Session {
  return {
    id,
    startedAt: 1,
    ...(endedAt === undefined ? {} : { endedAt }),
    entries: [{ exerciseId, sets }],
  };
}

beforeEach(() => {
  values = {};
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: {
      getItem: (key: string) => values[key] ?? null,
      setItem: (key: string, value: string) => {
        values[key] = value;
      },
    },
  });
});

describe('workout data layer', () => {
  it('persists a finished session before a component can unmount', () => {
    const finished = session('finished', 30, [completedSet(42.5, 8), completedSet(0, 12)]);
    const next = { version: 1 as const, sessions: [finished], active: null };
    expect(saveWorkoutState(next)).toBe(true);
    expect(loadWorkoutState()).toEqual(next);
  });

  it('reports a failed write and preserves the last stored workout', () => {
    const active = session('active', undefined, [completedSet(42.5, 8)]);
    saveWorkoutState({ version: 1, sessions: [], active });
    const stored = values[WORKOUT_STORAGE_KEY];
    localStorage.setItem = () => { throw new Error('Storage unavailable'); };
    expect(saveWorkoutState({ version: 1, sessions: [], active: null })).toBe(false);
    expect(values[WORKOUT_STORAGE_KEY]).toBe(stored);
  });

  it('preserves pending exercises and set counts through a storage round trip', () => {
    const pending = [{ name: 'Custom press', sets: 3 }, { name: 'Custom row', sets: 20 }];
    saveWorkoutState({
      version: 1,
      sessions: [],
      active: { ...session('pending', undefined, []), pending },
    });
    expect(loadWorkoutState().active?.pending).toEqual(pending);
  });

  it('drops only malformed pending entries, preserving active entries and history', () => {
    const active = session('pending', undefined, [completedSet(42.5, 8)]);
    const history = session('previous', 20, [completedSet(40, 8)]);
    const result = validateWorkoutState({
      version: 1,
      sessions: [history],
      active: {
        ...active,
        pending: [
          null, 'broken', {}, { name: '', sets: 1 }, { name: '  ', sets: 1 },
          { name: 'a'.repeat(81), sets: 1 }, { name: 42, sets: 1 },
          { name: 'Bad count', sets: 0 }, { name: 'Bad count', sets: 21 },
          { name: 'Bad count', sets: 1.5 }, { name: 'Bad count', sets: '3' },
          { name: 'Bad count', sets: Infinity }, { name: 'Bad count', sets: NaN },
          { name: ' Custom press ', sets: 1 }, { name: 'a'.repeat(80), sets: 20 },
        ],
      },
    });
    expect(result.sessions).toEqual([history]);
    expect(result.active).toEqual({
      ...active,
      pending: [{ name: 'Custom press', sets: 1 }, { name: 'a'.repeat(80), sets: 20 }],
    });
  });

  it.each([undefined, null, 'broken', {}])('reads legacy or non-array pending data: %s', (pending) => {
    const active = session('legacy', undefined, [completedSet(0, 8)]);
    const result = validateWorkoutState({ version: 1, sessions: [], active: { ...active, pending } });
    expect(result.active).toEqual(active);
    expect(result.active).not.toHaveProperty('pending');
  });

  it('calculates Epley one-rep max', () => {
    expect(epleyOneRm(60, 10)).toBe(80);
  });

  it('counts only completed sets in total volume', () => {
    const workout = session('volume', 10, [
      completedSet(40, 10),
      { weightKg: 80, reps: 10, done: false },
    ]);
    expect(sessionVolume(workout)).toBe(400);
  });

  it('uses the most recently ended session for the previous-set default', () => {
    const older = session('older', 10, [completedSet(40, 8)]);
    const newer = session('newer', 20, [completedSet(50, 10)]);
    expect(latestSetForExercise([newer, older], exerciseId)).toEqual(completedSet(50, 10));
  });

  it('treats more reps at the same weight as a personal record', () => {
    const previous = session('previous', 10, [completedSet(50, 8)]);
    const current = session('current', 20, [completedSet(50, 10)]);
    expect(personalRecords(current, [previous])).toHaveLength(1);
  });

  it('does not treat a first-time exercise as a personal record', () => {
    const current = session('current', 20, [completedSet(50, 10)]);
    expect(personalRecords(current, [])).toEqual([]);
  });

  it('identifies first-time exercises separately', () => {
    const current = session('current', 20, [completedSet(50, 10)]);
    expect(firstTimeExercises(current, [])).toEqual([exerciseId]);
  });

  it('returns zero when the rest period already ended', () => {
    expect(remainingRestSeconds(100, 200)).toBe(0);
  });

  it('returns an empty state for malformed JSON', () => {
    values[WORKOUT_STORAGE_KEY] = '{broken';
    expect(loadWorkoutState()).toEqual({ version: 1, sessions: [], active: null });
  });

  it('drops a session with required fields missing', () => {
    values[WORKOUT_STORAGE_KEY] = JSON.stringify({
      version: 1,
      sessions: [{ id: 'missing-start', entries: [] }],
      active: null,
    });
    expect(loadWorkoutState().sessions).toEqual([]);
  });

  it('drops negative set data while preserving the valid session', () => {
    values[WORKOUT_STORAGE_KEY] = JSON.stringify({
      version: 1,
      sessions: [session('negative', 10, [{ weightKg: -1, reps: 8, done: true }])],
      active: null,
    });
    expect(loadWorkoutState().sessions[0].entries).toEqual([]);
  });

  it('drops entries with an unknown exercise id', () => {
    values[WORKOUT_STORAGE_KEY] = JSON.stringify({
      version: 1,
      sessions: [{ id: 'unknown', startedAt: 1, entries: [{ exerciseId: 'nope', sets: [] }] }],
      active: null,
    });
    expect(loadWorkoutState().sessions[0].entries).toEqual([]);
  });

  it('keeps an active session and its rest end time after reload', () => {
    saveWorkoutState({
      version: 1,
      sessions: [],
      active: { ...session('active', undefined, []), restEndsAt: 99 },
    });
    expect(loadWorkoutState().active?.restEndsAt).toBe(99);
  });

  it('restores a removed session at its original position', () => {
    const sessions = [
      session('first', 1, []),
      session('middle', 2, []),
      session('last', 3, []),
    ];
    const removed = removeSession(sessions, 'middle');
    expect(restoreSession(removed.sessions, removed.removed!, removed.index)).toEqual(sessions);
  });

  it('sorts maximum-weight history and applies its limit', () => {
    const sessions = [
      session('third', 30, [completedSet(60, 5)]),
      session('first', 10, [completedSet(40, 5)]),
      session('second', 20, [completedSet(50, 5)]),
    ];
    expect(exerciseMaxHistory(sessions, exerciseId, 2)).toEqual([
      { endedAt: 20, weightKg: 50 },
      { endedAt: 30, weightKg: 60 },
    ]);
  });
});

describe('workout number inputs', () => {
  it.each(['', '0', '0.', '42.', '42.5', '999.9', '0042.5'])('accepts weight draft %j', (value) => {
    expect(isValidWorkoutInput(value, 'weightKg')).toBe(true);
    expect(parseWorkoutInput(value, 'weightKg')).toBe(Number(value));
  });

  it.each(['', '0', '8', '999', '008'])('accepts rep draft %j', (value) => {
    expect(isValidWorkoutInput(value, 'reps')).toBe(true);
    expect(parseWorkoutInput(value, 'reps')).toBe(Number(value));
  });

  it.each(['-1', '+1', '1e2', '0x10', 'Infinity', 'NaN', ' ', ' 8', '8 ', '8kg', '.', '42..5', '42,5'])(
    'rejects malformed input %j without partial parsing',
    (value) => {
      for (const field of ['weightKg', 'reps'] as const) {
        expect(isValidWorkoutInput(value, field)).toBe(false);
        expect(parseWorkoutInput(value, field)).toBeNull();
      }
    },
  );

  it.each(['1000', '999.99', '42.50', '0.01'])('rejects out-of-range or overprecise weight %j', (value) => {
    expect(parseWorkoutInput(value, 'weightKg')).toBeNull();
  });

  it.each(['1000', '8.', '8.0', '0.1'])('rejects fractional or out-of-range reps %j', (value) => {
    expect(parseWorkoutInput(value, 'reps')).toBeNull();
  });

  it('normalizes drafts only on blur, including trailing dots, empty strings and leading zeros', () => {
    expect(normalizeWorkoutInput('42.', 'weightKg')).toBe('42');
    expect(normalizeWorkoutInput('0.', 'weightKg')).toBe('0');
    expect(normalizeWorkoutInput('', 'weightKg')).toBe('0');
    expect(normalizeWorkoutInput('0042.5', 'weightKg')).toBe('42.5');
    expect(normalizeWorkoutInput('42.0', 'weightKg')).toBe('42');
    expect(normalizeWorkoutInput('008', 'reps')).toBe('8');
    expect(normalizeWorkoutInput('', 'reps')).toBe('0');
    expect(normalizeWorkoutInput('8abc', 'reps')).toBe('8abc');
  });
});

describe('visible rest countdown completion', () => {
  it('announces a countdown seen running shortly before its deadline', () => {
    expect(shouldAnnounceRestEnd(5000, 5000, 4000)).toBe(true);
    expect(shouldAnnounceRestEnd(5000, 6000, 4000)).toBe(true);
  });

  it('never announces a timer first discovered expired, even within the grace period', () => {
    expect(shouldAnnounceRestEnd(5000, 5001, null)).toBe(false);
    expect(shouldAnnounceRestEnd(5000, 9000, null)).toBe(false);
    expect(shouldAnnounceRestEnd(5000, 6000, 6000)).toBe(false);
  });

  it('does not announce after a long suspension or before time is up', () => {
    expect(shouldAnnounceRestEnd(5000, 8001, 4999)).toBe(false);
    expect(shouldAnnounceRestEnd(5000, 6000, 1000)).toBe(false);
    expect(shouldAnnounceRestEnd(5000, 4000, 3000)).toBe(false);
  });
});
