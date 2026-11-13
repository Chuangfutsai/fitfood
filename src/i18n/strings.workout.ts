export type WorkoutLanguage = 'zh-Hant' | 'en';

const copy: Record<string, readonly [string, string]> = {
  start: ['開始訓練', 'Start workout'],
  plan: ['使用目前課表', 'Use current plan'],
  blank: ['從空白開始', 'Start blank'],
  add: ['加入動作', 'Add exercise'],
  finish: ['結束訓練', 'Finish workout'],
  history: ['訓練紀錄', 'History'],
  search: ['搜尋中英文動作', 'Search exercises'],
  all: ['全部', 'All'],
  push: ['推', 'Push'],
  pull: ['拉', 'Pull'],
  legs: ['腿', 'Legs'],
  core: ['核心', 'Core'],
  equipment: ['器材', 'Equipment'],
  'equipment.barbell': ['槓鈴', 'Barbell'],
  'equipment.dumbbell': ['啞鈴', 'Dumbbell'],
  'equipment.machine': ['器械', 'Machine'],
  'equipment.cable': ['滑輪', 'Cable'],
  'equipment.bodyweight': ['徒手', 'Bodyweight'],
  'equipment.kettlebell': ['壺鈴', 'Kettlebell'],
  'focus.push': ['推', 'Push'],
  'focus.pull': ['拉', 'Pull'],
  'focus.legs': ['腿', 'Legs'],
  'focus.core': ['核心', 'Core'],
  weight: ['重量 kg', 'Weight kg'],
  reps: ['次數', 'Reps'],
  done: ['完成', 'Done'],
  last: ['上次：{weight} kg × {reps}', 'Last: {weight} kg × {reps}'],
  addSet: ['加一組', 'Add set'],
  remove: ['刪除動作', 'Remove exercise'],
  rest: ['休息', 'Rest'],
  skip: ['跳過', 'Skip'],
  steps: ['步驟', 'Steps'],
  mistakes: ['常見錯誤', 'Common mistakes'],
  muscles: ['主要肌群', 'Primary muscles'],
  summary: ['訓練摘要', 'Workout summary'],
  duration: ['總時間', 'Total time'],
  sets: ['完成組數', 'Completed sets'],
  volume: ['總訓練量', 'Total volume'],
  records: ['個人紀錄', 'Personal records'],
  none: ['本次沒有新的個人紀錄', 'No new personal records'],
  delete: ['刪除', 'Delete'],
  undo: ['復原', 'Undo'],
  empty: ['還沒有已完成的訓練', 'No completed workouts'],
  details: ['訓練詳情', 'Workout details'],
  chart: ['最近 10 次最大重量', 'Last 10 max weights'],
  noMatches: ['找不到符合的動作', 'No matching exercises'],
  close: ['關閉', 'Close'],
};

export function workoutText(
  lang: WorkoutLanguage,
  key: string,
  values: Record<string, string | number> = {},
): string {
  const template = copy[key]?.[lang === 'zh-Hant' ? 0 : 1] ?? key;
  return template.replace(/\{(\w+)\}/g, (match, name: string) => {
    return values[name] === undefined ? match : String(values[name]);
  });
}
