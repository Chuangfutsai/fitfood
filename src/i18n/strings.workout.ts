import { strings } from './strings';

export type WorkoutLanguage = "zh-Hant" | "en";

export function workoutText(
  lang: WorkoutLanguage,
  key: string,
  values: Record<string, string | number> = {}
): string {
  const template = strings[`workout.${key}`]?.[lang] ?? key;
  return template.replace(/\{(\w+)\}/g, (match, name: string) => {
    return values[name] === undefined ? match : String(values[name]);
  });
}
