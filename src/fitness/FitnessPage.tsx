import { useState } from 'react';
import { motion } from 'framer-motion';
import { Dumbbell, Footprints, Timer } from 'lucide-react';
import type { AppData } from '../types';
import { SegmentedTabs } from '../ui/SegmentedTabs';
import { CardioPanel } from './CardioPanel';
import { StrengthPanel } from './StrengthPanel';

interface FitnessPageProps {
  data: AppData;
  setData: (data: AppData) => void;
}

const fitnessTabs = [
  { value: 'cardio', label: '有氧' },
  { value: 'strength', label: '無氧' },
];

function HeroCard({ nextFocusLabel }: { nextFocusLabel: string }) {
  const [hasError, setHasError] = useState(false);
  const now = new Date();
  const hour = now.getHours();
  const weekdays = [
    '星期日',
    '星期一',
    '星期二',
    '星期三',
    '星期四',
    '星期五',
    '星期六',
  ];
  const dateLabel = `${now.getMonth() + 1}月${now.getDate()}日 ${weekdays[now.getDay()]}`;
  const greeting =
    hour >= 5 && hour < 11
      ? '早安'
      : hour >= 11 && hour < 14
        ? '午安'
        : hour >= 14 && hour < 18
          ? '下午好'
          : '晚安';

  if (hasError) {
    return (
      <section className="relative isolate h-[200px] w-full overflow-hidden rounded-[24px] bg-fit/10">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <motion.div
            className="absolute -right-10 -top-3 flex h-[140px] w-[140px] items-center justify-center rounded-full bg-carrot"
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
            className="absolute right-9 top-[72px] flex h-[72px] w-[72px] items-center justify-center rounded-full bg-radish"
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
          >
            <Timer className="text-white" size={32} strokeWidth={2} />
          </motion.div>
        </div>

        <div className="absolute left-5 top-5 z-10">
          <p className="text-xs leading-4 text-muted tabular-nums">{dateLabel}</p>
          <p className="mt-2 text-sm leading-5 text-text">
            {greeting}，今天練什麼？
          </p>
        </div>

        <div className="absolute bottom-5 left-5 z-10 max-w-[60%]">
          <h1 className="text-[28px] font-extrabold leading-8 text-text">
            <span className="block">動起來，</span>
            <span className="block">比昨天更好</span>
          </h1>
          <span className="mt-2 inline-flex rounded-full bg-surface px-3 py-1 text-xs font-bold leading-4 text-fit">
            下一次重訓：{nextFocusLabel}
          </span>
        </div>
      </section>
    );
  }

  return (
    <section className="relative h-[200px] overflow-hidden rounded-[24px]">
      <img
        src="/dishes/hero-fitness.jpg"
        alt="今日健身"
        className="h-full w-full object-cover"
        onError={() => setHasError(true)}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
      <div className="absolute bottom-5 left-5">
        <p className="text-sm text-white">今天練什麼？</p>
        <h1 className="text-[28px] font-extrabold text-white">
          動起來，比昨天更好
        </h1>
      </div>
    </section>
  );
}

export function FitnessPage({ data, setData }: FitnessPageProps) {
  const [activeTab, setActiveTab] = useState('cardio');

  return (
    <main className="space-y-5 px-5 pt-[calc(env(safe-area-inset-top)+20px)]">
      <HeroCard
        nextFocusLabel={
          data.lastStrengthFocus === 'push'
            ? '拉'
            : data.lastStrengthFocus === 'pull'
              ? '腿'
              : '推'
        }
      />

      <SegmentedTabs
        options={fitnessTabs}
        value={activeTab}
        onChange={setActiveTab}
        accent="fit"
      />

      {activeTab === 'cardio' ? (
        <CardioPanel data={data} setData={setData} />
      ) : (
        <StrengthPanel data={data} setData={setData} />
      )}
    </main>
  );
}
