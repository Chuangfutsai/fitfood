import { todayStrings } from '../i18n/strings.today';
import { useLang } from '../i18n/LanguageContext';

export function useTodayText() {
  const { lang } = useLang();

  return (key: keyof typeof todayStrings, values: Record<string, string | number> = {}) =>
    todayStrings[key][lang === 'zh-Hant' ? 0 : 1].replace(/\{(\w+)\}/g, (placeholder, name: string) =>
      values[name] === undefined ? placeholder : String(values[name]),
    );
}
