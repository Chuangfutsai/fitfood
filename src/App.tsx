import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { FitnessPage } from './fitness/FitnessPage';
import { FoodPage } from './food/FoodPage';
import { useAppData } from './storage';
import { BottomNav } from './ui/BottomNav';

export default function App() {
  const [data, setData] = useAppData();
  const [tab, setTab] = useState<'food' | 'fit'>('food');

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
            {tab === 'food' ? (
              <FoodPage data={data} setData={setData} />
            ) : (
              <FitnessPage data={data} setData={setData} />
            )}
          </motion.div>
        </AnimatePresence>
      </main>
      <BottomNav tab={tab} onChange={setTab} />
    </div>
  );
}
