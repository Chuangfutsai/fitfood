import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { WorkoutState } from './types';

const hookRuntime = vi.hoisted(() => ({
  state: undefined as WorkoutState | undefined,
  effect: undefined as (() => void | (() => void)) | undefined,
  updates: [] as WorkoutState[],
}));

vi.mock('react', () => ({
  useState: (initializer: () => WorkoutState) => {
    hookRuntime.state ??= initializer();
    return [hookRuntime.state, (next: WorkoutState) => {
      hookRuntime.state = next;
      hookRuntime.updates.push(next);
    }];
  },
  useEffect: (effect: () => void | (() => void)) => {
    hookRuntime.effect = effect;
  },
}));

import {
  loadWorkoutState,
  replaceWorkoutState,
  saveWorkoutState,
  useWorkoutState,
  validateWorkoutState,
  WORKOUT_REPLACED_EVENT,
  WORKOUT_STORAGE_KEY,
} from './workoutStore';
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
  hookRuntime.state = undefined;
  hookRuntime.effect = undefined;
  hookRuntime.updates = [];
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: {
      getItem: (key: string) => values[key] ?? null,
      setItem: (key: string, value: string) => {
        values[key] = value;
      },
      get length() {
        return Object.keys(values).length;
      },
      key: (index: number) => Object.keys(values)[index] ?? null,
      removeItem: (key: string) => {
        delete values[key];
      },
    },
  });
});

function storageEvent(key: string | null): StorageEvent {
  const event = new Event('storage');
  Object.defineProperty(event, 'key', { value: key });
  return event as StorageEvent;
}

describe('useWorkoutState', () => {
  it('loads stored workouts once while rendering again without an event', () => {
    const stored = session('stored', 30, [completedSet(40, 8)]);
    values[WORKOUT_STORAGE_KEY] = JSON.stringify({ version: 1, sessions: [stored], active: null });
    const reads = vi.spyOn(localStorage, 'getItem');

    expect(useWorkoutState().sessions).toEqual([stored]);
    useWorkoutState();
    expect(reads).toHaveBeenCalledTimes(1);
    reads.mockRestore();
  });

  it('updates for replacement and relevant storage events, then removes listeners', () => {
    const target = new EventTarget();
    vi.stubGlobal('window', target);
    try {
      expect(useWorkoutState()).toEqual({ version: 1, sessions: [], active: null });
      const cleanup = hookRuntime.effect?.();
      expect(typeof cleanup).toBe('function');

      const replaced = session('replaced', 30, [completedSet(40, 8)]);
      replaceWorkoutState({ version: 1, sessions: [replaced], active: null });
      expect(hookRuntime.state?.sessions).toEqual([replaced]);
      expect(hookRuntime.updates).toHaveLength(1);

      const changed = session('changed', 40, [completedSet(45, 8)]);
      values[WORKOUT_STORAGE_KEY] = JSON.stringify({ version: 1, sessions: [changed], active: null });
      target.dispatchEvent(storageEvent('fitfood:lang'));
      expect(hookRuntime.updates).toHaveLength(1);
      target.dispatchEvent(storageEvent(WORKOUT_STORAGE_KEY));
      expect(hookRuntime.state?.sessions).toEqual([changed]);

      values[WORKOUT_STORAGE_KEY] = JSON.stringify({ version: 1, sessions: [], active: null });
      target.dispatchEvent(storageEvent(null));
      expect(hookRuntime.state?.sessions).toEqual([]);
      expect(hookRuntime.updates).toHaveLength(3);

      if (typeof cleanup === 'function') cleanup();
      target.dispatchEvent(new Event(WORKOUT_REPLACED_EVENT));
      target.dispatchEvent(storageEvent(WORKOUT_STORAGE_KEY));
      expect(hookRuntime.updates).toHaveLength(3);
    } finally {
      vi.unstubAllGlobals();
    }
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

  it('replaces validated workouts and emits an event after writing', () => {
    const events: string[] = [];
    const target = new EventTarget();
    vi.stubGlobal('window', target);
    try {
      target.addEventListener(WORKOUT_REPLACED_EVENT, () => events.push(WORKOUT_REPLACED_EVENT));
      const valid = session('valid', 30, [completedSet(42.5, 8)]);
      const replaced = replaceWorkoutState({
        version: 1,
        sessions: [{ id: 'broken', entries: [] }, valid],
        active: null,
      });
      expect(replaced).toEqual({ version: 1, sessions: [valid], active: null });
      expect(loadWorkoutState()).toEqual(replaced);
      expect(events).toEqual([WORKOUT_REPLACED_EVENT]);
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it('throws and does not emit a replacement event when storage fails', () => {
    const events: string[] = [];
    const target = new EventTarget();
    vi.stubGlobal('window', target);
    try {
      target.addEventListener(WORKOUT_REPLACED_EVENT, () => events.push(WORKOUT_REPLACED_EVENT));
      localStorage.setItem = () => { throw new Error('Storage unavailable'); };
      expect(() => replaceWorkoutState({ version: 1, sessions: [], active: null })).toThrow();
      expect(events).toEqual([]);
    } finally {
      vi.unstubAllGlobals();
    }
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

  it('backs up malformed JSON byte-for-byte before returning an empty state', () => {
    const raw = '{broken';
    values[WORKOUT_STORAGE_KEY] = raw;
    expect(loadWorkoutState()).toEqual({ version: 1, sessions: [], active: null });
    const backupKey = Object.keys(values).find((key) => key.startsWith(`${WORKOUT_STORAGE_KEY}:corrupt-`));
    expect(backupKey).toBeDefined();
    expect(values[backupKey!]).toBe(raw);
  });

  it('does not overwrite a newer workout version', () => {
    const raw = JSON.stringify({ version: 2, sessions: [], active: null });
    values[WORKOUT_STORAGE_KEY] = raw;
    expect(loadWorkoutState()).toEqual({ version: 1, sessions: [], active: null });
    expect(values[WORKOUT_STORAGE_KEY]).toBe(raw);
  });

  it('keeps only the latest three corrupt workout backups', () => {
    values[`${WORKOUT_STORAGE_KEY}:corrupt-100`] = 'oldest';
    values[`${WORKOUT_STORAGE_KEY}:corrupt-200`] = 'older';
    values[`${WORKOUT_STORAGE_KEY}:corrupt-300`] = 'old';
    values[WORKOUT_STORAGE_KEY] = '{broken';
    const realNow = Date.now;
    Date.now = () => 400;
    loadWorkoutState();
    Date.now = realNow;
    const keys = Object.keys(values).filter((key) => key.startsWith(`${WORKOUT_STORAGE_KEY}:corrupt-`));
    expect(keys.sort()).toEqual([
      `${WORKOUT_STORAGE_KEY}:corrupt-200`,
      `${WORKOUT_STORAGE_KEY}:corrupt-300`,
      `${WORKOUT_STORAGE_KEY}:corrupt-400`,
    ]);
  });

  it('keeps the source value when corrupt-workout backup fails', () => {
    const raw = '{broken';
    values[WORKOUT_STORAGE_KEY] = raw;
    localStorage.setItem = () => { throw new Error('Storage unavailable'); };
    expect(loadWorkoutState()).toEqual({ version: 1, sessions: [], active: null });
    expect(values[WORKOUT_STORAGE_KEY]).toBe(raw);
  });

  it('refuses to overwrite corrupt data when save-time backup fails', () => {
    const raw = '{broken';
    values[WORKOUT_STORAGE_KEY] = raw;
    localStorage.setItem = () => { throw new Error('Storage unavailable'); };
    expect(saveWorkoutState({ version: 1, sessions: [], active: null })).toBe(false);
    expect(values[WORKOUT_STORAGE_KEY]).toBe(raw);
  });

  it('deduplicates repeated loads of the same corrupt workout data', () => {
    values[WORKOUT_STORAGE_KEY] = '{broken';
    for (let index = 0; index < 5; index += 1) loadWorkoutState();
    const backups = Object.keys(values).filter((key) => key.startsWith(`${WORKOUT_STORAGE_KEY}:corrupt-`));
    expect(backups).toHaveLength(1);
    expect(values[backups[0]]).toBe('{broken');
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
