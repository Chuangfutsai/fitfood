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
  {
    id: 'cardio-elliptical-steady',
    machine: 'elliptical',
    name: '穩定燃脂',
    minutes: 35,
    steps: [
      '暖身 5 分鐘，阻力 3',
      '主段 25 分鐘，阻力 5–6，踏頻 65–75 RPM，心率約最大心率 60–70%',
      '緩和 5 分鐘，阻力 2',
    ],
  },
  {
    id: 'cardio-elliptical-interval',
    machine: 'elliptical',
    name: '間歇',
    minutes: 24,
    steps: [
      '暖身 5 分鐘，阻力 3',
      '8 輪：40 秒阻力 8–10 快踩＋80 秒阻力 4 慢踩',
      '緩和 3 分鐘',
    ],
  },
  {
    id: 'cardio-elliptical-reverse',
    machine: 'elliptical',
    name: '前後交替',
    minutes: 40,
    steps: [
      '暖身 5 分鐘',
      '前進 15 分鐘，阻力 6',
      '倒踩 10 分鐘，阻力 5',
      '前進 5 分鐘，阻力 7',
      '緩和 5 分鐘',
    ],
  },
  {
    id: 'cardio-spinbike-steady',
    machine: 'spinbike',
    name: '穩定騎乘',
    minutes: 40,
    steps: [
      '暖身 5 分鐘輕阻力，85–95 RPM',
      '主段 30 分鐘中阻力，80–90 RPM，心率 65–75%',
      '緩和 5 分鐘',
    ],
  },
  {
    id: 'cardio-spinbike-tabata',
    machine: 'spinbike',
    name: 'Tabata 間歇',
    minutes: 20,
    steps: [
      '暖身 6 分鐘',
      '2 組 × 8 輪（20 秒全力＋10 秒休息），組間輕鬆踩 2 分鐘',
      '緩和 4 分鐘',
    ],
  },
  {
    id: 'cardio-spinbike-pyramid',
    machine: 'spinbike',
    name: '爬坡金字塔',
    minutes: 30,
    steps: [
      '暖身 5 分鐘',
      '每 2 分鐘加一級阻力，共 5 次',
      '每 2 分鐘減一級阻力，共 5 次',
      '緩和 5 分鐘',
    ],
  },
  {
    id: 'cardio-recumbent-recovery',
    machine: 'recumbent',
    name: '恢復日',
    minutes: 30,
    steps: [
      '全程低阻力，70–80 RPM，心率 55–65%，能邊騎邊說話的強度',
    ],
  },
  {
    id: 'cardio-recumbent-steady',
    machine: 'recumbent',
    name: '穩定燃脂',
    minutes: 40,
    steps: [
      '暖身 5 分鐘',
      '主段 30 分鐘中阻力，75–85 RPM，心率 60–70%',
      '緩和 5 分鐘',
    ],
  },
  {
    id: 'cardio-recumbent-interval',
    machine: 'recumbent',
    name: '輕間歇',
    minutes: 25,
    steps: [
      '暖身 5 分鐘',
      '6 輪：1 分鐘中高阻力＋2 分鐘輕鬆踩',
      '緩和 2 分鐘',
    ],
  },
  {
    id: 'cardio-rower-steady',
    machine: 'rower',
    name: '穩定划',
    minutes: 25,
    steps: [
      '暖身 5 分鐘，18–20 槳/分',
      '主段 15 分鐘，22–24 槳/分，中等強度',
      '緩和 5 分鐘。提示：發力順序是腿→身體→手，回槳反過來',
    ],
  },
  {
    id: 'cardio-rower-interval',
    machine: 'rower',
    name: '250 公尺衝刺',
    minutes: 22,
    steps: [
      '暖身 5 分鐘',
      '6 × 250 公尺衝刺，每趟之間休息 1 分鐘',
      '緩和 5 分鐘',
    ],
  },
  {
    id: 'cardio-rower-endurance',
    machine: 'rower',
    name: '耐力',
    minutes: 30,
    steps: [
      '暖身 5 分鐘',
      '20 分鐘穩定配速，22 槳/分，每 5 分鐘檢查一次姿勢',
      '緩和 5 分鐘',
    ],
  },
  {
    id: 'cardio-airbike-interval',
    machine: 'airbike',
    name: '15/45 間歇',
    minutes: 20,
    steps: [
      '暖身 5 分鐘',
      '10 輪：15 秒全力＋45 秒輕踩',
      '緩和 5 分鐘',
    ],
  },
  {
    id: 'cardio-airbike-emom',
    machine: 'airbike',
    name: 'EMOM',
    minutes: 16,
    steps: [
      '暖身 4 分鐘',
      '8 分鐘：每分鐘一開始衝刺 8 大卡，剩下的時間休息',
      '緩和 4 分鐘',
    ],
  },
  {
    id: 'cardio-airbike-steady',
    machine: 'airbike',
    name: '低強度穩定',
    minutes: 25,
    steps: [
      '全程輕到中等阻力，手腳一起出力，心率 60–70%',
    ],
  },
  {
    id: 'cardio-skierg-steady',
    machine: 'skierg',
    name: '穩定拉',
    minutes: 20,
    steps: [
      '暖身 4 分鐘',
      '主段 12 分鐘，穩定節奏，每次都用髖部帶動往下拉',
      '緩和 4 分鐘',
    ],
  },
  {
    id: 'cardio-skierg-interval',
    machine: 'skierg',
    name: '30/30 間歇',
    minutes: 20,
    steps: [
      '暖身 5 分鐘',
      '10 輪：30 秒快拉＋30 秒慢拉',
      '緩和 5 分鐘',
    ],
  },
  {
    id: 'cardio-skierg-combo',
    machine: 'skierg',
    name: '上下肢搭配',
    minutes: 30,
    steps: [
      '暖身 5 分鐘',
      '4 輪：滑雪機 3 分鐘＋休息 1 分鐘＋原地踏步 1 分鐘',
      '緩和 5 分鐘',
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
