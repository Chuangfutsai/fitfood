import { beforeEach, describe, expect, it } from 'vitest';
import { loadWorkoutState, saveWorkoutState, WORKOUT_STORAGE_KEY } from './workoutStore';
import type { Session, WorkoutSet } from './types';
import {
  epleyOneRm,
  exerciseMaxHistory,
  latestSetForExercise,
  personalRecords,
  remainingRestSeconds,
  removeSession,
  restoreSession,
  sessionVolume,
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
