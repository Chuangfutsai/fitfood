import { useLang } from '../../i18n/LanguageContext';
import { menuStrings } from '../../i18n/strings.menu';

export function useMenuText() {
  const { lang } = useLang();
  return (key: string, values: Record<string, string | number> = {}) => {
    const template = menuStrings[key]?.[lang === 'en' ? 1 : 0] ?? key;
    return template.replace(/\{(\w+)\}/g, (placeholder, name: string) => values[name] === undefined ? placeholder : String(values[name]));
  };
}
