import { AnimatePresence, motion } from 'framer-motion';
import { lazy, Suspense, useState } from 'react';
import { FoodPage } from './food/FoodPage';
import { useAppData } from './storage';
import { BottomNav } from './ui/BottomNav';
import { ErrorBoundary } from './ui/ErrorBoundary';
import { useLang } from './i18n/LanguageContext';
import { TodayPage } from './today/TodayPage';

const FitnessPage = lazy(() => import('./fitness/FitnessPage').then((module) => ({ default: module.FitnessPage })));

export default function App() {
  return <ErrorBoundary><AppContent /></ErrorBoundary>;
}

function AppContent() {
  const { t } = useLang();
  const [data, setData] = useAppData();
  const [tab, setTab] = useState<'today' | 'food' | 'fit'>('today');
  const [fitnessInitialTab, setFitnessInitialTab] = useState<'strength' | undefined>(undefined);

  return (
    <div className="min-h-[100dvh]">
      <main className="mx-auto max-w-[480px] pb-[calc(env(safe-area-inset-bottom)+88px)]">
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {tab === 'today' ? (
              <TodayPage
                data={data}
                setData={setData}
                onOpenFood={() => setTab('food')}
                onOpenStrength={() => {
                  setFitnessInitialTab('strength');
                  setTab('fit');
                }}
              />
            ) : tab === 'food' ? (
              <FoodPage data={data} setData={setData} />
            ) : (
              <Suspense fallback={
                <div role="status" aria-label={t('common.loading')} className="space-y-5 px-5 pt-[calc(env(safe-area-inset-top)+20px)]">
                  <div className="h-[200px] animate-pulse rounded-[24px] bg-surface-2" />
                  <div className="h-11 animate-pulse rounded-[14px] bg-surface-2" />
                  <div className="h-40 animate-pulse rounded-[20px] bg-surface-2" />
                </div>
              }>
                <FitnessPage data={data} setData={setData} initialTab={fitnessInitialTab} />
              </Suspense>
            )}
          </motion.div>
        </AnimatePresence>
      </main>
      <BottomNav tab={tab} onChange={(next) => {
        setFitnessInitialTab(undefined);
        setTab(next);
      }} />
    </div>
  );
}
