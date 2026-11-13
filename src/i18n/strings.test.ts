import { describe, expect, it } from 'vitest';
import { strings } from './strings';
import { workoutText } from './strings.workout';

// Short visible button and chip labels read from JSX throughout the app.
const shortButtonAndChipKeys = [
  'today.streakStart',
  'today.streak',
  'today.goal',
  'today.addMeal',
  'today.planned',
  'meal.breakfast',
  'meal.lunch',
  'meal.dinner',
  'today.checkIn',
  'today.checkedIn',
  'today.resumeStrength',
  'today.startStrength',
  'today.rest',
  'goals.sex.male',
  'goals.sex.female',
  'goals.gentle',
  'goals.standard',
  'goals.save',
  'goals.open',
  'goals.invitation',
  'goals.over',
  'backup.export',
  'backup.restore',
  'backup.cancel',
  'backup.confirm',
  'backup.undo',
  'fitness.hero.nextStrength',
  'fitness.tabs.weekly',
  'fitness.tabs.cardio',
  'fitness.tabs.strength',
  'today.nav',
  'nav.food',
  'nav.fit',
  'common.closeSheet',
  'common.close',
  'common.add',
  'language.choose',
  'language.zh-Hant',
  'language.en',
  'category.protein',
  'category.veg',
  'category.carb',
  'category.other',
  'food.tab.wheel',
  'menu.tab.week',
  'food.tab.pantry',
  'food.tab.dishes',
  'food.hero.available',
  'food.wheel.shuffle',
  'food.wheel.pantryLink',
  'food.wheel.pantry',
  'wheel.spin',
  'food.result.accept',
  'food.result.again',
  'food.meals.title',
  'food.meals.count',
  'food.meals.countOne',
  'food.meals.notRecorded',
  'food.meals.remove',
  'food.meals.undo',
  'food.meals.deletedDish',
  'pantry.delete',
  'pantry.stockStatus',
  'pantry.addButton',
  'dishes.missing',
  'dishes.addButton',
  'dishes.delete',
  'dishes.deletedIngredient',
  'unit.minutes',
  'recipe.energy',
  'recipe.protein',
  'menu.plan',
  'menu.replan',
  'menu.view.menu',
  'menu.view.shopping',
  'menu.overTarget',
  'menu.lock',
  'menu.unlock',
  'menu.swap',
  'menu.shopping.copy',
  'menu.shopping.done',
  'menu.shopping.delete',
  'menu.shopping.add',
  'menu.shopping.undo',
  'fitness.recommended',
  'cardio.recommend',
  'cardio.machine.treadmill',
  'cardio.machine.stairclimber',
  'cardio.machine.elliptical',
  'cardio.machine.spinbike',
  'cardio.machine.recumbent',
  'cardio.machine.rower',
  'cardio.machine.airbike',
  'cardio.machine.skierg',
  'strength.focusPlan',
  'strength.focus.push',
  'strength.focus.pull',
  'strength.focus.legs',
  'strength.focus.full',
  'strength.exerciseCount',
  'strength.estimatedMinutes',
  'unit.sets',
  'strength.complete',
  'strength.completed',
  'weekly.today',
  'unit.minuteShort',
  'weekly.cardioMissing',
  'weekly.restDay',
  'weekly.strength.push',
  'weekly.strength.pull',
  'weekly.strength.legs',
  'weekly.strength.full',
] as const;

// These visible button descriptions retain their full meaning and may wrap beyond 24 characters.
const descriptiveButtonKeys = [
  'today.goalHint',
  'food.meals.summary',
  'food.meals.summaryOne',
] as const;

const workoutButtonAndChipKeys = [
  'start',
  'resume',
  'history',
  'undo',
  'plan',
  'blank',
  'close',
  'unmatched.map',
  'unmatched.skip',
  'remove',
  'remove.confirm',
  'done',
  'done.disabled',
  'delete',
  'addSet',
  'add',
  'finish',
  'finish.discard',
  'finish.continue',
  'history.delete',
  'minutes',
  'rest.decrease',
  'rest.increase',
  'skip',
  'all',
  'focus.push',
  'focus.pull',
  'focus.legs',
  'focus.core',
  'equipment.barbell',
  'equipment.dumbbell',
  'equipment.machine',
  'equipment.cable',
  'equipment.bodyweight',
  'equipment.kettlebell',
  'picker.added',
  'summary.firstTime',
] as const;

function placeholders(text: string): string[] {
  return [...text.matchAll(/\{([^{}]+)\}/g)].map((match) => match[1]).sort();
}

describe('strings', () => {
  it('contains translations to validate', () => {
    expect(Object.keys(strings).length).toBeGreaterThan(0);
  });

  it.each(Object.entries(strings))('%s has complete, consistent bilingual text', (_key, translation) => {
    const traditional = translation['zh-Hant'];
    const english = translation.en;

    expect(traditional).toBeTypeOf('string');
    expect(english).toBeTypeOf('string');
    expect(traditional.trim()).not.toBe('');
    expect(english.trim()).not.toBe('');
    expect(placeholders(english)).toEqual(placeholders(traditional));
    expect(english).not.toMatch(/\p{Script=Han}/u);
  });

  it('keeps short English button and chip copy within 24 characters', () => {
    for (const key of shortButtonAndChipKeys) {
      const english = strings[key]?.en;
      expect(english, key).toBeTypeOf('string');
      expect(english.length, key).toBeLessThanOrEqual(24);
    }

    for (const key of workoutButtonAndChipKeys) {
      const english = workoutText('en', key);
      expect(english, key).not.toBe(key);
      expect(english.length, key).toBeLessThanOrEqual(24);
    }

  });

  it('keeps full English descriptions and screen-reader labels', () => {
    for (const key of descriptiveButtonKeys) {
      expect(strings[key]?.en, key).toBeTypeOf('string');
    }

    expect(strings['food.meals.summary'].en).toBe('{n} meals · {kcal} kcal · {g} g protein');
    expect(strings['food.meals.summaryOne'].en).toBe('1 meal · {kcal} kcal · {g} g protein');
    expect(strings['today.strengthRecorded'].en).toBe('Strength: {sets} sets · {volume} kg');
    expect(strings['goals.disclaimer'].en).toBe(
      'These estimates do not replace advice from a doctor or registered dietitian.',
    );
    expect(strings['today.goalHint'].en).toBe('Set a calorie goal to see your progress.');
    expect(strings['weekly.detailsLabel'].en).toBe('Workout details for {date}');
    expect(strings['weekly.completeLabel'].en).toBe('Workout completed for {date}');
  });
});
