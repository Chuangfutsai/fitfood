import { useLang } from '../../i18n/LanguageContext';

export function useMenuText() {
  const { t } = useLang();
  return t;
}
