import { useState } from 'react';
import type { AppData } from '../types';
import { Card } from '../ui/Card';
import { SegmentedTabs } from '../ui/SegmentedTabs';

interface FoodPageProps {
  data: AppData;
  setData: (data: AppData) => void;
}

const foodTabs = [
  { value: 'wheel', label: '轉盤' },
  { value: 'pantry', label: '食材' },
  { value: 'dishes', label: '菜單' },
];

export function FoodPage(_props: FoodPageProps) {
  const [activeTab, setActiveTab] = useState('wheel');
  const activeLabel =
    foodTabs.find((tab) => tab.value === activeTab)?.label ?? '';

  return (
    <main className="min-h-[100dvh] space-y-6 px-5 pt-[calc(env(safe-area-inset-top)+20px)]">
      <h1 className="text-[28px] font-bold text-text">今天煮什麼</h1>
      <SegmentedTabs
        options={foodTabs}
        value={activeTab}
        onChange={setActiveTab}
        accent="food"
      />
      <Card accent="food">
        <p className="text-text">施工中：{activeLabel}</p>
      </Card>
    </main>
  );
}
