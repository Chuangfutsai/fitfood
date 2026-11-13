import { useState } from 'react';
import { motion } from 'framer-motion';
import { Dumbbell, Footprints, Timer } from 'lucide-react';
import type { AppData } from '../types';
import { SegmentedTabs } from '../ui/SegmentedTabs';
import { Sheet } from '../ui/Sheet';
import { CardioPanel } from './CardioPanel';
import { StrengthPanel } from './StrengthPanel';
import { WeeklyPanel } from './WeeklyPanel';
import { LanguageButton, useLang } from '../i18n/LanguageContext';

interface FitnessPageProps {
  data: AppData;
  setData: (next: AppData | ((previous: AppData) => AppData)) => void;
  initialTab?: 'weekly' | 'cardio' | 'strength';
}

const fitnessTabs = [
  { value: 'weekly', label: 'fitness.tabs.weekly' },
  { value: 'cardio', label: 'fitness.tabs.cardio' },
  { value: 'strength', label: 'fitness.tabs.strength' },
];

function HeroCard({ nextFocusLabel }: { nextFocusLabel: string }) {
  const { lang, t, formatDate } = useLang();
  const [hasError, setHasError] = useState(false);
  const now = new Date();
  const hour = now.getHours();
  const dateLabel = formatDate(now);
  const greeting =
    hour >= 5 && hour < 11
      ? t('greeting.morning')
      : hour >= 11 && hour < 14
        ? t('greeting.noon')
        : hour >= 14 && hour < 18
          ? t('greeting.afternoon')
          : t('greeting.evening');

  if (hasError) {
    return (
      <section className="relative isolate h-[200px] w-full overflow-hidden rounded-[24px] bg-fit/10">
        <LanguageButton accent="fit" SheetComponent={Sheet} />
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <motion.div
            className="absolute -right-10 -top-3 flex h-[140px] w-[140px] items-center
              justify-center rounded-full bg-carrot"
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 3.6, repeat: Infinity, ease: 'easeInOut', delay: 0 }}
          >
            <Dumbbell className="text-white" size={32} strokeWidth={2} />
          </motion.div>
          <motion.div
            className="absolute -right-6 top-[100px] flex h-24 w-24 items-center justify-center rounded-full bg-corn"
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
          >
            <Footprints className="text-white" size={32} strokeWidth={2} />
          </motion.div>
          <motion.div
            className="absolute right-9 top-[72px] flex h-[72px] w-[72px] items-center
              justify-center rounded-full bg-radish"
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
          >
            <Timer className="text-white" size={32} strokeWidth={2} />
          </motion.div>
        </div>

        <div className="absolute left-5 right-[68px] top-5 z-10">
          <p className="text-xs leading-4 text-muted tabular-nums">{dateLabel}</p>
          <p className="mt-2 text-sm leading-5 text-text">
            {t('fitness.hero.greeting', { greeting })}
          </p>
        </div>

        <div className="absolute bottom-5 left-5 z-10 max-w-[60%]">
          <h1 className={`${lang === 'en' ? 'text-[24px]' : 'text-[28px]'} font-extrabold leading-8 text-text`}>
            <span className="block">{t('fitness.hero.titleLine1')}</span>
            <span className="block">{t('fitness.hero.titleLine2')}</span>
          </h1>
          <span className="mt-2 inline-block max-w-full break-words rounded-full
            bg-surface px-3 py-1 text-xs font-bold leading-4 text-fit">
            {t('fitness.hero.nextStrength', { focus: nextFocusLabel })}
          </span>
        </div>
      </section>
    );
  }

  return (
    <section className="relative h-[200px] overflow-hidden rounded-[24px]">
      <LanguageButton accent="fit" SheetComponent={Sheet} />
      <img
        src="/dishes/hero-fitness.jpg"
        alt={t('fitness.hero.imageAlt')}
        className="h-full w-full object-cover"
        onError={() => setHasError(true)}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
      <div className="absolute bottom-5 left-5 right-5">
        <p className="text-sm text-white">{t('fitness.hero.subtitle')}</p>
        <h1 className={`${lang === 'en' ? 'text-[24px]' : 'text-[28px]'} font-extrabold text-white`}>
          {t('fitness.hero.title')}
        </h1>
      </div>
    </section>
  );
}

export function FitnessPage({ data, setData, initialTab }: FitnessPageProps) {
  const { t } = useLang();
  const [activeTab, setActiveTab] = useState<string>(initialTab ?? 'weekly');

  return (
    <main className="space-y-5 px-5 pt-[calc(env(safe-area-inset-top)+20px)]">
      <HeroCard
        nextFocusLabel={
          data.lastStrengthFocus === 'push'
            ? t('strength.focus.pull')
            : data.lastStrengthFocus === 'pull'
              ? t('strength.focus.legs')
              : t('strength.focus.push')
        }
      />

      <SegmentedTabs
        options={fitnessTabs.map((tab) => ({ ...tab, label: t(tab.label) }))}
        value={activeTab}
        onChange={setActiveTab}
        accent="fit"
      />

      {activeTab === 'weekly' ? (
        <WeeklyPanel data={data} setData={setData} />
      ) : activeTab === 'cardio' ? (
        <CardioPanel data={data} setData={setData} />
      ) : (
        <StrengthPanel data={data} setData={setData} />
      )}
    </main>
  );
}
