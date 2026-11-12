import { useState } from 'react';
import { Dumbbell } from 'lucide-react';
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

function HeroCard() {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <section className="relative h-[200px] overflow-hidden rounded-[24px] bg-fit/15 p-5">
        <Dumbbell
          className="absolute right-4 top-4 text-fit/40"
          size={72}
          strokeWidth={1.5}
        />
        <div className="absolute bottom-5 left-5">
          <p className="text-sm text-text">今天練什麼？</p>
          <h1 className="text-[28px] font-extrabold text-text">
            動起來，比昨天更好
          </h1>
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
      <HeroCard />

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
