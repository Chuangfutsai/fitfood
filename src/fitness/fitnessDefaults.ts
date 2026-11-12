import type { CardioPlan, StrengthPlan, WeeklyDay } from '../types';

export const defaultCardioPlans: CardioPlan[] = [
  {
    id: 'cardio-treadmill-12330',
    machine: 'treadmill',
    name: '12-3-30 爬坡走',
    minutes: 30,
    steps: [
      '暖身 5 分鐘：坡度 1% · 2.5 mph · 4.0 km/h',
      '主訓練 20 分鐘：坡度 12% · 3.0 mph · 4.8 km/h',
      '緩和 5 分鐘：坡度 1% · 2.5 mph · 4.0 km/h',
    ],
  },
  {
    id: 'cardio-treadmill-steady',
    machine: 'treadmill',
    name: '穩定快走',
    minutes: 25,
    steps: [
      '暖身 5 分鐘：坡度 1% · 2.5 mph · 4.0 km/h',
      '穩定快走 15 分鐘：坡度 3% · 3.5 mph · 5.6 km/h',
      '緩和 5 分鐘：坡度 1% · 2.5 mph · 4.0 km/h',
    ],
  },
  {
    id: 'cardio-treadmill-interval',
    machine: 'treadmill',
    name: '跑走間歇',
    minutes: 24,
    steps: [
      '暖身 5 分鐘：坡度 1% · 2.8 mph · 4.5 km/h',
      '重複 5 組：慢跑 2 分鐘 · 坡度 1% · 5.5 mph · 8.9 km/h',
      '每組後快走 1 分鐘：坡度 1% · 3.0 mph · 4.8 km/h',
      '緩和 4 分鐘：坡度 1% · 2.5 mph · 4.0 km/h',
    ],
  },
  {
    id: 'cardio-stair-steady',
    machine: 'stairclimber',
    name: '穩定爬樓',
    minutes: 20,
    steps: [
      '暖身 4 分鐘：等級 3–4',
      '穩定訓練 12 分鐘：等級 6–7',
      '緩和 4 分鐘：等級 3–4',
    ],
  },
  {
    id: 'cardio-stair-interval',
    machine: 'stairclimber',
    name: '爬樓間歇',
    minutes: 22,
    steps: [
      '暖身 4 分鐘：等級 3–4',
      '重複 6 組：快節奏 1 分鐘，等級 9–10',
      '每組後恢復 1 分鐘：等級 4–5',
      '緩和 6 分鐘：等級 3–4',
    ],
  },
  {
    id: 'cardio-stair-endurance',
    machine: 'stairclimber',
    name: '耐力爬樓',
    minutes: 30,
    steps: [
      '暖身 5 分鐘：等級 3–4',
      '耐力訓練 20 分鐘：等級 6–8',
      '緩和 5 分鐘：等級 3–4',
    ],
  },
];

export const defaultStrengthPlans: StrengthPlan[] = [
  {
    id: 'strength-push',
    focus: 'push',
    name: '推日基礎訓練',
    exercises: [
      { name: '槓鈴臥推', sets: 4, reps: '8–10', restSec: 90 },
      { name: '啞鈴肩推', sets: 3, reps: '10–12', restSec: 75 },
      { name: '上斜啞鈴臥推', sets: 3, reps: '10–12', restSec: 75 },
      { name: '側平舉', sets: 3, reps: '12–15', restSec: 60 },
      { name: '滑輪三頭下壓', sets: 3, reps: '12–15', restSec: 60 },
    ],
  },
  {
    id: 'strength-pull',
    focus: 'pull',
    name: '拉日基礎訓練',
    exercises: [
      { name: '高位下拉', sets: 4, reps: '8–10', restSec: 90 },
      { name: '坐姿划船', sets: 3, reps: '10–12', restSec: 75 },
      { name: '單手啞鈴划船', sets: 3, reps: '10–12', restSec: 75 },
      { name: '臉拉', sets: 3, reps: '12–15', restSec: 60 },
      { name: '啞鈴彎舉', sets: 3, reps: '10–12', restSec: 60 },
    ],
  },
  {
    id: 'strength-legs',
    focus: 'legs',
    name: '腿日基礎訓練',
    exercises: [
      { name: '深蹲', sets: 4, reps: '8–10', restSec: 90 },
      { name: '羅馬尼亞硬舉', sets: 3, reps: '8–10', restSec: 90 },
      { name: '腿推機', sets: 3, reps: '10–12', restSec: 75 },
      { name: '腿後腱彎舉', sets: 3, reps: '10–12', restSec: 60 },
      { name: '站姿提踵', sets: 4, reps: '12–15', restSec: 60 },
    ],
  },
  {
    id: 'strength-full',
    focus: 'full',
    name: '全身基礎訓練',
    exercises: [
      { name: '高腳杯深蹲', sets: 3, reps: '10–12', restSec: 75 },
      { name: '啞鈴臥推', sets: 3, reps: '10–12', restSec: 75 },
      { name: '高位下拉', sets: 3, reps: '10–12', restSec: 75 },
      { name: '啞鈴羅馬尼亞硬舉', sets: 3, reps: '10–12', restSec: 75 },
      { name: '平板撐', sets: 3, reps: '30–45 秒', restSec: 45 },
    ],
  },
];

export const defaultWeeklyPlan: WeeklyDay[] = [
  { weekday: 1, cardioPlanId: 'cardio-treadmill-12330', strengthFocus: 'full' },
  { weekday: 2, cardioPlanId: 'cardio-stair-steady', strengthFocus: null },
  { weekday: 3, cardioPlanId: 'cardio-treadmill-interval', strengthFocus: null },
  { weekday: 4, cardioPlanId: 'cardio-treadmill-steady', strengthFocus: 'full' },
  { weekday: 5, cardioPlanId: 'cardio-stair-interval', strengthFocus: null },
  { weekday: 6, cardioPlanId: 'cardio-stair-endurance', strengthFocus: null },
  { weekday: 0, cardioPlanId: null, strengthFocus: null },
];
