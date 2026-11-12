import { useState } from 'react';
import type { AppData } from '../types';
import { Card } from '../ui/Card';
import { SegmentedTabs } from '../ui/SegmentedTabs';

interface FitnessPageProps {
  data: AppData;
  setData: (data: AppData) => void;
}

const fitnessTabs = [
  { value: 'cardio', label: '有氧' },
  { value: 'strength', label: '無氧' },
];

export function FitnessPage(_props: FitnessPageProps) {
  const [activeTab, setActiveTab] = useState('cardio');
  const activeLabel =
    fitnessTabs.find((tab) => tab.value === activeTab)?.label ?? '';

  return (
    <main className="min-h-[100dvh] space-y-6 px-5 pt-[calc(env(safe-area-inset-top)+20px)]">
      <h1 className="text-[28px] font-bold text-text">今天練什麼</h1>
      <SegmentedTabs
        options={fitnessTabs}
        value={activeTab}
        onChange={setActiveTab}
        accent="fit"
      />
      <Card accent="fit">
        <p className="text-text">施工中：{activeLabel}</p>
      </Card>
    </main>
  );
}
