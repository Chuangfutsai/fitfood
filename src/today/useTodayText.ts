import { useLang } from '../i18n/LanguageContext';

export function useTodayText() {
  const { t } = useLang();
  return t;
}
