import { describe, expect, it } from 'vitest';
import { strings } from './strings';

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
});
