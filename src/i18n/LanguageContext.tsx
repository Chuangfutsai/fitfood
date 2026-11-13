import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Check, Languages } from 'lucide-react';
import type { Sheet } from '../ui/Sheet';
import { ErrorBoundary } from '../ui/ErrorBoundary';
import { strings } from './strings';
import { LanguageContext, useLang } from './langContext';
import type { Language, LanguageValue } from './langContext';
import { cardioTranslations, dishTranslations, exerciseTranslations, ingredientTranslations } from './dataTranslations';

export { useLang } from './langContext';

const LANGUAGE_KEY = 'fitfood:lang';
const languages: Language[] = ['zh-Hant', 'en'];
const locales: Record<Language, string> = {
  'zh-Hant': 'zh-TW',
  en: 'en-US',
};

function initialLanguage(): Language {
  try {
    const saved = localStorage.getItem(LANGUAGE_KEY);
    if (languages.includes(saved as Language)) return saved as Language;
  } catch {
    // Language selection remains usable when storage is unavailable.
  }
  const browserLanguage = typeof navigator === 'undefined' ? 'en' : navigator.language;
  if (/^zh(?:-|$)/i.test(browserLanguage)) return 'zh-Hant';
  return 'en';
}

function LanguageProviderContent({ children }: { children: ReactNode }) {
  const [lang, updateLanguage] = useState<Language>(initialLanguage);

  const setLang = useCallback((language: Language) => {
    updateLanguage(language);
    document.documentElement.lang = language;
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    try {
      localStorage.setItem(LANGUAGE_KEY, lang);
    } catch {
      // Keep the in-memory selection if persistence is blocked.
    }
  }, [lang]);

  const value = useMemo<LanguageValue>(() => ({
    lang,
    setLang,
    t: (key, values = {}) => {
      const template = strings[key]?.[lang] ?? strings[key]?.['zh-Hant'] ?? key;
      return template.replace(/\{(\w+)\}/g, (placeholder, name: string) =>
        values[name] === undefined ? placeholder : String(values[name]),
      );
    },
    tDish: (dish) => lang === 'zh-Hant' ? dish.name : dishTranslations[dish.id]?.[lang] ?? dish.name,
    tIngredient: (ingredient) =>
      lang === 'zh-Hant' ? ingredient.name : ingredientTranslations[ingredient.id]?.[lang] ?? ingredient.name,
    tCardio: (plan) => {
      const translated = lang === 'zh-Hant' ? undefined : cardioTranslations[plan.id]?.[lang];
      return translated ? { ...plan, name: translated.name, steps: [...translated.steps] } : plan;
    },
    tExercise: (name) => lang === 'zh-Hant' ? name : exerciseTranslations[name]?.[lang] ?? name,
    formatDate: (date, options) => {
      const formatter = new Intl.DateTimeFormat(locales[lang], options ?? {
        month: lang === 'en' ? 'short' : 'long',
        day: 'numeric',
        weekday: lang === 'en' ? 'short' : 'long',
      });
      if (!options && lang === 'zh-Hant') {
        return formatter.formatToParts(date).map((part) =>
          part.type === 'weekday' ? ` ${part.value}` : part.value,
        ).join('');
      }
      return formatter.format(date);
    },
  }), [lang, setLang]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  return <ErrorBoundary><LanguageProviderContent>{children}</LanguageProviderContent></ErrorBoundary>;
}

export function LanguageButton({ accent, SheetComponent }: { accent: 'food' | 'fit'; SheetComponent: typeof Sheet }) {
  const { lang, setLang, t } = useLang();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        aria-label={t('language.choose')}
        className={
          'absolute right-3 top-3 z-20 flex h-11 w-11 items-center justify-center ' +
          'rounded-full bg-surface/90 transition-transform active:scale-[0.97] ' +
          (accent === 'food' ? 'text-food' : 'text-fit')
        }
        onClick={() => setOpen(true)}
      >
        <Languages size={22} aria-hidden="true" />
      </button>
      {typeof document !== 'undefined' && createPortal(
        <SheetComponent open={open} onClose={() => setOpen(false)} title={t('language.title')}>
          <div className="space-y-2">
            {languages.map((language) => (
              <button
                key={language}
                type="button"
                lang={language}
                aria-pressed={lang === language}
                className={
                  'flex min-h-11 w-full items-center justify-between gap-3 rounded-[14px] ' +
                  'px-3 text-left text-text transition-transform active:scale-[0.97]'
                }
                onClick={() => { setLang(language); setOpen(false); }}
              >
                <span className="min-w-0 truncate">{t(`language.${language}`)}</span>
                {lang === language && (
                  <Check
                    size={20}
                    aria-hidden="true"
                    className={`shrink-0 ${accent === 'food' ? 'text-food' : 'text-fit'}`}
                  />
                )}
              </button>
            ))}
          </div>
        </SheetComponent>,
        document.body,
      )}
    </>
  );
}
