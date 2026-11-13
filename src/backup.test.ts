import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { exportBackup, getBackupFilename, parseBackup } from './backup';
import { createDefaultData } from './storage';
import { deliverBackupFile } from './ui/ErrorBoundary';
import { MENU_REPLACED_EVENT, MENU_STORAGE_KEY, replaceMenuState } from './food/menu/menuStore';
import { WORKOUT_STORAGE_KEY } from './fitness/workout/workoutStore';

const exportedAt = new Date('2026-11-12T20:30:00.000Z');
const dateKey = '2026-11-12';

beforeEach(() => {
  const values = new Map<string, string>();
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, String(value)),
    removeItem: (key: string) => values.delete(key),
    clear: () => values.clear(),
    key: (index: number) => [...values.keys()][index] ?? null,
    get length() { return values.size; },
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

function fixture() {
  const data = structuredClone(createDefaultData());
  data.ingredients[0].inStock = false;
  data.mealLog[dateKey] = [{ id: 'meal-backup', dishId: 'dish-tomato-egg', at: exportedAt.getTime(), kcal: 295, proteinG: 15, meal: 'lunch' }];
  data.weeklyLog[dateKey] = true;
  data.profile = { sex: 'female', age: 32, heightCm: 165, weightKg: 62, activity: 1.55, deficit: 0.15 };
  data.weightLog[dateKey] = 62;
  return data;
}

describe('exportBackup and parseBackup', () => {
  it('round-trips all data exactly, including nutrient snapshots and stock flags', () => {
    const data = fixture();
    const before = structuredClone(data);
    const backup = exportBackup(data, exportedAt);
    expect(backup).toMatchObject({ app: 'fitfood', schemaVersion: 2, exportedAt: exportedAt.toISOString(), data, modules: { menu: { version: 1 } } });
    expect(parseBackup(JSON.stringify(backup))).toEqual({ ok: true, backup });
    expect(data).toEqual(before);
  });

  it('keeps deleted defaults deleted after an export and import', () => {
    const data = fixture();
    data.dishes = data.dishes.filter((dish) => dish.id !== 'dish-tomato-egg');
    data.ingredients = data.ingredients.filter((ingredient) => ingredient.id !== 'ing-egg');
    const removedCardio = data.cardioPlans[0].id;
    data.cardioPlans = data.cardioPlans.filter((plan) => plan.id !== removedCardio);
    data.weeklyPlan = data.weeklyPlan.map((day) => day.cardioPlanId === removedCardio ? { ...day, cardioPlanId: null } : day);
    const result = parseBackup(JSON.stringify(exportBackup(data, exportedAt)));
    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error('Expected a valid backup');
    expect(result.backup.data.dishes.some((dish) => dish.id === 'dish-tomato-egg')).toBe(false);
    expect(result.backup.data.ingredients.some((ingredient) => ingredient.id === 'ing-egg')).toBe(false);
    expect(result.backup.data.cardioPlans.some((plan) => plan.id === removedCardio)).toBe(false);
    expect(result.backup.data.knownDefaultIds).toEqual(data.knownDefaultIds);
  });

  it('rejects broken JSON with a specific error', () => {
    expect(parseBackup('{invalid')).toEqual({ ok: false, error: 'invalid-json' });
  });

  it.each(['other-app', null, undefined])('rejects an incorrect app field: %s', (app) => {
    expect(parseBackup(JSON.stringify({ ...exportBackup(fixture(), exportedAt), app })))
      .toEqual({ ok: false, error: 'wrong-app' });
  });

  it('rejects an envelope from a future schema', () => {
    expect(parseBackup(JSON.stringify({ ...exportBackup(fixture(), exportedAt), schemaVersion: 3 })))
      .toEqual({ ok: false, error: 'future-version' });
  });

  it('also rejects future data inside an older envelope', () => {
    const backup = exportBackup(fixture(), exportedAt);
    expect(parseBackup(JSON.stringify({ ...backup, data: { ...backup.data, version: 3 } })))
      .toEqual({ ok: false, error: 'future-version' });
  });

  it.each([null, [], 42])('rejects an invalid envelope: %s', (raw) => {
    expect(parseBackup(JSON.stringify(raw))).toEqual({ ok: false, error: 'invalid-data' });
  });

  it.each([undefined, null, '2', 0, 1.5])('rejects an invalid schema version: %s', (schemaVersion) => {
    expect(parseBackup(JSON.stringify({ ...exportBackup(fixture(), exportedAt), schemaVersion })))
      .toEqual({ ok: false, error: 'invalid-data' });
  });

  it.each([undefined, null, 'not-a-date', '2026-11-12', '2026-99-12T00:00:00Z'])('rejects an invalid export timestamp: %s', (date) => {
    expect(parseBackup(JSON.stringify({ ...exportBackup(fixture(), exportedAt), exportedAt: date })))
      .toEqual({ ok: false, error: 'invalid-date' });
  });

  it.each([undefined, null, [], 'broken'])('rejects an invalid data container: %s', (data) => {
    expect(parseBackup(JSON.stringify({ ...exportBackup(fixture(), exportedAt), data })))
      .toEqual({ ok: false, error: 'invalid-data' });
  });

  it('cleans bad fields while preserving valid records', () => {
    const data = fixture();
    const backup = exportBackup(data, exportedAt);
    const result = parseBackup(JSON.stringify({
      ...backup,
      data: {
        ...data,
        cardioPlans: [...data.cardioPlans, { id: 'bad-plan', machine: 'rower', name: 42, minutes: -5, steps: 'broken' }],
        mealLog: { ...data.mealLog, bad: [1], '2026-11-11': 'broken' },
        weeklyLog: { ...data.weeklyLog, bad: true, '2026-11-11': false },
        profile: { ...data.profile, age: 17 },
      },
    }));
    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error('Expected a repairable backup');
    expect(result.backup.data.cardioPlans).toEqual(data.cardioPlans);
    expect(result.backup.data.mealLog).toEqual(data.mealLog);
    expect(result.backup.data.weeklyLog).toEqual(data.weeklyLog);
    expect(result.backup.data.profile).toBeNull();
  });

  it('migrates a version 1 backup and does not resurrect an original deleted dish', () => {
    const data = fixture();
    const { knownDefaultIds: _known, ...legacy } = data;
    const result = parseBackup(JSON.stringify({
      app: 'fitfood', schemaVersion: 1, exportedAt: exportedAt.toISOString(),
      data: { ...legacy, version: 1, dishes: data.dishes.filter((dish) => dish.id !== 'dish-tomato-egg') },
    }));
    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error('Expected a migratable backup');
    expect(result.backup.schemaVersion).toBe(2);
    expect(result.backup.data.version).toBe(2);
    expect(result.backup.data.knownDefaultIds.dishes).toContain('dish-tomato-egg');
    expect(result.backup.data.dishes.some((dish) => dish.id === 'dish-tomato-egg')).toBe(false);
  });

  it('reads and sanitizes the menu module without writing localStorage', () => {
    const setItem = vi.fn(() => { throw new Error('No storage access allowed'); });
    vi.stubGlobal('localStorage', { getItem: vi.fn((key: string) => key === MENU_STORAGE_KEY ? JSON.stringify({ version: 1, weekStart: '2026-11-09', days: [] }) : null), setItem });
    try {
      expect(exportBackup(fixture(), exportedAt).modules?.menu?.weekStart).toBe('2026-11-09');
      expect(setItem).not.toHaveBeenCalled();
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it('round-trips a menu module exactly', () => {
    const menu = { version: 1, weekStart: '2026-11-09', days: [{ dateKey: '2026-11-10', meals: [{ meal: 'lunch', dishId: 'dish-tomato-egg', locked: true }], overTarget: false }], checked: ['ing-egg'], extras: [{ id: 'extra-1', text: 'Milk', checked: false }] };
    vi.stubGlobal('localStorage', { getItem: vi.fn(() => JSON.stringify(menu)), setItem: vi.fn() });
    try {
      const backup = exportBackup(fixture(), exportedAt);
      expect(parseBackup(JSON.stringify(backup))).toEqual({ ok: true, backup });
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it('round-trips complete workout history and an active session exactly', () => {
    const workouts = {
      version: 1 as const,
      sessions: [{
        id: 'finished-workout', startedAt: 100, endedAt: 200,
        entries: [{ exerciseId: 'machine-chest-press', sets: [
          { weightKg: 42.5, reps: 8, done: true },
          { weightKg: 40, reps: 10, done: false },
        ] }],
      }],
      active: {
        id: 'active-workout', startedAt: 300, restEndsAt: 360,
        entries: [{ exerciseId: 'machine-chest-press', sets: [{ weightKg: 45, reps: 6, done: true }] }],
        pending: [{ name: 'Custom press', sets: 3 }],
      },
    };
    localStorage.setItem(WORKOUT_STORAGE_KEY, JSON.stringify(workouts));
    const backup = exportBackup(fixture(), exportedAt);
    expect(backup.modules?.workouts).toEqual(workouts);
    const parsed = parseBackup(JSON.stringify(backup));
    expect(parsed).toEqual({ ok: true, backup });
    if (!parsed.ok) throw new Error('Expected a valid workout backup');
    expect(parsed.backup.modules?.workouts).toEqual(workouts);
  });

  it.each(['{invalid', JSON.stringify({ version: 2, sessions: [], active: null })])(
    'exports empty workouts when stored workout data is malformed: %s',
    (raw) => {
      localStorage.setItem(WORKOUT_STORAGE_KEY, raw);
      expect(exportBackup(fixture(), exportedAt).modules?.workouts)
        .toEqual({ version: 1, sessions: [], active: null });
    },
  );

  it('keeps a legacy backup without workouts compatible', () => {
    const backup = exportBackup(fixture(), exportedAt);
    const result = parseBackup(JSON.stringify({ ...backup, modules: { menu: backup.modules?.menu } }));
    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error('Expected a valid legacy backup');
    expect(result.backup.modules).not.toHaveProperty('workouts');
  });

  it('validates damaged workout records individually without rejecting the backup', () => {
    const validSession = {
      id: 'valid-workout', startedAt: 100, endedAt: 200,
      entries: [{ exerciseId: 'machine-chest-press', sets: [{ weightKg: 42.5, reps: 8, done: true }] }],
    };
    const backup = exportBackup(fixture(), exportedAt);
    const result = parseBackup(JSON.stringify({
      ...backup,
      modules: {
        ...backup.modules,
        workouts: {
          version: 1,
          sessions: [
            validSession,
            { id: 'invalid-workout', startedAt: -1, entries: [] },
            { id: 'partly-valid', startedAt: 300, entries: [
              { exerciseId: 'unknown-exercise', sets: [] },
              { exerciseId: 'machine-chest-press', sets: [
                { weightKg: 20, reps: 12, done: true },
                { weightKg: -1, reps: 8, done: true },
              ] },
            ] },
          ],
          active: null,
        },
      },
    }));
    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error('Expected a repairable workout backup');
    expect(result.backup.modules?.workouts).toEqual({
      version: 1,
      sessions: [validSession, {
        id: 'partly-valid', startedAt: 300,
        entries: [{ exerciseId: 'machine-chest-press', sets: [{ weightKg: 20, reps: 12, done: true }] }],
      }],
      active: null,
    });
  });

  it('keeps a legacy backup without a menu module compatible', () => {
    const backup = exportBackup(fixture(), exportedAt);
    const { modules: _modules, ...legacy } = backup;
    const result = parseBackup(JSON.stringify(legacy));
    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error('Expected a valid legacy backup');
    expect(result.backup.modules).toBeUndefined();
  });

  it('cleans a corrupt menu module', () => {
    const backup = exportBackup(fixture(), exportedAt);
    const result = parseBackup(JSON.stringify({ ...backup, modules: { menu: { version: 1, weekStart: 'bad', days: [{ dateKey: 'bad', meals: [{}] }], checked: [1, 'ok'], extras: [{ id: 1, text: null }] } } }));
    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error('Expected a repairable module');
    expect(result.backup.modules?.menu).toEqual({ version: 1, weekStart: '', days: [], checked: ['ok'], extras: [] });
  });

  it('replaces a sanitized menu and notifies active menu stores', () => {
    const setItem = vi.fn();
    const eventTarget = new EventTarget();
    const listener = vi.fn();
    eventTarget.addEventListener(MENU_REPLACED_EVENT, listener);
    vi.stubGlobal('localStorage', { setItem });
    vi.stubGlobal('window', eventTarget);
    try {
      const menu = replaceMenuState({ version: 1, weekStart: 'invalid', days: [{ dateKey: 'bad', meals: [{}] }], checked: [1, 'checked'], extras: [{ id: 1, text: null }] });
      expect(menu).toEqual({ version: 1, weekStart: '', days: [], checked: ['checked'], extras: [] });
      expect(setItem).toHaveBeenCalledWith(MENU_STORAGE_KEY, JSON.stringify(menu));
      expect(listener).toHaveBeenCalledOnce();
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it('produces the same repaired backup when legacy meal IDs are missing', () => {
    const data = fixture();
    const text = JSON.stringify({
      ...exportBackup(data, exportedAt),
      data: { ...data, mealLog: { [dateKey]: [{ dishId: 'dish-tomato-egg', at: exportedAt.getTime() }] } },
    });
    const first = parseBackup(text);
    expect(first.ok).toBe(true);
    expect(parseBackup(text)).toEqual(first);
  });
});

describe('getBackupFilename', () => {
  it('uses the local calendar date with padded month and day', () => {
    expect(getBackupFilename(new Date(2026, 0, 2, 23, 30))).toBe('fitfood-backup-2026-01-02.json');
  });
});

describe('deliverBackupFile', () => {
  const filename = 'fitfood-backup-2026-11-12.json';
  const contents = '{"app":"fitfood"}';

  function mockBrowser(sharing: { canShare?: (data: ShareData) => boolean; share?: (data: ShareData) => Promise<void> } = {}) {
    const anchor = { href: '', download: '', click: vi.fn(), remove: vi.fn() };
    const createElement = vi.fn(() => anchor);
    const appendChild = vi.fn();
    vi.stubGlobal('navigator', sharing);
    vi.stubGlobal('document', { createElement, body: { appendChild } });
    const createObjectURL = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:backup-test');
    const revokeObjectURL = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
    return { anchor, createElement, appendChild, createObjectURL, revokeObjectURL };
  }

  beforeEach(() => { vi.useFakeTimers(); });
  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('shares the correctly named JSON file without downloading when file sharing is supported', async () => {
    const canShare = vi.fn((_data: ShareData) => true);
    const share = vi.fn(async (_data: ShareData) => {});
    const browser = mockBrowser({ canShare, share });
    expect(await deliverBackupFile(contents, filename)).toBe(true);
    expect(canShare).toHaveBeenCalledOnce();
    expect(share).toHaveBeenCalledOnce();
    const sharedFile = share.mock.calls[0][0].files![0];
    expect(sharedFile.name).toBe(filename);
    expect(sharedFile.type).toBe('application/json');
    expect(await sharedFile.text()).toBe(contents);
    expect(canShare).toHaveBeenCalledWith({ files: [sharedFile] });
    expect(browser.createObjectURL).not.toHaveBeenCalled();
    expect(browser.anchor.click).not.toHaveBeenCalled();
  });

  it('treats a cancelled share as cancellation without starting an unexpected download', async () => {
    const share = vi.fn(async () => { throw new DOMException('Cancelled', 'AbortError'); });
    const browser = mockBrowser({ canShare: () => true, share });
    expect(await deliverBackupFile(contents, filename)).toBe(false);
    expect(share).toHaveBeenCalledOnce();
    expect(browser.createObjectURL).not.toHaveBeenCalled();
    expect(browser.anchor.click).not.toHaveBeenCalled();
  });

  it('downloads the JSON and releases its temporary URL when sharing APIs are absent', async () => {
    const browser = mockBrowser();
    expect(await deliverBackupFile(contents, filename)).toBe(true);
    const file = browser.createObjectURL.mock.calls[0][0] as File;
    expect(file.name).toBe(filename);
    expect(await file.text()).toBe(contents);
    expect(browser.createElement).toHaveBeenCalledWith('a');
    expect(browser.appendChild).toHaveBeenCalledWith(browser.anchor);
    expect(browser.anchor.href).toBe('blob:backup-test');
    expect(browser.anchor.download).toBe(filename);
    expect(browser.anchor.click).toHaveBeenCalledOnce();
    expect(browser.anchor.remove).toHaveBeenCalledOnce();
    expect(browser.revokeObjectURL).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1000);
    expect(browser.revokeObjectURL).toHaveBeenCalledWith('blob:backup-test');
  });

  it('downloads without calling share when canShare rejects files', async () => {
    const share = vi.fn(async () => {});
    const browser = mockBrowser({ canShare: () => false, share });
    expect(await deliverBackupFile(contents, filename)).toBe(true);
    expect(share).not.toHaveBeenCalled();
    expect(browser.anchor.click).toHaveBeenCalledOnce();
  });

  it('falls back to a download when sharing fails for a reason other than cancellation', async () => {
    const share = vi.fn(async () => { throw new Error('File sharing unavailable'); });
    const browser = mockBrowser({ canShare: () => true, share });
    expect(await deliverBackupFile(contents, filename)).toBe(true);
    expect(share).toHaveBeenCalledOnce();
    expect(browser.anchor.click).toHaveBeenCalledOnce();
  });

  it('falls back to a download when probing file-sharing support throws', async () => {
    const share = vi.fn(async () => {});
    const browser = mockBrowser({ canShare: () => { throw new TypeError('Unsupported files'); }, share });
    expect(await deliverBackupFile(contents, filename)).toBe(true);
    expect(share).not.toHaveBeenCalled();
    expect(browser.anchor.click).toHaveBeenCalledOnce();
  });
});
