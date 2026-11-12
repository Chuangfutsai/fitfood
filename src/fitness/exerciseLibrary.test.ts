import { describe, expect, it } from 'vitest';
import { exerciseLibrary } from './exerciseLibrary';

describe('exerciseLibrary', () => {
  it('has unique ids', () => {
    expect(new Set(exerciseLibrary.map((exercise) => exercise.id)).size).toBe(exerciseLibrary.length);
  });

  it('has the required count for every focus', () => {
    const counts = Object.fromEntries(['push', 'pull', 'legs', 'core'].map((focus) => [focus, exerciseLibrary.filter((exercise) => exercise.focus === focus).length]));
    expect(counts).toEqual({ push: 10, pull: 10, legs: 12, core: 8 });
  });

  it('keeps Chinese and English step counts aligned', () => {
    exerciseLibrary.forEach((exercise) => expect(exercise.steps.zh).toHaveLength(exercise.steps.en.length));
  });

  it('contains no empty strings', () => {
    const values = exerciseLibrary.flatMap((exercise) => [exercise.id, exercise.name.zh, exercise.name.en, ...exercise.primaryMuscles.flatMap((muscle) => [muscle.zh, muscle.en]), ...exercise.secondaryMuscles.flatMap((muscle) => [muscle.zh, muscle.en]), ...exercise.steps.zh, ...exercise.steps.en, ...exercise.mistakes.zh, ...exercise.mistakes.en, exercise.defaultReps]);
    values.forEach((value) => expect(value.trim()).not.toBe(''));
  });

  it('uses a safe rest interval', () => {
    exerciseLibrary.forEach((exercise) => expect(exercise.restSec).toBeGreaterThanOrEqual(45));
    exerciseLibrary.forEach((exercise) => expect(exercise.restSec).toBeLessThanOrEqual(180));
  });
});
